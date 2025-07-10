import json
import boto3
import os
import logging
from typing import Dict, Any

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
rds_data_client = boto3.client('rds-data')
ssm_client = boto3.client('ssm')

def get_database_config() -> Dict[str, str]:
    """Get database configuration from SSM Parameter Store"""
    try:
        # Get database parameters from SSM
        parameter_names = [
            '/app/database/credentials-arn',
            '/app/database/name'
        ]
        
        response = ssm_client.get_parameters(Names=parameter_names)
        
        config = {}
        for param in response['Parameters']:
            key = param['Name'].split('/')[-1]  # Get the last part of the parameter name
            config[key] = param['Value']
        
        # Add cluster ARN from environment variable
        config['cluster_arn'] = os.environ['DATABASE_CLUSTER_ARN']
        
        return config
    except Exception as e:
        logger.error(f"Error getting database configuration: {str(e)}")
        raise

def execute_sql(sql: str, database_config: Dict[str, str]) -> Dict[str, Any]:
    """Execute SQL statement using RDS Data API"""
    try:
        response = rds_data_client.execute_statement(
            resourceArn=database_config['cluster_arn'],
            secretArn=database_config['credentials-arn'],
            database=database_config['name'],
            sql=sql
        )
        return response
    except Exception as e:
        logger.error(f"Error executing SQL: {str(e)}")
        raise

def create_tables(database_config: Dict[str, str]) -> Dict[str, Any]:
    """Create database tables"""
    results = {}
    
    # Drop test table if it exists
    drop_statements = {
        'drop_test_table': 'DROP TABLE IF EXISTS test_table;'
    }
    
    # DDL statements for creating the new tables
    ddl_statements = {
        'users_table': '''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                cognito_user_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''',
        
        'user_events_table': '''
            CREATE TABLE IF NOT EXISTS user_events (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                event_type VARCHAR(50) NOT NULL,
                event_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ''',
        
        'projects_table': '''
            CREATE TABLE IF NOT EXISTS projects (
                id SERIAL PRIMARY KEY,
                project_name VARCHAR(255) NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                s3_link VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (project_name, user_id)
            );
        ''',
        
        'user_transactions_table': '''
            CREATE TABLE IF NOT EXISTS user_transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                transaction_type VARCHAR(50) NOT NULL,
                amount DECIMAL(10,2),
                status VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        '''
    }
    
    # Create indexes for better performance
    index_statements = {
        'idx_users_email': 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
        'idx_users_cognito_user_id': 'CREATE INDEX IF NOT EXISTS idx_users_cognito_user_id ON users(cognito_user_id);',
        'idx_projects_user_id': 'CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);',
        'idx_user_transactions_user_id': 'CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);',
        'idx_user_transactions_status': 'CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);',
        'idx_user_events_user_id': 'CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);',
        'idx_user_events_type': 'CREATE INDEX IF NOT EXISTS idx_user_events_type ON user_events(event_type);'
    }
    
    try:
        # Drop old test table
        logger.info("Dropping test table if it exists...")
        for drop_name, drop_sql in drop_statements.items():
            logger.info(f"Executing: {drop_name}")
            response = execute_sql(drop_sql, database_config)
            results[drop_name] = {
                'status': 'success',
                'rows_affected': response.get('numberOfRecordsUpdated', 0)
            }
        
        # Execute DDL statements
        logger.info("Creating new tables...")
        for table_name, ddl in ddl_statements.items():
            logger.info(f"Creating table: {table_name}")
            response = execute_sql(ddl, database_config)
            results[table_name] = {
                'status': 'success',
                'rows_affected': response.get('numberOfRecordsUpdated', 0)
            }
        
        # Create indexes
        logger.info("Creating indexes...")
        for index_name, index_sql in index_statements.items():
            logger.info(f"Creating index: {index_name}")
            response = execute_sql(index_sql, database_config)
            results[index_name] = {
                'status': 'success',
                'rows_affected': response.get('numberOfRecordsUpdated', 0)
            }
        
        logger.info("All tables and indexes created successfully")
        return results
        
    except Exception as e:
        logger.error(f"Error creating tables: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Lambda function handler"""
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Get database configuration
        database_config = get_database_config()
        logger.info("Database configuration retrieved successfully")
        
        # Determine action from event
        action = event.get('action', 'create_tables')
        
        if action == 'create_tables':
            results = create_tables(database_config)
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Tables created successfully',
                    'results': results
                })
            }
        
        elif action == 'test_connection':
            # Test database connection
            test_sql = "SELECT version() as version, current_database() as database;"
            response = execute_sql(test_sql, database_config)
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Database connection successful',
                    'database_info': response.get('records', [])
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': f'Unknown action: {action}',
                    'available_actions': ['create_tables', 'test_connection']
                })
            }
            
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Internal server error'
            })
        } 