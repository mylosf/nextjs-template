import json
import boto3
import logging
import os
import urllib3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def send_response(event, context, response_status, response_data=None, physical_resource_id=None):
    """Send response to CloudFormation"""
    if response_data is None:
        response_data = {}
    
    if physical_resource_id is None:
        physical_resource_id = context.log_stream_name
    
    # Check if this is a CloudFormation custom resource event
    if 'ResponseURL' not in event:
        logger.info("Not a CloudFormation custom resource event, skipping response")
        return
    
    response_url = event['ResponseURL']
    
    response_body = {
        'Status': response_status,
        'Reason': f'See the details in CloudWatch Log Stream: {context.log_stream_name}',
        'PhysicalResourceId': physical_resource_id,
        'StackId': event['StackId'],
        'RequestId': event['RequestId'],
        'LogicalResourceId': event['LogicalResourceId'],
        'Data': response_data
    }
    
    json_response_body = json.dumps(response_body)
    
    headers = {
        'content-type': '',
        'content-length': str(len(json_response_body))
    }
    
    try:
        http = urllib3.PoolManager()
        response = http.request('PUT', response_url, body=json_response_body, headers=headers)
        logger.info(f"CloudFormation response sent successfully: {response.status}")
    except Exception as e:
        logger.error(f"Failed to send response to CloudFormation: {str(e)}")

def initialize_database(cluster_endpoint, secret_arn, region, account_id):
    """Initialize database tables and return success status"""
    logger.info(f"Initializing database on cluster: {cluster_endpoint}")
    
    # Use RDS Data API
    rds_data = boto3.client('rds-data', region_name=region)
    
    # Create database ARN for Data API
    cluster_name = cluster_endpoint.split('.')[0]  # Extract cluster name from endpoint
    cluster_arn = f"arn:aws:rds:{region}:{account_id}:cluster:{cluster_name}"
    
    logger.info(f"Using cluster ARN: {cluster_arn}")
    logger.info(f"Using secret ARN: {secret_arn}")
    
    # Create tables using RDS Data API
    sql_statements = [
        # Enable UUID extension
        "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",
        
        # Create users table
        """CREATE TABLE IF NOT EXISTS users (
            user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );""",
        
        # Create user_events table
        """CREATE TABLE IF NOT EXISTS user_events (
            event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            type VARCHAR(100) NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );""",
        
        # Create user_transactions table
        """CREATE TABLE IF NOT EXISTS user_transactions (
            trans_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            type VARCHAR(100) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );""",
        
        # Create projects table
        """CREATE TABLE IF NOT EXISTS projects (
            project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            s3_link TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );""",
        
        # Create indexes for better performance
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);",
        "CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(type);",
        "CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);",
        "CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);",
        
        # Create triggers for updated_at timestamps
        """CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';""",
        
        """CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();""",
            
        """CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"""
    ]
    
    # Execute each SQL statement
    for i, sql in enumerate(sql_statements):
        try:
            logger.info(f"Executing SQL statement {i+1}/{len(sql_statements)}")
            response = rds_data.execute_statement(
                resourceArn=cluster_arn,
                secretArn=secret_arn,
                database='postgres',
                sql=sql
            )
            logger.info(f"SQL statement {i+1} executed successfully")
        except Exception as e:
            logger.error(f"Error executing SQL statement {i+1}: {str(e)}")
            logger.error(f"SQL: {sql}")
            raise e
    
    logger.info("All database tables and indexes created successfully")
    return True

def handler(event, context):
    logger.info(f"Received event: {json.dumps(event, default=str)}")
    
    try:
        # Get database connection parameters from environment variables
        cluster_endpoint = os.environ['CLUSTER_ENDPOINT']
        secret_arn = os.environ['SECRET_ARN']
        region = os.environ['AWS_REGION']
        account_id = context.invoked_function_arn.split(':')[4]
        
        # Handle CloudFormation custom resource events
        request_type = event.get('RequestType', 'Create')
        
        # Only run database initialization on Create and Update, or manual invocation
        if request_type in ['Create', 'Update'] or 'RequestType' not in event:
            success = initialize_database(cluster_endpoint, secret_arn, region, account_id)
            
            if success:
                # Send success response to CloudFormation (if it's a CF event)
                send_response(event, context, 'SUCCESS', {'Message': 'Database initialized successfully'})
                
                return {
                    'statusCode': 200,
                    'body': json.dumps('Database initialized successfully')
                }
            else:
                raise Exception("Database initialization failed")
                
        elif request_type == 'Delete':
            logger.info("Delete request received - no action needed")
            # Send success response to CloudFormation
            send_response(event, context, 'SUCCESS', {'Message': 'Delete completed - no action taken'})
            
            return {
                'statusCode': 200,
                'body': json.dumps('Delete completed - no action taken')
            }
        
    except Exception as e:
        logger.error(f"Error in handler: {str(e)}")
        
        # Send failure response to CloudFormation (if it's a CF event)
        send_response(event, context, 'FAILED', {'Error': str(e)})
        
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        } 