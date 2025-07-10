import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';

export class StorageStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the bucket
    this.bucket = new s3.Bucket(this, 'SchifferConfigBucket', {
      // Bucket names must be globally unique
      bucketName: `schiffer-config-bucket-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Production: Retain bucket
      autoDeleteObjects: false, // Production: Don't auto-delete
      lifecycleRules: [{
        id: 'TransitionToIA',
        transitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30)
        }, {
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: cdk.Duration.days(90)
        }]
      }],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.PUT],
          allowedOrigins: ['https://yourdomain.com'], // Production: Restrict to actual domain
          allowedHeaders: ['Content-Type', 'Authorization'],
          maxAge: 3000,
        },
      ],
      serverAccessLogsPrefix: 'access-logs/',
      eventBridgeEnabled: true, // Enable EventBridge for S3 events
    });

    // Add bucket policy
    const bucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetBucketTagging',
        's3:PutBucketTagging',
        's3:GetBucketVersioning',
        's3:GetBucketPolicy',
        's3:DeleteBucketPolicy',
      ],
      resources: [this.bucket.bucketArn],
      principals: [new iam.ServicePrincipal('s3.amazonaws.com')],
    });

    this.bucket.addToResourcePolicy(bucketPolicy);

    // Store the bucket name in SSM Parameter Store
    new ssm.StringParameter(this, 'ConfigBucketNameParameter', {
      parameterName: '/schiffer/storage/configBucketName',
      stringValue: this.bucket.bucketName,
      description: 'S3 bucket name for user configurations',
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'ConfigBucketName', {
      value: this.bucket.bucketName,
    });
  }
} 