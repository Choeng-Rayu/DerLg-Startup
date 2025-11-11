# Implementation Plan

## Phase 1: Backend Infrastructure and Database Setup

- [x] 1. Set up backend project structure and core dependencies
  - Initialize TypeScript configuration with strict mode
  - Install Express, Sequelize, bcrypt, jsonwebtoken, express-validator
  - Set up environment configuration with dotenv
  - Create folder structure: /src/models, /src/controllers, /src/routes, /src/middleware, /src/services, /src/utils
  - _Requirements: 53.1, 53.2_

- [x] 2. Configure MySQL database connection with Sequelize
  - Set up Sequelize instance with MySQL connection
  - Create database configuration for development and production
  - Implement connection pooling and error handling
  - _Requirements: 53.2_

- [x] 3. Implement User model and authentication tables
  - Create Users table with fields: id, user_type, email, phone, password_hash, google_id, facebook_id, first_name, last_name, profile_image, language, currency, is_student, student_email, jwt_refresh_token, email_verified, is_active
  - Add indexes for email, user_type, and student_email
  - Implement model validations and hooks
  - _Requirements: 1.1, 32.1, 58.1, 58.2_

- [x] 4. Implement Hotels, Rooms, and related models
  - Create Hotels table with location (JSON), contact (JSON), amenities (array), images (array), status, average_rating
  - Create Rooms table with hotel_id FK, room_type, capacity, price_per_night, amenities, images
  - Add appropriate indexes and foreign key constraints
  - _Requirements: 2.1, 2.5, 6.1, 6.3_


- [x] 5. Implement Bookings and payment-related models
  - Create Bookings table with user_id, hotel_id, room_id, check_in, check_out, guests (JSON), pricing (JSON), payment (JSON), status, cancellation (JSON)
  - Create PaymentTransactions table with booking_id FK, transaction_id, gateway, amount, payment_type, status, escrow_status
  - Add indexes for user_id, hotel_id, status, check_in
  - _Requirements: 4.1, 4.2, 16.1, 16.3, 44.1, 57.1_

- [x] 6. Implement Tours, Events, and Reviews models
  - Create Tours table with destination, duration (JSON), difficulty, category (array), price_per_person, inclusions, itinerary (JSON), guide_required, transportation_required
  - Create Events table with event_type, start_date, end_date, location (JSON), pricing (JSON), capacity, cultural_significance
  - Create Reviews table with user_id, booking_id, hotel_id, ratings (JSON), sentiment (JSON), comment
  - _Requirements: 30.1, 30.3, 5.1, 5.2, 15.1, 47.1_

- [x] 7. Implement Guides and Transportation models
  - Create Guides table with telegram_user_id, telegram_username, specializations (array), languages (array), status, created_by
  - Create Transportation table with telegram_user_id, telegram_username, vehicle_type, capacity, amenities (array), status, created_by
  - Add unique indexes for telegram_user_id and status indexes
  - _Requirements: 34.4, 34.5, 49.1, 49.2, 50.1, 58.3, 58.4, 60.1, 60.2_

- [x] 8. Implement supporting models (PromoCodes, Messages, Wishlists, AIConversations)
  - Create PromoCodes table with code, discount_type, discount_value, valid_from, valid_until, usage_limit, applicable_to
  - Create Messages table with booking_id, sender_id, sender_type, message, is_read
  - Create Wishlists table with user_id, item_type, item_id, notes
  - Create AIConversations table with user_id, session_id, ai_type, messages (JSON), context (JSON), recommendations (JSON)
  - _Requirements: 22.1, 22.3, 9.1, 20.1, 36.1, 46.1, 62.1_

## Phase 2: Authentication and Authorization System

- [x] 9. Implement JWT authentication service
  - Create JWT token generation with 24-hour access token and 30-day refresh token
  - Implement token verification middleware
  - Create refresh token rotation logic
  - Store refresh tokens in database with user association
  - _Requirements: 1.2, 1.3, 32.4_

