# Design Document

## Overview

The DerLg Tourism Platform is a comprehensive multi-system architecture designed to facilitate tourism booking in Cambodia. The platform consists of four primary systems that work together to provide a seamless experience for tourists, hotel administrators, platform administrators, and service providers.

### System Architecture

The platform follows a microservices-inspired architecture with the following components:

1. **Customer System** - Next.js frontend + Node.js/Express backend
2. **Hotel Admin Dashboard** - Fullstack Next.js application
3. **Super Admin Dashboard** - Fullstack Next.js application
4. **AI Recommendation Engine** - Python FastAPI microservice
5. **Shared Infrastructure** - MongoDB Atlas, Cloudinary, Payment Gateways, Telegram Bot

### Technology Stack

**Frontend:**
- React with Next.js 14+ (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- Chart.js/Recharts for analytics visualization
- Socket.io-client for real-time features

**Backend:**
- Node.js with Express framework
- TypeScript for type safety
- Sequelize ORM with MySQL database
- JWT for authentication
- bcrypt for password hashing

**AI Engine:**
- Python 3.10+
- FastAPI framework
- OpenAI GPT-4 for conversational AI
- scikit-learn for recommendation algorithms
- sentence-transformers for semantic analysis

**Mobile:**
- Flutter for cross-platform development
- Dart programming language

**Infrastructure:**
- MySQL database hosted on Digital Ocean
- Cloudinary for media storage
- Digital Ocean droplets for hosting
- Domain: derlg.com (NameCheap)
- SSL/TLS certificates for HTTPS
- Google Analytics (G-CS4CQ72GZ6)

**Third-Party Integrations:**
- Google OAuth 2.0
- Facebook Login API
- PayPal payment gateway
- Bakong (KHQR) payment system (choeng_rayu@aclb, +855969983479)
- Stripe for card payments
- Twilio for SMS notifications
- SendGrid/Mailgun for email
- Google Maps API
- Google Calendar API
- Telegram Bot API (7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM)

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Web Browser │ Mobile App   │ Telegram Bot │ Service Provider   │
│  (Tourist)   │ (Flutter)    │ (Tourist)    │ Telegram Bot       │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Customer    │ Hotel Admin  │ Super Admin  │ Telegram Bot       │
│  System      │ Dashboard    │ Dashboard    │ Service            │
│  (Next.js +  │ (Next.js     │ (Next.js     │ (Node.js)          │
│   Node.js)   │  Fullstack)  │  Fullstack)  │                    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  AI Engine   │ Auth Service │ Payment      │ Notification       │
│  (FastAPI)   │ (JWT)        │ Service      │ Service            │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  MySQL DB    │ Cloudinary   │ Redis Cache  │ External APIs      │
│  (Primary)   │ (Media)      │ (Sessions)   │ (Maps, Calendar)   │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

### System Communication Flow

**Tourist Booking Flow:**
```
Tourist → Customer Frontend → Node.js API → MySQL Database
                           ↓
                    AI Engine (recommendations)
                           ↓
                    Payment Gateway (PayPal/Bakong/Stripe)
                           ↓
                    Notification Service (Email/SMS)
                           ↓
                    Google Calendar API
```

**Service Provider Status Update Flow:**
```
Guide/Driver → Telegram Bot → Webhook → Node.js API → MySQL Database
                                                    ↓
                                            Admin Dashboard (real-time update)
                                                    ↓
                                            Booking Availability Update
```

**AI Recommendation Flow:**
```
User Input → Customer Frontend → AI Engine
                                    ↓
                            Analyze: Budget, Preferences, History
                                    ↓
                            Query: Available Tours/Hotels
                                    ↓
                            Generate: Personalized Recommendations
                                    ↓
                            Return: Ranked Results with Booking Links
```

## Components and Interfaces

### 1. Customer System

#### Frontend Components (Next.js)

**Pages:**
- `/` - Homepage with search and AI recommendations
- `/hotels` - Hotel listing with filters
- `/hotels/[id]` - Hotel detail page
- `/tours` - Tour listing
- `/tours/[id]` - Tour detail page
- `/events` - Cultural events and festivals
- `/bookings` - User booking management
- `/profile` - User profile and preferences
- `/login` - Authentication page
- `/register` - Registration page
- `/chat-ai` - AI chat assistant interface
- `/wishlist` - Saved hotels and tours
- `/payment` - Payment processing page

**Core Components:**

```typescript
// SearchBar Component
interface SearchBarProps {
  destination: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  onSearch: (params: SearchParams) => void;
}

// HotelCard Component
interface HotelCardProps {
  hotel: Hotel;
  onFavorite: (hotelId: string) => void;
  onBook: (hotelId: string) => void;
}

// BookingForm Component
interface BookingFormProps {
  hotel: Hotel;
  room: Room;
  onSubmit: (booking: BookingData) => void;
  paymentOptions: PaymentOption[];
}

// ChatAssistant Component
interface ChatAssistantProps {
  userId: string;
  onRecommendation: (recommendation: Recommendation) => void;
  aiType: 'streaming' | 'quick' | 'event-based';
}

// PaymentSelector Component
interface PaymentSelectorProps {
  totalAmount: number;
  options: {
    deposit: { percentage: number; amount: number };
    milestone: { schedule: PaymentSchedule[] };
    full: { discount: number; bonus: string[] };
  };
  onSelect: (option: PaymentOption) => void;
}
```

#### Backend API (Node.js/Express)

**Controller Structure:**

```typescript
// AuthController
class AuthController {
  register(req, res): Promise<Response>
  login(req, res): Promise<Response>
  socialAuth(req, res): Promise<Response>
  forgotPassword(req, res): Promise<Response>
  resetPassword(req, res): Promise<Response>
  refreshToken(req, res): Promise<Response>
  logout(req, res): Promise<Response>
}

// BookingController
class BookingController {
  createBooking(req, res): Promise<Response>
  getBookings(req, res): Promise<Response>
  getBookingById(req, res): Promise<Response>
  updateBooking(req, res): Promise<Response>
  cancelBooking(req, res): Promise<Response>
  processPayment(req, res): Promise<Response>
  applyPromoCode(req, res): Promise<Response>
}

// HotelController
class HotelController {
  getHotels(req, res): Promise<Response>
  getHotelById(req, res): Promise<Response>
  searchHotels(req, res): Promise<Response>
  getAvailability(req, res): Promise<Response>
}

// EventController
class EventController {
  getEvents(req, res): Promise<Response>
  getEventById(req, res): Promise<Response>
  getEventsByDate(req, res): Promise<Response>
}

// ReviewController
class ReviewController {
  createReview(req, res): Promise<Response>
  getReviews(req, res): Promise<Response>
  updateReview(req, res): Promise<Response>
}

// AIController
class AIController {
  getRecommendations(req, res): Promise<Response>
  chatWithAI(req, res): Promise<Response>
  generateItinerary(req, res): Promise<Response>
}
```

**API Routes:**

```typescript
// Authentication Routes
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/social/google
POST   /api/auth/social/facebook
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/refresh-token
POST   /api/auth/logout

// Hotel Routes
GET    /api/hotels
GET    /api/hotels/:id
GET    /api/hotels/search
GET    /api/hotels/:id/availability
GET    /api/hotels/:id/rooms

// Booking Routes
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
DELETE /api/bookings/:id/cancel
POST   /api/bookings/:id/payment
POST   /api/bookings/:id/promo-code

// Event Routes
GET    /api/events
GET    /api/events/:id
GET    /api/events/date/:date

// Review Routes
POST   /api/reviews
GET    /api/reviews/hotel/:hotelId
PUT    /api/reviews/:id

// AI Routes
POST   /api/ai/recommend
POST   /api/ai/chat
POST   /api/ai/itinerary
```

### 2. Hotel Admin Dashboard

#### Pages (Next.js Fullstack)

- `/dashboard` - Overview with KPIs
- `/bookings` - Booking management
- `/rooms` - Room inventory management
- `/profile` - Hotel profile management
- `/messages` - Customer communication
- `/reports` - Analytics and reports
- `/settings` - Configuration

#### API Routes (Next.js API Routes)

```typescript
// Hotel Management
GET    /api/hotel/profile
PUT    /api/hotel/profile
POST   /api/hotel/images

// Room Management
GET    /api/rooms
POST   /api/rooms
PUT    /api/rooms/:id
DELETE /api/rooms/:id

// Booking Management
GET    /api/bookings
PUT    /api/bookings/:id/approve
PUT    /api/bookings/:id/reject
PUT    /api/bookings/:id/complete

// Messaging
GET    /api/messages
POST   /api/messages
PUT    /api/messages/:id/read

// Reports
GET    /api/reports/revenue
GET    /api/reports/occupancy
GET    /api/reports/ratings
```

### 3. Super Admin Dashboard

#### Pages (Next.js Fullstack)

- `/dashboard` - Platform overview
- `/hotels` - Hotel management
- `/users` - User management
- `/bookings` - All bookings oversight
- `/guides` - Guide management
- `/transportation` - Driver/vehicle management
- `/events` - Event CRUD operations
- `/promo-codes` - Discount management
- `/analytics` - Platform analytics
- `/ai-monitoring` - AI performance tracking
- `/settings` - System configuration

#### API Routes (Next.js API Routes)

```typescript
// Hotel Management
GET    /api/admin/hotels
POST   /api/admin/hotels/:id/approve
POST   /api/admin/hotels/:id/reject
PUT    /api/admin/hotels/:id/status

// User Management
GET    /api/admin/users
PUT    /api/admin/users/:id/deactivate
POST   /api/admin/users/:id/reset-password

// Guide Management
GET    /api/admin/guides
POST   /api/admin/guides
PUT    /api/admin/guides/:id
DELETE /api/admin/guides/:id

// Transportation Management
GET    /api/admin/transportation
POST   /api/admin/transportation
PUT    /api/admin/transportation/:id
DELETE /api/admin/transportation/:id

// Event Management
GET    /api/admin/events
POST   /api/admin/events
PUT    /api/admin/events/:id
DELETE /api/admin/events/:id

// Promo Code Management
GET    /api/admin/promo-codes
POST   /api/admin/promo-codes
PUT    /api/admin/promo-codes/:id
DELETE /api/admin/promo-codes/:id

// Analytics
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/revenue
GET    /api/admin/analytics/bookings
GET    /api/admin/analytics/ai-performance

// Reports Export
GET    /api/admin/reports/export/pdf
GET    /api/admin/reports/export/excel
```

### 4. AI Recommendation Engine

#### FastAPI Endpoints

```python
# Recommendation Engine
@app.post("/api/recommend")
async def get_recommendations(request: RecommendationRequest) -> RecommendationResponse

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest) -> ChatResponse

@app.post("/api/itinerary")
async def generate_itinerary(request: ItineraryRequest) -> ItineraryResponse

@app.post("/api/analyze-review")
async def analyze_sentiment(request: ReviewAnalysisRequest) -> SentimentResponse

@app.get("/api/health")
async def health_check() -> HealthResponse
```

#### AI Service Architecture

```python
# Service Structure
/ai_service
  /models
    recommendation_model.py    # Collaborative filtering
    sentiment_model.py         # Review sentiment analysis
    chat_model.py             # ChatGPT integration
  /routes
    recommend.py
    chat.py
    analyze.py
  /utils
    data_processor.py
    feature_extractor.py
  /config
    settings.py
  main.py
```

**AI Models:**

1. **Recommendation Model**: Hybrid approach combining:
   - Collaborative filtering (user-user similarity)
   - Content-based filtering (hotel features)
   - Budget constraints optimization
   - Real-time event integration

2. **Chat Model**: ChatGPT-4 integration with:
   - Context management
   - Conversation history
   - Multi-language support
   - Streaming responses

3. **Sentiment Analysis**: Using sentence-transformers for:
   - Review classification (positive/neutral/negative)
   - Topic extraction
   - Satisfaction scoring

### 5. Telegram Bot Service

#### Bot Commands and Handlers

```typescript
// Tourist Bot Commands
/start - Initialize bot and authenticate
/recommend - Get AI recommendations
/book - Start booking process
/mybookings - View bookings
/help - Get help

// Service Provider Bot Commands
/start - Authenticate with Telegram ID
/status - Check current status
/available - Mark as available
/busy - Mark as unavailable
/today - View today's assignments
```

#### Webhook Handlers

```typescript
// Status Update Handler
POST /webhook/telegram/status
{
  telegram_user_id: string,
  telegram_username: string,
  status: 'available' | 'unavailable',
  timestamp: Date
}

// Booking Notification Handler
POST /webhook/telegram/booking
{
  provider_id: string,
  booking_id: string,
  details: BookingDetails
}
```

## Data Models

### Database Schema (MySQL with Sequelize)

#### Users Table

```typescript
interface User {
  id: string;                    // UUID primary key
  user_type: 'super_admin' | 'admin' | 'tourist';
  email: string;                 // Unique, indexed
  phone: string;                 // Unique, nullable
  password_hash: string;         // bcrypt hashed
  google_id: string;            // Nullable
  facebook_id: string;          // Nullable
  first_name: string;
  last_name: string;
  profile_image: string;        // Cloudinary URL
  language: 'en' | 'km' | 'zh';
  currency: 'USD' | 'KHR';
  is_student: boolean;
  student_email: string;        // School email, nullable
  student_discount_remaining: number; // Default 3
  jwt_refresh_token: string;    // Nullable
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login: Date;
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_student_email ON users(student_email);
```

#### Hotels Table

```typescript
interface Hotel {
  id: string;                    // UUID primary key
  admin_id: string;             // Foreign key to users
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    latitude: number;
    longitude: number;
    google_maps_url: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  amenities: string[];          // Array of amenity codes
  images: string[];             // Cloudinary URLs
  logo: string;                 // Cloudinary URL
  star_rating: number;          // 1-5
  average_rating: number;       // Calculated from reviews
  total_reviews: number;
  status: 'pending_approval' | 'active' | 'inactive' | 'rejected';
  approval_date: Date;
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_hotels_status ON hotels(status);
CREATE INDEX idx_hotels_admin_id ON hotels(admin_id);
CREATE INDEX idx_hotels_city ON hotels(location->>'city');
```

#### Rooms Table

```typescript
interface Room {
  id: string;                    // UUID primary key
  hotel_id: string;             // Foreign key to hotels
  room_type: string;            // e.g., "Deluxe Suite"
  description: string;
  capacity: number;             // Max guests
  bed_type: string;             // e.g., "King", "Twin"
  size_sqm: number;
  price_per_night: number;
  discount_percentage: number;  // 0-100
  amenities: string[];
  images: string[];             // Cloudinary URLs
  total_rooms: number;          // Total inventory
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_price ON rooms(price_per_night);
```

#### Bookings Table

```typescript
interface Booking {
  id: string;                    // UUID primary key
  booking_number: string;       // Unique, human-readable
  user_id: string;              // Foreign key to users
  hotel_id: string;             // Foreign key to hotels
  room_id: string;              // Foreign key to rooms
  check_in: Date;
  check_out: Date;
  nights: number;               // Calculated
  guests: {
    adults: number;
    children: number;
  };
  guest_details: {
    name: string;
    email: string;
    phone: string;
    special_requests: string;
  };
  pricing: {
    room_rate: number;
    subtotal: number;
    discount: number;
    promo_code: string;
    student_discount: number;
    tax: number;
    total: number;
  };
  payment: {
    method: 'paypal' | 'bakong' | 'stripe';
    type: 'deposit' | 'milestone' | 'full';
    status: 'pending' | 'partial' | 'completed' | 'refunded';
    transactions: PaymentTransaction[];
    escrow_status: 'held' | 'released';
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  cancellation: {
    cancelled_at: Date;
    reason: string;
    refund_amount: number;
    refund_status: string;
  };
  calendar_event_id: string;    // Google Calendar
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
```

#### Tours Table

```typescript
interface Tour {
  id: string;                    // UUID primary key
  name: string;
  description: string;
  destination: string;
  duration: {
    days: number;
    nights: number;
  };
  difficulty: 'easy' | 'moderate' | 'challenging';
  category: string[];           // e.g., ["cultural", "adventure"]
  price_per_person: number;
  group_size: {
    min: number;
    max: number;
  };
  inclusions: string[];
  exclusions: string[];
  itinerary: DayItinerary[];
  images: string[];             // Cloudinary URLs
  meeting_point: {
    address: string;
    latitude: number;
    longitude: number;
  };
  guide_required: boolean;
  transportation_required: boolean;
  is_active: boolean;
  average_rating: number;
  total_bookings: number;
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_tours_destination ON tours(destination);
CREATE INDEX idx_tours_price ON tours(price_per_person);
CREATE INDEX idx_tours_category ON tours USING GIN(category);
```

#### Events Table

```typescript
interface Event {
  id: string;                    // UUID primary key
  name: string;
  description: string;
  event_type: 'festival' | 'cultural' | 'seasonal';
  start_date: Date;
  end_date: Date;
  location: {
    city: string;
    province: string;
    venue: string;
    latitude: number;
    longitude: number;
  };
  pricing: {
    base_price: number;
    vip_price: number;
  };
  capacity: number;
  bookings_count: number;
  images: string[];             // Cloudinary URLs
  cultural_significance: string;
  what_to_expect: string;
  related_tours: string[];      // Tour IDs
  is_active: boolean;
  created_by: string;           // Super admin ID
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_location ON events(location->>'city');
CREATE INDEX idx_events_type ON events(event_type);
```

#### Reviews Table

```typescript
interface Review {
  id: string;                    // UUID primary key
  user_id: string;              // Foreign key to users
  booking_id: string;           // Foreign key to bookings
  hotel_id: string;             // Foreign key to hotels
  tour_id: string;              // Foreign key to tours (nullable)
  ratings: {
    overall: number;            // 1-5
    cleanliness: number;
    service: number;
    location: number;
    value: number;
  };
  comment: string;
  sentiment: {
    score: number;              // 0-1 from AI
    classification: 'positive' | 'neutral' | 'negative';
    topics: { topic: string; sentiment: number }[];
  };
  images: string[];             // Cloudinary URLs
  helpful_count: number;
  is_verified: boolean;         // Confirmed booking
  admin_response: string;
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_reviews_hotel_id ON reviews(hotel_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(ratings->>'overall');
```

#### Guides Table

```typescript
interface Guide {
  id: string;                    // UUID primary key
  name: string;
  phone: string;
  email: string;
  telegram_user_id: string;     // Unique
  telegram_username: string;
  specializations: string[];    // e.g., ["temples", "history"]
  languages: string[];          // e.g., ["en", "km", "zh"]
  bio: string;
  profile_image: string;        // Cloudinary URL
  certifications: string[];
  status: 'available' | 'unavailable' | 'on_tour';
  average_rating: number;
  total_tours: number;
  created_by: string;           // Super admin ID
  created_at: Date;
  updated_at: Date;
  last_status_update: Date;
}

// Indexes
CREATE INDEX idx_guides_telegram_id ON guides(telegram_user_id);
CREATE INDEX idx_guides_status ON guides(status);
CREATE INDEX idx_guides_languages ON guides USING GIN(languages);
```

#### Transportation Table

```typescript
interface Transportation {
  id: string;                    // UUID primary key
  driver_name: string;
  phone: string;
  telegram_user_id: string;     // Unique
  telegram_username: string;
  vehicle_type: 'tuk_tuk' | 'car' | 'van' | 'bus';
  vehicle_model: string;
  license_plate: string;
  capacity: number;             // Seats
  amenities: string[];          // e.g., ["AC", "WiFi"]
  status: 'available' | 'unavailable' | 'on_trip';
  average_rating: number;
  total_trips: number;
  created_by: string;           // Super admin ID
  created_at: Date;
  updated_at: Date;
  last_status_update: Date;
}

// Indexes
CREATE INDEX idx_transportation_telegram_id ON transportation(telegram_user_id);
CREATE INDEX idx_transportation_status ON transportation(status);
CREATE INDEX idx_transportation_type ON transportation(vehicle_type);
```

#### PromoCodes Table

```typescript
interface PromoCode {
  id: string;                    // UUID primary key
  code: string;                 // Unique, uppercase
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_amount: number;
  max_discount: number;
  valid_from: Date;
  valid_until: Date;
  usage_limit: number;
  usage_count: number;
  applicable_to: 'all' | 'hotels' | 'tours' | 'events';
  applicable_ids: string[];     // Specific hotel/tour IDs
  user_type: 'all' | 'new' | 'returning';
  is_active: boolean;
  created_by: string;           // Super admin ID
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_valid ON promo_codes(valid_from, valid_until);
```

#### Messages Table

```typescript
interface Message {
  id: string;                    // UUID primary key
  booking_id: string;           // Foreign key to bookings
  sender_id: string;            // User or admin ID
  sender_type: 'tourist' | 'hotel_admin';
  recipient_id: string;
  message: string;
  attachments: string[];        // Cloudinary URLs
  is_read: boolean;
  read_at: Date;
  created_at: Date;
}

// Indexes
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, is_read);
```

#### AIConversations Table

```typescript
interface AIConversation {
  id: string;                    // UUID primary key
  user_id: string;              // Foreign key to users
  session_id: string;           // Unique session identifier
  ai_type: 'streaming' | 'quick' | 'event-based';
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  context: {
    budget: number;
    destination: string;
    dates: { start: Date; end: Date };
    preferences: string[];
  };
  recommendations: {
    hotel_ids: string[];
    tour_ids: string[];
    event_ids: string[];
  };
  conversion: {
    booked: boolean;
    booking_id: string;
  };
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id);
```

#### PaymentTransactions Table

```typescript
interface PaymentTransaction {
  id: string;                    // UUID primary key
  booking_id: string;           // Foreign key to bookings
  transaction_id: string;       // Gateway transaction ID
  gateway: 'paypal' | 'bakong' | 'stripe';
  amount: number;
  currency: 'USD' | 'KHR';
  payment_type: 'deposit' | 'milestone_1' | 'milestone_2' | 'milestone_3' | 'full';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gateway_response: any;        // JSON
  escrow_status: 'held' | 'released' | 'refunded';
  escrow_release_date: Date;
  refund_amount: number;
  refund_reason: string;
  created_at: Date;
  updated_at: Date;
}

// Indexes
CREATE INDEX idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_gateway ON payment_transactions(gateway);
```

#### Wishlists Table

```typescript
interface Wishlist {
  id: string;                    // UUID primary key
  user_id: string;              // Foreign key to users
  item_type: 'hotel' | 'tour' | 'event';
  item_id: string;              // Foreign key to respective table
  notes: string;
  created_at: Date;
}

// Indexes
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE UNIQUE INDEX idx_wishlists_unique ON wishlists(user_id, item_type, item_id);
```

## Error Handling

### Error Response Format

All API endpoints will return errors in a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;              // Machine-readable error code
    message: string;           // Human-readable message
    details?: any;             // Additional error details
    timestamp: Date;
  };
}
```

### Error Codes

```typescript
enum ErrorCode {
  // Authentication Errors (1xxx)
  INVALID_CREDENTIALS = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  UNAUTHORIZED = 'AUTH_1003',
  FORBIDDEN = 'AUTH_1004',
  EMAIL_NOT_VERIFIED = 'AUTH_1005',
  
