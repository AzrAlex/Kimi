#!/bin/bash

# Stockify Docker Setup Validation Script
echo "🔍 Validating Stockify Docker Setup..."

# Check required files
files=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "backend/server.py"
    "backend/requirements.txt"
    "backend/.env"
    "frontend/Dockerfile"
    "frontend/package.json"
    "frontend/src/App.js"
    "init-mongo.js"
    ".dockerignore"
)

missing_files=()

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
        missing_files+=("$file")
    fi
done

# Check directories
dirs=(
    "backend"
    "frontend"
    "frontend/src"
    "frontend/src/components"
    "frontend/src/pages"
    "frontend/src/services"
    "frontend/src/contexts"
    "frontend/public"
)

for dir in "${dirs[@]}"; do
    if [[ -d "$dir" ]]; then
        echo "✅ $dir/"
    else
        echo "❌ $dir/ (MISSING)"
        missing_files+=("$dir/")
    fi
done

# Summary
echo ""
if [[ ${#missing_files[@]} -eq 0 ]]; then
    echo "🎉 All required files are present!"
    echo "📦 Your Docker setup is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Install Docker and Docker Compose"
    echo "2. Run: ./start-docker.sh"
    echo "3. Access: http://localhost:3000"
else
    echo "❌ Missing ${#missing_files[@]} files/directories:"
    printf '%s\n' "${missing_files[@]}"
    echo ""
    echo "Please ensure all files are created properly."
fi

# Count files created
echo ""
echo "📊 File Summary:"
echo "   Backend files: $(find backend -type f | wc -l)"
echo "   Frontend files: $(find frontend -type f 2>/dev/null | wc -l)"
echo "   Docker configs: $(ls *.yml *.js *.md 2>/dev/null | wc -l)"
echo "   Scripts: $(ls *.sh 2>/dev/null | wc -l)"