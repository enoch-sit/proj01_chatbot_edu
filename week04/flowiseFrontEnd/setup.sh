#!/bin/bash

# FlowiseAI Frontend Docker Setup Script

echo "🚀 FlowiseAI Frontend Docker Setup"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file..."
    cp .env.example .env
    
    echo "⚠️  Please edit .env with your configuration:"
    echo "   - VITE_FLOWISE_BASE_URL: Your FlowiseAI instance URL"
    echo "   - VITE_FLOWISE_CHATFLOW_ID: Your chatflow ID"
    echo "   - VITE_BASE_PATH: Your nginx base path"
    echo "   - VITE_FLOWISE_API_KEY: Your API key (if needed)"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

# Build and start the container
echo "🔨 Building Docker container..."
docker-compose build

echo "🚀 Starting container..."
docker-compose up -d

# Check if container is running
sleep 5
if docker-compose ps | grep -q "Up"; then
    echo "✅ Container started successfully!"
    
    # Get the base path from .env
    BASE_PATH=$(grep "^VITE_BASE_PATH=" .env | cut -d '=' -f2)
    BASE_PATH=${BASE_PATH:-/projectui}
    
    echo ""
    echo "🌐 Application URLs:"
    echo "   Local: http://localhost:3002${BASE_PATH}/"
    echo "   Health: http://localhost:3002/health"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo ""
    
    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    if curl -f -s http://localhost:3002/health > /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed. Check container logs."
    fi
else
    echo "❌ Container failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Your FlowiseAI frontend is ready."