  // Validation Errors (2xxx)
  INVALID_INPUT = 'VAL_2001',
  MISSING_REQUIRED_FIELD = 'VAL_2002',
  INVALID_DATE_RANGE = 'VAL_2003',
  INVALID_PROMO_CODE = 'VAL_2004',
  
  // Resource Errors (3xxx)
  RESOURCE_NOT_FOUND = 'RES_3001',
  RESOURCE_ALREADY_EXISTS = 'RES_3002',
  RESOURCE_UNAVAILABLE = 'RES_3003',
  
  // Booking Errors (4xxx)
  ROOM_NOT_AVAILABLE = 'BOOK_4001',
  BOOKING_CANCELLED = 'BOOK_4002',
  BOOKING_EXPIRED = 'BOOK_4003',
  INVALID_BOOKING_STATUS = 'BOOK_4004',
  
  // Payment Errors (5xxx)
  PAYMENT_FAILED = 'PAY_5001',
  PAYMENT_GATEWAY_ERROR = 'PAY_5002',
  INSUFFICIENT_FUNDS = 'PAY_5003',
  REFUND_FAILED = 'PAY_5004',
  
  // System Errors (9xxx)
  INTERNAL_SERVER_ERROR = 'SYS_9001',
  SERVICE_UNAVAILABLE = 'SYS_9002',
  DATABASE_ERROR = 'SYS_9003',
  EXTERNAL_API_ERROR = 'SYS_9004',
}
```

### Error Handling Strategy

1. **Client-Side Validation**: Validate inputs before API calls
2. **API Validation**: Use middleware for request validation (express-validator)
3. **Try-Catch Blocks**: Wrap all async operations
4. **Logging**: Log all errors with context (Winston)
5. **User-Friendly Messages**: Translate error codes to user messages
6. **Retry Logic**: Implement exponential backoff for transient failures
7. **Circuit Breaker**: Prevent cascading failures for external services

## Authentication and Authorization

### JWT Token Strategy

**Access Token:**
- Expiration: 24 hours
- Payload: { userId, userType, email }
- Storage: HTTP-only cookie (web), secure storage (mobile)

**Refresh Token:**
- Expiration: 30 days
- Storage: Database + HTTP-only cookie
- Used to generate new access tokens

### Authentication Flow

```
1. User Login
   ↓
