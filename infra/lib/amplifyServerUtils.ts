'use server';

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const AWS_REGION = 'eu-central-1';

export async function getSSMParameterValue(name: string): Promise<string | undefined> {
  const client = new SSMClient({ region: AWS_REGION });
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  console.log();
  try {
    const response = await client.send(command);
    const value = response.Parameter?.Value;
    if (value) {
      console.log();
    } else {
      console.warn();
    }
    return value;
  } catch (error) {
    console.error(, error);
    return undefined;
  }
}