- [x] 10. Implement user registration and login endpoints
  - Create POST /api/auth/register endpoint with email/password validation
  - Implement password hashing with bcrypt (10+ rounds)
  - Create POST /api/auth/login endpoint with credential verification
  - Return JWT tokens on successful authentication
  - _Requirements: 1.1, 1.2, 28.2, 58.5_


- [x] 11. Implement Google OAuth 2.0 integration
  - Set up Google OAuth client configuration
  - Create POST /api/auth/social/google endpoint
  - Implement authorization code exchange for access token
  - Fetch user profile and create/update user account
  - Generate JWT tokens for authenticated user
  - _Requirements: 32.3, 35.1, 35.3_

- [x] 12. Implement Facebook Login integration
  - Set up Facebook Login API configuration
  - Create POST /api/auth/social/facebook endpoint
  - Implement Facebook token verification
  - Create/update user account with Facebook profile data
  - _Requirements: 32.3, 35.2, 35.3_

- [x] 13. Implement password reset functionality
  - Create POST /api/auth/forgot-password endpoint accepting email or phone
  - Generate secure reset token with 1-hour expiration
  - Integrate Twilio for SMS-based reset links
  - Integrate SendGrid for email-based reset links
  - Create POST /api/auth/reset-password endpoint to validate token and update password
  - Invalidate all existing JWT tokens on password change
  - _Requirements: 1.5, 33.1, 33.2, 33.3, 33.4, 33.5_

- [x] 14. Implement role-based authorization middleware
  - Create authorize middleware accepting allowed user types
  - Verify user role from JWT payload
  - Return 403 Forbidden for unauthorized access
  - Apply to protected routes (super_admin, admin, tourist)
  - _Requirements: 32.2, 32.5, 34.1, 34.2, 34.3_

## Phase 3: Hotel and Room Management APIs

- [x] 15. Implement hotel search and listing endpoints
  - Create GET /api/hotels endpoint with pagination
  - Implement GET /api/hotels/search with filters (destination, dates, guests, price range, amenities)
  - Add query optimization with indexes
  - Return results within 2 seconds with caching
  - _Requirements: 2.1, 2.3, 19.1, 19.2, 19.4_

- [x] 16. Implement hotel detail and availability endpoints
  - Create GET /api/hotels/:id endpoint with full hotel details
  - Implement GET /api/hotels/:id/availability with date range checking
  - Include room types, pricing, reviews, and location data
  - Calculate real-time room availability
  - _Requirements: 2.5, 29.1, 29.3_

- [x] 17. Implement hotel admin profile management
  - Create GET /api/hotel/profile endpoint for hotel admins
  - Implement PUT /api/hotel/profile to update hotel information
  - Integrate Cloudinary for image uploads
  - Validate hotel data (name, description, amenities, contact)
  - _Requirements: 6.1, 6.2, 6.4_


- [x] 18. Implement room inventory management
  - Create GET /api/rooms endpoint for hotel admins
  - Implement POST /api/rooms to add new room types
  - Create PUT /api/rooms/:id to update room details
  - Implement DELETE /api/rooms/:id to remove rooms
  - Validate room capacity (1-20 guests) and positive pricing
  - _Requirements: 6.3, 6.5_

## Phase 4: Booking System and Payment Processing

- [x] 19. Implement booking creation endpoint
  - Create POST /api/bookings endpoint
  - Validate check-in/check-out dates and guest count
  - Create booking with "pending" status
  - Reserve room for 15 minutes
  - Generate unique booking number
  - _Requirements: 4.1, 23.1_

- [x] 20. Integrate PayPal payment gateway
  - Set up PayPal SDK configuration
  - Create payment intent creation logic
  - Implement webhook handler for payment confirmation
  - Update booking status to "confirmed" on successful payment
  - Store transaction details in PaymentTransactions table
  - _Requirements: 16.1, 16.2, 16.3, 44.1_

