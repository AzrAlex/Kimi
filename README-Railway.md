# 🚄 Stockify - Déploiement Railway.app

Guide complet pour déployer Stockify sur Railway.app avec GitHub.

## 📋 **Prérequis**

- ✅ Compte GitHub avec votre code Stockify
- ✅ Compte Railway.app (gratuit)
- ✅ Railway CLI (optionnel)

## 🚀 **Déploiement en 5 étapes**

### **1️⃣ Préparer le code GitHub**

```bash
# S'assurer que tout est à jour
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### **2️⃣ Créer le projet Railway**

**A. Via Dashboard Railway :**
1. Aller sur https://railway.app
2. Se connecter avec GitHub
3. Cliquer **"New Project"**
4. Choisir **"Deploy from GitHub repo"**
5. Sélectionner votre repo Stockify

**B. Via CLI (optionnel) :**
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Setup
railway login
railway init
```

### **3️⃣ Déployer le Backend**

**Dans Railway Dashboard :**
1. **Add Service** → **GitHub Repo**
2. Sélectionner votre repo Stockify
3. **Settings** → **Source** :
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.railway`
4. Le déploiement commence automatiquement

**Variables d'environnement Backend :**
```env
MONGO_URL=${{MongoDB.MONGO_URL}}
DB_NAME=stockify
```

### **4️⃣ Déployer le Frontend**

**Ajouter un nouveau service :**
1. **Add Service** → **GitHub Repo** (même repo)
2. **Settings** → **Source** :
   - **Root Directory:** `frontend`
   - **Dockerfile Path:** `Dockerfile.railway`

**Variables d'environnement Frontend :**
```env
REACT_APP_BACKEND_URL=https://votre-backend.railway.app
```

### **5️⃣ Ajouter MongoDB**

1. **Add Service** → **Database** → **MongoDB**
2. Railway crée automatiquement la base
3. Connection URL disponible dans les variables

---

## ⚙️ **Configuration détaillée**

### **Variables d'environnement complètes**

**Backend Service :**
```env
# Database
MONGO_URL=${{MongoDB.MONGO_URL}}
DB_NAME=stockify

# Python
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1

# JWT (optionnel - personnalisé)
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Frontend Service :**
```env
# API Connection
REACT_APP_BACKEND_URL=https://stockify-backend.railway.app

# Build optimization
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### **Domaines personnalisés**

**Backend :**
- Railway génère : `https://backend-production-xxxx.railway.app`
- Domaine custom : **Settings** → **Domains** → **Custom Domain**

**Frontend :**
- Railway génère : `https://frontend-production-xxxx.railway.app`
- Domaine custom : Configurer de même

---

## 🧪 **Test et validation**

### **1. Vérifier les déploiements**

```bash
# Backend API
curl https://votre-backend.railway.app/docs

# Frontend
curl https://votre-frontend.railway.app
```

### **2. Créer les données de test**

**Via Railway CLI :**
```bash
# Se connecter au backend
railway shell backend-service

# Créer les données
python create_test_data.py
```

**Via Dashboard :**
- **Backend Service** → **Shell**
- Exécuter `python create_test_data.py`

### **3. Tester l'application**

- **Frontend :** https://votre-frontend.railway.app
- **Login :** admin@stockify.com / admin123
- **Vérifier :** Dashboard, Articles, Requests

---

## 📊 **Monitoring Railway**

### **Logs en temps réel :**
```bash
# Via CLI
railway logs backend-service
railway logs frontend-service

# Ou via Dashboard
```

### **Métriques :**
- **CPU/RAM usage**
- **Network traffic**
- **Request count**
- **Error rates**

### **Alertes :**
Railway peut envoyer des alertes Discord/Slack en cas de problème.

---

## 💰 **Coûts Railway**

### **Plan gratuit :**
- **$5 crédit/mois** gratuit
- **500 heures/mois** compute time
- Suffisant pour Stockify en développement

### **Estimation Stockify :**
- **Backend :** ~$2-3/mois
- **Frontend :** ~$1-2/mois  
- **MongoDB :** ~$1-2/mois
- **Total :** ~$4-7/mois

---

## 🔧 **Optimisations Railway**

### **1. Build performance :**

**backend/Dockerfile.railway :**
- Multi-stage build pour réduire la taille
- Cache des dépendances Python
- Image optimisée

**frontend/Dockerfile.railway :**
- Build React optimisé
- Nginx pour serving statique
- Compression activée

### **2. Variables partagées :**

```bash
# Créer des variables partagées
railway variables set ENVIRONMENT=production
railway variables set API_VERSION=v1
```

### **3. Health checks :**

Railway vérifie automatiquement :
- **Backend :** `/docs` endpoint
- **Frontend :** `/health` endpoint

---

## 🚨 **Troubleshooting**

### **Erreurs courantes :**

**1. Build qui échoue :**
```bash
# Vérifier les logs
railway logs backend-service --deployment

# Variables manquantes
railway variables list
```

**2. MongoDB connection :**
```bash
# Vérifier la variable MONGO_URL
echo $MONGO_URL

# Format correct : mongodb://...
```

**3. CORS errors :**
- Vérifier `REACT_APP_BACKEND_URL`
- S'assurer que le backend a CORS activé

### **Debug commands :**
```bash
# Se connecter au container
railway shell backend-service

# Tester MongoDB
python -c "from motor.motor_asyncio import AsyncIOMotorClient; print('OK')"

# Tester les variables
env | grep MONGO
```

---

## 🔄 **Déploiement continu**

### **Auto-deployment :**
Railway redéploie automatiquement à chaque push sur la branche principale.

### **Contrôler les déploiements :**
```bash
# Déployer manuellement
railway up

# Rollback
railway rollback
```

---

## 📝 **Checklist déploiement**

### **Avant le déploiement :**
- [ ] Code poussé sur GitHub
- [ ] Variables d'environnement configurées
- [ ] Dockerfiles Railway prêts

### **Après le déploiement :**
- [ ] Backend accessible via /docs
- [ ] Frontend charge correctement
- [ ] MongoDB connecté
- [ ] Données de test créées
- [ ] Login fonctionne
- [ ] CRUD articles fonctionne

---

## 🎯 **Commands rapides**

```bash
# Setup initial
./railway-deploy.sh

# Deploy manual
railway up

# Logs
railway logs --follow

# Variables
railway variables set KEY=value

# Shell access  
railway shell
```

---

## 📞 **Support**

- **Railway Docs :** https://docs.railway.app
- **Discord Railway :** https://discord.gg/railway
- **GitHub Issues :** Votre repo Stockify

---

**🎉 Votre Stockify est maintenant déployé sur Railway.app avec MongoDB et accessible publiquement ! 🚄**