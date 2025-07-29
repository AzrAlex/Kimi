#!/bin/bash

# Stockify Docker Startup Script
echo "🚀 Starting Stockify Application..."

# Check if Docker and Docker Compose are available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not available"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed or not available"
    exit 1
fi

# Build and start services
echo "📦 Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Service Status:"
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=10

echo ""
echo "🎉 Stockify is now running!"
echo ""
echo "📱 Access Points:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:8001"
echo "   API Docs:     http://localhost:8001/docs"
echo "   MongoDB UI:   http://localhost:8081 (admin/admin123)"
echo ""
echo "🔐 Default Login:"
echo "   Admin: admin@stockify.com / admin123"
echo "   User:  user@stockify.com / user123"
echo ""
echo "💡 To create test data: docker-compose exec backend python create_test_data.py"
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"