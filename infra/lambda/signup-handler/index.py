import json
import boto3
import logging
import os
from datetime import datetime
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

def create_user_record(email: str, display_name: str, cognito_user_id: str = None) -> Dict[str, Any]:
    """Create a new user record in the users table"""
    try:
        # Insert user record using the existing table structure
        user_sql = """
        INSERT INTO users (username, email, is_active)
        VALUES (:username, :email, :is_active)
        RETURNING user_uuid::text, username, email, is_active
        """
        
        parameters = [
            {'name': 'username', 'value': {'stringValue': display_name}},
            {'name': 'email', 'value': {'stringValue': email}},
            {'name': 'is_active', 'value': {'booleanValue': True}}
        ]
        
        response = execute_sql(user_sql, parameters)
        
        if response.get('records'):
            user_record = response['records'][0]
            return {
                'user_uuid': user_record[0]['stringValue'],
                'username': user_record[1]['stringValue'],
                'email': user_record[2]['stringValue'],
                'is_active': user_record[3]['booleanValue']
            }
        else:
            raise Exception("No user record returned from insert")
            
    except Exception as e:
        logger.error(f"Error creating user record: {str(e)}")
        raise

def create_signup_event(user_uuid: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a signup event record in the user_events table"""
    try:
        event_sql = """
        INSERT INTO user_events (user_uuid, type, timestamp)
        VALUES (:user_uuid::uuid, 'signup', NOW())
        RETURNING event_uuid::text, user_uuid::text, type, timestamp
        """
        
        parameters = [
            {'name': 'user_uuid', 'value': {'stringValue': user_uuid}}
        ]
        
        response = execute_sql(event_sql, parameters)
        
        if response.get('records'):
            event_record = response['records'][0]
            return {
                'event_uuid': event_record[0]['stringValue'],
                'user_uuid': event_record[1]['stringValue'],
                'type': event_record[2]['stringValue'],
                'timestamp': event_record[3]['stringValue']
            }
        else:
            raise Exception("No event record returned from insert")
            
    except Exception as e:
        logger.error(f"Error creating signup event: {str(e)}")
        raise

def validate_input(event_body: Dict[str, Any]) -> Dict[str, str]:
    """Validate input parameters"""
    required_fields = ['email', 'display_name']
    errors = {}
    
    for field in required_fields:
        if not event_body.get(field):
            errors[field] = f"{field} is required"
        elif not isinstance(event_body[field], str):
            errors[field] = f"{field} must be a string"
        elif len(event_body[field].strip()) == 0:
            errors[field] = f"{field} cannot be empty"
    
    # Additional email validation
    if 'email' not in errors:
        email = event_body['email'].strip()
        if '@' not in email or '.' not in email:
            errors['email'] = "Invalid email format"
    
    # Additional display name validation
    if 'display_name' not in errors:
        display_name = event_body['display_name'].strip()
        if len(display_name) > 100:
            errors['display_name'] = "Display name cannot exceed 100 characters"
    
    return errors

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
        
        # Validate input
        validation_errors = validate_input(body)
        if validation_errors:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Validation failed',
                    'details': validation_errors
                })
            }
        
        # Extract and clean input data
        email = body['email'].strip().lower()
        display_name = body['display_name'].strip()
        cognito_user_id = body.get('cognito_user_id', '').strip()
        
        # Check if user already exists
        check_user_sql = "SELECT user_uuid::text, email FROM users WHERE email = :email"
        check_response = execute_sql(check_user_sql, [
            {'name': 'email', 'value': {'stringValue': email}}
        ])
        
        if check_response.get('records'):
            return {
                'statusCode': 409,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'error': 'User already exists',
                    'email': email
                })
            }
        
        # Create user record
        user_record = create_user_record(email, display_name, cognito_user_id)
        
        # Create signup event
        event_data = {
            'signup_method': 'web',
            'user_agent': event.get('headers', {}).get('User-Agent', ''),
            'ip_address': event.get('requestContext', {}).get('identity', {}).get('sourceIp', ''),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        signup_event = create_signup_event(user_record['user_uuid'], event_data)
        
        logger.info(f"Successfully created user {user_record['user_uuid']} and signup event {signup_event['event_uuid']}")
        
        # Return success response
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'message': 'User created successfully',
                'user': {
                    'user_uuid': user_record['user_uuid'],
                    'email': user_record['email'],
                    'username': user_record['username'],
                    'is_active': user_record['is_active']
                },
                'event': {
                    'event_uuid': signup_event['event_uuid'],
                    'type': signup_event['type'],
                    'timestamp': signup_event['timestamp']
                }
            })
        }
        
    except Exception as e:
        logger.error(f"Error processing signup: {str(e)}")
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