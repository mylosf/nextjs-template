import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { VPCStack } from '../vpc/vpc-stack';

interface DataStackProps extends cdk.StackProps {
  vpcStack: VPCStack;
}

export class DataStack extends cdk.Stack {
  public readonly cluster: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    // Create database credentials secret
    const dbCredentials = new secretsmanager.Secret(this, 'DatabaseCredentials', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Allow deletion when stack is destroyed
    });

    // Create Aurora PostgreSQL Serverless v2 cluster
    // Deploy in private subnets only for security
    this.cluster = new rds.DatabaseCluster(this, 'PostgreSQLCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_3,
      }),
      credentials: rds.Credentials.fromSecret(dbCredentials),
      writer: rds.ClusterInstance.serverlessV2('writer', {
        instanceIdentifier: 'postgres-writer',
        autoMinorVersionUpgrade: false,
        publiclyAccessible: false, // Ensures no public access
      }),
      serverlessV2MinCapacity: 0,
      serverlessV2MaxCapacity: 1.0,
      vpc: props.vpcStack.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // Only private subnets
      },
      securityGroups: [props.vpcStack.databaseSecurityGroup],
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enableDataApi: true, // Required for RDS Data API VPC Endpoint
    });

    // Store database connection details in SSM Parameter Store
    new ssm.StringParameter(this, 'DatabaseEndpoint', {
      parameterName: '/app/database/endpoint',
      stringValue: this.cluster.clusterEndpoint.hostname,
    });

    new ssm.StringParameter(this, 'DatabasePort', {
      parameterName: '/app/database/port',
      stringValue: this.cluster.clusterEndpoint.port.toString(),
    });

    new ssm.StringParameter(this, 'DatabaseName', {
      parameterName: '/app/database/name',
      stringValue: 'postgres',
    });

    new ssm.StringParameter(this, 'DatabaseCredentialsArn', {
      parameterName: '/app/database/credentials-arn',
      stringValue: dbCredentials.secretArn,
    });

    // Output important values
    new cdk.CfnOutput(this, 'DatabaseEndpointOutput', {
      value: this.cluster.clusterEndpoint.hostname,
      description: 'Aurora PostgreSQL Cluster Endpoint',
    });

    new cdk.CfnOutput(this, 'DatabaseCredentialsSecretArn', {
      value: dbCredentials.secretArn,
      description: 'Database Credentials Secret ARN',
    });
  }
} 