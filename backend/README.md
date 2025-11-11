# DerLg Tourism Platform - Backend API

Backend API for the DerLg Tourism Platform built with Node.js, Express, TypeScript, and Sequelize.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, env)
│   ├── controllers/     # Request handlers
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Server entry point
├── dist/                # Compiled JavaScript (generated)
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Run in development mode:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### Database Scripts
- `npm run db:test` - Test database connection
- `npm run db:sync` - Sync models with database

### Model Testing Scripts
- `npm run test:user` - Test User model
- `npm run test:hotel-room` - Test Hotel and Room models
- `npm run test:booking` - Test Booking and PaymentTransaction models
- `npm run test:tour-event-review` - Test Tour, Event, and Review models
- `npm run test:guide-transportation` - Test Guide and Transportation models
- `npm run test:supporting` - Test supporting models (PromoCode, Message, Wishlist, AIConversation)

### Authentication Testing Scripts
- `npm run test:auth` - Test JWT authentication service
- `npm run test:registration` - Test user registration and login
- `npm run test:google-oauth` - Test Google OAuth integration (basic)
- `npm run test:google-oauth-integration` - Test Google OAuth with real credentials
- `npm run test:facebook-oauth` - Test Facebook OAuth integration (basic)
- `npm run test:facebook-oauth-integration` - Test Facebook OAuth with real credentials
- `npm run test:password-reset` - Test password reset flow
- `npm run test:password-reset-complete` - Test complete password reset
- `npm run test:authorization` - Test role-based authorization

### Hotel Testing Scripts
- `npm run test:hotel-search` - Test hotel search and listing endpoints
- `npm run test:hotel-availability` - Test hotel availability checking
- `npm run test:hotel-detail` - Test hotel detail endpoint
- `npm run test:hotel-admin-profile` - Test hotel admin profile management
- `npm run test:room-inventory` - Test room inventory management
- `npm run seed:hotels` - Seed test hotel data

### Payment Testing Scripts
- `npm run test:paypal` - Test PayPal integration (basic)
- `npm run test:paypal:payment` - Test PayPal payment flow
- `npm run test:bakong` - Test Bakong (KHQR) payment integration

### Verification Scripts
- `npm run verify:user` - Verify users table structure

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/social/google` - Google OAuth 2.0 authentication
- `POST /api/auth/social/facebook` - Facebook Login authentication
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout (requires authentication)
- `GET /api/auth/verify` - Verify access token (requires authentication)
- `GET /api/auth/me` - Get current user (requires authentication)

### Hotels (Public)
- `GET /api/hotels` - List all hotels with pagination
- `GET /api/hotels/search` - Search hotels with advanced filters
- `GET /api/hotels/:id/availability` - Check room availability for date range
- `GET /api/hotels/:id` - Get hotel details by ID

### Hotel Admin (Protected)
- `GET /api/hotel/profile` - Get hotel profile for authenticated admin
- `PUT /api/hotel/profile` - Update hotel profile

### Room Inventory Management (Protected - Hotel Admins Only)
- `GET /api/rooms` - Get all rooms for hotel admin
- `POST /api/rooms` - Create a new room type
- `PUT /api/rooms/:id` - Update room details
- `DELETE /api/rooms/:id` - Delete a room type

### Payment Routes

#### PayPal Payment Routes
- `POST /api/payments/paypal/create` - Create PayPal payment intent
- `POST /api/payments/paypal/capture` - Capture PayPal payment
- `GET /api/payments/paypal/status/:orderId` - Get PayPal payment status
- `POST /api/payments/paypal/webhook` - PayPal webhook handler (no auth)
- `GET /api/payments/paypal/success` - PayPal success redirect
- `GET /api/payments/paypal/cancel` - PayPal cancel redirect

#### Bakong (KHQR) Payment Routes
- `POST /api/payments/bakong/create` - Create Bakong payment (generate QR code)
- `POST /api/payments/bakong/verify` - Verify Bakong payment
- `GET /api/payments/bakong/status/:md5Hash` - Get Bakong payment status
- `POST /api/payments/bakong/webhook` - Bakong webhook handler (no auth)

Additional endpoints will be added in subsequent tasks.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Sequelize
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## Environment Variables

See `.env.example` for all required environment variables.

## Database

The application uses MySQL with Sequelize ORM. 

### Database Setup

1. **Install MySQL** (if not already installed)

2. **Create Database**:
```sql
CREATE DATABASE derlg_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'derlg_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON derlg_tourism.* TO 'derlg_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configure Environment Variables**:
Update your `.env` file with database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=derlg_tourism
DB_USER=derlg_user
DB_PASSWORD=your_secure_password
```

4. **Test Database Connection**:
```bash
npx ts-node src/scripts/testDbConnection.ts
```

### Database Features

- **Connection Pooling**: Optimized for development (5 connections) and production (20 connections)
- **Automatic Retry**: Retries on transient connection errors (max 3 attempts)
- **Error Handling**: Comprehensive error logging and handling
- **Graceful Shutdown**: Properly closes connections on application shutdown
- **Pool Monitoring**: Real-time connection pool status tracking

For detailed database documentation, see [docs/DATABASE.md](docs/DATABASE.md).
