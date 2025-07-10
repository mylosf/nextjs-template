#!/usr/bin/env python3
"""
Direct Database Connection Script using Aurora Data API
No VPC tunneling required - connects directly from your local machine!
"""

import boto3
import json
import sys
from typing import Dict, Any, List

class AuroraDataAPIClient:
    def __init__(self, region: str = 'eu-central-1'):
        self.region = region
        self.rds_data = boto3.client('rds-data', region_name=region)
        self.ssm = boto3.client('ssm', region_name=region)
        self.secrets_manager = boto3.client('secretsmanager', region_name=region)
        
        # Get connection details from SSM
        self.cluster_arn = self._get_cluster_arn()
        self.secret_arn = self._get_secret_arn()
        
    def _get_cluster_arn(self) -> str:
        """Get the cluster ARN from SSM parameters"""
        try:
            endpoint = self.ssm.get_parameter(Name='/app/database/endpoint')['Parameter']['Value']
            # Extract cluster name from endpoint
            cluster_name = endpoint.split('.')[0]
            account_id = boto3.client('sts').get_caller_identity()['Account']
            return f"arn:aws:rds:{self.region}:{account_id}:cluster:{cluster_name}"
        except Exception as e:
            print(f"Error getting cluster ARN: {e}")
            sys.exit(1)
    
    def _get_secret_arn(self) -> str:
        """Get the secret ARN from SSM parameters"""
        try:
            return self.ssm.get_parameter(Name='/app/database/credentials-arn')['Parameter']['Value']
        except Exception as e:
            print(f"Error getting secret ARN: {e}")
            sys.exit(1)
    
    def execute_sql(self, sql: str, parameters: List[Dict] = None) -> Dict[Any, Any]:
        """Execute SQL using Aurora Data API"""
        try:
            params = {
                'resourceArn': self.cluster_arn,
                'secretArn': self.secret_arn,
                'database': 'postgres',
                'sql': sql
            }
            
            if parameters:
                params['parameters'] = parameters
            
            response = self.rds_data.execute_statement(**params)
            return response
        except Exception as e:
            print(f"Error executing SQL: {e}")
            return None
    
    def show_tables(self):
        """Show all tables in the database"""
        sql = """
        SELECT 
            schemaname,
            tablename,
            tableowner
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
        """
        
        result = self.execute_sql(sql)
        if result and 'records' in result:
            print("\n=== Database Tables ===")
            for record in result['records']:
                schema = record[0]['stringValue'] if record[0] else 'N/A'
                table = record[1]['stringValue'] if record[1] else 'N/A'
                owner = record[2]['stringValue'] if record[2] else 'N/A'
                print(f"Schema: {schema}, Table: {table}, Owner: {owner}")
        else:
            print("No tables found or error occurred")
    
    def describe_table(self, table_name: str):
        """Describe table structure"""
        sql = """
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_name = %s
        ORDER BY ordinal_position;
        """
        
        # Note: Aurora Data API uses different parameter format
        result = self.execute_sql(
            "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = :table_name ORDER BY ordinal_position",
            [{'name': 'table_name', 'value': {'stringValue': table_name}}]
        )
        
        if result and 'records' in result:
            print(f"\n=== Table Structure: {table_name} ===")
            for record in result['records']:
                col_name = record[0]['stringValue'] if record[0] else 'N/A'
                data_type = record[1]['stringValue'] if record[1] else 'N/A'
                nullable = record[2]['stringValue'] if record[2] else 'N/A'
                default = record[3]['stringValue'] if record[3] and 'stringValue' in record[3] else 'NULL'
                print(f"  {col_name}: {data_type}, Nullable: {nullable}, Default: {default}")
        else:
            print(f"Table {table_name} not found or error occurred")
    
    def run_custom_query(self, sql: str):
        """Run a custom SQL query"""
        result = self.execute_sql(sql)
        if result:
            print(f"\n=== Query Result ===")
            print(json.dumps(result, indent=2, default=str))
        else:
            print("Query failed or returned no results")

def main():
    """Main function with interactive menu"""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("""
Aurora Data API Database Client

Usage:
  python connect-to-db.py                 # Interactive mode
  python connect-to-db.py --show-tables   # Show all tables
  python connect-to-db.py --describe users # Describe users table
  
Examples:
  python connect-to-db.py --query "SELECT * FROM users LIMIT 5"
        """)
        sys.exit(0)
    
    try:
        client = AuroraDataAPIClient()
        
        if len(sys.argv) > 1:
            if sys.argv[1] == '--show-tables':
                client.show_tables()
            elif sys.argv[1] == '--describe' and len(sys.argv) > 2:
                client.describe_table(sys.argv[2])
            elif sys.argv[1] == '--query' and len(sys.argv) > 2:
                client.run_custom_query(sys.argv[2])
            else:
                print("Invalid arguments. Use --help for usage information.")
        else:
            # Interactive mode
            print("🚀 Aurora Data API Database Client")
            print("Choose an option:")
            print("1. Show all tables")
            print("2. Describe a table")
            print("3. Run custom query")
            print("4. Exit")
            
            while True:
                choice = input("\nEnter your choice (1-4): ").strip()
                
                if choice == '1':
                    client.show_tables()
                elif choice == '2':
                    table_name = input("Enter table name: ").strip()
                    client.describe_table(table_name)
                elif choice == '3':
                    sql = input("Enter SQL query: ").strip()
                    client.run_custom_query(sql)
                elif choice == '4':
                    print("Goodbye!")
                    break
                else:
                    print("Invalid choice. Please enter 1-4.")
    
    except KeyboardInterrupt:
        print("\nGoodbye!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 