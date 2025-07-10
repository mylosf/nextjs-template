import json
import boto3
import logging
import os
from typing import Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
rds_client = boto3.client('rds-data')
ssm_client = boto3.client('ssm')

def get_database_config() -> Dict[str, str]:
    """Get database configuration from SSM Parameter Store"""
    try:
        # Get database credentials ARN
        credentials_response = ssm_client.get_parameter(
            Name='/app/database/credentials-arn'
        )
        credentials_arn = credentials_response['Parameter']['Value']
        
        # Get cluster ARN from environment variable
        cluster_arn = os.environ.get('CLUSTER_ARN')
        
        # Get database name from environment variable
        database_name = os.environ.get('DATABASE_NAME', 'postgres')
        
        return {
            'cluster_arn': cluster_arn,
            'credentials_arn': credentials_arn,
            'database_name': database_name
        }
    except Exception as e:
        logger.error(f"Error getting database config: {str(e)}")
        raise

def execute_sql(sql: str, parameters: list = None) -> Dict[str, Any]:
    """Execute SQL statement using RDS Data API"""
    try:
        db_config = get_database_config()
        
        request_params = {
            'resourceArn': db_config['cluster_arn'],
            'secretArn': db_config['credentials_arn'],
            'database': db_config['database_name'],
            'sql': sql
        }
        
        if parameters:
            request_params['parameters'] = parameters
        
        response = rds_client.execute_statement(**request_params)
        return response
    except Exception as e:
        logger.error(f"Error executing SQL: {str(e)}")
        raise

def format_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """Format the RDS Data API response for better readability"""
    formatted = {
        'records': [],
        'numberOfRecordsUpdated': response.get('numberOfRecordsUpdated', 0),
        'columnMetadata': response.get('columnMetadata', [])
    }
    
    # Convert records to a more readable format
    records = response.get('records', [])
    column_metadata = response.get('columnMetadata', [])
    
    for record in records:
        formatted_record = {}
        for i, field in enumerate(record):
            column_name = column_metadata[i]['name'] if i < len(column_metadata) else f'column_{i}'
            
            # Extract the actual value from the field
            if 'stringValue' in field:
                formatted_record[column_name] = field['stringValue']
            elif 'longValue' in field:
                formatted_record[column_name] = field['longValue']
            elif 'doubleValue' in field:
                formatted_record[column_name] = field['doubleValue']
            elif 'booleanValue' in field:
                formatted_record[column_name] = field['booleanValue']
            elif 'isNull' in field and field['isNull']:
                formatted_record[column_name] = None
            else:
                formatted_record[column_name] = str(field)
        
        formatted['records'].append(formatted_record)
    
    return formatted

def validate_sql(sql: str) -> tuple[bool, str]:
    """Basic SQL validation to prevent dangerous operations"""
    sql_upper = sql.upper().strip()
    
    # Block only the most dangerous operations
    dangerous_keywords = ['DROP', 'TRUNCATE', 'ALTER', 'CREATE']
    
    # Allow SELECT, DELETE, INSERT, UPDATE for testing purposes
    # But block table structure changes
    if not sql_upper.startswith(('SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'DELETE', 'INSERT', 'UPDATE')):
        # Check if it's a table listing query
        if not any(phrase in sql_upper for phrase in [
            'INFORMATION_SCHEMA.TABLES',
            'INFORMATION_SCHEMA.COLUMNS',
            'PG_TABLES',
            'PG_CLASS'
        ]):
            for keyword in dangerous_keywords:
                if keyword in sql_upper:
                    return False, f"Operation '{keyword}' is not allowed for security reasons"
    
    # Additional safety check for DROP operations in any part of the query
    if 'DROP' in sql_upper:
        return False, "DROP operations are not allowed for security reasons"
    
    return True, "Valid"

def handler(event, context):
    """Main Lambda handler function"""
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Parse request body
        try:
            if isinstance(event.get('body'), str):
                body = json.loads(event['body'])
            else:
                body = event.get('body', {})
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Invalid JSON in request body'
                })
            }
        
        # Extract SQL query
        sql_query = body.get('sql', '').strip()
        if not sql_query:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'SQL query is required',
                    'example': {
                        'sql': 'SELECT * FROM information_schema.tables WHERE table_schema = \'public\''
                    }
                })
            }
        
        # Validate SQL for security
        is_valid, validation_message = validate_sql(sql_query)
        if not is_valid:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'error': validation_message,
                    'allowed_operations': ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'DELETE', 'INSERT', 'UPDATE'],
                    'example_queries': [
                        'SELECT * FROM information_schema.tables WHERE table_schema = \'public\'',
                        'SELECT * FROM information_schema.columns WHERE table_schema = \'public\'',
                        'SELECT version()',
                        'SELECT current_database()',
                        'DELETE FROM user_events WHERE type = \'test\'',
                        'INSERT INTO users (username, email, is_active) VALUES (\'test\', \'test@test.com\', true)'
                    ]
                })
            }
        
        # Execute SQL query
        try:
            response = execute_sql(sql_query)
            formatted_response = format_response(response)
            
            logger.info(f"Successfully executed SQL query: {sql_query}")
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'query': sql_query,
                    'result': formatted_response,
                    'execution_time': 'Not measured'
                })
            }
            
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Database error',
                    'message': str(db_error),
                    'query': sql_query
                })
            }
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }