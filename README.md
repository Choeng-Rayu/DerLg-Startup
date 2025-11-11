# DerLg Tourism Platform

A comprehensive tourism booking platform for Cambodia connecting travelers with hotels, tours, and cultural experiences.

## 🚀 Project Status

**Current Phase:** Backend Core Complete (Phase 1-4 Partial)  
**Next Phase:** Complete Backend APIs & Start Frontend (Phase 4-9)  
**Completion:** ~21% (23/107 tasks complete)

### Component Status
- ✅ **Backend API** - 60% complete (Tasks 1-23 ✅, Tasks 24-29 ⚠️)
  - ✅ Infrastructure, Models, Authentication, Hotels, Rooms, Payments
  - ⚠️ Missing: Booking management, Tours, Events, Reviews
- ❌ **Frontend Web** - 0% complete (Tasks 44-58)
- ❌ **System Admin** - 0% complete (Tasks 59-66)
- ❌ **Mobile App** - 0% complete (Tasks 88-91)
- ❌ **AI Engine** - 0% complete (Tasks 30-35)

### 📚 Documentation

**🚨 CRITICAL: Component Synchronization**

**👉 START HERE:** **[DEVELOPER_QUICK_REFERENCE.md](./DEVELOPER_QUICK_REFERENCE.md)** - Quick start by role

Before starting any development, read these documents:

1. **[PLATFORM_SYNC_STATUS.md](./PLATFORM_SYNC_STATUS.md)** ⭐ - Complete status across all components
2. **[API_CONTRACTS.md](./API_CONTRACTS.md)** ⭐ - API reference for frontend/mobile developers
3. **[FRONTEND_TYPES_REFERENCE.ts](./FRONTEND_TYPES_REFERENCE.ts)** ⭐ - TypeScript types for frontend
4. **[SYNC_COMPLETION_SUMMARY.md](./SYNC_COMPLETION_SUMMARY.md)** - Analysis summary and next steps

**Getting Started:**
- **[DEVELOPER_QUICK_REFERENCE.md](./DEVELOPER_QUICK_REFERENCE.md)** - Quick reference by role
- **[DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md)** - New developer guide
- **[QUICK_START.md](./QUICK_START.md)** - Get backend running locally
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Cross-component integration

**Legacy Documentation:**
- [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md) - Older sync analysis
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Older API docs
- [SYNC_ANALYSIS_SUMMARY.md](./SYNC_ANALYSIS_SUMMARY.md) - Older sync review

---

## 🚀 Quick Start

**New to the project?** Start here:

1. **[Quick Start Guide](QUICK_START.md)** - Get everything running in 10 minutes
2. **[Integration Guide](INTEGRATION_GUIDE.md)** - Understand how components work together
3. **[Synchronization Status](SYNCHRONIZATION_STATUS.md)** - See current development status

---

## 📋 Project Overview

DerLg.com is a multi-platform tourism booking system consisting of:

### Core Systems

1. **Customer System** (`backend/` + `frontend/` + `mobile_app/`)
   - Tourist-facing web and mobile applications
   - Hotel and tour search and booking
   - AI-powered recommendations
   - Multi-language support (English, Khmer, Chinese)

2. **Super Admin Dashboard** (`system-admin/`)
   - Fullstack Next.js application for platform oversight
   - Hotel, user, and booking management
   - Analytics and reporting
   - Guide and transportation management

3. **AI Recommendation Engine** (`backend-ai/`)
   - Python FastAPI microservice
   - Personalized recommendations
   - ChatGPT-4 powered chat assistant
   - Sentiment analysis for reviews

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DerLg Tourism Platform                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │◀────│ System Admin │
│  (Next.js)   │     │  (Express)   │     │  (Next.js)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                      │
       │                    │                      │
       ▼                    ▼                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile App  │     │  AI Engine   │     │    MySQL     │
│  (Flutter)   │     │  (FastAPI)   │     │  Database    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **ORM**: Sequelize
- **Database**: MySQL
- **Authentication**: JWT with bcrypt
- **Security**: helmet, cors, express-rate-limit

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

### System Admin
- **Framework**: Next.js 15+ (Fullstack)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Charts**: Chart.js/Recharts
- **Language**: TypeScript

### Mobile App
- **Framework**: Flutter SDK 3.5.3+
- **Language**: Dart
- **Platforms**: iOS, Android, Web, Desktop

### AI Engine
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **AI**: OpenAI GPT-4
- **ML**: scikit-learn, sentence-transformers

---

## 📦 Repository Structure

```
/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── models/      # Sequelize models (14 models)
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth, validation, error handling
│   │   ├── services/    # Business logic
│   │   └── migrations/  # Database migrations
│   └── docs/            # API documentation
│
├── frontend/            # Next.js customer web app
│   └── src/app/        # App Router pages
│
├── system-admin/        # Next.js fullstack admin app
│   └── src/app/
│       ├── api/        # Backend API routes
│       └── [pages]/    # Admin pages
│
├── mobile_app/          # Flutter mobile application
│   └── lib/            # Dart source code
│
└── backend-ai/          # Python FastAPI AI service
    └── [to be implemented]
```

