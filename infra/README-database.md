# Database Infrastructure

## Automatic Table Creation

Yes! The Lambda function **will automatically run** and create the tables during CDK deployment.

### How it works:

1. **CDK Custom Resource**: The `DatabaseInitializer` custom resource automatically triggers the Lambda function when the stack is deployed
2. **Lambda Execution**: The `InitDatabaseFunction` runs with the AWS Advanced Python Wrapper to create all required tables
3. **Dependency Management**: The custom resource waits for the Aurora cluster to be ready before executing

### Tables Created Automatically:

- **`users`**: User accounts with UUID primary keys
- **`user_events`**: User activity tracking
- **`user_transactions`**: Payment and transaction records  
- **`projects`**: User project data with S3 links

### Database Features:

✅ **UUID Primary Keys** with auto-generation  
✅ **Foreign Key Constraints** for data integrity  
✅ **Indexes** on frequently queried columns  
✅ **Auto-updating timestamps** via triggers  
✅ **Robust connection handling** with AWS Advanced Python Wrapper  

### Deployment

```bash
cd infra
cdk deploy SchifferDataStack
```

The tables will be created automatically during deployment. You can verify this by:

1. Checking CloudFormation stack events
2. Viewing Lambda function logs in CloudWatch
3. Connecting to the database and running `\dt` to list tables

### Connection Details

After deployment, connection parameters are stored in SSM Parameter Store:

- `/app/database/endpoint` - Aurora cluster endpoint
- `/app/database/port` - Database port (5432)
- `/app/database/name` - Database name (postgres)
- `/app/database/credentials-arn` - Secrets Manager ARN for credentials

### Lambda Function Details

- **Runtime**: Python 3.11
- **Timeout**: 5 minutes
- **VPC**: Deployed in private subnets
- **Dependencies**: AWS Advanced Python Wrapper, psycopg, boto3
- **Authentication**: Secrets Manager integration

The Lambda will handle failover scenarios automatically and provides much faster reconnection than standard PostgreSQL drivers (7 seconds vs 30+ seconds). 