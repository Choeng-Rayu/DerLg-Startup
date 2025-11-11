# Developer Onboarding Guide

Welcome to the DerLg Tourism Platform! This guide will help you get started quickly.

## 🎯 Quick Start by Role

### Backend Developer

**What's Ready:**
- ✅ All database models implemented
- ✅ Authentication system working
- ✅ Google OAuth integrated
- ✅ Database migrations complete

**What You'll Work On:**
- Hotel management endpoints (Tasks 15-18)
- Booking creation and management (Tasks 19-26)
- Tours and events endpoints (Tasks 27-29)
- Payment gateway integration (Tasks 20-24)

**Start Here:**
1. Read [backend/README.md](./backend/README.md)
2. Review [backend/docs/AUTHENTICATION.md](./backend/docs/AUTHENTICATION.md)
3. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. Look at [.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md) (Tasks 12-29)

**Setup:**
```bash
cd backend
npm install
cp .env.example .env
# Configure database in .env
npm run db:sync
npm run dev
```

### Frontend Developer

**What's Ready:**
- ✅ Backend API with authentication
- ✅ API documentation available
- ⏳ Next.js skeleton project

**What You'll Build:**
- Authentication pages (login, register, OAuth)
- Hotel search and listing
- Hotel detail and booking flow
- User profile and booking management
- AI chat assistant interface

**Start Here:**
1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md)
3. Check [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. Look at [.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md) (Tasks 44-58)

**Setup:**
```bash
cd frontend
npm install
# Create .env.local with API_URL
npm run dev
```

**API Integration Example:**
See the React/Next.js examples in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#frontend-reactnextjs)

### System Admin Developer

**What's Ready:**
- ✅ Backend API with authentication
- ✅ Role-based access control ready
- ⏳ Next.js fullstack skeleton

**What You'll Build:**
- Admin dashboard with KPIs
- Hotel management and approval
- User management
- Guide and transportation management
- Event management (CRUD)
- Analytics and reports

**Start Here:**
1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md)
3. Check [.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md) (Tasks 59-76)

**Setup:**
```bash
cd system-admin
npm install
# Create .env.local with API_URL
npm run dev
```

**Note:** System Admin is a fullstack Next.js app with API routes in `app/api/`

### Mobile Developer

**What's Ready:**
- ✅ Backend API with authentication
- ✅ API documentation available
- ⏳ Flutter skeleton project

**What You'll Build:**
- Authentication screens
- Hotel search and booking
- User profile management
- Mobile-specific features (geolocation, click-to-call)

**Start Here:**
1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review Flutter examples in API_DOCUMENTATION.md
3. Check [.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md) (Tasks 88-91)

**Setup:**
```bash
cd mobile_app
flutter pub get
flutter run
```

**API Integration Example:**
See the Flutter examples in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#mobile-flutter)

### AI/ML Engineer

**What's Ready:**
- ✅ Backend API ready to integrate
- ✅ Database models for recommendations
- ⏳ AI Engine not created yet

**What You'll Build:**
- FastAPI recommendation service
- Collaborative filtering algorithm
- ChatGPT-4 integration
- Sentiment analysis for reviews
- Itinerary generation

**Start Here:**
1. Review [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md)
2. Check [.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md) (Tasks 30-35)
3. Plan API contract with backend team

**Setup:**
```bash
mkdir backend-ai
cd backend-ai
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install fastapi uvicorn openai scikit-learn sentence-transformers
```

### DevOps Engineer

**What's Ready:**
- ✅ Backend API deployable
- ⏳ Frontend/Admin not ready
- ⏳ No CI/CD pipeline

**What You'll Set Up:**
- Digital Ocean infrastructure
- MySQL database hosting
- Redis cache
- CI/CD pipeline
- SSL/TLS certificates
- Monitoring and logging

**Start Here:**
1. Review [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md)
2. Check [.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md) (Tasks 98-102)
3. Plan deployment architecture

## 📋 Essential Documents

### For Everyone
- **[README.md](./README.md)** - Project overview
- **[COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md)** - Detailed component status
- **[SYNC_ANALYSIS_SUMMARY.md](./SYNC_ANALYSIS_SUMMARY.md)** - Latest sync analysis

### Technical Docs
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Integration patterns
- **[QUICK_START.md](./QUICK_START.md)** - Quick setup guide

