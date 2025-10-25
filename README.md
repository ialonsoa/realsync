# RealSync - AI-Powered Real Estate Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

RealSync is a modern, AI-powered collaborative platform that unifies property owners, buyers, and real estate agents with a shared timeline, document hub, smart reminders, and real-time tax/legal calculators for the Peruvian real estate market.

## 🚀 Features

- **Multi-User Dashboards**: Role-specific views for owners, buyers, and agents
- **Real-Time Process Tracker**: Visual timeline with Peru-specific legal stages
- **Smart Reminders**: AI-generated notifications via WhatsApp, email, and SMS
- **Document Repository**: Centralized, version-controlled file storage
- **Tax & Profit Estimator**: Real-time calculations for Alcabala, Impuesto a la Renta
- **Unified Chat**: Encrypted messaging with AI summaries
- **Agent Analytics**: Performance metrics and bottleneck identification
- **Mobile-First**: React Native app with document scanning

## 📋 Table of Contents

- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🏗 Architecture

RealSync uses a microservices architecture with the following components:

- **Backend Services**: Node.js/Express microservices
  - Auth Service (authentication & authorization)
  - Property Service (property management)
  - Transaction Service (deal lifecycle)
  - Document Service (file management)
  - Notification Service (multi-channel alerts)
  - Estimator Service (Python/FastAPI for tax calculations)
  - Chat Service (real-time messaging)
  - Analytics Service (reporting & insights)

- **Frontend Applications**:
  - Web App (React 18+ with TypeScript)
  - Mobile App (React Native for Android & iOS)

- **Infrastructure**:
  - Database: PostgreSQL 14+
  - Cache: Redis
  - Storage: AWS S3 / GCP Cloud Storage
  - Message Queue: RabbitMQ / AWS SQS
  - API Gateway: Kong / AWS API Gateway

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose (recommended)
- Python >= 3.10 (for Estimator service)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/realsync.git
cd realsync

# Copy environment variables
cp .env.example .env

# Start all services with Docker Compose
docker-compose up -d

# Run database migrations
npm run migrate

# Access the application
# Web: http://localhost:3000
# API: http://localhost:8000
```

### Manual Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend/web
npm install

# Install mobile dependencies
cd ../mobile
npm install

# Start development servers
npm run dev:all
```

## 📁 Project Structure

```
realsync/
├── backend/
│   ├── services/
│   │   ├── auth/              # Authentication & authorization
│   │   ├── property/          # Property management
│   │   ├── transaction/       # Transaction lifecycle
│   │   ├── document/          # Document management
│   │   ├── notification/      # Multi-channel notifications
│   │   ├── estimator/         # Tax calculations (Python)
│   │   ├── chat/              # Real-time messaging
│   │   └── analytics/         # Reporting & insights
│   ├── shared/
│   │   ├── database/          # Database models & migrations
│   │   ├── utils/             # Shared utilities
│   │   ├── types/             # TypeScript types
│   │   └── middleware/        # Shared middleware
│   └── config/                # Configuration files
├── frontend/
│   ├── web/                   # React web application
│   └── mobile/                # React Native mobile app
├── infrastructure/
│   ├── docker/                # Docker configurations
│   ├── kubernetes/            # K8s manifests
│   └── terraform/             # Infrastructure as Code
├── docs/
│   ├── api/                   # API documentation
│   ├── architecture/          # Architecture diagrams
│   └── guides/                # User & developer guides
└── scripts/                   # Utility scripts
```

## 💻 Development

### Running Individual Services

```bash
# Auth Service
cd backend/services/auth
npm run dev

# Web Application
cd frontend/web
npm run dev

# Mobile Application
cd frontend/mobile
npm run android  # or npm run ios
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend/web
npm test

# End-to-end tests
npm run test:e2e
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## 🚢 Deployment

### Production Build

```bash
# Build all services
npm run build:all

# Build specific service
npm run build:auth
npm run build:web
```

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/

# Check deployment status
kubectl get pods -n realsync
```

## 📚 API Documentation

API documentation is available at:
- **Development**: http://localhost:8000/api/docs
- **Production**: https://api.realsync.pe/v1/docs

See [API Documentation](docs/api/README.md) for detailed endpoint specifications.

## 🌍 Environment Variables

Key environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/realsync
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AWS (for S3 storage)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=realsync-documents

# Notification Services
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
SENDGRID_API_KEY=your-key

# AI Services
OPENAI_API_KEY=your-key
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Product Owner**: Alonso Inca Roca Navarrete
- **Target Market**: Peru (initial), LATAM expansion

## 📞 Support

- **Email**: support@realsync.pe
- **Documentation**: https://docs.realsync.pe
- **Status Page**: https://status.realsync.pe

## 🗺 Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and timeline.

- [x] Phase 1: Discovery & Design (4 weeks)
- [ ] Phase 2: MVP Development (8 weeks) - **Current**
- [ ] Phase 3: Private Beta (4 weeks)
- [ ] Phase 4: Public Launch (Q2 2026)
- [ ] Phase 5: LATAM Expansion (Q4 2026)

---

Built with ❤️ for the Peruvian real estate market
