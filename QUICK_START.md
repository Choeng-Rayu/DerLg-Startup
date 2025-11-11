# DerLg Tourism Platform - Quick Start Guide

Get the backend API running locally in under 10 minutes.

## ⚠️ Current State

**✅ Backend API** - Fully functional with authentication and database models
**⏳ Frontend/Mobile/Admin** - Skeleton projects, not yet implemented
**⏳ AI Engine** - Not created yet

This guide focuses on the working backend API. See [COMPONENT_SYNC_STATUS.md](./COMPONENT_SYNC_STATUS.md) for full status.

---

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Git

**Optional (for future development):**
- Flutter SDK 3.5.3+ (for mobile app)
- Python 3.10+ (for AI engine)

---

## Step 1: Clone and Setup Backend

```bash
# Clone the repository
git clone <repository-url>
cd derlg-tourism-platform

# Install backend dependencies
cd backend
npm install
```

---

## Step 2: Database Setup

```bash
# Create MySQL database
mysql -u root -p

# In MySQL shell:
CREATE DATABASE derlg_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'derlg_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON derlg_tourism.* TO 'derlg_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Step 3: Environment Configuration

### Backend

```bash
cd backend
cp .env.example .env

# Edit .env with your database credentials
# Minimum required:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=derlg_tourism
DB_USER=derlg_user
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

### Frontend

```bash
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_URL=http://localhost:8000
EOF
```

### System Admin

```bash
cd system-admin
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_URL=http://localhost:8000
EOF
```

---

## Step 4: Initialize Database

```bash
cd backend

# Test database connection
npm run db:test

# Sync models to database (creates all tables)
npm run db:sync

# Verify tables were created
npm run verify:user
```

---

## Step 5: Start All Services

Open 4 terminal windows:

### Terminal 1: Backend API

```bash
cd backend
npm run dev

# Should see:
# Server is running on port 5000
# Environment: development
# Database connection established successfully
```

### Terminal 2: Frontend Web

```bash
cd frontend
npm run dev

# Should see:
# ▲ Next.js 15.5.6
# - Local: http://localhost:3000
```

### Terminal 3: System Admin

```bash
cd system-admin
npm run dev

# Should see:
# ▲ Next.js 15.5.6
# - Local: http://localhost:3001
```

### Terminal 4: Mobile App (Optional)

```bash
cd mobile_app
flutter run

# Or for web:
flutter run -d chrome
```

---

## Step 6: Test the Setup

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"data":{"status":"ok","timestamp":"..."},"timestamp":"..."}
```

### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_type": "tourist",
    "email": "test@example.com",
    "password": "Password123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Should return user data and JWT tokens
```

### Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Should return user data and JWT tokens
```

### Access Frontend

Open browser: http://localhost:3000

### Access System Admin

Open browser: http://localhost:3001

---

## Step 7: Create Test Data (Optional)

```bash
cd backend

# Run model tests to create sample data
npm run test:user
npm run test:hotel-room
npm run test:booking
npm run test:tour-event-review
npm run test:guide-transportation
npm run test:supporting
```

---

## Common Issues and Solutions

### Issue: Database Connection Failed

**Error**: `Unable to connect to the database`

**Solution**:
```bash
# Check MySQL is running
sudo systemctl status mysql

# Start MySQL if not running
sudo systemctl start mysql

# Verify credentials in backend/.env
```

### Issue: Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Issue: Frontend Can't Connect to Backend

**Error**: Network errors in browser console

**Solution**:
1. Verify backend is running on port 5000
2. Check CORS_ORIGIN in backend/.env includes http://localhost:3000
3. Verify NEXT_PUBLIC_API_URL in frontend/.env.local

### Issue: TypeScript Compilation Errors

**Error**: Type errors in frontend/admin

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## Development Workflow

### Making Backend Changes

```bash
cd backend

# 1. Create/modify model
vim src/models/NewModel.ts

# 2. Create migration
vim src/migrations/015-create-new-table.ts

# 3. Update model associations
vim src/models/index.ts

# 4. Sync database
npm run db:sync

# 5. Create test script
vim src/scripts/testNewModel.ts

# 6. Run tests
npm run test:new-model
```

### Making Frontend Changes

```bash
cd frontend

# 1. Create new page
mkdir -p src/app/new-page
vim src/app/new-page/page.tsx

# 2. Create API client function
vim src/lib/api-client.ts

# 3. Create types
vim src/types/models.ts

# 4. Test in browser
npm run dev
# Open http://localhost:3000/new-page
```

### Making Admin Changes

```bash
cd system-admin

# 1. Create API route
mkdir -p src/app/api/admin
vim src/app/api/admin/route.ts

# 2. Create admin page
mkdir -p src/app/admin/dashboard
vim src/app/admin/dashboard/page.tsx

# 3. Test in browser
npm run dev
# Open http://localhost:3001/admin/dashboard
```

---

## Useful Commands

### Backend

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm start                # Start production server

# Database
npm run db:test          # Test connection
npm run db:sync          # Sync models
npm run verify:user      # Verify users table

# Testing
npm run test:user        # Test User model
npm run test:hotel-room  # Test Hotel/Room models
npm run test:booking     # Test Booking/Payment models
npm run test:auth        # Test authentication service
```

### Frontend/Admin

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

### Mobile

```bash
flutter run              # Run on connected device
flutter run -d chrome    # Run on Chrome
flutter build apk        # Build Android APK
flutter test             # Run tests
flutter clean            # Clean build files
```

---

## Next Steps

1. **Implement Frontend Authentication**
   - See: `INTEGRATION_GUIDE.md` → Authentication Flow
   - Create login/register pages
   - Set up API client with token management

2. **Implement System Admin Dashboard**
   - Create admin authentication
   - Build dashboard layout
   - Implement hotel management

3. **Add More Backend Endpoints**
   - Follow tasks in `.kiro/specs/derlg-tourism-platform/tasks.md`
   - Implement hotel search and listing (Tasks 15-18)
   - Implement booking system (Tasks 19-26)

4. **Set Up AI Engine**
   - Initialize FastAPI project
   - Implement recommendation algorithm
   - Integrate ChatGPT-4

---

## Resources

- **Backend Documentation**: `backend/README.md`
- **API Documentation**: `backend/docs/`
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Synchronization Status**: `SYNCHRONIZATION_STATUS.md`
- **Task List**: `.kiro/specs/derlg-tourism-platform/tasks.md`

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review `INTEGRATION_GUIDE.md` for detailed integration steps
3. Check backend logs for error messages
4. Verify all environment variables are set correctly
5. Ensure all services are running

---

**Happy Coding! 🚀**
