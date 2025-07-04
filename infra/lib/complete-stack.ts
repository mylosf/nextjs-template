import { Duration, Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CompleteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3 Bucket for generated zip files
    const generatedZipBucket = new s3.Bucket(this, 'GeneratedZipBucket', {
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production
      autoDeleteObjects: true, // NOT recommended for production
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

    // Lambda Function 2: Bedrock Joke Generator
    const bedrockJokeGeneratorLambda = new lambda.Function(this, 'BedrockJokeGeneratorLambda', {
      runtime: lambda.Runtime.PYTHON_3_9, // Python runtime for the new Lambda
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/bedrock-joke-generator'),
      memorySize: 512, // Sufficient memory for a simple Bedrock call
      timeout: Duration.minutes(1),
      environment: {
        BEDROCK_REGION: this.region,
      },
    });

    // Grant Bedrock Joke Generator Lambda permissions to invoke Bedrock models
    bedrockJokeGeneratorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
      ],
      resources: [
        'arn:aws:bedrock:*:*:foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
      ],
    }));

    // Step Functions Tasks
    const processJsonTask = new tasks.LambdaInvoke(this, 'ProcessJson', {
      lambdaFunction: jsonProcessorLambda,
      outputPath: '$',
    });

    const generateJokeTask = new tasks.LambdaInvoke(this, 'GenerateJoke', {
      lambdaFunction: bedrockJokeGeneratorLambda,
      inputPath: '$',
      outputPath: '$.Payload', // Pass all previous payload and add joke
    });

    // Step Functions Workflow Definition
    const definition = processJsonTask.next(generateJokeTask);

    const stateMachine = new sfn.StateMachine(this, 'CompleteWorkflow', {
      definition,
      stateMachineName: 'CompleteWorkflow',
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
  }
} 