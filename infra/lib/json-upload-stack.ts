import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'
import * as path from 'path'

export class JSONUploadStack extends cdk.Stack {
  public readonly uploadBucket: s3.Bucket
  public readonly processingLambda: lambda.Function
  public readonly uploadApi: apigateway.RestApi

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Lambda Layer for template repository
    // Initial layer creation - GitHub Actions will publish new versions
    const templateLayer = new lambda.LayerVersion(this, 'TemplateLayer', {
      layerVersionName: 'template-repo-layer',
      code: lambda.Code.fromAsset(path.join(__dirname, '../template-layer-placeholder')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Template repository layer - managed by CI/CD',
    })

    // Store the layer ARN in SSM for GitHub Actions to reference
    new ssm.StringParameter(this, 'TemplateLayerArnParameter', {
      parameterName: '/json-processor/template-layer-arn',
      stringValue: templateLayer.layerVersionArn,
      description: 'ARN of the template repository layer',
    })

    // S3 bucket for storing generated TypeScript files
    const bucket = new s3.Bucket(this, 'GeneratedFilesBucket', {
      bucketName: `json-processor-files-${this.account}-${this.region}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    })

    // Lambda function for processing JSON
    const processorFunction = new lambda.Function(this, 'JSONProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/json-processor')),
      timeout: cdk.Duration.seconds(60), // Increased for file processing
      memorySize: 1024, // Increased for zip operations
      layers: [templateLayer],
      environment: {
        BUCKET_NAME: bucket.bucketName,
        TEMPLATE_LAYER_PATH: '/opt/template-repo',
      },
    })

    // Grant the Lambda function permissions to read and write to the S3 bucket
    bucket.grantReadWrite(processorFunction)

    // Grant Lambda permissions to access SSM parameters (for configuration)
    processorFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ssm:GetParameter', 'ssm:GetParameters'],
        resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/json-processor/*`],
      })
    )

    // API Gateway
    const api = new apigateway.RestApi(this, 'JSONProcessorAPI', {
      restApiName: 'JSON Processor Service',
      description: 'API for processing JSON uploads and generating TypeScript files',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    })

    // Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(processorFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    })

    // Add /upload resource and method to API Gateway
    const uploadResource = api.root.addResource('upload')
    uploadResource.addMethod('POST', lambdaIntegration)

    // Store configuration in SSM Parameter Store
    new ssm.StringParameter(this, 'APIEndpointParameter', {
      parameterName: '/json-processor/api-endpoint',
      stringValue: api.url,
    })

    new ssm.StringParameter(this, 'S3BucketParameter', {
      parameterName: '/json-processor/s3-bucket',
      stringValue: bucket.bucketName,
    })

    // GitHub Actions IAM Setup
    // Create GitHub OIDC Identity Provider
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubOIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1'], // GitHub's thumbprint
    })

    // Create IAM Role for GitHub Actions
    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: `GitHubActions-${this.stackName}-Role`,
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': 'repo:mylosf/*:*', // Allow any repo in mylosf org
          },
        }
      ),
      description: 'IAM role for GitHub Actions to manage Lambda layers and functions',
    })

    // Attach necessary permissions for GitHub Actions
    // Policy for actions that need specific resources
    githubActionsRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          // Lambda permissions for layer management
          'lambda:PublishLayerVersion',
          'lambda:DeleteLayerVersion',
          'lambda:ListLayerVersions',
          'lambda:GetLayerVersion',
          
          // Lambda function permissions
          'lambda:GetFunction',
          'lambda:UpdateFunctionConfiguration',
          'lambda:GetFunctionConfiguration',
        ],
        resources: [
          `arn:aws:lambda:${this.region}:${this.account}:layer:template-repo-layer`,
          `arn:aws:lambda:${this.region}:${this.account}:layer:template-repo-layer:*`,
          processorFunction.functionArn,
        ],
      })
    )

    // Policy for actions that need wildcard resources
    githubActionsRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          // Lambda list actions need wildcard
          'lambda:ListFunctions',
          'lambda:ListLayers',
          
          // CloudFormation permissions
          'cloudformation:DescribeStacks',
          'cloudformation:ListStackResources',
          
          // IAM read permissions
          'iam:GetRole',
          'iam:ListRoles',
        ],
        resources: ['*'],
      })
    )

    // Store GitHub Actions Role ARN in SSM for easy reference
    new ssm.StringParameter(this, 'GitHubActionsRoleArnParameter', {
      parameterName: '/json-processor/github-actions-role-arn',
      stringValue: githubActionsRole.roleArn,
      description: 'ARN of the GitHub Actions IAM role',
    })

    // Set public readonly properties
    this.uploadBucket = bucket
    this.processingLambda = processorFunction
    this.uploadApi = api

    // CloudFormation outputs
    new cdk.CfnOutput(this, 'APIGatewayURL', {
      value: api.url,
      description: 'URL of the API Gateway',
    })

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: bucket.bucketName,
      description: 'Name of the S3 bucket for generated files',
    })

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: processorFunction.functionName,
      description: 'Name of the Lambda function',
    })

    new cdk.CfnOutput(this, 'TemplateLayerArn', {
      value: templateLayer.layerVersionArn,
      description: 'ARN of the template repository layer',
    })

    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: githubActionsRole.roleArn,
      description: 'ARN of the GitHub Actions IAM role - add this to GitHub secrets as AWS_ROLE_ARN',
    })
  }
} 