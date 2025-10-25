# Getting Started with RealSync

Welcome to RealSync! This guide will help you set up and run the application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **Python** >= 3.10 ([Download](https://www.python.org/))
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/))
- **Redis** >= 6 ([Download](https://redis.io/))
- **Docker & Docker Compose** (Recommended) ([Download](https://www.docker.com/))

## Quick Start with Docker (Recommended)

This is the fastest way to get RealSync running locally:

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd "Realsync App V1"

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration (optional for local development)
nano .env
```

### 2. Start Services

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Run Database Migrations

```bash
# Run migrations to create database schema
npm run migrate
```

### 4. Access the Application

- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Auth Service**: http://localhost:8001
- **Estimator Service**: http://localhost:8006
- **RabbitMQ Management**: http://localhost:15672 (username: realsync, password: realsync)
- **Kong Admin API**: http://localhost:8444

### 5. Create Your First User

```bash
# Using curl
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@realsync.pe",
    "password": "SecurePassword123!",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "AGENT",
    "phone": "+51999999999"
  }'
```

## Manual Setup (Without Docker)

If you prefer to run services individually:

### 1. Database Setup

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@14

# Create database
createdb realsync

# Start Redis
brew services start redis
```

### 2. Backend Services

```bash
# Install dependencies for all backend services
cd backend
npm install

# Database package
cd shared/database
npm install
npm run migrate

# Auth Service
cd ../../services/auth
npm install
npm run dev

# In separate terminals, start other services:
# Property, Transaction, Document, Notification, Chat, Analytics
```

### 3. Tax Estimator Service (Python)

```bash
cd backend/services/estimator

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run service
uvicorn app.main:app --reload --port 8006
```

### 4. Frontend

```bash
cd frontend/web

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Key environment variables you should configure:

### Required for Full Functionality

```bash
# Database
DATABASE_URL=postgresql://realsync:realsync@localhost:5432/realsync

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AWS S3 (for document storage)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=realsync-documents-dev

# Twilio (for WhatsApp/SMS notifications)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# SendGrid (for email notifications)
SENDGRID_API_KEY=your-sendgrid-key

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-key
```

### Optional (for development)

Most services will work with default values for local development. You can add these later as needed.

## Testing the Application

### 1. Test the Estimator Service

```bash
curl -X POST http://localhost:8006/api/v1/estimator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "sale_price": 500000,
    "municipality": "LIMA",
    "acquisition_price": 400000,
    "is_primary_residence": false
  }'
```

### 2. Test Auth Service

```bash
# Register
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "first_name": "Test",
    "last_name": "User",
    "role": "AGENT"
  }'

# Login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend/web
npm test
```

### Linting and Formatting

```bash
# Lint all code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database Migrations

```bash
# Create a new migration
cd backend/shared/database
npm run migrate:make migration_name

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

## Common Issues and Solutions

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection
psql -U realsync -d realsync -h localhost
```

### Docker Issues

```bash
# Reset everything
docker-compose down -v
docker-compose up -d --build

# View logs
docker-compose logs -f service-name
```

## Next Steps

1. **Read the PRD**: Check `prd.json` for complete product requirements
2. **API Documentation**: Visit http://localhost:8006/docs for FastAPI docs
3. **Explore the Code**: Start with:
   - `backend/services/auth/` - Authentication logic
   - `backend/services/estimator/` - Tax calculation logic
   - `frontend/web/src/` - React application
4. **Implement Features**: Pick a feature from the PRD and start building!

## Architecture Overview

```
RealSync/
├── backend/
│   ├── services/           # Microservices
│   │   ├── auth/          # JWT authentication
│   │   ├── property/      # Property management
│   │   ├── transaction/   # Deal lifecycle
│   │   ├── document/      # File management
│   │   ├── notification/  # Multi-channel alerts
│   │   ├── estimator/     # Tax calculations (Python)
│   │   ├── chat/          # Real-time messaging
│   │   └── analytics/     # Reporting
│   └── shared/            # Shared code
│       ├── database/      # Migrations & models
│       ├── utils/         # Utilities
│       └── types/         # TypeScript types
├── frontend/
│   ├── web/              # React web app
│   └── mobile/           # React Native app
└── infrastructure/       # Docker, K8s, Terraform
```

## Resources

- **Project Documentation**: `/docs`
- **API Specs**: `/docs/api`
- **Architecture Diagrams**: `/docs/architecture`
- **User Guides**: `/docs/guides`

## Support

- **Issues**: Create an issue in the repository
- **Questions**: Check the documentation first
- **Contributing**: See CONTRIBUTING.md

---

Happy coding! 🚀
