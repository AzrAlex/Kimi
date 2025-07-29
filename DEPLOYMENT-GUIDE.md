# 🚀 Guide de Déploiement Stockify

## 📋 **Étapes de déploiement GitHub → Railway**

### **1️⃣ Préparation GitHub**

```bash
# 1. Cloner ou naviguer vers votre projet
cd votre-projet-stockify

# 2. S'assurer que tous les fichiers sont présents
./validate-setup.sh

# 3. Commit et push
git add .
git commit -m "Ready for Railway deployment 🚄"
git push origin main
```

### **2️⃣ Créer le projet Railway**

1. **Aller sur :** https://railway.app
2. **Se connecter** avec GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Sélectionner** votre repo Stockify

### **3️⃣ Configuration des services**

#### **🔧 Backend Service**
1. **New Service** → **GitHub Repo** → Votre repo
2. **Settings** → **Source** :
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.railway`
3. **Settings** → **Environment** :
   ```env
   MONGO_URL=${{MongoDB.MONGO_URL}}
   DB_NAME=stockify
   PYTHONDONTWRITEBYTECODE=1
   PYTHONUNBUFFERED=1
   ```

#### **🎨 Frontend Service**
1. **New Service** → **GitHub Repo** → Même repo
2. **Settings** → **Source** :
   - **Root Directory:** `frontend`
   - **Dockerfile Path:** `Dockerfile.railway`
3. **Settings** → **Environment** :
   ```env
   REACT_APP_BACKEND_URL=https://votre-backend.railway.app
   NODE_ENV=production
   ```

#### **🗄️ MongoDB Service**
1. **New Service** → **Database** → **MongoDB**
2. Railway génère automatiquement la connection

### **4️⃣ Après déploiement**

```bash
# 1. Attendre que tous les services soient "Active"

# 2. Créer les données de test
railway shell backend-service
python create_test_data.py
exit

# 3. Tester l'application
# Frontend : https://votre-frontend.railway.app
# Backend  : https://votre-backend.railway.app/docs
```

### **5️⃣ Comptes de test**

- **Admin :** admin@stockify.com / admin123
- **User :** user@stockify.com / user123

---

## 🛠️ **Commandes utiles**

### **CLI Railway (optionnel)**
```bash
# Installation
npm install -g @railway/cli

# Login
railway login

# Déployer
railway up

# Logs
railway logs --follow

# Variables
railway variables set KEY=value
```

### **Maintenance**
```bash
# Voir les services
railway status

# Redéployer
railway up --service backend
railway up --service frontend

# Rollback
railway rollback
```

---

## 📊 **URLs d'accès**

Après déploiement, vous aurez :

- **🌐 Application :** https://stockify-frontend.railway.app
- **📡 API :** https://stockify-backend.railway.app
- **📚 Docs API :** https://stockify-backend.railway.app/docs
- **🗄️ MongoDB :** Accessible via Railway dashboard

---

## 💰 **Coûts**

- **Plan gratuit :** $5/mois crédit gratuit
- **Stockify complet :** ~$4-7/mois
- **Suffisant** pour développement et petit usage

---

## 🔧 **Troubleshooting**

### **Service ne démarre pas :**
1. Vérifier les logs Railway
2. Vérifier les variables d'environnement
3. S'assurer que Dockerfile.railway existe

### **CORS errors :**
1. Vérifier `REACT_APP_BACKEND_URL`
2. Attendre que backend soit complètement démarré

### **MongoDB connection :**
1. Vérifier que service MongoDB est "Active"
2. Variable `MONGO_URL` doit être `${{MongoDB.MONGO_URL}}`

---

## ✅ **Checklist final**

- [ ] Code pushé sur GitHub
- [ ] Services Railway créés (Backend, Frontend, MongoDB)
- [ ] Variables d'environnement configurées
- [ ] Services tous "Active"
- [ ] Données de test créées
- [ ] Application accessible et fonctionnelle

**🎉 Votre Stockify est maintenant en production sur Railway ! 🚄**