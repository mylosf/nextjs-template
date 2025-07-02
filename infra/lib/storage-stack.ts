import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class StorageStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'SchifferConfigBucket', {
      // Bucket names must be globally unique
      bucketName: `schiffer-config-bucket-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT FOR PRODUCTION
      autoDeleteObjects: true, // NOT FOR PRODUCTION
      cors: [
        {
          allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.PUT],
          allowedOrigins: ['*'], // In production, restrict this to your actual domain
          allowedHeaders: ['*'],
        },
      ],
    });

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