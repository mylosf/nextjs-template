import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';

export class VPCStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly lambdaSecurityGroup: ec2.SecurityGroup;
  public readonly databaseSecurityGroup: ec2.SecurityGroup;
  public readonly endpointSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with /16 CIDR (65,536 IPs - plenty of space for 6 subnets)
    this.vpc = new ec2.Vpc(this, 'ApplicationVPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 3,
      natGateways: 0, // No NAT gateways needed for serverless
      subnetConfiguration: [
        {
          cidrMask: 26, // /26 = 64 IPs per subnet
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 26, // /26 = 64 IPs per subnet
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create security group for VPC Endpoints
    this.endpointSecurityGroup = new ec2.SecurityGroup(this, 'EndpointSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for VPC Endpoints',
      allowAllOutbound: false,
    });

    // Create security group for Lambda functions
    this.lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: false,
    });

    // Create security group for Database
    this.databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Aurora PostgreSQL cluster',
      allowAllOutbound: false,
    });

    // Configure security group rules
    // Endpoint SG: Allow inbound from Lambda SG on HTTPS port
    this.endpointSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(443),
      'Allow Lambda to connect to VPC Endpoints'
    );

    // DB SG: Allow inbound from Lambda SG on PostgreSQL port
    this.databaseSecurityGroup.addIngressRule(
      this.lambdaSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to PostgreSQL'
    );

    // Lambda SG: Allow outbound to Endpoint SG on HTTPS port
    this.lambdaSecurityGroup.addEgressRule(
      this.endpointSecurityGroup,
      ec2.Port.tcp(443),
      'Allow Lambda to connect to VPC Endpoints'
    );

    // Lambda SG: Allow outbound to RDS SG on PostgreSQL port
    this.lambdaSecurityGroup.addEgressRule(
      this.databaseSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow Lambda to connect to PostgreSQL'
    );

    // Create RDS Data API VPC Endpoint
    new ec2.InterfaceVpcEndpoint(this, 'RDSDataAPIVpcEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.RDS_DATA,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [this.endpointSecurityGroup],
    });

    // Create SSM Parameter Store VPC Endpoint
    new ec2.InterfaceVpcEndpoint(this, 'SSMVpcEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [this.endpointSecurityGroup],
    });

    // Create Secrets Manager VPC Endpoint
    new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerVpcEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [this.endpointSecurityGroup],
    });

    // Add VPC Flow Logs for security monitoring
    const flowLogGroup = new logs.LogGroup(this, 'VPCFlowLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new ec2.FlowLog(this, 'VPCFlowLog', {
      resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
      destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup),
      trafficType: ec2.FlowLogTrafficType.ALL,
    });
  }
} 