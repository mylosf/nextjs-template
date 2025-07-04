# infra/lambda/json-processor/index.py

import json
import zipfile
import io
import boto3
import os

def handler(event, context):
    print(f"JSON Processor Lambda received raw event: {json.dumps(event, indent=2)}")

    processed_pages = [] # This will store the list of pages with their sections
    error_details = None
    zip_file_key = None
    project_id = event.get('projectId', 'unknown')

    s3_bucket_name = os.environ.get('S3_BUCKET_NAME')
    if not s3_bucket_name:
        message = "S3_BUCKET_NAME environment variable is not set."
        print(f"CRITICAL ERROR: {message}")
        return {"projectId": project_id, "error": {"message": message, "code": "CONFIG_ERROR"}}

    s3_client = boto3.client('s3')

    try:
        project_data = event.get('projectData')

        if not project_data:
            message = f"Error for project {project_id}: 'projectData' is missing in the event."
            print(f"ERROR: {message}")
            error_details = {"message": message, "code": "MISSING_PROJECT_DATA"}
        elif 'sitemap' not in project_data:
            message = f"Error for project {project_id}: 'sitemap' array not found in projectData."
            print(f"ERROR: {message}")
            error_details = {"message": message, "code": "MISSING_SITEMAP"}
        elif not isinstance(project_data['sitemap'], list) or not project_data['sitemap']:
            message = f"Warning for project {project_id}: 'sitemap' is empty or not a list. Proceeding with empty pages and zip creation."
            print(f"WARNING: {message}")
            processed_pages = [] # Ensure it's an empty list
        else:
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Process the sitemap to extract pages and section names and add empty folders to zip
                for page in project_data['sitemap']:
                    page_id = page.get('id')
                    page_title = page.get('title', page_id) # Use id as fallback for title
                    
                    if not page_id: 
                        print(f"WARNING: Page missing ID in sitemap for project {project_id}. Skipping page for zip creation.")
                        continue

                    # Add empty directory to zip file
                    zipf.writestr(f"{page_id}/", "") 

                    # Create page.tsx content
                    page_tsx_content = f"'use client'\n\nexport default function Page() {{ return ( <h1>{{page_title}}</h1> ); }}"
                    zipf.writestr(f"{page_id}/page.tsx", page_tsx_content)

                    section_names = []
                    sections = page.get('sections', [])
                    if not isinstance(sections, list):
                        print(f"WARNING: Sections for page {page_id} in project {project_id} is not a list. Skipping sections for this page.")
                    else:
                        for section in sections:
                            section_name = section.get('name')
                            if section_name: 
                                section_names.append(section_name)
                            else:
                                print(f"WARNING: Section missing name in page {page_id} for project {project_id}. Skipping section.")
                    
                    processed_pages.append({
                        "pageId": page_id,
                        "pageTitle": page_title,
                        "sections": section_names
                    })
            
            zip_buffer.seek(0) # Reset buffer position to the beginning
            zip_file_key = f"{project_id}.zip"
            s3_client.put_object(Bucket=s3_bucket_name, Key=zip_file_key, Body=zip_buffer.getvalue())
            print(f"Successfully uploaded {zip_file_key} to S3 bucket {s3_bucket_name}")

            print(f"JSON processing complete for project {project_id}. Prepared {len(processed_pages)} pages and created zip file.")

    except Exception as e:
        error_message = str(e)
        message = f"Critical Error in JSON Processor Lambda for project {project_id}: {error_message}"
        print(f"CRITICAL ERROR: {message}", e)
        error_details = {"message": message, "details": str(e), "code": "INTERNAL_ERROR"}
        processed_pages = [] # Ensure output is consistent even on critical error

    finally:
        final_output = {
            "projectId": project_id,
            "pages": processed_pages, 
            "zipFileKey": zip_file_key,
            "s3BucketName": s3_bucket_name,
            "error": error_details,
        }
        print(f"JSON Processor Lambda returning final payload: {json.dumps(final_output, indent=2)}")
        return final_output 