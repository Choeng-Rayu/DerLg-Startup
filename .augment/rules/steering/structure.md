# Project Structure

## Repository Organization

This is a monorepo containing four main applications:

```
/
├── backend/              # Node.js/Express API server for main website
├── frontend/             # Next.js customer-facing web app
├── system-admin/         # Fullstack Next.js app (backend + frontend) for admin use
├── mobile_app/           # Flutter mobile application
└── backend-ai/           # Python FastAPI AI recommendation processing service
```

**Important Architecture Notes**:
- `backend/` - Main API backend serving the customer-facing website and mobile app
- `frontend/` - Customer-facing Next.js web application
- `system-admin/` - Standalone fullstack Next.js application with its own backend and frontend for admin operations
- `mobile_app/` - Flutter cross-platform mobile app
- `backend-ai/` - Separate Python service dedicated to AI recommendation processing only

## Backend Structure

```
backend/
├── src/
│   ├── config/          # Configuration (database, env)
│   ├── controllers/     # Request handlers
│   ├── models/          # Sequelize models (User, Hotel, Booking, etc.)
│   ├── routes/          # API route definitions
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions (logger, response helpers)
│   ├── migrations/      # Database migrations
│   ├── scripts/         # Utility scripts (testing, sync)
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Server entry point
├── docs/                # Documentation
├── dist/                # Compiled output (generated)
├── .env.example         # Environment template
├── tsconfig.json        # TypeScript config
└── package.json
```

## Frontend Structure (Next.js App Router)

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx   # Root layout
│       ├── page.tsx     # Homepage
│       ├── globals.css  # Global styles
│       └── [routes]/    # Route-based pages
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS config (v4)
├── tsconfig.json        # TypeScript config
└── package.json
```

## System Admin Structure (Fullstack Next.js)

```
system-admin/
├── src/
│   └── app/
│       ├── api/         # Backend API routes (Next.js API Routes)
│       ├── layout.tsx   # Root layout
│       ├── page.tsx     # Admin dashboard homepage
│       ├── globals.css  # Global styles
│       └── [routes]/    # Admin pages (hotels, users, bookings, etc.)
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS config (v4)
├── tsconfig.json        # TypeScript config
└── package.json
```

Note: System Admin is a fullstack application - frontend pages in `app/` and backend API routes in `app/api/`.

## Mobile App Structure (Flutter)

```
mobile_app/
├── lib/
│   └── main.dart        # App entry point
├── android/             # Android-specific files
├── ios/                 # iOS-specific files
├── web/                 # Web-specific files
├── test/                # Test files
├── pubspec.yaml         # Flutter dependencies
└── analysis_options.yaml
```

## Key Architectural Patterns

### Backend Patterns

- **MVC Architecture**: Models (Sequelize), Controllers (request handlers), Routes (endpoints)
- **Middleware Chain**: Security (helmet) → CORS → Rate limiting → Body parsing → Routes → Error handling
- **Sequelize ORM**: Models with hooks for password hashing, validation, and data normalization
- **Error Handling**: Centralized error handler with consistent error response format
- **Logging**: Winston-based logger for structured logging
- **Database**: Connection pooling, retry logic, graceful shutdown

### Model Conventions

- Use TypeScript with strict typing
- Sequelize models extend `Model<InferAttributes, InferCreationAttributes>`
- Enums for constrained values (UserType, Language, Currency)
- Hooks for data transformation (beforeCreate, beforeUpdate, beforeSave)
- Instance methods for business logic (comparePassword, toSafeObject)
- Indexes defined in model initialization
- snake_case for database columns, camelCase for TypeScript

### API Conventions

- RESTful endpoints under `/api` prefix
- Consistent response format: `{ success: boolean, data?: any, error?: ErrorObject }`
- Error codes follow pattern: `PREFIX_XXXX` (e.g., AUTH_1001, VAL_2001)
- Rate limiting applied to all `/api` routes
- Request logging with IP and user agent

### Frontend Patterns

- Next.js 15 App Router (not Pages Router)
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Component-based architecture
- Server and client components separation

### Configuration

- Environment variables via `.env` files (never commit)
- Centralized config in `src/config/env.ts`
- Different configs for development/production
- Database connection pooling optimized per environment
