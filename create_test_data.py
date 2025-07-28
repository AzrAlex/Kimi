#!/usr/bin/env python3

import asyncio
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt
import uuid

# Load environment
load_dotenv('/app/backend/.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def create_test_users():
    # Admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "nom": "Administrateur",
        "email": "admin@stockify.com",
        "password_hash": hash_password("admin123"),
        "role": "admin",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Regular user
    regular_user = {
        "id": str(uuid.uuid4()),
        "nom": "Utilisateur Test",
        "email": "user@stockify.com", 
        "password_hash": hash_password("user123"),
        "role": "user",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Check if users already exist
    existing_admin = await db.users.find_one({"email": "admin@stockify.com"})
    existing_user = await db.users.find_one({"email": "user@stockify.com"})
    
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print("Admin user created: admin@stockify.com / admin123")
    else:
        print("Admin user already exists")
        
    if not existing_user:
        await db.users.insert_one(regular_user)
        print("Regular user created: user@stockify.com / user123")
    else:
        print("Regular user already exists")

async def create_test_articles():
    test_articles = [
        {
            "id": str(uuid.uuid4()),
            "nom": "Ordinateur Portable Dell",
            "description": "Dell Latitude 7420 - 16GB RAM, 512GB SSD",
            "image": None,
            "code_qr": None,
            "quantite": 5,
            "quantite_min": 2,
            "date_expiration": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "nom": "Souris sans fil",
            "description": "Souris ergonomique Logitech MX Master 3",
            "image": None,
            "code_qr": None,
            "quantite": 1,  # Stock bas
            "quantite_min": 5,
            "date_expiration": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "nom": "Cartouche d'encre HP",
            "description": "Cartouche HP 302 Noir",
            "image": None,
            "code_qr": None,
            "quantite": 8,
            "quantite_min": 3,
            "date_expiration": datetime.utcnow() + timedelta(days=15),  # Expire bientôt
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "nom": "Câble HDMI",
            "description": "Câble HDMI 2.1 - 2m",
            "image": None,
            "code_qr": None,
            "quantite": 15,
            "quantite_min": 5,
            "date_expiration": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "nom": "Papier A4",
            "description": "Ramette papier A4 80g - 500 feuilles",
            "image": None,
            "code_qr": None,
            "quantite": 25,
            "quantite_min": 10,
            "date_expiration": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    existing_count = await db.articles.count_documents({})
    if existing_count == 0:
        await db.articles.insert_many(test_articles)
        print(f"Created {len(test_articles)} test articles")
    else:
        print(f"Articles already exist ({existing_count} articles)")

async def main():
    print("Creating test data for Stockify...")
    
    try:
        await create_test_users()
        await create_test_articles()
        print("\nTest data creation completed!")
        print("\n🔑 Login credentials:")
        print("Admin: admin@stockify.com / admin123")
        print("User: user@stockify.com / user123")
        
    except Exception as e:
        print(f"Error creating test data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())