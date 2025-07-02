#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { HostingStack } from '../lib/hosting-stack';
import { StorageStack } from '../lib/storage-stack';
import { DataStack } from '../lib/data-stack';
import { JSONUploadStack } from '../lib/json-upload-stack';

const app = new cdk.App();

// Define the environment
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

// Create the stacks and use the original names to avoid conflicts
const authStack = new AuthStack(app, 'SchifferAuthStack', { env: env });
const hostingStack = new HostingStack(app, 'SchifferHostingStack', { env: env });
const storageStack = new StorageStack(app, 'SchifferStorageStack', { env: env });
const dataStack = new DataStack(app, 'SchifferDataStack', { env });
const jsonUploadStack = new JSONUploadStack(app, 'SchifferJSONUploadStack', { env });

/*Add dependencies between stacks if needed
storageStack.addDependency(authStack);
dataStack.addDependency(authStack);
hostingStack.addDependency(authStack);
hostingStack.addDependency(storageStack);
hostingStack.addDependency(dataStack);
jsonUploadStack.addDependency(authStack);*/