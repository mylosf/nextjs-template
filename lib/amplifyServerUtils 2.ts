'use server';

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const AWS_REGION = 'eu-central-1';

export async function getSSMParameterValue(name: string): Promise<string | undefined> {
  const client = new SSMClient({ region: AWS_REGION });
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });

  // console.log(`Attempting to fetch SSM parameter: ${name} in region ${AWS_REGION}`); // Temporarily removed for clearer middleware logs
  try {
    const response = await client.send(command);
    const value = response.Parameter?.Value;
    // if (value) {
    //   console.log(`SSM Parameter ${name} fetched successfully: ${value.substring(0, 5)}...`); // Temporarily removed
    // } else {
    //   console.warn(`SSM Parameter ${name} found but has no value.`); // Temporarily removed
    // }
    return value;
  } catch (error) {
    console.error(`Error fetching SSM parameter ${name} in region ${AWS_REGION}:`, error);
    return undefined;
  }
}
