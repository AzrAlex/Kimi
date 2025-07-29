#!/bin/sh

# Railway Environment Variable Substitution Script
# This script replaces build-time environment variables with runtime ones

echo "🚄 Starting Railway frontend with environment substitution..."

# Default backend URL if not provided
BACKEND_URL=${REACT_APP_BACKEND_URL:-"http://localhost:8001"}

echo "📡 Backend URL configured as: $BACKEND_URL"

# Replace environment variables in built JavaScript files
if [ -n "$REACT_APP_BACKEND_URL" ]; then
    echo "🔄 Replacing backend URL in built files..."
    
    # Find and replace in all JS files
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|http://localhost:8001|$REACT_APP_BACKEND_URL|g" {} \;
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|process\.env\.REACT_APP_BACKEND_URL|\"$REACT_APP_BACKEND_URL\"|g" {} \;
    
    echo "✅ Backend URL replacement completed"
else
    echo "⚠️  REACT_APP_BACKEND_URL not set, using default"
fi

# Replace other environment variables if needed
if [ -n "$REACT_APP_API_VERSION" ]; then
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|REACT_APP_API_VERSION_PLACEHOLDER|$REACT_APP_API_VERSION|g" {} \;
fi

echo "🎉 Frontend ready to serve!"

# Execute the main command (nginx)
exec "$@"