- [x] 21. Integrate Bakong (KHQR) payment system
  - Set up Bakong API configuration with merchant details
  - Generate KHQR codes for bookings
  - Implement payment verification with polling method
  - Handle KHR currency transactions
  - _Requirements: 16.1, 16.5, 43.1_

- [x] 22. Integrate Stripe payment gateway
  - Set up Stripe SDK with API keys
  - Create payment intent for card payments
  - Implement 3D Secure authentication
  - Handle webhook or polling events for payment status
  - _Requirements: 16.1, 16.5_

- [x] 23. Implement payment options (deposit, milestone, full)
  - Create payment option selection logic
  - Implement 50-70% deposit payment calculation
  - Create milestone payment schedule (50%/25%/25%)
  - Apply 5% discount for full upfront payment
  - Add bonus services for full payment (free airport pickup)
  - _Requirements: 44.1, 44.2, 44.3, 44.4_

- [x] 24. Implement escrow and payment scheduling
  - Create escrow hold logic for all payments
  - Implement automated milestone payment reminders
  - Schedule payment notifications (1 week before, upon arrival)
  - Create escrow release logic after service delivery
  - _Requirements: 44.5, 57.1, 57.2, 57.3_


- [x] 25. Implement booking management endpoints
  - Create GET /api/bookings for user's booking list
  - Implement GET /api/bookings/:id for booking details
  - Create PUT /api/bookings/:id for modifications
  - Implement DELETE /api/bookings/:id/cancel for cancellations
  - Calculate refund amounts based on cancellation policy
  - _Requirements: 4.3, 4.4, 23.2, 23.4, 45.1, 45.2, 45.3_

- [x] 26. Implement promo code system
  - Create POST /api/bookings/:id/promo-code endpoint
  - Validate promo code (expiration, usage limits, applicable items)
  - Calculate discount (percentage or fixed amount)
  - Apply discount to booking total
  - Increment usage count
  - _Requirements: 22.1, 22.2, 22.3_

## Phase 5: Tours, Events, and Reviews

- [x] 27. Implement tour listing and booking endpoints
  - Create GET /api/tours with search and filters
  - Implement GET /api/tours/:id for tour details
  - Create POST /api/bookings/tours for tour bookings
  - Include itinerary, inclusions, exclusions, meeting point
  - _Requirements: 30.1, 30.2, 30.3_

- [x] 28. Implement event management endpoints
  - Create GET /api/events for event listings
  - Implement GET /api/events/:id for event details
  - Create GET /api/events/date/:date for date-based queries
  - Include cultural significance and related tours
  - _Requirements: 47.1, 47.2, 47.4_

- [x] 29. Implement review submission and display
  - Create POST /api/reviews endpoint for review submission
  - Validate that booking is completed before allowing review
  - Store ratings (overall, cleanliness, service, location, value)
  - Calculate and update hotel average rating
  - Create GET /api/reviews/hotel/:hotelId for review listing
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

## Phase 6: AI Recommendation Engine (Python FastAPI)

- [x] 30. Set up AI Engine project structure
  - Initialize FastAPI project with Python 3.10+
  - Install dependencies: fastapi, uvicorn, openai, scikit-learn, sentence-transformers
  - Create folder structure: /models, /routes, /utils, /config
  - Set up environment configuration
  - _Requirements: 53.1_

- [x] 31. Implement recommendation algorithm
  - Create collaborative filtering model for user-user similarity
  - Implement content-based filtering for hotel features
  - Build hybrid recommendation system (60% collaborative, 40% content-based)
  - Apply budget constraints optimization
  - Integrate real-time event data
  - _Requirements: 3.1, 3.3, 13.1, 13.2, 13.3, 31.1_


