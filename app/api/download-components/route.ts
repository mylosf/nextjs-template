import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read CDK outputs to get bucket name
    const cdkOutputsPath = path.join(process.cwd(), 'infra', 'cdk-outputs.json');
    const cdkOutputs = JSON.parse(fs.readFileSync(cdkOutputsPath, 'utf8'));
    
    const componentsBucketName = cdkOutputs?.SchifferCompleteStack?.ComponentsBucketName;
    
    if (!componentsBucketName) {
      return NextResponse.json({ error: 'Components bucket name not found in CDK outputs' }, { status: 500 });
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: 'eu-central-1',
    });

    // List objects in the components bucket to get the latest component
    const listCommand = new ListObjectsV2Command({
      Bucket: componentsBucketName,
      MaxKeys: 10,
    });

    const listResponse = await s3Client.send(listCommand);
    
    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return NextResponse.json({ error: 'No components found in bucket' }, { status: 404 });
    }

    // Get the most recent component (assuming they're sorted by timestamp)
    const latestComponent = listResponse.Contents.sort((a, b) => 
      (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0)
    )[0];

    if (!latestComponent.Key) {
      return NextResponse.json({ error: 'Invalid component key' }, { status: 500 });
    }

    // Generate a pre-signed URL for downloading the component
    const getObjectCommand = new GetObjectCommand({
      Bucket: componentsBucketName,
      Key: latestComponent.Key,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    return NextResponse.json({ 
      downloadUrl: signedUrl,
      filename: latestComponent.Key,
      lastModified: latestComponent.LastModified,
    });

  } catch (error) {
    console.error('Error generating component download URL:', error);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
} 