2. Validate Credentials
   ↓
3. Generate Access Token (24h) + Refresh Token (30d)
   ↓
4. Store Refresh Token in DB
   ↓
5. Return Tokens to Client
   ↓
6. Client Stores in HTTP-only Cookies
   ↓
7. Include Access Token in API Requests
   ↓
8. When Access Token Expires:
   - Use Refresh Token to Get New Access Token
   - Rotate Refresh Token
```

### Social Authentication Flow

**Google OAuth:**
```
1. User Clicks "Login with Google"
   ↓
2. Redirect to Google OAuth Consent
   ↓
3. User Approves
   ↓
4. Google Redirects with Authorization Code
   ↓
5. Exchange Code for Google Access Token
   ↓
6. Fetch User Profile from Google
   ↓
7. Create/Update User in Database
   ↓
8. Generate JWT Tokens
   ↓
9. Return to Client
```

**Facebook Login:** Similar flow using Facebook Login API

### Authorization Middleware

```typescript
// Role-based access control
const authorize = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // From JWT verification
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!allowedRoles.includes(user.user_type)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};

// Usage
router.get('/admin/users', 
  authenticate, 
  authorize(['super_admin']), 
  AdminController.getUsers
);
```

## Payment Processing

### Payment Flow Architecture

```
User Selects Payment Option
   ↓