- [x] 32. Implement ChatGPT-4(switch to GPT4 is only for production) and deepseek(for testing response first) integration for chat assistant
  - Set up OpenAI API client with GPT-4 and deepseek api key(sk-1d6ba5f959c14324b157e1df043bcf65)
  - for developer test is put in the .env file the (MODEL_USED=DEEPSEEK) so it use deepseek but if (MODEL_USED=GPT) it use GPT 
  - Create system prompt for Cambodia tourism context
  - Implement streaming response functionality
  - Maintain conversation context and history
  - Support multi-language responses (English, Khmer, Chinese)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 36.1, 36.2, 40.1, 40.2_

- [x] 33. Implement sentiment analysis for reviews
  - Set up sentence-transformers model
  - Create sentiment classification (positive/neutral/negative)
  - Extract key topics from review text
  - Calculate sentiment scores (0-1 scale)
  - Flag extremely negative reviews (score < 0.3)
  - _Requirements: 5.4, 15.1, 15.2, 15.3, 15.4_

- [x] 34. Implement itinerary generation
  - Create itinerary optimization algorithm
  - Calculate optimal routes with Google Maps integration
  - Balance activity types (cultural, adventure, relaxation)
  - Allocate budget across days and activities
  - Generate day-by-day plans with cost breakdowns
  - _Requirements: 38.1, 38.2, 38.3, 38.4, 38.5_

- [x] 35. Create AI API endpoints
  - Implement POST /api/recommend for personalized recommendations
  - Create POST /api/chat for conversational AI
  - Implement POST /api/itinerary for itinerary generation
  - Create POST /api/analyze-review for sentiment analysis
  - Add GET /api/health for health checks
  - _Requirements: 13.5, 14.5, 15.5_

## Phase 7: Telegram Bot Integration

- [x] 36. Set up Telegram Bot service
  - Initialize Node.js Telegram Bot with bot token
  - Create bot command handlers (/start, /status, /available, /busy)
  - Set up webhook endpoints for status updates
  - Implement authentication using Telegram user ID
  - _Requirements: 50.1, 50.2, 50.3, 60.3_

- [x] 37. Implement guide/driver status management
  - Create status update webhook POST /webhook/telegram/status
  - Update guide/driver status in database
  - Broadcast status changes to admin dashboard via WebSocket
  - Update booking availability in real-time
  - _Requirements: 49.3, 49.4, 50.4, 60.5_

- [x] 38. Implement booking notifications for service providers
  - Send booking details to guides/drivers via Telegram
  - Include Google Maps navigation links
  - Provide booking acceptance/rejection buttons
  - Update booking status based on provider response
  - _Requirements: 56.2_


## Phase 8: Third-Party Integrations

- [x] 39. Integrate Google Maps API
  - Set up Google Maps API key configuration
  - Implement location autocomplete for address selection
  - Create route optimization for itineraries
  - Add real-time location tracking for tours
  - Generate navigation links for drivers
  - _Requirements: 56.1, 56.2, 56.3, 56.4_

- [x] 40. Integrate Google Calendar API
  - Set up Google Calendar OAuth configuration
  - Create calendar event on booking confirmation
  - Include trip details, location, and guide contact
  - Implement automatic event updates on booking changes
  - Delete calendar events on cancellation
  - _Requirements: 51.1, 51.2, 51.4, 51.5_

- [x] 41. Integrate Twilio for SMS notifications
  - Set up Twilio account and phone number
  - Implement SMS sending for password reset
  - Create booking reminder SMS (24 hours before)
  - Send payment reminder SMS for milestone payments
  - _Requirements: 33.2, 51.3_

- [x] 42. Integrate Nodemailer for email notifications
  - Set up SMTP transport configuration (e.g., Gmail or custom mail server)
  - Create welcome email on user registration
  - Implement booking confirmation email
  - Send booking reminder emails (24 hours before)
  - Create payment receipt emails
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 43. Integrate Cloudinary for media storage
  - Set up Cloudinary account and API keys
  - Implement image upload with optimization
  - Generate thumbnails for hotel/room images
  - Create image transformation utilities
  - _Requirements: 6.4_

## Phase 9: Customer Frontend (Next.js)

