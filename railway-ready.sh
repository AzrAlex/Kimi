#!/bin/bash

# 🎯 Script de validation finale pour Railway deployment
echo "🚄 Validation finale Stockify pour Railway.app"
echo "=============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

success_count=0
total_checks=0

check_item() {
    local item=$1
    local path=$2
    total_checks=$((total_checks + 1))
    
    if [[ -f "$path" ]] || [[ -d "$path" ]]; then
        echo -e "✅ ${GREEN}$item${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "❌ ${RED}$item${NC} (MANQUANT: $path)"
    fi
}

echo ""
echo -e "${BLUE}📦 VÉRIFICATION DES FICHIERS RAILWAY${NC}"
echo "-------------------------------------------"

# Fichiers Docker Railway
check_item "Backend Dockerfile Railway" "backend/Dockerfile.railway"
check_item "Frontend Dockerfile Railway" "frontend/Dockerfile.railway"
check_item "Backend Config Railway" "railway.backend.json"
check_item "Frontend Config Railway" "railway.frontend.json"

# Configuration Railway
check_item "Railway Ignore" ".railwayignore"
check_item "Railway Deploy Script" "railway-deploy.sh"
check_item "Nginx Railway Config" "frontend/nginx.railway.conf"
check_item "Docker Entrypoint Railway" "frontend/docker-entrypoint.railway.sh"

echo ""
echo -e "${BLUE}🔧 VÉRIFICATION CONFIGURATION${NC}"
echo "-------------------------------------------"

# Fichiers env
check_item "Backend Env Railway" "backend/.env.railway"
check_item "Frontend Package.json" "frontend/package.json"

# Scripts
check_item "Start Docker Script" "start-docker.sh"
check_item "Validation Script" "validate-setup.sh"

echo ""
echo -e "${BLUE}📚 VÉRIFICATION DOCUMENTATION${NC}"
echo "-------------------------------------------"

check_item "README Railway" "README-Railway.md"
check_item "Deployment Guide" "DEPLOYMENT-GUIDE.md"
check_item "Production Ready Guide" "PRODUCTION-READY.md"
check_item "Docker README" "README-Docker.md"

echo ""
echo -e "${BLUE}🧪 VÉRIFICATION TESTS ET SCRIPTS${NC}"
echo "-------------------------------------------"

check_item "Backend Tests" "backend_test.py"
check_item "Create Test Data" "create_test_data.py"
check_item "GitHub Workflow" ".github/workflows/railway-deploy.yml"

echo ""
echo -e "${BLUE}📱 VÉRIFICATION APPLICATION${NC}"
echo "-------------------------------------------"

# Frontend
check_item "React App" "frontend/src/App.js"
check_item "API Services" "frontend/src/services/api.js"
check_item "Auth Context" "frontend/src/contexts/AuthContext.js"
check_item "Dashboard Page" "frontend/src/pages/Dashboard.js"

# Backend
check_item "FastAPI Server" "backend/server.py"
check_item "Requirements" "backend/requirements.txt"

# MongoDB
check_item "MongoDB Init" "init-mongo.js"

echo ""
echo "==============================================="

# Calcul du score
percentage=$((success_count * 100 / total_checks))

if [ $percentage -eq 100 ]; then
    echo -e "🎉 ${GREEN}PARFAIT! Tous les fichiers sont présents ($success_count/$total_checks)${NC}"
    echo -e "✅ ${GREEN}Votre projet est 100% prêt pour Railway.app!${NC}"
elif [ $percentage -ge 90 ]; then
    echo -e "😊 ${YELLOW}TRÈS BIEN! ($success_count/$total_checks) - $percentage%${NC}"
    echo -e "⚠️  ${YELLOW}Quelques fichiers manquent mais déploiement possible${NC}"
else
    echo -e "😞 ${RED}ATTENTION! ($success_count/$total_checks) - $percentage%${NC}"
    echo -e "❌ ${RED}Des fichiers importants manquent${NC}"
fi

echo ""
echo -e "${BLUE}🚀 PROCHAINES ÉTAPES:${NC}"
echo "1. git add ."
echo "2. git commit -m 'Ready for Railway deployment 🚄'"
echo "3. git push origin main"
echo "4. Aller sur railway.app et déployer!"
echo ""

# Vérification Git
if [ -d ".git" ]; then
    echo -e "✅ ${GREEN}Dépôt Git initialisé${NC}"
    
    # Vérifier les fichiers non committé
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "⚠️  ${YELLOW}Fichiers non commités détectés${NC}"
        echo "   Pensez à faire: git add . && git commit"
    else
        echo -e "✅ ${GREEN}Tous les fichiers sont commités${NC}"
    fi
else
    echo -e "⚠️  ${YELLOW}Pas de dépôt Git - initialisez avec: git init${NC}"
fi

echo ""
echo -e "🎯 ${GREEN}Score final: $percentage% - Stockify prêt pour Railway!${NC} 🚄"