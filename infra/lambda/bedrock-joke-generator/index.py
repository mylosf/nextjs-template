import json
import boto3
import os

def handler(event, context):
    print(f"Bedrock Joke Generator Lambda received event: {json.dumps(event, indent=2)}")

    bedrock_runtime = boto3.client(
        service_name='bedrock-runtime',
        region_name=os.environ.get('BEDROCK_REGION', 'eu-central-1') # Use environment variable for region
    )

    try:
        # Claude Haiku model ID
        model_id = "anthropic.claude-3-sonnet-20240229-v1:0"

        # Prepare the prompt for a one-liner joke
        prompt = "Human: Tell me a one-liner joke.\n\nAssistant:"
        
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })

        response = bedrock_runtime.invoke_model(body=body, modelId=model_id, contentType="application/json", accept="application/json")
        response_body = json.loads(response.get('body').read())
        joke_text = response_body['content'][0]['text'].strip()

        print(f"Generated joke: {joke_text}")

        # Pass through original event data and add the joke
        output = {
            **event, # Pass through original event data
            "joke": joke_text
        }

        print(f"Bedrock Joke Generator Lambda returning: {json.dumps(output, indent=2)}")
        return output

    except Exception as e:
        error_message = str(e)
        print(f"Error invoking Bedrock or processing response: {error_message}")
        # Return error while passing through original event data if possible
        error_output = {
            **event,
            "error": {"message": error_message, "code": "BEDROCK_INVOCATION_ERROR"}
        }
        return error_output 