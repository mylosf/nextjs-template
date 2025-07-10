import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface ApiStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  dbClusterArn: string;
  dbSecretArn: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Lambda for database operations
    const dbLambda = new lambda.Function(this, 'DatabaseFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/database-api'),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      environment: {
        CLUSTER_ARN: props.dbClusterArn,
        SECRET_ARN: props.dbSecretArn,
        DATABASE_NAME: 'postgres'
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Grant RDS Data API permissions
    dbLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'rds-data:ExecuteStatement',
        'rds-data:BatchExecuteStatement',
        'rds-data:BeginTransaction',
        'rds-data:CommitTransaction',
        'rds-data:RollbackTransaction'
      ],
      resources: [props.dbClusterArn]
    }));

    dbLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [props.dbSecretArn]
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'DatabaseAPI', {
      restApiName: 'Database API',
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://yourdomain.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    const integration = new apigateway.LambdaIntegration(dbLambda);

    // API routes
    const users = api.root.addResource('users');
    users.addMethod('GET', integration);
    users.addMethod('POST', integration);

    const user = users.addResource('{id}');
    user.addMethod('GET', integration);
    user.addMethod('PUT', integration);
    user.addMethod('DELETE', integration);

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Database API URL'
    });
  }
}