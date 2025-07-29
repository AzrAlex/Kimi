# Stockify - Docker Setup

A complete inventory management system built with FastAPI (Python) backend, React frontend, and MongoDB database.

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Running the Application

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/stockify
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - **Frontend (React):** http://localhost:3000
   - **Backend API:** http://localhost:8001
   - **API Documentation:** http://localhost:8001/docs
   - **MongoDB Admin:** http://localhost:8081 (admin/admin123)

4. **Create test data:**
   ```bash
   docker-compose exec backend python create_test_data.py
   ```

## 🔐 Default Login Credentials

After creating test data:
- **Admin:** admin@stockify.com / admin123
- **User:** user@stockify.com / user123

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React web interface |
| Backend | 8001 | FastAPI REST API |
| MongoDB | 27017 | Database |
| Mongo Express | 8081 | Database admin UI |

## 🛠 Development

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Access Container Shell
```bash
# Backend container
docker-compose exec backend bash

# Frontend container (build stage)
docker-compose exec frontend sh
```

### Database Management
- **Access MongoDB:** http://localhost:8081
- **Direct mongo shell:**
  ```bash
  docker-compose exec mongo mongosh stockify -u admin -p password123
  ```

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │    │   FastAPI       │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 8001)   │    │   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                               │
                                               ▼
                                        ┌─────────────────┐
                                        │  Mongo Express  │
                                        │  Admin UI       │
                                        │  (Port 8081)    │
                                        └─────────────────┘
```

## 📂 Volumes

- **mongo_data:** MongoDB persistent storage
- **backend_uploads:** File uploads (article images)

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://admin:password123@mongo:27017/stockify?authSource=admin
DB_NAME=stockify
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts:** Make sure ports 3000, 8001, 8081, 27017 are available
2. **MongoDB connection issues:** Wait for MongoDB to fully start (health check)
3. **Frontend not loading:** Check if backend is healthy at http://localhost:8001/docs

### Health Checks
```bash
# Check service status
docker-compose ps

# Check specific service health
docker-compose exec backend curl -f http://localhost:8001/docs
docker-compose exec frontend curl -f http://localhost/
```

### Reset Database
```bash
# Stop services and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 📝 API Testing

Test the backend API:
```bash
# Run comprehensive API tests
docker-compose exec backend python backend_test.py

# Or from host (if Python is installed)
python backend_test.py
```

## 🚦 Production Deployment

For production deployment:

1. **Update environment variables**
2. **Use external MongoDB** (recommended)
3. **Configure reverse proxy/load balancer**
4. **Set up SSL certificates**
5. **Configure backup strategies**

## 🤝 Contributing

1. Make changes to the code
2. Test with Docker Compose
3. Submit pull request

## 📄 License

This project is licensed under the MIT License.