import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'path';
import { VPCStack } from '../vpc/vpc-stack';
import { DataStack } from '../database/data-stack';

interface DDLStackProps extends cdk.StackProps {
  vpcStack: VPCStack;
  dataStack: DataStack;
}

export class DDLStack extends cdk.Stack {
  public readonly ddlFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: DDLStackProps) {
    super(scope, id, props);

    // Create IAM role for Lambda function
    const ddlLambdaRole = new iam.Role(this, 'DDLLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Add permissions for RDS Data API
    ddlLambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'rds-data:ExecuteStatement',
        'rds-data:BatchExecuteStatement',
        'rds-data:BeginTransaction',
        'rds-data:CommitTransaction',
        'rds-data:RollbackTransaction',
      ],
      resources: [props.dataStack.cluster.clusterArn],
    }));

    // Add permissions for Secrets Manager (for database credentials)
    ddlLambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
      ],
      resources: ['*'], // Will be scoped to the database secret
    }));

    // Add permissions for SSM Parameter Store
    ddlLambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ssm:GetParameter',
        'ssm:GetParameters',
      ],
      resources: [
        `arn:aws:ssm:${this.region}:${this.account}:parameter/app/database/*`,
      ],
    }));

    // Create Lambda function
    this.ddlFunction = new lambda.Function(this, 'DDLFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/ddl-function')),
      role: ddlLambdaRole,
      vpc: props.vpcStack.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [props.vpcStack.lambdaSecurityGroup],
      environment: {
        DATABASE_CLUSTER_ARN: props.dataStack.cluster.clusterArn,
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
    });

    // Output Lambda function ARN
    new cdk.CfnOutput(this, 'DDLFunctionArn', {
      value: this.ddlFunction.functionArn,
      description: 'DDL Lambda Function ARN',
    });

    new cdk.CfnOutput(this, 'DDLFunctionName', {
      value: this.ddlFunction.functionName,
      description: 'DDL Lambda Function Name',
    });
  }
} 