- [x] 44. Set up Customer System frontend structure
  - Configure Next.js 14+ with App Router
  - Set up TypeScript and Tailwind CSS
  - Create layout components (Header, Footer, Navigation)
  - Implement responsive design (320px-2560px)
  - _Requirements: 18.1, 53.4_

- [x] 45. Implement authentication pages
  - Create /login page with email/password form
  - Implement /register page with validation
  - Add Google OAuth and Facebook Login buttons
  - Create password reset flow pages
  - Store JWT tokens in HTTP-only cookies
  - _Requirements: 1.1, 1.2, 32.3, 59.3_

- [x] 46. Implement homepage with search (live search also)
  - Create homepage with hero section and search bar
  - Implement destination, date, and guest count inputs
  - Add AI-powered recommendation section
  - Display popular destinations and featured hotels
  - _Requirements: 2.1, 3.1, 3.5, 59.1_


- [x] 47. Implement hotel search and listing pages
  - Create /hotels page with search results
  - Implement filter sidebar (price, amenities, rating)
  - Add sorting options (relevance, price, rating)
  - Display hotel cards with images, price, rating
  - Implement pagination for results
  - _Requirements: 2.2, 2.3, 2.4, 19.1, 19.2_

- [x] 48. Implement hotel detail page
  - Create /hotels/[id] page with full hotel information
  - Display image gallery with Cloudinary optimization
  - Show room types with pricing and availability
  - Include reviews section with sorting
  - Add Google Maps location display
  - Implement booking form with date selection
  - _Requirements: 2.5, 29.1, 29.2_

- [x] 49. Implement booking flow pages
  - Create booking form with guest details
  - Implement payment option selection (deposit/milestone/full)
  - Add promo code input and validation
  - Display booking summary with pricing breakdown
  - Create payment gateway integration UI
  - Show booking confirmation page
  - _Requirements: 4.1, 22.1, 44.1, 55.1, 55.4_

- [x] 50. Implement user profile and bookings page
  - Create /profile page with user information
  - Display booking history (upcoming, active, past)
  - Implement booking modification interface
  - Add cancellation functionality with refund calculation
  - Show wishlist with saved hotels
  - _Requirements: 4.3, 20.2, 23.1_

- [x] 51. Implement AI chat assistant interface
  - Create /chat-ai page with chat UI
  - Implement streaming message display
  - Add quick recommendation form (destination, budget, dates)
  - Display AI recommendations with booking links
  - Support three AI types (streaming, quick, event-based)
  - _Requirements: 14.1, 36.1, 46.1, 46.2, 46.3_

- [ ] 52. Implement tours and events pages
  - Create /tours page with tour listings
  - Implement /tours/[id] detail page
  - Create /events page with event calendar
  - Implement /events/[id] detail page
  - Add tour/event booking functionality
  - _Requirements: 30.1, 30.2, 47.1_

- [x] 53. Implement wishlist functionality
  - Create /wishlist page
  - Add favorite button to hotel cards
  - Implement add/remove from wishlist
  - Allow notes on wishlist items
  - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [x] 54. Implement hotel comparison tool
  - Add comparison selection (up to 4 hotels)
  - Create comparison table view
  - Highlight differences between hotels
  - Include booking buttons in comparison
  - _Requirements: 24.1, 24.2, 24.3, 24.4_


- [ ] 55. Implement multi-language support
  - Set up i18n with English and Khmer
  - Create language selector component
  - Translate all UI elements and labels
  - Store language preference in user profile
  - _Requirements: 21.1, 21.2, 21.3_

- [ ] 56. Implement social sharing features
  - Add social share buttons (Facebook, Twitter, WhatsApp, Email)
  - Generate shareable links with Open Graph meta tags
  - Track social shares for analytics
  - _Requirements: 25.1, 25.2, 25.5_

