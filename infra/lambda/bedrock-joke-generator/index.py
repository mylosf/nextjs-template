import json
import boto3
import os
from botocore.exceptions import ClientError

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='eu-central-1')
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")
        
        # Get the S3 bucket name from environment variable
        components_bucket = os.environ.get('COMPONENTS_BUCKET_NAME')
        if not components_bucket:
            raise ValueError("COMPONENTS_BUCKET_NAME environment variable not set")
        
        # Extract sitemap data from the event
        sitemap_data = event.get('sitemap_data', {})
        
        # Hardcoded natural language brief
        natural_language_brief = "Create a hero section about my tech startup."
        
        # Construct the prompt for Bedrock
        prompt = f"""You are an expert front-end engineer. Create a React TypeScript component for: {natural_language_brief}

Requirements:
- React 18+ with TypeScript
- Use shadcn/ui components (import from @/components/ui/*)
- Tailwind CSS classes only
- Responsive design
- Accessible (WCAG 2.1 AA)
- Minimalistic design

CRITICAL: Return ONLY valid TypeScript code. No explanations, no markdown, no backticks, no text before or after the code. Start directly with import statements and end with the export."""

        # Call Bedrock to generate the component
        response = bedrock_runtime.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 2000,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            }),
            contentType='application/json'
        )
        
        # Parse the response
        response_body = json.loads(response['body'].read())
        component_code = response_body['content'][0]['text']
        
        print(f"Generated component code: {component_code}")
        
        # Create filename with timestamp
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"hero-component-{timestamp}.tsx"
        
        # Upload the component to S3
        s3_client.put_object(
            Bucket=components_bucket,
            Key=filename,
            Body=component_code,
            ContentType='text/plain'
        )
        
        print(f"Component uploaded to S3: {filename}")
        
        # Return the result
        return {
            'statusCode': 200,
            'component_generated': True,
            'component_filename': filename,
            'sitemap_data': sitemap_data,
            's3_bucket': components_bucket
        }
        
    except ClientError as e:
        print(f"AWS Client Error: {e}")
        return {
            'statusCode': 500,
            'error': f'AWS Client Error: {str(e)}',
            'sitemap_data': event.get('sitemap_data', {})
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'error': str(e),
            'sitemap_data': event.get('sitemap_data', {})
        } 