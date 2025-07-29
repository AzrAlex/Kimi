#!/bin/sh

# Replace environment variables in JavaScript files
# This allows runtime environment variable substitution for React

if [ -n "$REACT_APP_BACKEND_URL" ]; then
    echo "Setting REACT_APP_BACKEND_URL to: $REACT_APP_BACKEND_URL"
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8001|$REACT_APP_BACKEND_URL|g" {} \;
fi

# Start nginx
exec "$@"