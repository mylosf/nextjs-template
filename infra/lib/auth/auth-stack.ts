import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as fs from 'fs';
import * as path from 'path';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

export class AuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Cognito User Pool for authentication
    const userPool = new cognito.UserPool(this, 'SchifferUserPool', {
      userPoolName: 'schiffer-user-pool',
      // Users can sign themselves up
      selfSignUpEnabled: true,
      // Users sign in with their email
      signInAliases: {
        email: true,
      },
      // Automatically verify email addresses
      autoVerify: {
        email: true,
      },
      // Password policy
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      // Allow users to recover their account via email
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // Production: Retain user pool on stack deletion
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      // Basic MFA without advanced security (requires Plus plan)
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
    });

    // Create SSM parameters to store the User Pool details
    new ssm.StringParameter(this, 'UserPoolIdParameter', {
      parameterName: '/schiffer/auth/userPoolId',
      stringValue: userPool.userPoolId,
      description: 'Cognito User Pool ID for Schiffer app',
    });

    // Application client for the User Pool
    const userPoolClient = new cognito.UserPoolClient(this, 'SchifferUserPoolClient', {
      userPool,
      // Don't generate a client secret for web/mobile apps
      generateSecret: false,
      // Add security settings
      authFlows: {
        userSrp: true,
        userPassword: false, // Disable less secure flows
        adminUserPassword: false,
      },
      // Token validity
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      // Prevent user existence errors
      preventUserExistenceErrors: true,
    });

    new ssm.StringParameter(this, 'UserPoolClientIdParameter', {
      parameterName: '/schiffer/auth/userPoolClientId',
      stringValue: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID for Schiffer app',
    });

    // Cognito Identity Pool to grant temporary AWS credentials
    const identityPool = new cognito.CfnIdentityPool(this, 'SchifferIdentityPool', {
      allowUnauthenticatedIdentities: false, // Do not allow guests to get credentials
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    // IAM role for authenticated users
    const authenticatedRole = new iam.Role(this, 'CognitoAuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    // Grant minimal permissions to the authenticated role
    authenticatedRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:PutObjectAcl'],
        effect: iam.Effect.ALLOW,
        resources: [
          `arn:aws:s3:::schiffer-config-bucket-${this.account}-${this.region}/users/\${cognito-identity.amazonaws.com:sub}/*`
        ],
        conditions: {
          StringEquals: {
            's3:x-amz-acl': 'private'
          }
        }
      })
    );

    // Add CloudWatch monitoring for Cognito
    const cognitoLogGroup = new logs.LogGroup(this, 'CognitoLogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    
    // Attach the role to the identity pool
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
      },
    });

    // Store the Identity Pool ID in SSM
    new ssm.StringParameter(this, 'IdentityPoolIdParameter', {
      parameterName: '/schiffer/auth/identityPoolId',
      stringValue: identityPool.ref,
      description: 'Cognito Identity Pool ID for Schiffer app',
    });

    // Output the User Pool ID and Client ID for the frontend to use
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
    });
  }
} 