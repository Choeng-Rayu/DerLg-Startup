# DerLg Tourism Platform - Developer Quick Reference

**Last Updated:** October 23, 2025

## 🆕 Recent Updates

### October 23, 2025 - Payment Options Service ✅

**New Service**: `backend/src/services/payment-options.service.ts`

Flexible payment calculations for bookings:
- **Deposit**: 50-70% upfront (default 60%)
- **Milestone**: 50%/25%/25% split
- **Full**: 100% upfront with 5% discount + bonuses

**New Endpoint**: `POST /api/bookings/payment-options` (public)

**Quick Start**:
```typescript
import { getAllPaymentOptions } from '../services/payment-options.service';
const options = getAllPaymentOptions(totalAmount, checkInDate);
```

**Docs**: `backend/docs/PAYMENT_OPTIONS.md` | **Test**: `npm run test:payment-options`

---

## 🎯 Start Here

### New to the Project?
1. Read [PLATFORM_SYNC_STATUS.md](./PLATFORM_SYNC_STATUS.md) - 5 min overview
2. Read [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - Setup guide
3. Choose your role below

### Backend Developer
1. ✅ Backend is 60% complete (Tasks 1-23 done)
2. ⚠️ **Next:** Complete Tasks 24-29 (booking management, tours, events, reviews)
3. 📖 See: [backend/README.md](./backend/README.md)
4. 📖 API Contracts: [API_CONTRACTS.md](./API_CONTRACTS.md)

### Frontend Developer
1. ❌ Frontend is 0% complete
2. ⚠️ **Blocked:** Waiting for backend Tasks 24-29
3. 📖 Copy types from: [FRONTEND_TYPES_REFERENCE.ts](./FRONTEND_TYPES_REFERENCE.ts)
4. 📖 API Reference: [API_CONTRACTS.md](./API_CONTRACTS.md)
5. 🚀 **Ready to start:** Tasks 44-45 (setup + auth pages)

### Mobile Developer
1. ❌ Mobile is 0% complete
2. ⚠️ **Blocked:** Waiting for backend Tasks 24-29
3. 📖 Convert types from: [FRONTEND_TYPES_REFERENCE.ts](./FRONTEND_TYPES_REFERENCE.ts)
4. 📖 API Reference: [API_CONTRACTS.md](./API_CONTRACTS.md)
5. 🚀 **Ready to start:** Task 88 (Flutter setup)

### System Admin Developer
1. ❌ Admin dashboard is 0% complete
2. ⚠️ **Blocked:** Waiting for backend Tasks 24-29
3. 📖 Copy types from: [FRONTEND_TYPES_REFERENCE.ts](./FRONTEND_TYPES_REFERENCE.ts)
4. 🚀 **Ready to start:** Task 59 (Next.js fullstack setup)

### AI/ML Developer
1. ❌ AI Engine is 0% complete
2. 🚀 **Ready to start:** Task 30 (FastAPI setup)
3. 📖 See: Tasks 30-35 in [tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md)

---

## 📊 Current Status (23/107 tasks = 21%)

### ✅ Completed (Tasks 1-23)
- Backend infrastructure & database
- All 14 database models
- JWT authentication + OAuth (Google, Facebook)
- Password reset
- Role-based authorization
- Hotel search & listing APIs
- Hotel admin profile management
- Room inventory management
- Booking creation API
- PayPal, Bakong, Stripe payment integration
- Payment options (deposit, milestone, full)

### ⚠️ In Progress / Next (Tasks 24-29)
- Escrow and payment scheduling
- Booking management endpoints (list, details, modify, cancel)
- Promo code system
- Tour listing and booking
- Event management
- Review submission and display

### ❌ Not Started (Tasks 30-107)
- AI Engine (Tasks 30-35)
- Telegram Bot (Tasks 36-38)
- Third-party integrations (Tasks 39-43)
- Frontend Web (Tasks 44-58)
- Hotel Admin Dashboard (Tasks 59-66)
- Super Admin Dashboard (Tasks 67-76)
- Real-time features (Tasks 77-80)
- Security & performance (Tasks 81-84)
- Notifications (Tasks 85-87)
- Mobile App (Tasks 88-91)
- Testing (Tasks 92-97)
- Deployment (Tasks 98-102)
- Documentation (Tasks 103-105)
- Launch (Tasks 106-107)

---

## 🔑 Key Files

### Documentation
- **[PLATFORM_SYNC_STATUS.md](./PLATFORM_SYNC_STATUS.md)** - Overall status
- **[API_CONTRACTS.md](./API_CONTRACTS.md)** - API reference
- **[FRONTEND_TYPES_REFERENCE.ts](./FRONTEND_TYPES_REFERENCE.ts)** - TypeScript types
- **[SYNC_COMPLETION_SUMMARY.md](./SYNC_COMPLETION_SUMMARY.md)** - Analysis summary

### Backend
- `backend/src/models/` - Database models
- `backend/src/routes/` - API routes
- `backend/src/controllers/` - Request handlers
- `backend/src/services/` - Business logic
- `backend/docs/` - API documentation

### Configuration
- `backend/.env.example` - Environment variables template
- `backend/src/config/env.ts` - Configuration management
- `backend/tsconfig.json` - TypeScript config

---

## 🚀 Quick Commands

### Backend
```bash
cd backend

# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env with your database credentials

# Test database connection
npm run db:test

# Sync models to database
npm run db:sync

# Run development server
npm run dev

# Run tests
npm run test:user
npm run test:hotel-room
npm run test:booking
npm run test:auth
```

### Frontend (Not Started)
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### System Admin (Not Started)
```bash
cd system-admin

# Install dependencies
npm install

# Run development server
npm run dev
```

### Mobile App (Not Started)
```bash
cd mobile_app

# Install dependencies
flutter pub get

# Run app
flutter run
```

---

## 🔗 API Endpoints

### ✅ Available Now

**Authentication:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/social/google`
- POST `/api/auth/social/facebook`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- POST `/api/auth/refresh-token`
- POST `/api/auth/logout`
- GET `/api/auth/verify`
- GET `/api/auth/me`

**Hotels:**
- GET `/api/hotels`
- GET `/api/hotels/search`
- GET `/api/hotels/:id`
- GET `/api/hotels/:id/availability`

**Hotel Admin:**
- GET `/api/hotel/profile`
- PUT `/api/hotel/profile`

**Rooms:**
- GET `/api/rooms`
- POST `/api/rooms`
- PUT `/api/rooms/:id`
- DELETE `/api/rooms/:id`

**Bookings:**
- POST `/api/bookings`

**Payments:**
- POST `/api/payments/paypal/create`
- POST `/api/payments/paypal/capture`
- GET `/api/payments/paypal/status/:orderId`
- POST `/api/payments/bakong/create`
- POST `/api/payments/bakong/verify`
- GET `/api/payments/bakong/status/:md5Hash`
- POST `/api/payments/stripe/create`
- POST `/api/payments/stripe/confirm`
- GET `/api/payments/stripe/status/:paymentIntentId`

### ⚠️ Missing (Needed for Frontend)

**Bookings:**
- GET `/api/bookings` - List user's bookings
- GET `/api/bookings/:id` - Get booking details
- PUT `/api/bookings/:id` - Modify booking
- DELETE `/api/bookings/:id/cancel` - Cancel booking
- POST `/api/bookings/:id/promo-code` - Apply promo code

**Tours:**
- GET `/api/tours`
- GET `/api/tours/:id`
- POST `/api/bookings/tours`

**Events:**
- GET `/api/events`
- GET `/api/events/:id`
- GET `/api/events/date/:date`

**Reviews:**
- POST `/api/reviews`
- GET `/api/reviews/hotel/:hotelId`
- GET `/api/reviews/tour/:tourId`

**Wishlist:**
- GET `/api/wishlist`
- POST `/api/wishlist`
- DELETE `/api/wishlist/:id`

**Messages:**
- GET `/api/messages/booking/:bookingId`
- POST `/api/messages`
- PUT `/api/messages/:id/read`

---

## 🎨 Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- Sequelize ORM
- MySQL database
- JWT authentication
- bcrypt password hashing

### Frontend (Planned)
- Next.js 15+ (App Router)
- React 19+
- TypeScript
- Tailwind CSS v4

### System Admin (Planned)
- Next.js 15+ (Fullstack)
- React 19+
- TypeScript
- Tailwind CSS v4
- Chart.js/Recharts

### Mobile (Planned)
- Flutter 3.5.3+
- Dart

### AI Engine (Planned)
- Python 3.10+
- FastAPI
- OpenAI GPT-4
- scikit-learn
- sentence-transformers

---

## 🐛 Common Issues

### Backend

**Database connection failed:**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in .env
cat backend/.env

# Test connection
npm run db:test
```

**TypeScript errors:**
```bash
# Rebuild
npm run build

# Check for errors
npx tsc --noEmit
```

**Port already in use:**
```bash
# Change PORT in .env
PORT=5001

# Or kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Frontend (When Started)

**API calls failing:**
- Check backend is running on http://localhost:5000
- Check CORS settings in backend
- Verify JWT token is being sent
- Check API endpoint exists (see API_CONTRACTS.md)

**Type errors:**
- Ensure types are copied from FRONTEND_TYPES_REFERENCE.ts
- Check API response matches expected type
- Verify enum values match backend

---

## 📞 Need Help?

1. Check [PLATFORM_SYNC_STATUS.md](./PLATFORM_SYNC_STATUS.md) for current status
2. Check [API_CONTRACTS.md](./API_CONTRACTS.md) for API reference
3. Check component README files:
   - [backend/README.md](./backend/README.md)
   - [frontend/README.md](./frontend/README.md)
   - [system-admin/README.md](./system-admin/README.md)
   - [mobile_app/README.md](./mobile_app/README.md)
4. Check task list: [.kiro/specs/derlg-tourism-platform/tasks.md](./.kiro/specs/derlg-tourism-platform/tasks.md)

---

## 🎯 Next Steps by Role

### Backend Developer
**Immediate (This Week):**
1. Implement Task 24: Escrow and payment scheduling
2. Implement Task 25: Booking management endpoints
3. Implement Task 26: Promo code system
4. Implement Task 27: Tour endpoints
5. Implement Task 28: Event endpoints
6. Implement Task 29: Review endpoints

**After (Next Week):**
7. Create OpenAPI/Swagger documentation
8. Create Postman collection
9. Write integration tests

### Frontend Developer
**Immediate (This Week):**
1. Wait for backend Tasks 24-29 OR
2. Start Task 44: Set up Next.js project
3. Copy types from FRONTEND_TYPES_REFERENCE.ts
4. Create API client with axios
5. Set up authentication context

**After (Next 2 Weeks):**
6. Implement Task 45: Authentication pages
7. Implement Task 46: Homepage with search
8. Implement Task 47: Hotel search and listing
9. Implement Task 48: Hotel detail page
10. Implement Task 49: Booking flow

### Mobile Developer
**Immediate (This Week):**
1. Wait for backend Tasks 24-29 OR
2. Start Task 88: Set up Flutter project
3. Convert types from FRONTEND_TYPES_REFERENCE.ts to Dart
4. Create API service layer
5. Set up secure token storage

**After (Next 2 Weeks):**
6. Implement Task 89: Mobile authentication
7. Implement Task 90: Hotel search and booking
8. Implement Task 91: Mobile-specific features

### System Admin Developer
**Immediate (This Week):**
1. Wait for backend Tasks 24-29 OR
2. Start Task 59: Set up Next.js fullstack project
3. Copy types from FRONTEND_TYPES_REFERENCE.ts
4. Create admin layout
5. Set up API routes

**After (Next 2 Weeks):**
6. Implement Task 60: Dashboard overview
7. Implement Task 61: Hotel profile management
8. Implement Task 62: Room inventory management
9. Implement Task 63: Booking management

### AI/ML Developer
**Immediate (This Week):**
1. Start Task 30: Set up FastAPI project
2. Install dependencies (openai, scikit-learn, etc.)
3. Create project structure

**After (Next 2 Weeks):**
4. Implement Task 31: Recommendation algorithm
5. Implement Task 32: ChatGPT integration
6. Implement Task 33: Sentiment analysis
7. Implement Task 34: Itinerary generation
8. Implement Task 35: AI API endpoints

---

**Remember:** Always check [PLATFORM_SYNC_STATUS.md](./PLATFORM_SYNC_STATUS.md) for the latest status before starting work!
