import { Duration, Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CompleteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Dead Letter Queue for failed processing
    const dlq = new sqs.Queue(this, 'ProcessingDLQ', {
      retentionPeriod: Duration.days(14),
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Main processing queue
    const processingQueue = new sqs.Queue(this, 'ComponentGenerationQueue', {
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3
      },
      visibilityTimeout: Duration.minutes(5),
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // S3 Bucket for generated zip files
    const generatedZipBucket = new s3.Bucket(this, 'GeneratedZipBucket', {
      removalPolicy: RemovalPolicy.RETAIN, // Production: Retain bucket
      autoDeleteObjects: false, // Production: Don't auto-delete
      versioned: true,
      lifecycleRules: [{
        id: 'DeleteOldVersions',
        noncurrentVersionExpiration: Duration.days(30)
      }]
    });

    // S3 Bucket for generated components
    const componentsBucket = new s3.Bucket(this, 'ComponentsBucket', {
      bucketName: 'schiffer-comps',
      removalPolicy: RemovalPolicy.RETAIN, // Production: Retain bucket
      autoDeleteObjects: false, // Production: Don't auto-delete
      versioned: true,
      lifecycleRules: [{
        id: 'TransitionToIA',
        transitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: Duration.days(30)
        }]
      }]
    });

    // Lambda Function 1: JSON Processor
    const jsonProcessorLambda = new lambda.Function(this, 'JsonProcessorLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/json-processor'), // Corrected path
      memorySize: 1024,
      timeout: Duration.minutes(5),
      environment: {
        S3_BUCKET_NAME: generatedZipBucket.bucketName,
      },
    });

    // Grant the JSON processor Lambda permissions to write to the S3 bucket
    generatedZipBucket.grantWrite(jsonProcessorLambda);

    // Lambda Function 2: Bedrock Component Generator
    const bedrockComponentGeneratorLambda = new lambda.Function(this, 'BedrockComponentGeneratorLambda', {
      runtime: lambda.Runtime.PYTHON_3_9, // Python runtime for the new Lambda
      handler: 'index.lambda_handler',
      code: lambda.Code.fromAsset('lambda/bedrock-joke-generator'),
      memorySize: 1024, // Increased memory for component generation
      timeout: Duration.minutes(3), // Increased timeout for component generation
      environment: {
        BEDROCK_REGION: this.region,
        COMPONENTS_BUCKET_NAME: componentsBucket.bucketName,
      },
    });

    // Grant Bedrock Component Generator Lambda permissions to invoke Bedrock models
    bedrockComponentGeneratorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
      ],
      resources: [
        'arn:aws:bedrock:*:*:foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
      ],
    }));

    // Grant the Bedrock Component Generator Lambda permissions to write to the components bucket
    componentsBucket.grantWrite(bedrockComponentGeneratorLambda);

    // Step Functions Tasks
    const processJsonTask = new tasks.LambdaInvoke(this, 'ProcessJson', {
      lambdaFunction: jsonProcessorLambda,
      outputPath: '$',
    });

    const generateComponentTask = new tasks.LambdaInvoke(this, 'GenerateComponent', {
      lambdaFunction: bedrockComponentGeneratorLambda,
      inputPath: '$',
      outputPath: '$',
    });

    // Step Functions Workflow Definition
    const definition = processJsonTask.next(generateComponentTask);

    const stateMachine = new sfn.StateMachine(this, 'CompleteWorkflow', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      stateMachineName: 'CompleteWorkflow',
      timeout: Duration.minutes(30), // Add timeout
    });

    // Add CloudWatch Alarms
    new cloudwatch.Alarm(this, 'StepFunctionFailureAlarm', {
      metric: stateMachine.metricFailed(),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Step Function execution failed'
    });

    new cloudwatch.Alarm(this, 'JsonProcessorLambdaErrorAlarm', {
      metric: jsonProcessorLambda.metricErrors(),
      threshold: 3,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'JSON Processor Lambda errors detected'
    });

    new cloudwatch.Alarm(this, 'BedrockLambdaErrorAlarm', {
      metric: bedrockComponentGeneratorLambda.metricErrors(),
      threshold: 3,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: 'Bedrock Component Generator Lambda errors detected'
    });

    new CfnOutput(this, 'CompleteWorkflowArn', {
      value: stateMachine.stateMachineArn,
      description: 'The ARN of the Complete Step Functions Workflow',
      exportName: 'CompleteWorkflowArn',
    });

    new CfnOutput(this, 'GeneratedZipBucketName', {
      value: generatedZipBucket.bucketName,
      description: 'The name of the S3 bucket where generated zip files are stored',
      exportName: 'GeneratedZipBucketName',
    });

    new CfnOutput(this, 'ComponentsBucketName', {
      value: componentsBucket.bucketName,
      description: 'The name of the S3 bucket where generated components are stored',
      exportName: 'ComponentsBucketName',
    });

    new CfnOutput(this, 'ComponentGenerationQueueUrl', {
      value: processingQueue.queueUrl,
      description: 'The URL of the SQS queue for component generation',
      exportName: 'ComponentGenerationQueueUrl',
    });
  }
} 