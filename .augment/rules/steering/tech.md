---
type: "always_apply"
---

# Technology Stack

## Backend (Node.js/Express)

**Location**: `backend/`

**Purpose**: Main API server for customer-facing website and mobile app

**Stack**:
- Node.js with Express.js framework
- TypeScript for type safety
- Sequelize ORM with MySQL database
- JWT authentication with bcrypt password hashing
- Security: helmet, cors, express-rate-limit

**Key Dependencies**:
- express, sequelize, mysql2, bcrypt, jsonwebtoken
- express-validator, dotenv, cors, helmet
- socket.io (real-time features), cloudinary (media), axios

**Database**: MySQL hosted on Digital Ocean

## Frontend (Next.js)

**Location**: `frontend/`

**Purpose**: Customer-facing web application

**Stack**:
- React with Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS v4

**Key Dependencies**:
- react 19.1.0, next 15.5.6
- tailwindcss 4, typescript 5

## System Admin (Fullstack Next.js)

**Location**: `system-admin/`

**Purpose**: Standalone fullstack application for admin operations (includes both backend and frontend)

**Stack**:
- React with Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS v4
- Chart.js/Recharts for analytics
- Next.js API Routes for backend functionality

**Key Dependencies**:
- react 19.1.0, next 15.5.6
- tailwindcss 4, typescript 5

## Mobile App (Flutter)

**Location**: `mobile_app/`

**Stack**:
- Flutter SDK 3.5.3+
- Dart programming language
- Cross-platform (iOS, Android, Web, Desktop)

## AI Engine (Python)

**Location**: `backend-ai/`

**Purpose**: Dedicated AI recommendation processing service (AI processing only)

**Stack**:
- Python 3.10+
- FastAPI framework
- OpenAI GPT-4 for conversational AI
- scikit-learn for recommendation algorithms
- sentence-transformers for sentiment analysis

## Infrastructure & Services

**Hosting**: Digital Ocean droplets
**Media Storage**: Cloudinary
**Database**: MySQL on Digital Ocean
**Analytics**: Google Analytics (G-CS4CQ72GZ6)

**Third-Party Integrations**:
- Google OAuth 2.0, Facebook Login
- PayPal, Bakong (KHQR: choeng_rayu@aclb, +855969983479), Stripe
- Twilio (SMS), SendGrid/Mailgun (email)
- Google Maps API, Google Calendar API
- Telegram Bot API (token: 7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM)

## Common Commands

### Backend

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server

# Database
npm run db:test          # Test database connection
npm run db:sync          # Sync models to database
npm run test:user        # Test User model
npm run verify:user      # Verify users table structure
```

### Frontend (Customer-facing)

```bash
npm run dev              # Start Next.js dev server with Turbopack
npm run build            # Build for production with Turbopack
npm start                # Start production server
npm run lint             # Run ESLint
```

### System Admin (Fullstack)

```bash
npm run dev              # Start Next.js dev server with Turbopack
npm run build            # Build for production with Turbopack
npm start                # Start production server
npm run lint             # Run ESLint
```

Note: System Admin is a fullstack Next.js app with its own backend (API routes) and frontend.

### Mobile App

```bash
flutter run              # Run app in debug mode
flutter build apk        # Build Android APK
flutter build ios        # Build iOS app
flutter test             # Run tests
flutter pub get          # Install dependencies
```

## Environment Configuration

Backend uses `.env` files (see `.env.example` for template). Key variables include:
- Database credentials (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- JWT secrets (JWT_SECRET, JWT_REFRESH_SECRET)
- API keys for third-party services
- CORS and rate limiting configuration