- [ ] 57. Implement accessibility features
  - Add ARIA labels and roles
  - Ensure keyboard navigation support
  - Maintain WCAG 2.1 Level AA color contrast
  - Provide alt text for all images
  - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5_

- [ ] 58. Optimize frontend performance
  - Implement lazy loading for images
  - Use Next.js static generation for public pages
  - Add API response caching
  - Compress assets with gzip/brotli
  - Achieve Lighthouse score 85+ desktop, 75+ mobile
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

## Phase 10: Hotel Admin Dashboard (Next.js)

- [ ] 59. Set up Hotel Admin Dashboard structure
  - Initialize Next.js fullstack application
  - Create admin layout with sidebar navigation
  - Implement role-based route protection
  - Set up API routes for hotel admin operations
  - _Requirements: 34.2_

- [ ] 60. Implement hotel admin dashboard overview
  - Create /dashboard page with KPIs
  - Display total bookings (daily, monthly, yearly)
  - Show total revenue and average occupancy rate
  - Display average customer rating
  - Add booking trend charts with Chart.js/Recharts
  - _Requirements: 8.1, 8.2_

- [ ] 61. Implement hotel profile management
  - Create hotel profile edit page
  - Implement image upload with Cloudinary
  - Add amenity selection interface
  - Validate and save hotel information
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 62. Implement room inventory management
  - Create room listing page
  - Add room creation form
  - Implement room edit functionality
  - Add room deletion with confirmation
  - _Requirements: 6.3, 6.5_


- [ ] 63. Implement booking management for hotel admins
  - Create bookings list page with filters
  - Display booking details (user, dates, room, payment)
  - Implement booking approval functionality
  - Add booking rejection with refund processing
  - Create check-out marking feature
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 64. Implement hotel-customer messaging
  - Create messaging interface
  - Display conversation threads by booking
  - Implement real-time messaging with Socket.io
  - Show message notifications
  - Display read status and timestamps
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 65. Implement analytics and reports
  - Create reports page with revenue charts
  - Display top-performing room types
  - Calculate and show occupancy rates
  - Implement CSV export functionality
  - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [ ] 66. Implement promo code management for hotel admins
  - Create promo code creation form
  - Set discount percentage, expiration, usage limits
  - Display active promo codes list
  - _Requirements: 22.4_

## Phase 11: Super Admin Dashboard (Next.js)

- [ ] 67. Set up Super Admin Dashboard structure
  - Initialize Next.js fullstack application
  - Create super admin layout with navigation
  - Implement super admin role protection
  - Set up API routes for platform management
  - _Requirements: 34.1_

- [ ] 68. Implement super admin dashboard overview
  - Create /dashboard with platform-wide KPIs
  - Display total users, hotels, bookings, revenue
  - Show pending hotel approvals count
  - Add growth metrics and charts
  - _Requirements: 10.1_

- [ ] 69. Implement hotel management and approval
  - Create hotels list with search and filters
  - Display pending hotel approvals
  - Implement hotel approval workflow
  - Add hotel rejection with notification
  - Create hotel enable/disable functionality
  - _Requirements: 10.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 70. Implement user management
  - Create users list with search
  - Display user details and booking history
  - Implement account deactivation
  - Add password reset functionality
  - _Requirements: 10.3_


- [ ] 71. Implement guide management
  - Create guides list page
  - Implement guide creation form with Telegram integration
  - Add guide edit functionality
  - Display real-time status (available/unavailable/on_tour)
  - Show guide performance metrics
  - _Requirements: 49.1, 49.4, 60.1, 60.4_

- [ ] 72. Implement transportation management
  - Create transportation/drivers list page
  - Implement driver creation form with Telegram integration
  - Add vehicle details management
  - Display real-time driver status
  - Show driver performance metrics
  - _Requirements: 49.2, 49.4, 60.2, 60.4_

- [ ] 73. Implement event management (CRUD)
  - Create events list page
  - Implement event creation form
  - Add event edit functionality
  - Create event deletion with booking handling
  - Display event bookings and revenue
  - _Requirements: 61.1, 61.2, 61.3, 61.4, 61.5_

