from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import qrcode
from io import BytesIO
import base64
import bcrypt
import jwt
from enum import Enum
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
SECRET_KEY = "stockify-secret-key-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

# Create uploads directory if it doesn't exist
uploads_dir = ROOT_DIR / "uploads"
uploads_dir.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class DemandeStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class MouvementType(str, Enum):
    ENTREE = "entree"
    SORTIE = "sortie"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    email: str
    password_hash: str
    role: UserRole = UserRole.USER
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    nom: str
    email: str
    password: str
    role: UserRole = UserRole.USER

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    nom: str
    email: str
    role: UserRole
    created_at: datetime

class Article(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    description: str
    image: Optional[str] = None
    code_qr: Optional[str] = None
    quantite: int
    quantite_min: int
    date_expiration: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ArticleCreate(BaseModel):
    nom: str
    description: str
    quantite: int
    quantite_min: int
    date_expiration: Optional[datetime] = None

class ArticleResponse(BaseModel):
    id: str
    nom: str
    description: str
    image: Optional[str]
    code_qr: Optional[str]
    quantite: int
    quantite_min: int
    date_expiration: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class Demande(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    article_id: str
    quantite_demandee: int
    statut: DemandeStatus = DemandeStatus.PENDING
    date_demande: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DemandeCreate(BaseModel):
    article_id: str
    quantite_demandee: int

class DemandeResponse(BaseModel):
    id: str
    user_id: str
    article_id: str
    quantite_demandee: int
    statut: DemandeStatus
    date_demande: datetime
    user_nom: Optional[str] = None
    article_nom: Optional[str] = None

class Mouvement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    article_id: str
    type: MouvementType
    quantite: int
    utilisateur_id: str
    raison: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MouvementCreate(BaseModel):
    article_id: str
    type: MouvementType
    quantite: int
    raison: str

class HistoriqueAction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str
    cible_type: str
    cible_id: str
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardStats(BaseModel):
    total_articles: int
    total_users: int
    total_demandes: int
    articles_low_stock: int
    articles_expiring_soon: int

class AlerteItem(BaseModel):
    id: str
    nom: str
    type: str
    message: str
    created_at: datetime

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

async def log_action(user_id: str, action: str, cible_type: str, cible_id: str, description: str):
    historique = HistoriqueAction(
        user_id=user_id,
        action=action,
        cible_type=cible_type,
        cible_id=cible_id,
        description=description
    )
    await db.historique_actions.insert_one(historique.dict())

# Authentication routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        nom=user_data.nom,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )
    
    await db.users.insert_one(user.dict())
    return UserResponse(**user.dict())

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

# Articles routes
@api_router.get("/articles", response_model=List[ArticleResponse])
async def get_articles(current_user: User = Depends(get_current_user)):
    articles = await db.articles.find().to_list(1000)
    return [ArticleResponse(**article) for article in articles]

@api_router.post("/articles", response_model=ArticleResponse)
async def create_article(
    nom: str = Form(...),
    description: str = Form(...),
    quantite: int = Form(...),
    quantite_min: int = Form(...),
    date_expiration: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_admin_user)
):
    article_id = str(uuid.uuid4())
    
    # Handle image upload
    image_path = None
    if image:
        image_path = f"uploads/{article_id}_{image.filename}"
        with open(uploads_dir / f"{article_id}_{image.filename}", "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    
    # Parse date_expiration
    expiration_date = None
    if date_expiration:
        expiration_date = datetime.fromisoformat(date_expiration)
    
    # Generate QR code
    qr_data = f"ARTICLE:{article_id}:{nom}"
    qr_code = generate_qr_code(qr_data)
    
    article = Article(
        id=article_id,
        nom=nom,
        description=description,
        image=image_path,
        code_qr=qr_code,
        quantite=quantite,
        quantite_min=quantite_min,
        date_expiration=expiration_date
    )
    
    await db.articles.insert_one(article.dict())
    await log_action(current_user.id, "CREATE", "Article", article_id, f"Créé l'article {nom}")
    
    return ArticleResponse(**article.dict())

@api_router.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: str, current_user: User = Depends(get_current_user)):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse(**article)

@api_router.put("/articles/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    nom: str = Form(...),
    description: str = Form(...),
    quantite: int = Form(...),
    quantite_min: int = Form(...),
    date_expiration: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_admin_user)
):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Handle image upload
    image_path = article.get("image")
    if image:
        image_path = f"uploads/{article_id}_{image.filename}"
        with open(uploads_dir / f"{article_id}_{image.filename}", "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    
    # Parse date_expiration
    expiration_date = None
    if date_expiration:
        expiration_date = datetime.fromisoformat(date_expiration)
    
    # Update article
    await db.articles.update_one(
        {"id": article_id},
        {"$set": {
            "nom": nom,
            "description": description,
            "image": image_path,
            "quantite": quantite,
            "quantite_min": quantite_min,
            "date_expiration": expiration_date,
            "updated_at": datetime.utcnow()
        }}
    )
    
    await log_action(current_user.id, "UPDATE", "Article", article_id, f"Modifié l'article {nom}")
    
    updated_article = await db.articles.find_one({"id": article_id})
    return ArticleResponse(**updated_article)

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, current_user: User = Depends(get_admin_user)):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.articles.delete_one({"id": article_id})
    await log_action(current_user.id, "DELETE", "Article", article_id, f"Supprimé l'article {article['nom']}")
    
    return {"message": "Article deleted successfully"}