### Backend Specific
- **[backend/README.md](./backend/README.md)** - Backend setup
- **[backend/docs/AUTHENTICATION.md](./backend/docs/AUTHENTICATION.md)** - Auth system
- **[backend/docs/DATABASE.md](./backend/docs/DATABASE.md)** - Database config
- **[backend/docs/USER_MODEL.md](./backend/docs/USER_MODEL.md)** - User model
- **[backend/docs/HOTEL_ROOM_MODELS.md](./backend/docs/HOTEL_ROOM_MODELS.md)** - Hotel/Room models
- **[backend/docs/BOOKING_PAYMENT_MODELS.md](./backend/docs/BOOKING_PAYMENT_MODELS.md)** - Booking/Payment
- **[backend/docs/TOUR_EVENT_REVIEW_MODELS.md](./backend/docs/TOUR_EVENT_REVIEW_MODELS.md)** - Tours/Events/Reviews
- **[backend/docs/GUIDE_TRANSPORTATION_MODELS.md](./backend/docs/GUIDE_TRANSPORTATION_MODELS.md)** - Guides/Transportation
- **[backend/docs/SUPPORTING_MODELS.md](./backend/docs/SUPPORTING_MODELS.md)** - Supporting models
- **[backend/docs/GOOGLE_OAUTH.md](./backend/docs/GOOGLE_OAUTH.md)** - Google OAuth

### Task Lists
- **[.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md)** - All tasks
- **[.kiro/specs/derlg-tourism-platform/requirements.md](./.kiro/specs/derlg-tourism-platform/requirements.md)** - Requirements
- **[.kiro/specs/derlg-tourism-platform/design.md](./.kiro/specs/derlg-tourism-platform/design.md)** - Design doc

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   DerLg Tourism Platform                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Frontend   │  │ System Admin │  │  Mobile App  │
│   (Next.js)  │  │  (Next.js)   │  │  (Flutter)   │
│   Port 3000  │  │  Port 3001   │  │              │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                    HTTP/REST
                         │
              ┌──────────▼──────────┐
              │    Backend API      │
              │  (Node.js/Express)  │
              │     Port 5000       │
              └──────────┬──────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
    │   MySQL   │  │  Redis  │  │ AI Engine │
    │ Database  │  │  Cache  │  │  (Python) │
    │           │  │         │  │ Port 8000 │
    └───────────┘  └─────────┘  └───────────┘
```

## 🔑 Key Concepts

### Authentication Flow

1. User registers/logs in via frontend
2. Backend validates credentials
3. Backend generates JWT tokens (access + refresh)
4. Frontend stores tokens securely
5. Frontend includes access token in API requests
6. Backend validates token on protected routes
7. Frontend refreshes token when expired

### Data Flow

1. Frontend makes API request
2. Backend validates authentication
3. Backend queries database
4. Backend formats response
5. Frontend receives and displays data

### Payment Flow

1. User creates booking (status: pending)
2. User selects payment option (deposit/milestone/full)
3. Frontend redirects to payment gateway
4. Gateway processes payment
5. Gateway webhook notifies backend
6. Backend updates booking status (confirmed)
7. Backend creates payment transaction record

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Test database connection
npm run db:test

# Test specific models
npm run test:user
npm run test:hotel-room
npm run test:booking
npm run test:tour-event-review
npm run test:guide-transportation
npm run test:supporting

# Test authentication
npm run test:auth
npm run test:registration
npm run test:google-oauth
```

### API Testing

Use the examples in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) with cURL or Postman.

## 🐛 Common Issues

### Backend Won't Start

**Issue:** Database connection failed  
**Solution:** Check MySQL is running and .env credentials are correct

**Issue:** Port 5000 already in use  
**Solution:** Change PORT in .env or kill process using port 5000

### Frontend Can't Connect to API

**Issue:** CORS error  
**Solution:** Ensure frontend URL is in backend CORS_ORIGIN config

**Issue:** 401 Unauthorized  
**Solution:** Check access token is being sent in Authorization header

### Database Issues

**Issue:** Table doesn't exist  
**Solution:** Run `npm run db:sync` to create tables

**Issue:** Migration failed  
**Solution:** Check database credentials and permissions

## 📞 Getting Help

1. Check relevant documentation first
2. Review [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md) for current status
3. Look at existing code examples
4. Check task list for context
5. Ask team for clarification

## 🎯 Current Priorities

### Week 1-2 (Immediate)
1. Complete backend hotel/booking endpoints (Backend team)
2. Implement frontend authentication pages (Frontend team)
3. Create API contract tests (Backend team)

### Week 3-4 (Short term)
4. Build system admin dashboard (Admin team)
5. Integrate PayPal payment (Backend + Frontend)
6. Start AI engine development (AI team)

### Month 2 (Medium term)
7. Implement mobile app core features (Mobile team)
8. Add real-time messaging (Backend + Frontend)
9. Deploy to staging environment (DevOps)

## 🚀 Next Steps

1. **Choose your role** from the sections above
2. **Read the "Start Here" documents** for your role
3. **Set up your development environment**
4. **Review the task list** for your component
5. **Start coding!**

Welcome aboard! 🎉
