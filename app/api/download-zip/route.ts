import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import cdkOutputs from '@/infra/cdk-outputs.json';

// Get the S3 Bucket Name from CDK outputs
const S3_BUCKET_NAME = (cdkOutputs as any).SchifferCompleteStack.GeneratedZipBucketName;
const AWS_REGION = 'eu-central-1'; // Make sure this matches your deployed region

const s3Client = new S3Client({ region: AWS_REGION });

export async function POST(request: Request) {
  const { projectId } = await request.json();

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }

  if (!S3_BUCKET_NAME) {
    console.error('S3 Bucket Name is not configured in cdk-outputs.json.');
    return NextResponse.json({ error: 'S3 Bucket Name not configured' }, { status: 500 });
  }

  const zipFileKey = `${projectId}.zip`;

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: zipFileKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to generate download link' }, { status: 500 });
  }
} 