import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { VPCStack } from '../vpc/vpc-stack';
import { DataStack } from '../database/data-stack';

interface SQLTestStackProps extends cdk.StackProps {
  vpcStack: VPCStack;
  dataStack: DataStack;
}

export class SQLTestStack extends cdk.Stack {
  public readonly sqlTestLambda: lambda.Function;
  public readonly sqlTestApi: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: SQLTestStackProps) {
    super(scope, id, props);

    // Create IAM role for the Lambda function
    const sqlTestLambdaRole = new iam.Role(this, 'SQLTestLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Add permissions for RDS Data API and Secrets Manager
    sqlTestLambdaRole.addToPolicy(
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
    sqlTestLambdaRole.addToPolicy(
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
    sqlTestLambdaRole.addToPolicy(
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
    this.sqlTestLambda = new lambda.Function(this, 'SQLTestFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/sqltest-handler'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        REGION: this.region,
        CLUSTER_ARN: props.dataStack.cluster.clusterArn,
        DATABASE_NAME: 'postgres',
      },
      role: sqlTestLambdaRole,
      vpc: props.vpcStack.vpc,
      vpcSubnets: {
        subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [props.vpcStack.lambdaSecurityGroup],
    });

    // Create API Gateway
    this.sqlTestApi = new apigateway.RestApi(this, 'SQLTestApi', {
      restApiName: 'Schiffer SQL Test API',
      description: 'API for testing SQL queries on the database',
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

    // Create sql resource and method
    const sqlResource = this.sqlTestApi.root.addResource('sql');
    const sqlIntegration = new apigateway.LambdaIntegration(this.sqlTestLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    sqlResource.addMethod('POST', sqlIntegration, {
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
    new ssm.StringParameter(this, 'SQLTestApiUrl', {
      parameterName: '/app/api/sqltest-url',
      stringValue: this.sqlTestApi.url,
      description: 'URL for the SQL test API endpoint',
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'SQLTestApiUrlOutput', {
      value: this.sqlTestApi.url,
      description: 'URL for the SQL test API',
    });

    new cdk.CfnOutput(this, 'SQLTestEndpointOutput', {
      value: `${this.sqlTestApi.url}sql`,
      description: 'Full URL for the SQL test endpoint',
    });
  }
}