---

## 🎯 Key Features

- ✅ **Multi-role Authentication** (Tourist, Hotel Admin, Super Admin)
- ✅ **Hotel & Room Management** with real-time availability
- ✅ **Flexible Payment Options** (PayPal, Bakong/KHQR, Stripe)
  - Deposit (50-70%)
  - Milestone payments (50%/25%/25%)
  - Full payment with 5% discount
- ✅ **Student Discount Program** (3 uses per verified email)
- 🔄 **AI-Powered Recommendations** (In Progress)
- 🔄 **ChatGPT-4 Travel Assistant** (In Progress)
- 🔄 **Sentiment Analysis for Reviews** (In Progress)
- 🔄 **Real-time Messaging** (Planned)
- 🔄 **Google Calendar Integration** (Planned)
- 🔄 **Telegram Bot for Service Providers** (Planned)

**Legend**: ✅ Complete | 🔄 In Progress | ⏳ Planned

---

## 📊 Development Status

**Current Phase**: Phase 2 - Authentication and Authorization System

**Completion**: ~15% of total project

### Completed (Tasks 1-10):
- ✅ Backend infrastructure and database setup
- ✅ All data models (14 models with migrations)
- ✅ JWT authentication service
- ✅ User registration and login endpoints
- ✅ Error handling and logging

### In Progress (Tasks 11-14):
- 🔄 Google OAuth integration
- 🔄 Facebook Login integration
- 🔄 Password reset functionality
- 🔄 Role-based authorization middleware

### Next Up (Tasks 15-26):
- ⏳ Hotel and room management APIs
- ⏳ Booking system and payment processing
- ⏳ Tours, events, and reviews

See [SYNCHRONIZATION_STATUS.md](SYNCHRONIZATION_STATUS.md) for detailed status.

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Flutter SDK 3.5.3+ (for mobile)
- Python 3.10+ (for AI engine)

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd derlg-tourism-platform

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../system-admin && npm install
cd ../mobile_app && flutter pub get

# 3. Set up database
mysql -u root -p
CREATE DATABASE derlg_tourism;

# 4. Configure environment
cd backend
cp .env.example .env
# Edit .env with your database credentials

# 5. Initialize database
npm run db:sync

# 6. Start services
npm run dev  # In backend/
npm run dev  # In frontend/
npm run dev  # In system-admin/
```

**For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)**

---

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Setup and run in 10 minutes
- **[Integration Guide](INTEGRATION_GUIDE.md)** - Cross-component integration
- **[Synchronization Status](SYNCHRONIZATION_STATUS.md)** - Current development status

### Component Documentation
- **[Backend README](backend/README.md)** - API server documentation
- **[Backend API Docs](backend/docs/)** - Detailed API documentation
- **[Frontend README](frontend/README.md)** - Web app documentation
- **[System Admin README](system-admin/README.md)** - Admin dashboard documentation
- **[Mobile App README](mobile_app/README.md)** - Flutter app documentation

### Specifications
- **[Requirements](.kiro/specs/derlg-tourism-platform/requirements.md)** - Product requirements
- **[Design](.kiro/specs/derlg-tourism-platform/design.md)** - System design
- **[Tasks](.kiro/specs/derlg-tourism-platform/tasks.md)** - Implementation plan

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       - User registration
POST   /api/auth/login          - User login
POST   /api/auth/refresh-token  - Refresh access token
POST   /api/auth/logout         - User logout
GET    /api/auth/verify         - Verify token
GET    /api/auth/me             - Get current user
```

### Health Check
```
GET    /api/health              - API health status
```

**More endpoints coming soon...**

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for detailed API documentation.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Test database connection
npm run db:test

# Test individual models
npm run test:user
npm run test:hotel-room
npm run test:booking
npm run test:tour-event-review
npm run test:guide-transportation
npm run test:supporting

# Test authentication service
npm run test:auth
```

---

## 🌐 Deployment

### Production URLs
- **Frontend**: https://derlg.com
- **Backend API**: https://api.derlg.com
- **System Admin**: https://admin.derlg.com
- **AI Engine**: https://ai.derlg.com

### Infrastructure
- **Hosting**: Digital Ocean Droplets
- **Database**: MySQL on Digital Ocean
- **Media Storage**: Cloudinary
- **Domain**: NameCheap (derlg.com)

---

## 🤝 Contributing

1. Check [SYNCHRONIZATION_STATUS.md](SYNCHRONIZATION_STATUS.md) for current priorities
2. Review [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for integration patterns
3. Follow the task list in `.kiro/specs/derlg-tourism-platform/tasks.md`
4. Ensure all components remain synchronized
5. Update documentation when making changes

---

## 📝 License

[Add license information]

---

## 👥 Team

[Add team information]

---

## 📞 Support

For issues and questions:
1. Check [QUICK_START.md](QUICK_START.md) troubleshooting section
2. Review [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for integration issues
3. Check backend logs for error messages
4. Verify environment configuration

---

**Built with ❤️ for Cambodia Tourism**
