// MongoDB initialization script for Stockify
// This script runs when MongoDB container starts for the first time

// Switch to the stockify database
db = db.getSiblingDB('stockify');

// Create collections with validation
db.createCollection('users', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["id", "nom", "email", "password_hash", "role"],
         properties: {
            id: { bsonType: "string" },
            nom: { bsonType: "string" },
            email: { bsonType: "string" },
            password_hash: { bsonType: "string" },
            role: { enum: ["admin", "user"] },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
         }
      }
   }
});

db.createCollection('articles', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["id", "nom", "description", "quantite", "quantite_min"],
         properties: {
            id: { bsonType: "string" },
            nom: { bsonType: "string" },
            description: { bsonType: "string" },
            image: { bsonType: ["string", "null"] },
            code_qr: { bsonType: ["string", "null"] },
            quantite: { bsonType: "int" },
            quantite_min: { bsonType: "int" },
            date_expiration: { bsonType: ["date", "null"] },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
         }
      }
   }
});

db.createCollection('demandes');
db.createCollection('mouvements');
db.createCollection('historique_actions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "id": 1 }, { unique: true });
db.articles.createIndex({ "id": 1 }, { unique: true });
db.articles.createIndex({ "nom": 1 });
db.articles.createIndex({ "quantite": 1 });
db.demandes.createIndex({ "id": 1 }, { unique: true });
db.demandes.createIndex({ "user_id": 1 });
db.demandes.createIndex({ "article_id": 1 });
db.mouvements.createIndex({ "id": 1 }, { unique: true });
db.mouvements.createIndex({ "article_id": 1 });
db.historique_actions.createIndex({ "id": 1 }, { unique: true });
db.historique_actions.createIndex({ "user_id": 1 });
db.historique_actions.createIndex({ "created_at": -1 });

print('✅ MongoDB initialization completed for Stockify database');