'use server';

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const AWS_REGION = 'eu-central-1';

export async function getSSMParameterValue(name: string): Promise<string | undefined> {
  const client = new SSMClient({ region: AWS_REGION });
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  try {
    const response = await client.send(command);
    return response.Parameter?.Value;
  } catch (error) {
    console.error('Error getting SSM parameter value:', error);
    return undefined;
  }
}
