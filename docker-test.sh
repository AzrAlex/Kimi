#!/bin/bash

# Docker Test Script for Stockify
# This script validates the Docker setup and runs comprehensive tests

set -e

echo "🔍 Testing Stockify Docker Setup..."

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Test docker-compose file validity
echo "📝 Validating docker-compose.yml..."
docker-compose config > /dev/null
echo "✅ docker-compose.yml is valid"

# Build images
echo "🏗️ Building Docker images..."
docker-compose build

echo "✅ All images built successfully"

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 45

# Check service health
echo "🔍 Checking service health..."

# Check MongoDB
if docker-compose exec -T mongo mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is healthy"
else
    echo "❌ MongoDB is not responding"
    docker-compose logs mongo
fi

# Check Backend
if curl -f http://localhost:8001/docs > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
    docker-compose logs backend
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
    docker-compose logs frontend
fi

# Create test data
echo "📊 Creating test data..."
docker-compose exec -T backend python create_test_data.py

# Run API tests
echo "🧪 Running API tests..."
docker-compose exec -T backend python backend_test.py

# Show final status
echo ""
echo "📊 Final Status:"
docker-compose ps

echo ""
echo "🎉 Docker setup test completed successfully!"
echo ""
echo "Access your application:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:8001"
echo "   API Docs:     http://localhost:8001/docs"
echo "   MongoDB UI:   http://localhost:8081"
echo ""
echo "To stop services: docker-compose down"