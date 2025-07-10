import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { VPCStack } from '../vpc/vpc-stack';
import { DataStack } from '../database/data-stack';

interface SignupStackProps extends cdk.StackProps {
  vpcStack: VPCStack;
  dataStack: DataStack;
}

export class SignupStack extends cdk.Stack {
  public readonly signupLambda: lambda.Function;
  public readonly signupApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: SignupStackProps) {
    super(scope, id, props);

    // Create IAM role for the Lambda function
    const signupLambdaRole = new iam.Role(this, 'SignupLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Add permissions for RDS Data API and Secrets Manager
    signupLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'rds-data:ExecuteStatement',
          'rds-data:BatchExecuteStatement',
          'rds-data:BeginTransaction',
          'rds-data:CommitTransaction',
          'rds-data:RollbackTransaction',
        ],
        resources: [props.dataStack.cluster.clusterArn],
      })
    );

    // Add permissions for Secrets Manager
    signupLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:*`,
        ],
      })
    );

    // Add permissions for SSM Parameter Store
    signupLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ssm:GetParameter',
          'ssm:GetParameters',
        ],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/app/database/*`,
        ],
      })
    );

    // Create the Lambda function
    this.signupLambda = new lambda.Function(this, 'SignupFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/signup-handler'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        REGION: this.region,
        CLUSTER_ARN: props.dataStack.cluster.clusterArn,
        DATABASE_NAME: 'postgres',
      },
      role: signupLambdaRole,
      vpc: props.vpcStack.vpc,
      vpcSubnets: {
        subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [props.vpcStack.lambdaSecurityGroup],
    });

    // Create API Gateway
    this.signupApi = new apigateway.RestApi(this, 'SignupApi', {
      restApiName: 'Schiffer Signup API',
      description: 'API for user signup functionality',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
      },
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Create signup resource and method
    const signupResource = this.signupApi.root.addResource('signup');
    const signupIntegration = new apigateway.LambdaIntegration(this.signupLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    signupResource.addMethod('POST', signupIntegration, {
      methodResponses: [
        {
          statusCode: '200',
        },
        {
          statusCode: '400',
        },
        {
          statusCode: '500',
        },
      ],
    });

    // Store API Gateway URL in SSM Parameter Store
    new ssm.StringParameter(this, 'SignupApiUrl', {
      parameterName: '/app/api/signup-url',
      stringValue: this.signupApi.url,
      description: 'URL for the signup API endpoint',
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'SignupApiUrlOutput', {
      value: this.signupApi.url,
      description: 'URL for the signup API',
    });

    new cdk.CfnOutput(this, 'SignupEndpointOutput', {
      value: `${this.signupApi.url}signup`,
      description: 'Full URL for the signup endpoint',
    });
  }
}