┌──────────────────────────────────────┐
│  Payment Options:                    │
│  1. Deposit (50-70%)                 │
│  2. Milestone (50%/25%/25%)          │
│  3. Full Payment (5% discount)       │
└──────────────────────────────────────┘
   ↓
Select Payment Gateway
   ↓
┌──────────────────────────────────────┐
│  Gateways:                           │
│  - PayPal                            │
│  - Bakong (KHQR)                     │
│  - Stripe (Cards)                    │
└──────────────────────────────────────┘
   ↓
Process Payment
   ↓
Escrow Hold (until service delivery)
   ↓
Send Confirmation
   ↓
Update Booking Status
   ↓
Schedule Milestone Payments (if applicable)
```

### Payment Gateway Integration

**PayPal:**
```typescript
import paypal from '@paypal/checkout-server-sdk';

const createPayPalOrder = async (amount: number, currency: string) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toString()
      }
    }]
  });
  
  const order = await paypalClient.execute(request);
  return order.result.id;
};
```

**Bakong (KHQR):**
```typescript
const generateBakongQR = async (amount: number, bookingId: string) => {
  const qrData = {
    merchant_id: 'choeng_rayu@aclb',
    phone: '+855969983479',
    amount: amount,
    currency: 'KHR',
    reference: bookingId
  };
  
  // Generate KHQR code
  const qrCode = await bakongAPI.generateQR(qrData);
  return qrCode;
};
```

**Stripe:**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createStripePaymentIntent = async (amount: number, currency: string) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: currency.toLowerCase(),
    payment_method_types: ['card']
  });
  
  return paymentIntent.client_secret;
};
```