- [ ] 74. Implement promo code management
  - Create promo codes list page
  - Implement promo code creation form
  - Add platform-wide and specific promo codes
  - Display usage statistics
  - Implement automatic expiration
  - _Requirements: 22.5, 62.1, 62.2, 62.3, 62.4_

- [ ] 75. Implement AI system monitoring
  - Create AI monitoring dashboard
  - Display recommendation metrics (total, response time, CTR)
  - Show sentiment analysis results by hotel
  - Display chat assistant usage statistics
  - Provide access to AI logs
  - Add recommendation algorithm retraining trigger
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 54.1, 54.2_

- [ ] 76. Implement platform analytics and reports
  - Create analytics dashboard with revenue charts
  - Display booking heatmaps
  - Show growth metrics over time
  - Implement CSV and PDF export
  - _Requirements: 10.5_

## Phase 12: Real-Time Features and WebSockets

- [ ] 77. Set up WebSocket server with Socket.io
  - Initialize Socket.io server
  - Implement JWT authentication for WebSocket connections
  - Create room-based communication (user rooms, hotel rooms, admin room)
  - _Requirements: 9.5_

- [ ] 78. Implement real-time messaging
  - Create message sending/receiving handlers
  - Broadcast messages to booking participants
  - Display real-time notifications
  - Update message read status
  - _Requirements: 9.2, 9.3_


- [ ] 79. Implement real-time booking updates
  - Broadcast booking status changes to users and admins
  - Update availability in real-time
  - Notify hotel admins of new bookings
  - _Requirements: 29.4_

- [ ] 80. Implement real-time provider status updates
  - Broadcast guide/driver status changes to admin dashboard
  - Update booking availability based on provider status
  - _Requirements: 49.4, 50.4_

## Phase 13: Security and Performance

- [x] 81. Implement security measures
  - Add rate limiting with express-rate-limit
  - Implement CORS configuration
  - Add Helmet.js for security headers
  - Implement CSRF protection
  - Add input sanitization with sanitize-html
  - _Requirements: 28.1, 28.3, 28.4_

- [x] 82. Implement caching with Redis
  - Set up Redis connection
  - Cache hotel listings (5-minute TTL)
  - Cache search results
  - Implement cache invalidation on updates
  - _Requirements: 27.4_

- [x] 83. Implement error handling and logging
  - Create centralized error handler
  - Set up Winston logger
  - Log all errors with context
  - Implement user-friendly error messages
  - Create error code system
  - _Requirements: Error handling from design_

- [x] 84. Optimize database queries
  - Implement eager loading to prevent N+1 queries
  - Add pagination for large datasets
  - Ensure all indexes are created
  - Optimize complex queries
  - _Requirements: 27.1_

## Phase 14: Notifications and Reminders

- [x] 85. Implement email notification system
  - Create email templates with SendGrid
  - Send welcome email on registration
  - Send booking confirmation emails
  - Send booking reminder emails (24 hours before)
  - Send payment receipts
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 86. Implement SMS notification system
  - Set up Twilio SMS service
  - Send booking reminders via SMS
  - Send payment reminders for milestone payments
  - _Requirements: 51.3, 57.3_

- [x] 87. Implement automated job scheduling
  - Set up job scheduler (node-cron or Bull)
  - Schedule booking reminder jobs
  - Schedule payment reminder jobs
  - Schedule milestone payment processing
  - Schedule escrow release jobs
  - _Requirements: 4.5, 57.2_


## Phase 15: Mobile App (Flutter) - Optional

- [ ] 88. Set up Flutter mobile app structure
  - Initialize Flutter project
  - Set up folder structure (screens, widgets, services, models)
  - Configure Android and iOS builds
  - _Requirements: 53.3_

- [ ] 89. Implement mobile authentication
  - Create login and registration screens
  - Integrate Google and Facebook OAuth
  - Store JWT tokens securely
  - _Requirements: 1.1, 1.2, 32.3_

