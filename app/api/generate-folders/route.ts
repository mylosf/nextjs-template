import { NextResponse } from 'next/server';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
// import cdkOutputs from '@/infra/cdk-outputs.json'; // Temporarily comment out due to cdk-outputs.json not updating

const COMPLETE_WORKFLOW_ARN = 'arn:aws:states:eu-central-1:656074853148:stateMachine:CompleteWorkflow'; // Hardcoded ARN

export async function POST(request: Request) {
  const { projectId, projectData } = await request.json();

  if (!projectId || !projectData) {
    return NextResponse.json({ error: 'Missing projectId or projectData' }, { status: 400 });
  }

  try {
    // const stateMachineArn = (cdkOutputs as any).CompleteStack.CompleteWorkflowArn; // Original line
    const stateMachineArn = COMPLETE_WORKFLOW_ARN; // Use hardcoded ARN

    if (!stateMachineArn) {
      console.error('Step Functions ARN is undefined after hardcoding. This should not happen.');
      return NextResponse.json({ error: 'Step Functions ARN not configured' }, { status: 500 });
    }

    console.log(`Attempting to start Step Functions workflow with ARN: ${stateMachineArn}`);
    const client = new SFNClient({ region: 'eu-central-1' }); // Use your AWS region
    const command = new StartExecutionCommand({
      stateMachineArn: stateMachineArn,
      input: JSON.stringify({ projectId, projectData }),
      name: `GenerateFolders-${projectId}-${Date.now()}`,
    });

    await client.send(command);

    return NextResponse.json({ message: 'Step Functions workflow started successfully!' });
  } catch (error) {
    console.error('Error starting Step Functions workflow:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to start Step Functions workflow' }, { status: 500 });
  }
} 