### Milestone Payment Scheduling

```typescript
interface MilestoneSchedule {
  milestone_1: {
    percentage: 50;
    due: 'immediate';
    amount: number;
  };
  milestone_2: {
    percentage: 25;
    due: 'one_week_before';
    amount: number;
  };
  milestone_3: {
    percentage: 25;
    due: 'upon_arrival';
    amount: number;
  };
}

const scheduleMilestonePayments = async (booking: Booking) => {
  const schedule = calculateMilestones(booking.pricing.total);
  
  // Schedule automated payment reminders
  await scheduleJob({
    type: 'payment_reminder',
    booking_id: booking.id,
    milestone: 2,
    run_at: subDays(booking.check_in, 7)
  });
  
  await scheduleJob({
    type: 'payment_reminder',
    booking_id: booking.id,
    milestone: 3,
    run_at: booking.check_in
  });
};
```

### Refund Processing

```typescript
const processRefund = async (booking: Booking, reason: string) => {
  const daysUntilCheckIn = differenceInDays(booking.check_in, new Date());
  let refundPercentage = 0;
  
  if (daysUntilCheckIn >= 30) {
    refundPercentage = 100; // Full refund minus fees
  } else if (daysUntilCheckIn >= 7) {
    refundPercentage = 50;
  } else {
    // Check payment type
    if (booking.payment.type === 'deposit') {
      refundPercentage = 0; // Deposit retained
    } else {
      refundPercentage = 50;
    }
  }
  
  const refundAmount = (booking.pricing.total * refundPercentage) / 100;
  
  // Process refund through original gateway
  await processGatewayRefund(
    booking.payment.method,
    booking.id,
    refundAmount
  );
  
  return refundAmount;
};
```

## Third-Party Integrations

### Google Maps Integration

```typescript
// Location Selection Component
import { GoogleMap, Autocomplete } from '@react-google-maps/api';

const LocationPicker = ({ onLocationSelect }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      onLocationSelect({
        address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      });
    }
  };
  
  return (
    <Autocomplete
      onLoad={setAutocomplete}
      onPlaceChanged={onPlaceChanged}
    >
      <input type="text" placeholder="Enter pickup location" />
    </Autocomplete>
  );
};
```

### Google Calendar Integration

```typescript
import { google } from 'googleapis';

const createCalendarEvent = async (booking: Booking) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const event = {
    summary: `Trip to ${booking.hotel.name}`,
    description: `Booking #${booking.booking_number}\nGuide: ${booking.guide?.name}`,
    location: booking.hotel.location.address,
    start: {
      dateTime: booking.check_in.toISOString(),
      timeZone: 'Asia/Phnom_Penh'
    },
    end: {
      dateTime: booking.check_out.toISOString(),
      timeZone: 'Asia/Phnom_Penh'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 }
      ]
    }
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  });
  
  return response.data.id;
};
```

### Telegram Bot Integration

```typescript
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Tourist Bot Commands
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 'Welcome to DerLg! How can I help you today?', {
    reply_markup: {
      keyboard: [
        ['🔍 Get Recommendations', '📅 My Bookings'],
        ['💬 Chat with AI', '❓ Help']
      ]
    }
  });
});

// Service Provider Status Update
bot.onText(/\/available/, async (msg) => {
  const telegramUserId = msg.from.id.toString();
  const telegramUsername = msg.from.username;
  
  // Update status in database
  await updateProviderStatus({
    telegram_user_id: telegramUserId,
    telegram_username: telegramUsername,
    status: 'available'
  });
  
  await bot.sendMessage(msg.chat.id, '✅ Status updated to Available');
});

// Webhook for status updates
app.post('/webhook/telegram/status', async (req, res) => {
  const { telegram_user_id, status } = req.body;
  
  // Update in database
  await updateProviderStatus({ telegram_user_id, status });
  
  // Notify admin dashboard via WebSocket
  io.emit('provider_status_update', { telegram_user_id, status });
  
  res.json({ success: true });
});
```

### Twilio SMS Integration

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendPasswordResetSMS = async (phone: string, resetToken: string) => {
  const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  
  await client.messages.create({
    body: `Reset your DerLg password: ${resetLink}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
};

