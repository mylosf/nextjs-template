#!/bin/bash

echo "🚀 Setting up Aurora Data API Database Access"
echo "=============================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   brew install awscli   # macOS"
    echo "   pip install awscli    # Python"
    exit 1
fi

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
fi

# Install required Python packages
echo "📦 Installing required Python packages..."
pip3 install boto3 --user

# Make the connect script executable
chmod +x connect-to-db.py

# Test AWS credentials
echo "🔐 Testing AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ AWS credentials are configured"
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo "   Account ID: $ACCOUNT_ID"
else
    echo "❌ AWS credentials not configured. Please run:"
    echo "   aws configure"
    exit 1
fi

# Test database connectivity
echo "🔍 Testing database connectivity..."
if python3 connect-to-db.py --show-tables &> /dev/null; then
    echo "✅ Database connection successful!"
    echo ""
    echo "🎉 Setup complete! You can now:"
    echo ""
    echo "1. Run interactive mode:"
    echo "   python3 connect-to-db.py"
    echo ""
    echo "2. Show all tables:"
    echo "   python3 connect-to-db.py --show-tables"
    echo ""
    echo "3. Describe a table:"
    echo "   python3 connect-to-db.py --describe users"
    echo ""
    echo "4. Run custom queries:"
    echo "   python3 connect-to-db.py --query \"SELECT * FROM users LIMIT 5\""
    echo ""
else
    echo "❌ Database connection failed. Please check:"
    echo "   1. Your AWS credentials have RDS Data API permissions"
    echo "   2. The database stack is deployed successfully"
    echo "   3. You're in the correct AWS region (eu-central-1)"
fi 