# Demandes routes
@api_router.get("/demandes", response_model=List[DemandeResponse])
async def get_demandes(current_user: User = Depends(get_current_user)):
    query = {}
    if current_user.role == UserRole.USER:
        query = {"user_id": current_user.id}
    
    demandes = await db.demandes.find(query).to_list(1000)
    
    # Enrich with user and article names
    for demande in demandes:
        user = await db.users.find_one({"id": demande["user_id"]})
        article = await db.articles.find_one({"id": demande["article_id"]})
        demande["user_nom"] = user["nom"] if user else None
        demande["article_nom"] = article["nom"] if article else None
    
    return [DemandeResponse(**demande) for demande in demandes]

@api_router.post("/demandes", response_model=DemandeResponse)
async def create_demande(demande_data: DemandeCreate, current_user: User = Depends(get_current_user)):
    article = await db.articles.find_one({"id": demande_data.article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    demande = Demande(
        user_id=current_user.id,
        article_id=demande_data.article_id,
        quantite_demandee=demande_data.quantite_demandee
    )
    
    await db.demandes.insert_one(demande.dict())
    await log_action(current_user.id, "CREATE", "Demande", demande.id, f"Demande de {demande_data.quantite_demandee} {article['nom']}")
    
    return DemandeResponse(**demande.dict(), user_nom=current_user.nom, article_nom=article["nom"])

@api_router.put("/demandes/{demande_id}/approve")
async def approve_demande(demande_id: str, current_user: User = Depends(get_admin_user)):
    demande = await db.demandes.find_one({"id": demande_id})
    if not demande:
        raise HTTPException(status_code=404, detail="Demande not found")
    
    article = await db.articles.find_one({"id": demande["article_id"]})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    if article["quantite"] < demande["quantite_demandee"]:
        raise HTTPException(status_code=400, detail="Stock insuffisant")
    
    # Update demande status
    await db.demandes.update_one(
        {"id": demande_id},
        {"$set": {"statut": DemandeStatus.APPROVED, "updated_at": datetime.utcnow()}}
    )
    
    # Update article stock
    await db.articles.update_one(
        {"id": demande["article_id"]},
        {"$inc": {"quantite": -demande["quantite_demandee"]}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    # Log movement
    mouvement = Mouvement(
        article_id=demande["article_id"],
        type=MouvementType.SORTIE,
        quantite=demande["quantite_demandee"],
        utilisateur_id=current_user.id,
        raison=f"Demande approuvée #{demande_id}"
    )
    await db.mouvements.insert_one(mouvement.dict())
    
    await log_action(current_user.id, "APPROVE", "Demande", demande_id, f"Approuvé la demande #{demande_id}")
    
    return {"message": "Demande approved successfully"}

@api_router.put("/demandes/{demande_id}/reject")
async def reject_demande(demande_id: str, current_user: User = Depends(get_admin_user)):
    demande = await db.demandes.find_one({"id": demande_id})
    if not demande:
        raise HTTPException(status_code=404, detail="Demande not found")
    
    await db.demandes.update_one(
        {"id": demande_id},
        {"$set": {"statut": DemandeStatus.REJECTED, "updated_at": datetime.utcnow()}}
    )
    
    await log_action(current_user.id, "REJECT", "Demande", demande_id, f"Rejeté la demande #{demande_id}")
    
    return {"message": "Demande rejected successfully"}

# Mouvements routes
@api_router.get("/mouvements")
async def get_mouvements(current_user: User = Depends(get_admin_user)):
    mouvements = await db.mouvements.find().sort("created_at", -1).to_list(1000)
    
    # Enrich with article and user names
    for mouvement in mouvements:
        article = await db.articles.find_one({"id": mouvement["article_id"]})
        user = await db.users.find_one({"id": mouvement["utilisateur_id"]})
        mouvement["article_nom"] = article["nom"] if article else None
        mouvement["user_nom"] = user["nom"] if user else None
    
    return mouvements

@api_router.post("/mouvements")
async def create_mouvement(mouvement_data: MouvementCreate, current_user: User = Depends(get_admin_user)):
    article = await db.articles.find_one({"id": mouvement_data.article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    mouvement = Mouvement(
        article_id=mouvement_data.article_id,
        type=mouvement_data.type,
        quantite=mouvement_data.quantite,
        utilisateur_id=current_user.id,
        raison=mouvement_data.raison
    )
    
    await db.mouvements.insert_one(mouvement.dict())
    
    # Update article stock
    if mouvement_data.type == MouvementType.ENTREE:
        await db.articles.update_one(
            {"id": mouvement_data.article_id},
            {"$inc": {"quantite": mouvement_data.quantite}, "$set": {"updated_at": datetime.utcnow()}}
        )
    else:
        await db.articles.update_one(
            {"id": mouvement_data.article_id},
            {"$inc": {"quantite": -mouvement_data.quantite}, "$set": {"updated_at": datetime.utcnow()}}
        )
    
    await log_action(current_user.id, "CREATE", "Mouvement", mouvement.id, f"Mouvement {mouvement_data.type} de {mouvement_data.quantite} {article['nom']}")
    
    return {"message": "Mouvement created successfully"}

# Dashboard routes
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    total_articles = await db.articles.count_documents({})
    total_users = await db.users.count_documents({})
    total_demandes = await db.demandes.count_documents({})
    
    # Articles with low stock
    articles_low_stock = await db.articles.count_documents({
        "$expr": {"$lte": ["$quantite", "$quantite_min"]}
    })
    
    # Articles expiring soon (next 30 days)
    thirty_days_from_now = datetime.utcnow() + timedelta(days=30)
    articles_expiring_soon = await db.articles.count_documents({
        "date_expiration": {"$lte": thirty_days_from_now, "$gte": datetime.utcnow()}
    })
    
    return DashboardStats(
        total_articles=total_articles,
        total_users=total_users,
        total_demandes=total_demandes,
        articles_low_stock=articles_low_stock,
        articles_expiring_soon=articles_expiring_soon
    )

@api_router.get("/dashboard/alerts", response_model=List[AlerteItem])
async def get_alerts(current_user: User = Depends(get_current_user)):
    alerts = []
    
    # Low stock alerts
    low_stock_articles = await db.articles.find({
        "$expr": {"$lte": ["$quantite", "$quantite_min"]}
    }).to_list(100)
    
    for article in low_stock_articles:
        alerts.append(AlerteItem(
            id=article["id"],
            nom=article["nom"],
            type="stock_low",
            message=f"Stock faible: {article['quantite']} restants (min: {article['quantite_min']})",
            created_at=datetime.utcnow()
        ))
    
    # Expiring soon alerts
    thirty_days_from_now = datetime.utcnow() + timedelta(days=30)
    expiring_articles = await db.articles.find({
        "date_expiration": {"$lte": thirty_days_from_now, "$gte": datetime.utcnow()}
    }).to_list(100)
    
    for article in expiring_articles:
        days_until_expiration = (article["date_expiration"] - datetime.utcnow()).days
        alerts.append(AlerteItem(
            id=article["id"],
            nom=article["nom"],
            type="expiring_soon",
            message=f"Expire dans {days_until_expiration} jours",
            created_at=datetime.utcnow()
        ))
    
    return alerts

@api_router.get("/dashboard/charts")
async def get_chart_data(current_user: User = Depends(get_current_user)):
    # Articles by category (simplified - we'll use first letter of name)
    articles = await db.articles.find().to_list(1000)
    category_counts = {}
    for article in articles:
        category = article["nom"][0].upper() if article["nom"] else "A"
        category_counts[category] = category_counts.get(category, 0) + 1
    
    # Demandes by status
    demandes = await db.demandes.find().to_list(1000)
    status_counts = {"pending": 0, "approved": 0, "rejected": 0}
    for demande in demandes:
        status_counts[demande["statut"]] += 1
    
    # Stock levels
    stock_levels = []
    for article in articles:
        stock_levels.append({
            "nom": article["nom"],
            "quantite": article["quantite"],
            "quantite_min": article["quantite_min"]
        })
    
    return {
        "articles_by_category": category_counts,
        "demandes_by_status": status_counts,
        "stock_levels": stock_levels[:10]  # Limit to 10 items
    }

# Historique routes
@api_router.get("/historique")
async def get_historique(current_user: User = Depends(get_current_user)):
    query = {}
    if current_user.role == UserRole.USER:
        query = {"user_id": current_user.id}
    
    historique = await db.historique_actions.find(query).sort("created_at", -1).limit(100).to_list(100)
    
    # Enrich with user names
    for action in historique:
        user = await db.users.find_one({"id": action["user_id"]})
        action["user_nom"] = user["nom"] if user else None
    
    return historique

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()