const sendBookingReminder = async (phone: string, booking: Booking) => {
  await client.messages.create({
    body: `Reminder: Your trip to ${booking.hotel.name} is tomorrow! Check-in: ${format(booking.check_in, 'PPP')}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
};
```

### SendGrid Email Integration

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendBookingConfirmation = async (booking: Booking, user: User) => {
  const msg = {
    to: user.email,
    from: 'bookings@derlg.com',
    subject: `Booking Confirmation - ${booking.booking_number}`,
    templateId: 'd-xxxxxxxxxxxxx',
    dynamicTemplateData: {
      user_name: `${user.first_name} ${user.last_name}`,
      booking_number: booking.booking_number,
      hotel_name: booking.hotel.name,
      check_in: format(booking.check_in, 'PPP'),
      check_out: format(booking.check_out, 'PPP'),
      total_amount: booking.pricing.total,
      payment_status: booking.payment.status
    }
  };
  
  await sgMail.send(msg);
};
```

### Cloudinary Integration

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (file: Express.Multer.File, folder: string) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: `derlg/${folder}`,
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });
  
  return {
    url: result.secure_url,
    public_id: result.public_id
  };
};
```

## AI Engine Design

### Architecture

```
User Request
   ↓
API Gateway (Node.js)
   ↓
AI Engine (FastAPI)
   ↓
┌─────────────────────────────────────┐
│  AI Services:                       │
│  1. Recommendation Engine           │
│  2. Chat Assistant (ChatGPT)        │
│  3. Sentiment Analysis              │
└─────────────────────────────────────┘
   ↓
Database Query (MySQL)
   ↓
Response Processing
   ↓
Return to Client
```

### Recommendation Algorithm

```python
class RecommendationEngine:
    def __init__(self):
        self.collaborative_model = CollaborativeFiltering()
        self.content_model = ContentBasedFiltering()
        
    async def get_recommendations(
        self,
        user_id: str,
        budget: float,
        preferences: dict,
        dates: dict
    ) -> List[Recommendation]:
        # 1. Get user history and preferences
        user_profile = await self.get_user_profile(user_id)
        
        # 2. Get available hotels/tours within budget
        available_items = await self.query_available_items(
            budget=budget,
            dates=dates
        )
        
        # 3. Apply collaborative filtering
        cf_scores = self.collaborative_model.predict(
            user_id,
            available_items
        )
        
        # 4. Apply content-based filtering
        cb_scores = self.content_model.predict(
            user_profile,
            available_items
        )
        
        # 5. Combine scores (hybrid approach)
        final_scores = 0.6 * cf_scores + 0.4 * cb_scores
        
        # 6. Apply budget constraints
        filtered = self.apply_budget_optimization(
            available_items,
            final_scores,
            budget
        )
        
        # 7. Integrate real-time events
        enhanced = await self.integrate_events(filtered, dates)
        
        # 8. Rank and return top recommendations
        return sorted(enhanced, key=lambda x: x.score, reverse=True)[:10]
```

### ChatGPT Integration

```python
from openai import AsyncOpenAI

class ChatAssistant:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.system_prompt = """
        You are a helpful travel assistant for DerLg, a Cambodia tourism platform.
        Help users plan their trips by:
        - Understanding their budget and preferences
        - Recommending hotels, tours, and cultural events
        - Providing cultural context about Cambodia
        - Suggesting optimal itineraries
        
        Always be friendly, informative, and budget-conscious.
        """
    
    async def chat(
        self,
        user_message: str,
        conversation_history: List[dict],
        context: dict
    ) -> str:
        messages = [
            {"role": "system", "content": self.system_prompt},
            *conversation_history,
            {"role": "user", "content": user_message}
        ]
        
        # Add context about available options
        if context.get('available_hotels'):
            context_msg = f"Available hotels: {context['available_hotels']}"
            messages.insert(1, {"role": "system", "content": context_msg})
        
        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            stream=True
        )
        
        # Stream response
        async for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
```

### Sentiment Analysis

```python
from transformers import pipeline

class SentimentAnalyzer:
    def __init__(self):
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment"
        )
        self.topic_extractor = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )
    
    async def analyze_review(self, review_text: str) -> dict:
        # 1. Overall sentiment
        sentiment = self.sentiment_pipeline(review_text)[0]
        score = self._normalize_score(sentiment['label'])
        
        # 2. Topic extraction
        topics = ['cleanliness', 'service', 'location', 'value', 'amenities']
        topic_sentiments = {}
        
        for topic in topics:
            topic_text = self._extract_topic_sentences(review_text, topic)
            if topic_text:
                topic_sentiment = self.sentiment_pipeline(topic_text)[0]
                topic_sentiments[topic] = self._normalize_score(
                    topic_sentiment['label']
                )
        
        # 3. Classification
        classification = 'positive' if score >= 0.6 else \
                        'negative' if score <= 0.4 else 'neutral'
        
        return {
            'score': score,
            'classification': classification,
            'topics': topic_sentiments
        }
    
    def _normalize_score(self, label: str) -> float:
        # Convert 1-5 star rating to 0-1 score
        star_map = {'1 star': 0.0, '2 stars': 0.25, '3 stars': 0.5,
                    '4 stars': 0.75, '5 stars': 1.0}
        return star_map.get(label, 0.5)
```

### Itinerary Generation

```python
class ItineraryGenerator:
    async def generate_itinerary(
        self,
        destination: str,
        days: int,
        budget: float,
        preferences: List[str]
    ) -> dict:
        # 1. Get available attractions
        attractions = await self.get_attractions(destination, preferences)
        
        # 2. Calculate optimal route
        route = self.optimize_route(attractions, days)
        
        # 3. Allocate budget
        budget_allocation = self.allocate_budget(route, budget)
        
        # 4. Generate day-by-day plan
        itinerary = []
        daily_budget = budget / days
        
        for day in range(days):
            day_plan = {
                'day': day + 1,
                'activities': [],
                'meals': [],
                'transportation': [],
                'total_cost': 0
            }
            
            # Morning activity
            morning = self.select_activity(
                route[day]['morning'],
                budget_allocation,
                'cultural'
            )
            day_plan['activities'].append(morning)
            
            # Afternoon activity
            afternoon = self.select_activity(
                route[day]['afternoon'],
                budget_allocation,
                preferences[0] if preferences else 'adventure'
            )
            day_plan['activities'].append(afternoon)
            
            # Add meals and transportation
            day_plan['meals'] = self.plan_meals(daily_budget * 0.3)
            day_plan['transportation'] = self.plan_transport(
                morning['location'],
                afternoon['location']
            )
            
            day_plan['total_cost'] = self.calculate_day_cost(day_plan)
            itinerary.append(day_plan)
        
        return {
            'destination': destination,
            'duration': days,
            'total_budget': budget,
            'itinerary': itinerary,
            'remaining_budget': budget - sum(d['total_cost'] for d in itinerary)
        }
```

## Real-Time Features

### WebSocket Architecture

```typescript
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  const userId = socket.data.user.userId;
  const userType = socket.data.user.userType;
  
  // Join user-specific room
  socket.join(`user:${userId}`);
  
  // Join role-specific room
  if (userType === 'hotel_admin') {
    socket.join(`hotel:${socket.data.user.hotelId}`);
  } else if (userType === 'super_admin') {
    socket.join('admin');
  }
  
  // Handle chat messages
  socket.on('send_message', async (data) => {
    const message = await saveMessage(data);
    io.to(`booking:${data.booking_id}`).emit('new_message', message);
  });
  
  // Handle booking updates
  socket.on('booking_update', async (data) => {
    const booking = await updateBooking(data);
    io.to(`user:${booking.user_id}`).emit('booking_updated', booking);
    io.to(`hotel:${booking.hotel_id}`).emit('booking_updated', booking);
  });
  
  // Handle provider status updates
  socket.on('provider_status', async (data) => {
    await updateProviderStatus(data);
    io.to('admin').emit('provider_status_update', data);
  });
});
```

### AI Streaming Response

```typescript
// Client-side
const streamAIResponse = async (message: string) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // Update UI with streaming text
    appendToChat(chunk);
  }
};

// Server-side
app.post('/api/ai/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const { message } = req.body;
  
  const stream = await aiEngine.chat(message);
  
  for await (const chunk of stream) {
    res.write(chunk);
  }
  
  res.end();
});
```

## Security Measures

### Security Checklist

1. **Authentication & Authorization**
   - JWT tokens with short expiration
   - Refresh token rotation
   - Role-based access control
   - OAuth 2.0 for social login

2. **Data Protection**
   - bcrypt password hashing (10+ rounds)
   - HTTPS/TLS encryption
   - Environment variables for secrets
   - No sensitive data in logs

3. **Input Validation**
   - express-validator for API inputs
   - SQL injection prevention (Sequelize ORM)
   - XSS protection (sanitize inputs)
   - CSRF tokens for state-changing operations

4. **API Security**
   - Rate limiting (express-rate-limit)
   - CORS configuration
   - Helmet.js for security headers
   - API key authentication for services

5. **Payment Security**
   - PCI DSS compliance
   - No card data storage
   - Escrow protection
   - Transaction logging

6. **Database Security**
   - Parameterized queries
   - Least privilege access
   - Regular backups
   - Encryption at rest

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Auth endpoints stricter limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

### Input Sanitization

```typescript
import { body, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

const validateBooking = [
  body('check_in').isISO8601().toDate(),
  body('check_out').isISO8601().toDate(),
  body('guests.adults').isInt({ min: 1, max: 20 }),
  body('guest_details.name').trim().escape(),
  body('guest_details.email').isEmail().normalizeEmail(),
  body('guest_details.phone').matches(/^\+?[1-9]\d{1,14}$/),
  body('guest_details.special_requests').customSanitizer(value => {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {}
    });
  })
];

app.post('/api/bookings', validateBooking, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process booking
});
```

## Performance Optimization

### Caching Strategy

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Cache hotel listings
const getHotels = async (filters: any) => {
  const cacheKey = `hotels:${JSON.stringify(filters)}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const hotels = await Hotel.findAll({ where: filters });
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(hotels));
  
  return hotels;
};

// Invalidate cache on st updateHotel = async (hotelId: string, data: any) => {
  await Hotel.update(data, { w: { id: hotelId } });
  
  // Invalidate related caches
  const keys = await redis.keys('hotels:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
```

### Database Optimization

```typescript
// Eager loading to prevent N+1 queries
const getBookingWithDetails = async (bookingId: string) => {
  return await Booking.findByPk(bookingId, {
    include: [
      {
        model: Hotel,
        include: [{ model: Room }]
      },
      { model: User },
      { model: PaymentTransaction }
    ]
  });
};

// Pagination foarge datasets
const getBookings = async (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Booking.findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
  
  return {
    bookings: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit)
  };
};

// Ixes for common queries
// Already defined in schema, but ensure they exist:
// - idx_bookings_user_id
// - idx_bookings_hotel_id
// - idx_bookings_status
// - idx_bookings_check_in
```

### Image Optimization

```typescript
// Cloudinary transformations
const getOptimizedImageUrl = (publicId: string, options: any = {}) => {
  const {
    width = 80= 600,
    quality = 'auto',
    format = 'auto'
  } = options;
  
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'fill' },
      { quality },
      { fetch_format: format }
    ]
  });
};

// Lazy loading on frontend
const ImageComponent = ({ src, alt }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
};
```

### Next.js Optimization

```typescript
// Static generation for public pages
export async function generateStaticParams() {
  const hotels = await getPopularHotels();
  return hotels.map((hotel) => ({
    id: hotel.id
  }));
}

// Server-side rendering with caching
export const revalidate = 300; // Revalidate every 5 minutes

export default async function HotelPage({ params }) {
  const hotel = await getHotel(params.id);
  return <HotelDetails hotel={hotel} />;
}

// API route caching
export async function GET(request: Request) {
  const hotels = await getHotels();
  
  return new Response(JSON.stringify(hotels), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
```

## Testing Strategy

### Unit Testing

```typescript
// Example: Booking service test
import { BookingService } from './booking.service';
import { jest } from '@jest/globals';

describe('BookingService', () => {
  let bookingService: BookingService;
  
  beforeEach(() => {
    bookingService = new BookingService();
  });
  
  describe('calculateTotalPrice', () => {
    it('should calculate correct price with no discount', () => {
      const result = bookingService.calculateTotalPrice({
        roomRate: 100,
        nights: 3,
        discount: 0
      });
      
      expect(result).toBe(300);
    });
    
    it('should apply student discount correctly', () => {
      const result = bookingService.calculateTotalPrice({
        roomRate: 100,
        nights: 3,
        discount: 10,
        isStudent: true
      });
      
      expect(result).toBe(270); // 300 - 10%
    });
  });
  
  describe('validateBookingDates', () => {
    it('should reject past check-in dates', () => {
      const pastDate = new Date('2020-01-01');
      const futureDate = new Date('2025-12-31');
      
      expect(() => {
        bookingService.validateBookingDates(pastDate, futureDate);
      }).toThrow('Check-in date cannot be in the past');
    });
  });
});
```

### Integration Testing

```typescript
// Example: API endpoint test
import request from 'supertest';
import app from '../app';

describe('POST /api/bookings', () => {
  it('should create a booking with valid data', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        hotel_id: 'hotel-123',
        room_id: 'room-456',
        check_in: '2025-12-01',
        check_out: '2025-12-05',
        guests: { adults: 2, children: 0 }
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('booking_number');
  });
  
  it('should reject booking without authentication', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({});
    
    expect(response.status).toBe(401);
  });
});
```

### End-to-End Testing

```typescript
// Example: Playwright E2E test
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete full booking process', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('https://derlg.com');
    
    // 2. Search for hotels
    await page.fill('[data-testid="destination"]', 'Siem Reap');
    await page.fill('[data-testid="check-in"]', '2025-12-01');
    await page.fill('[data-testid="check-out"]', '2025-12-05');
    await page.click('[data-testid="search-button"]');
    
    // 3. Select a hotel
    await page.click('[data-testid="hotel-card"]:first-child');
    
    // 4. Select a room
    await page.click('[data-testid="book-room-button"]');
    
    // 5. Fill guest details
    await page.fill('[data-testid="guest-name"]', 'John Doe');
    await page.fill('[data-testid="guest-email"]', 'john@example.com');
    await page.fill('[data-testid="guest-phone"]', '+1234567890');
    
    // 6. Select payment option
    await page.click('[data-testid="payment-full"]');
    
    // 7. Complete payment (mock)
    await page.click('[data-testid="confirm-booking"]');
    
    // 8. Verify confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-number"]')).toContainText(/BK-\d+/);
  });
});
```

## Deployment Architecture

### Infrastructure Setup

```yaml
# Digital Ocean Droplet Configuration
Droplet 1 (Backend):
  - OS: Ubuntu 22.04 LTS
  - Size: 4GB RAM, 2 vCPUs
  - Services: Node.js API, MySQL
  - Domain: api.derlg.com

Droplet 2 (Frontend):
  - OS: Ubuntu 22.04 LTS
  - Size: 2GB RAM, 1 vCPU
  - Services: Next.js (Customer System)
  - Domain: derlg.com

Droplet 3 (Admin):
  - OS: Ubuntu 22.04 LTS
  - Size: 2GB RAM, 1 vCPU
  - Services: Next.js (Admin Dashboards)
  - Domain: admin.derlg.com

Droplet 4 (AI Engine):
  - OS: Ubuntu 22.04 LTS
  - Size: 8GB RAM, 4 vCPUs
  - Services: Python FastAPI
  - Domain: ai.derlg.com

Load Balancer:
  - Distribute traffic across droplets
  - SSL termination
  - Health checks

Database:
  - MySQL 8.0 on dedicated droplet
  - Daily automated backups
  - Replication for high availability

Redis Cache:
  - Managed Redis instance
  - Session storage
  - API response caching
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DO_HOST_BACKEND }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /var/www/derlg-backend
            git pull origin main
            npm install
            npm run build
            pm2 restart derlg-backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Digital Ocean
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DO_HOST_FRONTEND }}
          username: ${{ secrets.DO_USERNAME }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /var/www/derlg-frontend
            git pull origin main
            npm install
            npm run build
            pm2 restart derlg-frontend
```

### Environment Configuration

```bash
# Backend .env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@localhost:3306/derlg
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://localhost:6379

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Payment Gateways
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
BAKONG_MERCHANT_ID=choeng_rayu@aclb
BAKONG_PHONE=+855969983479

# External Services
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
SENDGRID_API_KEY=your-sendgrid-key

# Google Services
GOOGLE_MAPS_API_KEY=your-maps-key
GOOGLE_CALENDAR_CLIENT_ID=your-calendar-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-calendar-secret

# Telegram
TELEGRAM_BOT_TOKEN=7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM

# AI Engine
AI_ENGINE_URL=https://ai.derlg.com
OPENAI_API_KEY=your-openai-key

# Analytics
GOOGLE_ANALYTICS_ID=G-CS4CQ72GZ6

# Frontend .env
NEXT_PUBLIC_API_URL=https://api.derlg.com
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-maps-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

### Monitoring and Logging

```typescript
// Winston logger configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Booking created', { bookingId, userId });
logger.error('Payment failed', { error, bookingId });
```

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    services: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      ai_engine: await checkAIEngineHealth()
    }
  };
  
  const isHealthy = Object.values(health.services).every(s => s === 'OK');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## Mobile App Design (Flutter)

### Project Structure

```
/lib
  /core
    /constants
    /utils
    /theme
  /data
    /models
    /repositories
    /providers
  /presentation
    /screens
      /home
      /hotels
      /bookings
      /profile
      /chat
    /widgets
    /controllers
  /services
    /api_service.dart
    /auth_service.dart
    /storage_service.dart
  main.dart
```

### Key Features Implementation

```dart
// API Service
class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.derlg.com',
    connectTimeout: Duration(seconds: 30),
    receiveTimeout: Duration(seconds: 30),
  ));
  
  Future<List<Hotel>> getHotels(SearchParams params) async {
    try {
      final response = await _dio.get('/hotels', queryParameters: params.toJson());
      return (response.data as List)
          .map((json) => Hotel.fromJson(json))
          .toList();
    } catch (e) {
      throw ApiException(e.toString());
    }
  }
  
  Future<Booking> createBooking(BookingData data) async {
    final response = await _dio.post('/bookings', data: data.toJson());
    return Booking.fromJson(response.data);
  }
}

// State Management (Riverpod)
final hotelsProvider = FutureProvider.family<List<Hotel>, SearchParams>(
  (ref, params) async {
    final apiService = ref.read(apiServiceProvider);
    return await apiService.getHotels(params);
  },
);

// UI Screen
class HotelListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchParams = ref.watch(searchParamsProvider);
    final hotelsAsync = ref.watch(hotelsProvider(searchParams));
    
    return Scaffold(
      appBar: AppBar(title: Text('Hotels')),
      body: hotelsAsync.when(
        data: (hotels) => ListView.builder(
          itemCount: hotels.length,
          itemBuilder: (context, index) => HotelCard(hotel: hotels[index]),
        ),
        loading: () => Center(child: CircularProgressIndicator()),
        error: (error, stack) => ErrorWidget(error: error),
      ),
    );
  }
}
```

## Conclusion

This design document provides a comprehensive technical blueprint for the DerLg Tourism Platform. The architecture is designed to be:

- **Scalable**: Microservices approach allows independent scaling
- **Maintainable**: Clear separation of concerns and modular design
- **Secure**: Multiple layers of security from authentication to payment processing
- **Performant**: Caching, optimization, and efficient database queries
- **User-Friendly**: Intuitive interfaces across web and mobile platforms
- **AI-Powered**: Intelligent recommendations and conversational assistance

The implementation will follow this design while remaining flexible to adapt to changing requirements and user feedback.
