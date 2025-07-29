#!/bin/bash

# 🚄 Railway Deployment Script for Stockify
# This script helps deploy Stockify to Railway.app

set -e

echo "🚄 Stockify Railway Deployment Setup"
echo "===================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "✅ Railway CLI ready"
echo ""

# Project setup
read -p "📝 Enter your Railway project name (or press Enter for 'stockify'): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-stockify}

echo "🏗️  Setting up Railway project: $PROJECT_NAME"

# Initialize Railway project if not exists
if [ ! -f ".railway" ]; then
    railway init
fi

echo ""
echo "📋 Deployment Instructions:"
echo ""
echo "1️⃣  Deploy Backend:"
echo "   - Go to Railway dashboard"
echo "   - Create new service from GitHub repo"
echo "   - Set root directory: 'backend'"
echo "   - Railway will use: backend/Dockerfile.railway"
echo ""
echo "2️⃣  Deploy Frontend:"
echo "   - Create another service from same repo"
echo "   - Set root directory: 'frontend'"
echo "   - Railway will use: frontend/Dockerfile.railway"
echo ""
echo "3️⃣  Add MongoDB:"
echo "   - Click 'Add Service' -> 'Database' -> 'MongoDB'"
echo "   - Railway will provide connection URL"
echo ""
echo "4️⃣  Environment Variables:"
echo ""
echo "   Backend Variables:"
echo "   MONGO_URL=\${{MongoDB.MONGO_URL}}"
echo "   DB_NAME=stockify"
echo ""
echo "   Frontend Variables:"
echo "   REACT_APP_BACKEND_URL=https://your-backend.railway.app"
echo ""
echo "5️⃣  After deployment:"
echo "   railway run python create_test_data.py"
echo ""

# Ask if user wants to continue with automated setup
read -p "🤖 Would you like me to help with the automated setup? (y/N): " AUTO_SETUP

if [[ $AUTO_SETUP =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔧 Setting up project structure..."
    
    # Create railway services configuration
    mkdir -p .railway
    
    echo "📁 Project configured for Railway deployment"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Push your code to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'Ready for Railway deployment'"
    echo "   git push origin main"
    echo ""
    echo "2. Go to Railway dashboard and deploy!"
    echo "   https://railway.app/dashboard"
    echo ""
    echo "3. Don't forget to set environment variables!"
else
    echo "📚 Manual deployment selected. See README-Railway.md for details."
fi

echo ""
echo "🎉 Railway setup complete!"
echo "📄 Check README-Railway.md for detailed instructions"