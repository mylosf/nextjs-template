#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth/auth-stack';
import { HostingStack } from '../lib/hosting/hosting-stack';
import { StorageStack } from '../lib/storage/storage-stack';
import { DataStack } from '../lib/database/data-stack';
import { JSONUploadStack } from '../lib/lambdas/json-upload-stack';
import { CompleteStack } from '../lib/lambdas/complete-stack';
import { VPCStack } from '../lib/vpc/vpc-stack';
import { DDLStack } from '../lib/ddl/ddl-stack';
import { SignupStack } from '../lib/signup/signup-stack';
import { SQLTestStack } from '../lib/sqltest/sqltest-stack';

const app = new cdk.App();

// Create VPC stack first as other stacks depend on it
const vpcStack = new VPCStack(app, 'SchifferVPCStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Create new data stack with VPC reference using a different name
const dataStack = new DataStack(app, 'SchifferDataStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpcStack: vpcStack,
});

// Add dependency to ensure VPC is created first
dataStack.addDependency(vpcStack);

// Create DDL stack for database table creation
const ddlStack = new DDLStack(app, 'SchifferDDLStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpcStack: vpcStack,
  dataStack: dataStack,
});

// Add dependencies to ensure VPC and data stack are created first
ddlStack.addDependency(vpcStack);
ddlStack.addDependency(dataStack);

// Create Signup stack for user registration
const signupStack = new SignupStack(app, 'SchifferSignupStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpcStack: vpcStack,
  dataStack: dataStack,
});

// Add dependencies to ensure VPC and data stack are created first
signupStack.addDependency(vpcStack);
signupStack.addDependency(dataStack);

// Create SQL Test stack for database testing
const sqlTestStack = new SQLTestStack(app, 'SchifferSQLTestStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  vpcStack: vpcStack,
  dataStack: dataStack,
});

// Add dependencies to ensure VPC and data stack are created first
sqlTestStack.addDependency(vpcStack);
sqlTestStack.addDependency(dataStack);

// Create other stacks
new AuthStack(app, 'SchifferAuthStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new HostingStack(app, 'SchifferHostingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new StorageStack(app, 'SchifferStorageStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new JSONUploadStack(app, 'SchifferJSONUploadStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new CompleteStack(app, 'SchifferCompleteStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});