- [ ] 90. Implement mobile hotel search and booking
  - Create hotel search screen
  - Implement hotel detail screen
  - Create booking flow screens
  - Integrate payment gateways
  - _Requirements: 2.1, 4.1, 18.1_

- [ ] 91. Implement mobile-specific features
  - Add geolocation for nearby hotels
  - Implement click-to-call functionality
  - Optimize for touch interactions
  - _Requirements: 18.5_

## Phase 16: Testing and Quality Assurance

- [ ] 92. Write backend unit tests
  - Test authentication services
  - Test booking calculation logic
  - Test payment processing functions
  - Test validation middleware
  - _Requirements: Testing strategy from design_

- [ ] 93. Write API integration tests
  - Test all API endpoints
  - Test authentication flows
  - Test error handling
  - Test rate limiting
  - _Requirements: Testing strategy from design_

- [ ] 94. Write frontend component tests
  - Test React components
  - Test form validations
  - Test user interactions
  - _Requirements: Testing strategy from design_

- [ ] 95. Perform end-to-end testing
  - Test complete booking flow
  - Test payment processing
  - Test admin workflows
  - Test real-time features
  - _Requirements: Testing strategy from design_

- [ ] 96. Perform security testing
  - Test authentication and authorization
  - Test input validation and sanitization
  - Test SQL injection prevention
  - Test XSS protection
  - _Requirements: 28.1, 28.3, 28.4_

- [ ] 97. Perform performance testing
  - Load test API endpoints
  - Test database query performance
  - Test caching effectiveness
  - Measure page load times
  - _Requirements: 27.1, 27.5_


## Phase 17: Deployment and DevOps

- [ ] 98. Set up Digital Ocean infrastructure
  - Create droplets for backend, frontend, admin, AI engine
  - Configure MySQL database droplet
  - Set up Redis cache instance
  - Configure load balancer
  - _Requirements: Infrastructure from design_

- [ ] 99. Configure domain and SSL
  - Point derlg.com to frontend droplet
  - Point api.derlg.com to backend droplet
  - Point admin.derlg.com to admin droplet
  - Point ai.derlg.com to AI engine droplet
  - Install SSL/TLS certificates
  - _Requirements: 28.1_

- [ ] 100. Set up CI/CD pipeline
  - Configure GitHub Actions for automated testing
  - Set up automated deployment to Digital Ocean
  - Implement database migration automation
  - Configure environment variables
  - _Requirements: Deployment from design_

- [ ] 101. Configure monitoring and logging
  - Set up application monitoring
  - Configure error tracking
  - Set up database monitoring
  - Implement log aggregation
  - _Requirements: Performance optimization from design_

- [ ] 102. Implement backup and disaster recovery
  - Configure automated database backups
  - Set up backup retention policy
  - Create disaster recovery plan
  - Test backup restoration
  - _Requirements: Database security from design_

## Phase 18: Documentation and Launch Preparation

- [ ] 103. Write API documentation
  - Document all API endpoints
  - Include request/response examples
  - Document authentication requirements
  - Create Postman collection
  - _Requirements: General best practice_

- [ ] 104. Write user documentation
  - Create user guide for tourists
  - Write hotel admin manual
  - Create super admin documentation
  - Document common workflows
  - _Requirements: General best practice_

- [ ] 105. Write developer documentation
  - Document codebase architecture
  - Create setup instructions
  - Document deployment process
  - Write contribution guidelines
  - _Requirements: General best practice_

- [ ] 106. Perform final testing and bug fixes
  - Test all features end-to-end
  - Fix identified bugs
  - Verify all requirements are met
  - Conduct user acceptance testing
  - _Requirements: All requirements_

- [ ] 107. Launch platform
  - Deploy to production environment
  - Configure Google Analytics
  - Set up monitoring alerts
  - Announce platform launch
  - _Requirements: All requirements_
