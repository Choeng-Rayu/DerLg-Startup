---
type: "always_apply"
---

# Requirements Document

## Introduction

DerLg.com is a comprehensive tourism booking platform that connects travelers with hotels and tour experiences in Cambodia. The platform consists of four interconnected systems: a customer-facing booking application, a hotel admin dashboard for property management, a super admin dashboard for platform oversight, and an AI-powered recommendation engine. The system enables users to discover, book, and manage travel experiences while providing hotel operators and platform administrators with powerful management and analytics tools.

## Glossary

- **Customer System**: The user-facing web application where travelers browse, search, and book hotels and tours
- **Hotel Admin Dashboard**: The fullstack Next.js application used by hotel owners and managers to manage their properties, rooms, bookings, and customer interactions
- **Super Admin Dashboard**: The fullstack Next.js application used by DerLg platform administrators to oversee all hotels, users, bookings, and system operations
- **AI Engine**: The Python FastAPI microservice that provides personalized recommendations, chatbot assistance, and sentiment analysis
- **Booking Entity**: A reservation record containing user information, hotel/room details, dates, payment status, and booking status
- **User Account**: A registered customer account with authentication credentials, profile information, and booking history
- **Hotel Profile**: A registered hotel entity with property details, amenities, location, images, and associated rooms
- **Room Inventory**: The collection of available room types for a hotel with pricing, capacity, and availability information
- **Payment Gateway**: The third-party service (ABA PayWay or Stripe) that processes secure online payments
- **JWT Token**: JSON Web Token used for secure authentication and authorization across the platform
- **Review System**: The feature allowing users to rate and review hotels after their stay
- **Chat Assistant**: The AI-powered conversational interface that helps users find suitable travel options
- **Recommendation Algorithm**: The machine learning system that suggests personalized hotels and tours based on user preferences and behavior
- **Sentiment Analysis**: The AI feature that analyzes customer reviews to calculate satisfaction metrics
- **Booking Status**: The current state of a booking (pending, confirmed, completed, cancelled, rejected)
- **Role-Based Access**: The authorization system that controls feature access based on user roles (user, hotel_admin, super_admin)

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a traveler, I want to create an account and securely log in, so that I can book hotels and manage my reservations.

#### Acceptance Criteria

1. WHEN a new user submits valid registration information (email, password, name, phone), THE Customer System SHALL create a new User Account with encrypted password storage
2. WHEN a user submits valid login credentials, THE Customer System SHALL generate a JWT Token with 24-hour expiration and return it to the client
3. WHEN a user's JWT Token expires, THE Customer System SHALL require re-authentication before allowing access to protected resources
4. THE Customer System SHALL validate email format and enforce password requirements (minimum 8 characters, at least one uppercase, one lowercase, one number)
5. WHEN a user requests password reset, THE Customer System SHALL send a secure reset link via email that expires within 1 hour

### Requirement 2: Hotel Search and Discovery

**User Story:** As a traveler, I want to search for hotels by destination, dates, and guest count, so that I can find accommodations that meet my needs.

#### Acceptance Criteria

1. WHEN a user enters search criteria (destination, check-in date, check-out date, number of guests), THE Customer System SHALL return all Hotel Profiles with available Room Inventory matching the criteria within 2 seconds
2. THE Customer System SHALL display hotel results with thumbnail images, starting price, average rating, and location information
3. WHEN a user applies filters (price range, amenities, rating), THE Customer System SHALL update search results to show only matching hotels within 1 second
4. THE Customer System SHALL sort search results by relevance, price (low to high), price (high to low), or rating as selected by the user
5. WHEN a user views hotel details, THE Customer System SHALL display comprehensive information including all images, amenities, room types, reviews, and location map

### Requirement 3: AI-Powered Recommendations

**User Story:** As a traveler, I want personalized hotel and tour suggestions, so that I can discover options that match my preferences without extensive searching.

#### Acceptance Criteria

1. WHEN a user accesses the homepage, THE AI Engine SHALL generate personalized hotel recommendations based on user location, browsing history, and popular destinations within 3 seconds
2. WHEN a user interacts with the Chat Assistant, THE AI Engine SHALL provide conversational responses with relevant hotel and tour suggestions within 2 seconds per message
3. THE AI Engine SHALL analyze user preferences (budget range, location preferences, amenity preferences) to improve recommendation accuracy over time
4. WHEN a user completes a booking, THE AI Engine SHALL update the recommendation algorithm to reflect the user's confirmed preferences
5. THE Customer System SHALL display AI-recommended hotels with explanation tags (e.g., "Based on your previous bookings", "Popular in your area")

### Requirement 4: Booking Creation and Management

**User Story:** As a traveler, I want to book a hotel room and manage my reservations, so that I can secure my accommodation and track my travel plans.

#### Acceptance Criteria

1. WHEN a user selects a room and submits booking details (dates, guest information), THE Customer System SHALL create a Booking Entity with status "pending" and reserve the room for 15 minutes
2. WHEN a user completes payment through the Payment Gateway, THE Customer System SHALL update the Booking Status to "confirmed" and send a confirmation email within 30 seconds
3. THE Customer System SHALL display all user bookings on the profile page, categorized as upcoming, active, or past bookings
4. WHEN a user cancels a booking at least 48 hours before check-in, THE Customer System SHALL update the Booking Status to "cancelled" and initiate refund processing
5. THE Customer System SHALL send booking reminder emails 24 hours before check-in date

### Requirement 5: Review and Rating System

**User Story:** As a traveler, I want to leave reviews and ratings for hotels I've stayed at, so that I can share my experience and help other travelers make informed decisions.

#### Acceptance Criteria

1. WHEN a user's booking reaches "completed" status, THE Customer System SHALL enable the review submission feature for that hotel
2. WHEN a user submits a review with rating (1-5 stars) and text comment, THE Customer System SHALL store the review and associate it with the User Account and Hotel Profile
3. THE Customer System SHALL calculate and display the average rating for each Hotel Profile based on all submitted reviews
4. THE AI Engine SHALL perform Sentiment Analysis on review text and categorize it as positive, neutral, or negative
5. THE Customer System SHALL display reviews on hotel detail pages sorted by most recent or most helpful as selected by the user

### Requirement 6: Hotel Admin Property Management

**User Story:** As a hotel owner, I want to manage my hotel profile and room inventory, so that I can keep my property information accurate and up-to-date for potential guests.

#### Acceptance Criteria

1. WHEN a hotel admin logs into the Hotel Admin Dashboard, THE Hotel Admin Dashboard SHALL display the complete Hotel Profile with edit capabilities
2. WHEN a hotel admin updates hotel information (name, description, amenities, images), THE Hotel Admin Dashboard SHALL save changes and reflect them on the Customer System within 1 minute
3. THE Hotel Admin Dashboard SHALL allow hotel admins to add, edit, or remove Room Inventory entries with fields for room type, price, capacity, availability, photos, and description
4. WHEN a hotel admin uploads images, THE Hotel Admin Dashboard SHALL store them using Cloudinary and generate optimized thumbnails
5. THE Hotel Admin Dashboard SHALL validate that room prices are positive numbers and capacity is between 1 and 20 guests

### Requirement 7: Hotel Admin Booking Management

**User Story:** As a hotel manager, I want to view and manage incoming bookings, so that I can approve reservations and coordinate with guests.

#### Acceptance Criteria

1. THE Hotel Admin Dashboard SHALL display all bookings for the hotel, filterable by status (pending, confirmed, completed, cancelled)
2. WHEN a hotel admin approves a pending booking, THE Hotel Admin Dashboard SHALL update the Booking Status to "confirmed" and notify the customer via email within 30 seconds
3. WHEN a hotel admin rejects a booking, THE Hotel Admin Dashboard SHALL update the Booking Status to "rejected", initiate refund processing, and notify the customer within 30 seconds
4. THE Hotel Admin Dashboard SHALL display booking details including Booking Entity ID, user contact information, check-in/check-out dates, room type, total amount, and payment status
5. WHEN a guest checks out, THE Hotel Admin Dashboard SHALL allow the admin to mark the Booking Status as "completed"

### Requirement 8: Hotel Admin Analytics and Reports

**User Story:** As a hotel owner, I want to view performance metrics and revenue reports, so that I can understand my business performance and make data-driven decisions.

#### Acceptance Criteria

1. THE Hotel Admin Dashboard SHALL display key performance indicators including total bookings (daily, monthly, yearly), total revenue, average occupancy rate, and average customer rating
2. THE Hotel Admin Dashboard SHALL generate visual charts showing booking trends over time using Chart.js or Recharts
3. THE Hotel Admin Dashboard SHALL display the top-performing room types based on booking frequency and revenue
4. THE Hotel Admin Dashboard SHALL calculate and display average occupancy rate as (booked room-nights / total available room-nights) × 100
5. THE Hotel Admin Dashboard SHALL allow hotel admins to export booking and revenue reports in CSV format

### Requirement 9: Hotel-Customer Messaging

**User Story:** As a hotel manager, I want to communicate with guests who have bookings, so that I can answer questions and provide excellent customer service.

#### Acceptance Criteria

1. THE Hotel Admin Dashboard SHALL provide a messaging interface showing all conversations with customers who have active or upcoming bookings
2. WHEN a hotel admin sends a message, THE Hotel Admin Dashboard SHALL deliver it to the customer's inbox in the Customer System within 2 seconds
3. WHEN a customer sends a message, THE Hotel Admin Dashboard SHALL display a notification and show the message in the conversation thread
4. THE Hotel Admin Dashboard SHALL display message history for each booking with timestamps and read status
5. WHERE real-time messaging is enabled, THE Hotel Admin Dashboard SHALL use Socket.io to provide instant message delivery without page refresh

### Requirement 10: Super Admin Platform Oversight

**User Story:** As a platform administrator, I want to monitor all hotels, users, and bookings, so that I can ensure platform quality and resolve issues.

#### Acceptance Criteria

1. THE Super Admin Dashboard SHALL display platform-wide KPIs including total users, total hotels, total bookings, monthly revenue, and pending hotel approvals
2. THE Super Admin Dashboard SHALL provide a searchable list of all Hotel Profiles with ability to view details, approve/reject new hotels, and enable/disable existing hotels
3. THE Super Admin Dashboard SHALL provide a searchable list of all User Accounts with ability to view booking history, deactivate accounts, and reset passwords
4. THE Super Admin Dashboard SHALL display all Booking Entities across the platform with filtering by date range, status, hotel, and user
5. THE Super Admin Dashboard SHALL allow export of platform reports (financial reports, booking heatmaps, growth metrics) in CSV and PDF formats

### Requirement 11: Super Admin Hotel Approval Workflow

**User Story:** As a platform administrator, I want to review and approve new hotel registrations, so that I can maintain platform quality and prevent fraudulent listings.

#### Acceptance Criteria

1. WHEN a new hotel registers, THE Super Admin Dashboard SHALL create a Hotel Profile with status "pending_approval" that is not visible on the Customer System
2. THE Super Admin Dashboard SHALL display all pending hotel approvals with hotel details, submitted documentation, and contact information
3. WHEN a super admin approves a hotel, THE Super Admin Dashboard SHALL update the hotel status to "active" and make it visible on the Customer System within 1 minute
4. WHEN a super admin rejects a hotel, THE Super Admin Dashboard SHALL update the status to "rejected" and send a notification email to the hotel admin with rejection reason
5. THE Super Admin Dashboard SHALL allow super admins to disable active hotels, which removes them from Customer System search results immediately

### Requirement 12: Super Admin AI System Monitoring

**User Story:** As a platform administrator, I want to monitor AI system performance and accuracy, so that I can ensure users receive high-quality recommendations.

#### Acceptance Criteria

1. THE Super Admin Dashboard SHALL display AI Engine metrics including total recommendations generated, average response time, and recommendation click-through rate
2. THE Super Admin Dashboard SHALL show Sentiment Analysis results aggregated by hotel, displaying positive/neutral/negative review distribution
3. THE Super Admin Dashboard SHALL display Chat Assistant usage statistics including total conversations, average conversation length, and user satisfaction ratings
4. THE Super Admin Dashboard SHALL provide access to AI Engine logs for debugging and performance analysis
5. THE Super Admin Dashboard SHALL allow super admins to trigger recommendation algorithm retraining based on updated booking data

### Requirement 13: AI Recommendation Engine

**User Story:** As the platform, I want an AI system that generates accurate recommendations, so that users can discover relevant hotels and tours efficiently.

#### Acceptance Criteria

1. WHEN the Customer System requests recommendations, THE AI Engine SHALL analyze user profile, browsing history, and booking patterns to generate personalized hotel suggestions within 3 seconds
2. THE AI Engine SHALL use collaborative filtering to identify similar users and recommend hotels that similar users have booked
3. THE AI Engine SHALL consider factors including user budget range, preferred locations, amenity preferences, and previous booking ratings when generating recommendations
4. THE AI Engine SHALL provide a confidence score (0-100) for each recommendation indicating prediction accuracy
5. THE AI Engine SHALL expose a POST /recommend endpoint that accepts user ID and context parameters and returns a ranked list of hotel recommendations

### Requirement 14: AI Chat Assistant

**User Story:** As a traveler, I want to chat with an AI assistant about my travel plans, so that I can get personalized suggestions through natural conversation.

#### Acceptance Criteria

1. WHEN a user sends a message to the Chat Assistant, THE AI Engine SHALL process the natural language input and generate a contextual response within 2 seconds
2. THE AI Engine SHALL understand travel-related queries including destination questions, budget constraints, date availability, and amenity preferences
3. WHEN a user asks for recommendations, THE AI Engine SHALL provide specific hotel suggestions with brief descriptions and reasons for the recommendation
4. THE AI Engine SHALL maintain conversation context across multiple messages within a session
5. THE AI Engine SHALL expose a POST /chat endpoint that accepts message text and session ID and returns the assistant's response

### Requirement 15: AI Sentiment Analysis

**User Story:** As a platform administrator, I want automated analysis of customer reviews, so that I can identify hotel quality issues and trends without manual review.

#### Acceptance Criteria

1. WHEN a user submits a review, THE AI Engine SHALL analyze the review text and classify it as positive (score 0.6-1.0), neutral (score 0.4-0.6), or negative (score 0.0-0.4)
2. THE AI Engine SHALL extract key topics from reviews (e.g., "cleanliness", "staff", "location", "value") and associate sentiment scores with each topic
3. THE AI Engine SHALL calculate an overall satisfaction index for each Hotel Profile based on aggregated sentiment scores from all reviews
4. THE AI Engine SHALL identify reviews with extremely negative sentiment (score < 0.3) and flag them for super admin attention
5. THE AI Engine SHALL expose a POST /analyze-review endpoint that accepts review text and returns sentiment classification and topic analysis

### Requirement 16: Payment Processing

**User Story:** As a traveler, I want to securely pay for my booking using my preferred payment method, so that I can complete my reservation with confidence.

#### Acceptance Criteria

1. WHEN a user initiates payment, THE Customer System SHALL redirect to the Payment Gateway (ABA PayWay or Stripe) with encrypted booking details
2. WHEN the Payment Gateway confirms successful payment, THE Customer System SHALL receive a webhook notification and update the Booking Status to "confirmed" within 10 seconds
3. THE Customer System SHALL store payment transaction ID, amount, currency, and timestamp with the Booking Entity
4. WHEN payment fails, THE Customer System SHALL display an error message and allow the user to retry payment or cancel the booking
5. THE Customer System SHALL support multiple payment methods including credit cards, debit cards, and local payment options through the Payment Gateway

### Requirement 17: Email Notifications

**User Story:** As a user of the platform, I want to receive email notifications about important events, so that I stay informed about my bookings and account activity.

#### Acceptance Criteria

1. WHEN a user completes registration, THE Customer System SHALL send a welcome email with account verification link within 1 minute
2. WHEN a booking is confirmed, THE Customer System SHALL send a confirmation email to the user with booking details, hotel information, and cancellation policy within 30 seconds
3. WHEN a booking is 24 hours away, THE Customer System SHALL send a reminder email to the user with check-in instructions
4. WHEN a hotel admin approves or rejects a booking, THE Customer System SHALL send a status update email to the user within 30 seconds
5. THE Customer System SHALL use SendGrid or Mailgun to deliver all transactional emails with delivery tracking

### Requirement 18: Mobile Responsiveness

**User Story:** As a traveler using a mobile device, I want the platform to work seamlessly on my phone, so that I can search and book hotels on the go.

#### Acceptance Criteria

1. THE Customer System SHALL render all pages responsively on devices with screen widths from 320px to 2560px
2. THE Customer System SHALL optimize images for mobile devices by serving appropriately sized versions based on device screen size
3. THE Customer System SHALL provide touch-friendly interface elements with minimum tap target size of 44x44 pixels
4. THE Customer System SHALL load the homepage within 3 seconds on 4G mobile connections
5. THE Customer System SHALL support mobile-specific features including geolocation for nearby hotel search and click-to-call for hotel contact numbers

### Requirement 19: Advanced Search and Filtering

**User Story:** As a traveler with specific preferences, I want advanced search filters, so that I can quickly find hotels that match my exact requirements.

#### Acceptance Criteria

1. THE Customer System SHALL provide filter options for price range (with min/max sliders), star rating, guest rating (1-5 stars), and distance from city center
2. THE Customer System SHALL provide amenity filters including WiFi, parking, pool, breakfast, gym, spa, restaurant, and pet-friendly options
3. THE Customer System SHALL allow users to filter by room type (single, double, suite, family room) and bed type (single, double, queen, king)
4. WHEN a user applies multiple filters, THE Customer System SHALL show only hotels matching all selected criteria (AND logic)
5. THE Customer System SHALL display the count of matching hotels as filters are applied and show "No results" message when no hotels match

### Requirement 20: Favorites and Wishlists

**User Story:** As a traveler planning future trips, I want to save hotels to a wishlist, so that I can easily find and compare them later.

#### Acceptance Criteria

1. WHEN a logged-in user clicks the favorite icon on a hotel, THE Customer System SHALL add the Hotel Profile to the user's wishlist
2. THE Customer System SHALL provide a dedicated wishlist page showing all saved hotels with ability to remove items
3. THE Customer System SHALL display favorite status on hotel cards and detail pages with a filled heart icon for saved hotels
4. THE Customer System SHALL allow users to add notes to wishlist items (e.g., "For anniversary trip in June")
5. WHEN a user removes a hotel from wishlist, THE Customer System SHALL update the favorite status immediately without page reload

### Requirement 21: Multi-language Support

**User Story:** As an international traveler, I want to use the platform in my preferred language, so that I can understand all information clearly.

#### Acceptance Criteria

1. THE Customer System SHALL support English and Khmer languages with ability to switch between them via a language selector
2. WHEN a user selects a language, THE Customer System SHALL translate all UI elements, labels, and system messages to the selected language within 1 second
3. THE Customer System SHALL store the user's language preference and apply it automatically on subsequent visits
4. THE Customer System SHALL allow hotel admins to provide hotel descriptions and amenity information in multiple languages
5. THE Customer System SHALL display content in the user's selected language, falling back to English if translation is not available

### Requirement 22: Promotional Codes and Discounts

**User Story:** As a traveler, I want to apply promotional codes to my booking, so that I can receive discounts and special offers.

#### Acceptance Criteria

1. THE Customer System SHALL provide a promo code input field during the booking process
2. WHEN a user enters a valid promo code, THE Customer System SHALL apply the discount to the booking total and display the savings amount
3. THE Customer System SHALL validate promo codes against expiration dates, usage limits, and applicable hotels before applying discounts
4. THE Hotel Admin Dashboard SHALL allow hotel admins to create promotional codes with configurable discount percentage, expiration date, and usage limit
5. THE Super Admin Dashboard SHALL allow super admins to create platform-wide promotional codes applicable to all hotels

### Requirement 23: Booking Modification

**User Story:** As a traveler, I want to modify my booking dates or room type, so that I can adjust my plans without cancelling and rebooking.

#### Acceptance Criteria

1. THE Customer System SHALL allow users to request booking modifications for confirmed bookings at least 48 hours before check-in
2. WHEN a user requests a modification, THE Customer System SHALL check room availability for the new dates and calculate any price difference
3. WHEN a modification increases the booking cost, THE Customer System SHALL process the additional payment through the Payment Gateway
4. WHEN a modification decreases the booking cost, THE Customer System SHALL initiate a partial refund for the difference
5. THE Customer System SHALL send a modification confirmation email to the user and notify the hotel admin of the change within 30 seconds

### Requirement 24: Hotel Comparison Tool

**User Story:** As a traveler evaluating multiple options, I want to compare hotels side-by-side, so that I can make an informed decision.

#### Acceptance Criteria

1. THE Customer System SHALL allow users to select up to 4 hotels for comparison
2. THE Customer System SHALL display a comparison table showing hotel name, images, price, rating, key amenities, and distance from city center
3. THE Customer System SHALL highlight differences between hotels (e.g., unique amenities, price variations)
4. THE Customer System SHALL provide "Book Now" buttons for each hotel in the comparison view
5. THE Customer System SHALL allow users to remove hotels from comparison and add different ones without losing the comparison session

### Requirement 25: Social Sharing

**User Story:** As a traveler, I want to share hotels with friends and family, so that I can get their opinions before booking.

#### Acceptance Criteria

1. THE Customer System SHALL provide social sharing buttons on hotel detail pages for Facebook, Twitter, WhatsApp, and email
2. WHEN a user clicks a social share button, THE Customer System SHALL generate a shareable link with hotel preview image, name, and brief description
3. THE Customer System SHALL track social shares for analytics purposes
4. WHEN a user shares via email, THE Customer System SHALL open the default email client with pre-filled subject and body containing hotel details and link
5. THE Customer System SHALL generate Open Graph meta tags for rich social media previews when links are shared

### Requirement 26: Accessibility Compliance

**User Story:** As a user with disabilities, I want the platform to be accessible, so that I can use all features independently.

#### Acceptance Criteria

1. THE Customer System SHALL comply with WCAG 2.1 Level AA accessibility standards
2. THE Customer System SHALL provide keyboard navigation for all interactive elements with visible focus indicators
3. THE Customer System SHALL include ARIA labels and roles for screen reader compatibility
4. THE Customer System SHALL maintain a minimum color contrast ratio of 4.5:1 for normal text and 3:1 for large text
5. THE Customer System SHALL provide alternative text for all images and meaningful content

### Requirement 27: Performance Optimization

**User Story:** As a user, I want the platform to load quickly and respond smoothly, so that I can browse and book efficiently.

#### Acceptance Criteria

1. THE Customer System SHALL achieve a Lighthouse performance score of at least 85 on desktop and 75 on mobile
2. THE Customer System SHALL implement lazy loading for images below the fold to reduce initial page load time
3. THE Customer System SHALL use Next.js static generation for public pages (homepage, hotel listings) to improve load times
4. THE Customer System SHALL implement API response caching with 5-minute TTL for frequently accessed data (hotel lists, popular destinations)
5. THE Customer System SHALL compress all text-based assets (HTML, CSS, JavaScript) using gzip or brotli compression

### Requirement 28: Security and Data Protection

**User Story:** As a user, I want my personal and payment information to be secure, so that I can use the platform without privacy concerns.

#### Acceptance Criteria

1. THE Customer System SHALL enforce HTTPS for all connections with TLS 1.2 or higher
2. THE Customer System SHALL hash all passwords using bcrypt with a minimum of 10 salt rounds before storage
3. THE Customer System SHALL implement CSRF protection for all state-changing operations
4. THE Customer System SHALL sanitize all user inputs to prevent XSS attacks
5. THE Customer System SHALL never store complete credit card numbers, only storing the last 4 digits and payment gateway transaction IDs

### Requirement 29: Booking Calendar and Availability

**User Story:** As a traveler, I want to see room availability on a calendar, so that I can choose dates when my preferred room type is available.

#### Acceptance Criteria

1. THE Customer System SHALL display an interactive calendar on hotel detail pages showing room availability for the next 12 months
2. THE Customer System SHALL visually distinguish between available dates (green), partially available dates (yellow), and fully booked dates (red)
3. WHEN a user selects check-in and check-out dates, THE Customer System SHALL highlight the selected date range and show available room types with pricing
4. THE Customer System SHALL update availability in real-time when other users complete bookings
5. THE Customer System SHALL display pricing variations on the calendar (e.g., weekend rates, holiday rates, seasonal pricing)

### Requirement 30: Tour and Activity Booking

**User Story:** As a traveler, I want to book tours and activities in addition to hotels, so that I can plan my complete travel experience in one place.

#### Acceptance Criteria

1. THE Customer System SHALL provide a tours section with searchable tour listings including destination, duration, price, and difficulty level
2. THE Customer System SHALL allow users to book tours with date selection, participant count, and optional add-ons
3. THE Customer System SHALL display tour details including itinerary, inclusions, exclusions, meeting point, and cancellation policy
4. THE Customer System SHALL integrate tour bookings with hotel bookings, allowing users to create complete travel packages
5. THE AI Engine SHALL recommend relevant tours based on the user's hotel booking destination and travel dates

### Requirement 31: Budget-Based Tour Recommendations

**User Story:** As a tourist with a specific budget, I want to receive personalized tour recommendations that fit within my spending limits, so that I can plan my trip without exceeding my financial constraints.

#### Acceptance Criteria

1. WHEN a user provides their total budget and travel dates, THE AI Engine SHALL generate tour recommendations that stay within 90% of the specified budget
2. WHEN calculating recommendations, THE AI Engine SHALL include all costs (tours, transportation, accommodation, meals) with transparent pricing
3. IF the user's budget is insufficient for their preferences, THE AI Engine SHALL suggest alternative lower-cost options or shorter itineraries
4. WHEN budget constraints change, THE AI Engine SHALL update recommendations in real-time within 3 seconds
5. WHEN displaying recommendations, THE AI Engine SHALL show remaining budget after each suggested activity

### Requirement 32: Multi-Role User Authentication and Authorization System

**User Story:** As a platform user, I want to access the system with role-based permissions (Super Admin, Admin, Tourist), so that I can use features appropriate to my role while maintaining system security.

#### Acceptance Criteria

1. WHEN registering, THE Customer System SHALL support three user types: Super Admin, Admin, and Tourist with distinct authentication flows
2. WHEN tourists access without login, THE Customer System SHALL show only the home page and require login/registration for booking features
3. WHEN users register, THE Customer System SHALL offer manual registration, Google OAuth, and Facebook OAuth options for tourists only
4. WHEN authenticating, THE Customer System SHALL use JWT Token with secrets from environment configuration for secure session management
5. WHEN accessing features, THE Customer System SHALL enforce Role-Based Access with appropriate permissions for each user type

### Requirement 33: Enhanced Password Reset System

**User Story:** As a user who has forgotten my password, I want to reset it using either my phone number or email address, so that I can regain access to my account quickly and securely.

#### Acceptance Criteria

1. WHEN a user clicks "Forgot Password", THE Customer System SHALL allow input of either phone number or email address
2. WHEN a phone number is provided, THE Customer System SHALL send an SMS with a secure reset token link using Twilio within 30 seconds
3. WHEN an email is provided, THE Customer System SHALL send an email with a secure reset token link within 30 seconds
4. WHEN the reset token link is clicked, THE Customer System SHALL automatically redirect to password reset page with pre-validated token
5. WHEN new password is set, THE Customer System SHALL invalidate all existing JWT Tokens and require fresh login with the new password

### Requirement 34: Role-Based Access Control and Permissions

**User Story:** As a system administrator, I want different user roles to have appropriate access levels, so that system security is maintained while users can perform their required functions.

#### Acceptance Criteria

1. WHEN Super Admin logs in, THE Super Admin Dashboard SHALL provide full system access including user management, guide/driver creation, system configuration, and all administrative functions
2. WHEN Admin logs in, THE Hotel Admin Dashboard SHALL provide access to booking management, user support, content management, and operational dashboards
3. WHEN Tourist logs in, THE Customer System SHALL provide access to booking services, AI recommendations, payment processing, and personal account management
4. WHEN Super Admin creates guides, THE Super Admin Dashboard SHALL create guide profiles with Telegram integration for status management without requiring platform login
5. WHEN Super Admin creates transportation providers, THE Super Admin Dashboard SHALL create driver profiles with Telegram bot access for status updates without platform authentication

### Requirement 35: Social Authentication Integration

**User Story:** As a tourist, I want to register and login using my Google or Facebook account, so that I can access the platform quickly without creating new credentials.

#### Acceptance Criteria

1. WHEN selecting Google login, THE Customer System SHALL use Google OAuth 2.0 for secure authentication and profile data retrieval
2. WHEN selecting Facebook login, THE Customer System SHALL use Facebook Login API for authentication and basic profile information
3. WHEN social login is successful, THE Customer System SHALL create or update User Account with social account information
4. WHEN social accounts are linked, THE Customer System SHALL allow users to login using either social authentication or manual credentials
5. WHEN social authentication fails, THE Customer System SHALL provide fallback to manual login with clear error messaging

### Requirement 36: AI-Powered Conversational Interface with Streaming

**User Story:** As a tourist planning my trip, I want to chat with an AI assistant that understands my preferences and provides real-time streaming suggestions, so that I can get personalized help without waiting for human support.

#### Acceptance Criteria

1. WHEN a user starts a conversation, THE AI Engine SHALL provide streaming responses within 2 seconds of user input
2. WHEN discussing preferences, THE AI Engine SHALL remember context from previous messages in the same session
3. IF the user asks about specific locations, THE AI Engine SHALL provide accurate information about tours, hotels, and transportation options
4. WHEN generating itineraries, THE AI Engine SHALL consider user's stated interests, budget, travel dates, and group size
5. WHEN the conversation ends, THE Customer System SHALL save the chat history for future reference

### Requirement 37: Real-Time Event Integration

**User Story:** As a tourist, I want the AI assistant to suggest tours and activities based on current festivals and events happening during my visit, so that I can experience authentic local culture.

#### Acceptance Criteria

1. WHEN generating recommendations, THE AI Engine SHALL prioritize tours that include current festivals or special events
2. WHEN cultural events are scheduled, THE AI Engine SHALL automatically suggest relevant tours and provide cultural context
3. IF events are cancelled or rescheduled, THE AI Engine SHALL update recommendations and notify affected users within 1 hour
4. WHEN displaying event-based tours, THE AI Engine SHALL explain the cultural significance and what to expect
5. WHEN events have limited capacity, THE AI Engine SHALL prioritize booking suggestions based on user preferences

### Requirement 38: Intelligent Itinerary Generation

**User Story:** As a tourist with limited time, I want the AI to create a complete day-by-day itinerary that maximizes my experience while staying within budget, so that I can make the most of my Cambodia visit.

#### Acceptance Criteria

1. WHEN creating itineraries, THE AI Engine SHALL optimize travel routes to minimize transportation time and costs
2. WHEN scheduling activities, THE AI Engine SHALL consider opening hours, travel time between locations, and meal breaks
3. IF weather conditions are unfavorable, THE AI Engine SHALL suggest indoor alternatives or reschedule outdoor activities
4. WHEN generating multi-day itineraries, THE AI Engine SHALL balance different activity types (cultural, adventure, relaxation)
5. WHEN presenting itineraries, THE AI Engine SHALL provide detailed cost breakdowns and booking links for each activity

### Requirement 39: Personalization and Learning

**User Story:** As a returning user, I want the AI assistant to remember my preferences and past bookings, so that I can get increasingly personalized recommendations over time.

#### Acceptance Criteria

1. WHEN a user returns, THE AI Engine SHALL access their booking history and stated preferences from previous sessions
2. WHEN making recommendations, THE AI Engine SHALL avoid suggesting similar tours the user has already booked
3. IF a user frequently books certain types of activities, THE AI Engine SHALL prioritize similar recommendations
4. WHEN users provide feedback on suggestions, THE AI Engine SHALL learn and improve future recommendations
5. WHEN analyzing user behavior, THE AI Engine SHALL identify patterns to enhance the Recommendation Algorithm

### Requirement 40: Multi-Language AI Support

**User Story:** As an international tourist, I want to communicate with the AI assistant in my preferred language, so that I can get help without language barriers.

#### Acceptance Criteria

1. WHEN a user selects a language, THE AI Engine SHALL respond in English, Khmer, or Chinese as requested
2. WHEN translating responses, THE AI Engine SHALL maintain cultural context and local terminology
3. IF the AI Engine doesn't understand a query, THE AI Engine SHALL ask for clarification in the user's selected language
4. WHEN providing tour information, THE AI Engine SHALL include basic local phrases relevant to the activities
5. WHEN discussing cultural sites, THE AI Engine SHALL provide culturally appropriate explanations in the user's language

### Requirement 41: AI Integration with Existing Platform

**User Story:** As a platform user, I want the AI assistant to seamlessly integrate with my existing bookings and account information, so that I can manage everything in one place.

#### Acceptance Criteria

1. WHEN making recommendations, THE AI Engine SHALL access real-time tour availability and pricing from the platform database
2. WHEN users want to book, THE AI Engine SHALL provide direct links to the Customer System booking flow
3. IF a user has existing bookings, THE AI Engine SHALL consider these when suggesting additional activities
4. WHEN generating recommendations, THE AI Engine SHALL use the user's verified guide preferences and past reviews
5. WHEN discussing logistics, THE AI Engine SHALL integrate with the platform's transportation and hotel booking systems

### Requirement 42: AI Performance and Reliability

**User Story:** As a user of the AI assistant, I want fast and reliable responses even during peak usage times, so that I can plan my trip efficiently.

#### Acceptance Criteria

1. WHEN multiple users are active, THE AI Engine SHALL maintain response times under 3 seconds for 95% of queries
2. WHEN the AI Engine is unavailable, THE Customer System SHALL provide fallback responses with basic tour information
3. IF API rate limits are reached, THE AI Engine SHALL queue requests and notify users of expected wait times
4. WHEN processing complex itinerary requests, THE AI Engine SHALL provide progress updates for requests taking longer than 5 seconds
5. WHEN system load is high, THE AI Engine SHALL prioritize paying customers and active bookings

### Requirement 43: Cost Transparency and Booking Integration

**User Story:** As a budget-conscious traveler, I want the AI to provide transparent pricing and seamless booking options, so that I can make informed decisions and complete purchases easily.

#### Acceptance Criteria

1. WHEN displaying prices, THE AI Engine SHALL show all costs including taxes, fees, and tips with "no hidden charges" guarantee
2. WHEN recommending packages, THE AI Engine SHALL compare individual vs. bundled pricing and highlight savings
3. IF prices change during the conversation, THE AI Engine SHALL immediately notify the user and update recommendations
4. WHEN ready to book, THE Customer System SHALL provide one-click booking with pre-filled user information
5. WHEN discussing payment options, THE AI Engine SHALL explain available methods (Stripe, PayPal, Bakong) and processing times

### Requirement 44: Advanced Payment Processing with Multiple Options

**User Story:** As a tourist making a booking, I want flexible payment options including deposits and milestone payments, so that I can book with confidence while managing my budget effectively.

#### Acceptance Criteria

1. WHEN booking a tour, THE Customer System SHALL offer multiple payment options: 50-70% deposit, milestone payments (50%/25%/25%), or full payment with 5% discount
2. WHEN selecting deposit payment, THE Customer System SHALL clearly display remaining balance due date and payment schedule
3. WHEN choosing milestone payments, THE Customer System SHALL automatically schedule payments (50% upfront, 25% one week before, 25% upon arrival)
4. WHEN making full payment upfront, THE Customer System SHALL apply 5% discount and offer bonus services like free airport pickup
5. WHEN any payment is processed, THE Customer System SHALL use escrow protection through Payment Gateway and send immediate confirmation

### Requirement 45: Comprehensive Refund and Cancellation Policy

**User Story:** As a tourist who needs to change plans, I want transparent cancellation policies with fair refund options, so that I can book with confidence knowing my investment is protected.

#### Acceptance Criteria

1. WHEN a user cancels 30+ days before the trip, THE Customer System SHALL process a full refund minus processing fees
2. WHEN a user cancels 7-30 days before the trip, THE Customer System SHALL process a 50% refund with clear policy explanation
3. WHEN a user cancels within 7 days, THE Customer System SHALL process refunds based on deposit vs full payment terms
4. WHEN processing refunds for milestone payments, THE Customer System SHALL refund only payments already made according to the schedule
5. WHEN cancellation affects deposit bookings, THE Customer System SHALL retain deposit but refund any additional payments made

### Requirement 46: Three-Type AI System Architecture

**User Story:** As a tourist, I want access to different types of AI assistance depending on my needs, so that I can get the most appropriate help for my situation.

#### Acceptance Criteria

1. WHEN accessing AI assistance, THE Customer System SHALL provide three distinct AI types: Streaming Chat Assistant, Quick Recommendation Engine, and Event-Based Planner
2. WHEN using the Streaming Chat Assistant, THE Customer System SHALL enable real-time conversations about any booking or travel questions
3. WHEN using Quick Recommendations, THE Customer System SHALL accept destination, budget, group size, and duration inputs to generate instant suggestions
4. WHEN AI recommends events, THE Customer System SHALL include clickable links to book directly from the recommendation
5. WHEN switching between AI types, THE Customer System SHALL maintain user context and preferences across all interactions

### Requirement 47: Real Event Integration and Festival Management

**User Story:** As a tourist interested in cultural experiences, I want to discover and book authentic Cambodian festivals and events, so that I can experience local culture during my visit.

#### Acceptance Criteria

1. WHEN browsing events, THE Customer System SHALL display current and upcoming festivals including Khmer New Year and popular cultural events
2. WHEN AI makes recommendations, THE AI Engine SHALL automatically include relevant festivals happening during the user's travel dates
3. IF clicking on an event recommendation, THE Customer System SHALL redirect to the specific event booking page
4. WHEN events are seasonal, THE Customer System SHALL provide historical information and suggest optimal timing for future visits
5. WHEN booking event-related tours, THE Customer System SHALL provide cultural context and preparation guidelines

### Requirement 48: Comprehensive Admin Dashboard System

**User Story:** As an administrator, I want complete oversight of hotels, bookings, and real-time operations, so that I can manage the platform effectively and ensure quality service.

#### Acceptance Criteria

1. WHEN accessing the Hotel Admin Dashboard, THE Hotel Admin Dashboard SHALL display real-time hotel availability, current bookings, and user activity
2. WHEN managing hotels, THE Hotel Admin Dashboard SHALL enable admins to create, edit, and monitor hotel listings with real-time booking status
3. IF viewing bookings, THE Hotel Admin Dashboard SHALL show detailed information about users who have booked and their Booking Status
4. WHEN monitoring operations, THE Hotel Admin Dashboard SHALL provide real-time notifications for new bookings, cancellations, and payment issues
5. WHEN generating reports, THE Hotel Admin Dashboard SHALL provide analytics on occupancy rates, revenue, and user satisfaction

### Requirement 49: Transportation and Guide Management System

**User Story:** As a transportation/guide manager, I want to efficiently manage drivers and guides with real-time status updates, so that I can optimize resource allocation and service quality.

#### Acceptance Criteria

1. WHEN adding transportation, THE Super Admin Dashboard SHALL accept vehicle details (tuk tuk, car), seat capacity, and driver information
2. WHEN managing guides, THE Super Admin Dashboard SHALL track guide specializations, languages, and availability status
3. IF resources are working, THE Super Admin Dashboard SHALL automatically change their status to "unavailable" and update across all booking systems
4. WHEN viewing the dashboard, THE Super Admin Dashboard SHALL display real-time status of all drivers and guides with availability indicators
5. WHEN resources become available, THE Super Admin Dashboard SHALL automatically update booking availability and send notifications

### Requirement 50: Telegram Bot Status Management

**User Story:** As a driver or guide created by super admin, I want to easily update my work status through Telegram using my Telegram identity, so that I can manage my availability without needing to login to the main platform.

#### Acceptance Criteria

1. WHEN connecting to Telegram bot, THE Telegram Bot SHALL authenticate drivers and guides using their Telegram user ID and username as identity verification
2. WHEN work is completed, THE Telegram Bot SHALL allow users to click "Done" button to automatically update their status to "Available" in the Super Admin Dashboard
3. IF starting work, THE Telegram Bot SHALL allow users to click "In Progress" to update status to "Unavailable" across all booking systems
4. WHEN status changes, THE Super Admin Dashboard SHALL receive real-time notifications with timestamp and Telegram user details
5. WHEN bot commands are used, THE Telegram Bot SHALL provide confirmation messages and current status updates without requiring platform login

### Requirement 51: Google Calendar Integration and Reminders

**User Story:** As a tourist with confirmed bookings, I want automatic calendar reminders for my trips, so that I don't miss my scheduled activities and can prepare accordingly.

#### Acceptance Criteria

1. WHEN a booking is confirmed, THE Customer System SHALL automatically create Google Calendar events with trip details
2. WHEN adding to calendar, THE Customer System SHALL include location, guide contact information, and preparation instructions
3. IF the user prefers, THE Customer System SHALL send additional SMS and email reminders 24 hours before the trip
4. WHEN trips are cancelled or rescheduled, THE Customer System SHALL automatically update or remove calendar events
5. WHEN multiple bookings exist, THE Customer System SHALL show a complete itinerary with travel time between activities

### Requirement 52: Post-Trip Feedback and Rating System

**User Story:** As a tourist who has completed a trip, I want to easily provide feedback and ratings, so that I can help future travelers and improve service quality.

#### Acceptance Criteria

1. WHEN a trip is completed, THE Customer System SHALL automatically prompt users for feedback within 24 hours
2. WHEN providing ratings, THE Customer System SHALL allow users to rate from 1-5 stars for guide, transportation, overall experience, and value for money
3. IF writing reviews, THE Customer System SHALL allow users to add detailed comments about their experience
4. WHEN feedback is submitted, THE Customer System SHALL update guide and service provider ratings in real-time
5. WHEN reviews are published, THE Customer System SHALL display them to future customers with verification badges for confirmed bookings

### Requirement 53: Technology Stack Implementation

**User Story:** As a developer, I want to use modern, scalable technologies that ensure performance and maintainability, so that the platform can grow and adapt to user needs.

#### Acceptance Criteria

1. WHEN building the backend, THE Customer System SHALL use TypeScript with Node.js and Express framework
2. WHEN managing data, THE Customer System SHALL use Sequelize ORM with MySQL database for reliable data operations
3. IF uploading media, THE Customer System SHALL use Cloudinary for image and video storage with optimization
4. WHEN building the frontend, THE Customer System SHALL use React with Next.js for optimal performance and SEO
5. WHEN developing mobile apps, THE Customer System SHALL use Flutter for cross-platform compatibility and native performance

### Requirement 54: Analytics and Improvement

**User Story:** As a platform administrator, I want to track AI assistant usage and effectiveness, so that I can continuously improve the service and user experience.

#### Acceptance Criteria

1. WHEN users interact with the AI Engine, THE Super Admin Dashboard SHALL track conversation length, topics discussed, and booking conversion rates
2. WHEN recommendations are made, THE Super Admin Dashboard SHALL monitor which suggestions lead to actual bookings
3. IF users abandon conversations, THE Super Admin Dashboard SHALL analyze exit points to identify improvement opportunities
4. WHEN collecting feedback, THE Customer System SHALL allow users to rate AI responses and provide improvement suggestions
5. WHEN generating reports, THE Super Admin Dashboard SHALL display AI performance metrics and user satisfaction scores

### Requirement 55: Comprehensive Booking Flow System

**User Story:** As a tourist, I want multiple ways to create and customize my bookings, so that I can plan my trip exactly how I want it whether through AI recommendations or manual customization.

#### Acceptance Criteria

1. WHEN using AI recommendations, THE Customer System SHALL allow users to click on recommended events and customize details before payment
2. WHEN booking through AI suggestions, THE Customer System SHALL allow users to modify dates, group size, add services, or remove components
3. WHEN creating manual bookings, THE Customer System SHALL provide a complete customization interface for building tours from scratch
4. WHEN customizing any booking, THE Customer System SHALL recalculate pricing in real-time and show payment options (deposit, milestone, full)
5. WHEN finalizing any booking type, THE Customer System SHALL display complete itinerary, terms & conditions, and payment schedule before confirmation

### Requirement 56: Google Maps Integration for Booking and Transportation

**User Story:** As a tourist and service provider, I want integrated Google Maps functionality for location selection, route planning, and real-time tracking, so that I can navigate and coordinate effectively.

#### Acceptance Criteria

1. WHEN booking transportation, THE Customer System SHALL use Google Maps for pickup/dropoff location selection with address autocomplete
2. WHEN drivers accept bookings, THE Telegram Bot SHALL provide Google Maps navigation with optimal route planning
3. WHEN tours are in progress, THE Customer System SHALL show real-time location tracking for tourists and guides using Google Maps
4. WHEN planning custom itineraries, THE AI Engine SHALL display locations on Google Maps with distance and travel time calculations
5. WHEN emergencies occur, THE Customer System SHALL use Google Maps to share precise location coordinates with emergency contacts

### Requirement 57: Payment Milestone and Escrow Management

**User Story:** As a tourist making significant travel investments, I want secure payment processing with escrow protection and flexible payment schedules, so that I can book confidently while managing cash flow.

#### Acceptance Criteria

1. WHEN selecting milestone payments, THE Customer System SHALL automatically schedule and process payments according to the chosen plan
2. WHEN payments are held in escrow, THE Payment Gateway SHALL release funds to service providers only after service delivery confirmation
3. WHEN deposit payments are made, THE Customer System SHALL send automated reminders for remaining balance payments
4. WHEN full payment discounts are offered, THE Customer System SHALL automatically apply bonuses like free airport pickup or upgrades
5. WHEN any payment milestone is missed, THE Customer System SHALL send notifications and provide grace period options before booking cancellation

### Requirement 58: User Database Schema and Role Management

**User Story:** As a system architect, I want a well-structured user database that supports login users and separate tables for guides/drivers, so that the platform can efficiently manage different user types and their data.

#### Acceptance Criteria

1. WHEN designing the users table, THE Customer System SHALL include user_type field with enum values: 'super_admin', 'admin', 'tourist' for login-enabled users
2. WHEN storing authentication data, THE Customer System SHALL include fields for email, phone, password_hash, google_id, facebook_id, and jwt_refresh_token for login users
3. WHEN creating guides table, THE Super Admin Dashboard SHALL include guide_id, name, specializations, telegram_user_id, telegram_username, status, and created_by_admin fields
4. WHEN creating transportation table, THE Super Admin Dashboard SHALL include driver_id, name, vehicle_type, telegram_user_id, telegram_username, status, and created_by_admin fields
5. WHEN implementing security, THE Customer System SHALL use bcrypt for password hashing for login users and Telegram identity verification for guides/drivers

### Requirement 59: Guest Access and Login Enforcement

**User Story:** As a platform visitor, I want to browse the home page without registration, but understand that I need to login to access booking features, so that I can explore the platform before committing to registration.

#### Acceptance Criteria

1. WHEN visiting the platform without login, THE Customer System SHALL show the home page with general information and tour previews
2. WHEN attempting to book or access AI features, THE Customer System SHALL redirect to login/registration page with clear messaging
3. WHEN on the login page, THE Customer System SHALL display options for manual login, Google OAuth, Facebook OAuth, and registration
4. WHEN registration is required, THE Customer System SHALL clearly explain the benefits of creating a User Account for tourists
5. WHEN login is successful, THE Customer System SHALL redirect users to their intended destination with appropriate role-based interface

### Requirement 60: Super Admin Guide and Driver Management

**User Story:** As a super admin, I want to create and manage guide and driver profiles that integrate with Telegram bot, so that I can efficiently manage service providers without requiring them to have platform accounts.

#### Acceptance Criteria

1. WHEN creating a guide, THE Super Admin Dashboard SHALL accept name, specializations, contact info, and Telegram username for bot integration
2. WHEN creating a driver, THE Super Admin Dashboard SHALL accept name, vehicle details, capacity, and Telegram username for status management
3. WHEN guides/drivers are created, THE Super Admin Dashboard SHALL automatically link them to the Telegram Bot using their Telegram user ID
4. WHEN viewing guide/driver dashboards, THE Super Admin Dashboard SHALL display real-time status, booking history, and performance metrics
5. WHEN guides/drivers update status via Telegram Bot, THE Super Admin Dashboard SHALL immediately reflect changes in the admin dashboard and booking availability

### Requirement 61: Super Admin Event Management System

**User Story:** As a super admin, I want complete CRUD (Create, Read, Update, Delete) control over events in the system, so that I can manage all cultural events, festivals, and activities available for booking.

#### Acceptance Criteria

1. WHEN creating events, THE Super Admin Dashboard SHALL accept event details including name, description, dates, location, pricing, and capacity
2. WHEN updating events, THE Super Admin Dashboard SHALL allow modification of any event information including rescheduling and price changes
3. WHEN viewing events, THE Super Admin Dashboard SHALL display a comprehensive list with status, booking counts, and revenue information
4. WHEN deleting events, THE Super Admin Dashboard SHALL handle existing bookings appropriately with refund processing if necessary
5. WHEN events are modified, THE Super Admin Dashboard SHALL automatically notify affected users and update AI Engine recommendation systems

### Requirement 62: Promo Code and Discount Management System

**User Story:** As a super admin, I want to create and manage promotional codes and discounts, so that I can offer special pricing to attract customers and reward loyalty.

#### Acceptance Criteria

1. WHEN creating promo codes, THE Super Admin Dashboard SHALL accept code name, discount percentage/amount, validity dates, and usage limits
2. WHEN tourists apply promo codes, THE Customer System SHALL validate the code and apply appropriate discounts to their booking total
3. WHEN managing discounts, THE Super Admin Dashboard SHALL enable creation of seasonal promotions, first-time user discounts, and bulk booking discounts
4. WHEN promo codes expire, THE Super Admin Dashboard SHALL automatically deactivate them and prevent further usage
5. WHEN tracking promotions, THE Super Admin Dashboard SHALL display usage statistics, revenue impact, and customer acquisition metrics

### Requirement 63: Backend Architecture with Separated Controllers

**User Story:** As a developer, I want a well-organized backend architecture with separated routes and controllers, so that the codebase is maintainable and follows best practices.

#### Acceptance Criteria

1. WHEN structuring the backend, THE Customer System SHALL implement separate controller files for each major functionality area
2. WHEN organizing routes, THE Customer System SHALL have dedicated route files that import and use appropriate controllers
3. WHEN implementing controllers, THE Customer System SHALL handle specific business logic: AuthController, BookingController, EventController, AdminController, AIController
4. WHEN managing user roles, THE Customer System SHALL implement role-specific methods and middleware for access control
5. WHEN handling requests, THE Customer System SHALL delegate business logic to controllers while maintaining clean separation of concerns

### Requirement 64: Multi-Platform Application Development

**User Story:** As a user, I want to access the DerLg platform through website and mobile app, so that I can book tours and manage my travel plans from any device.

#### Acceptance Criteria

1. WHEN developing the website, THE Customer System SHALL use React with Next.js for optimal performance and SEO
2. WHEN building the mobile app, THE Customer System SHALL use Flutter for cross-platform compatibility on iOS and Android
3. WHEN deploying mobile app, THE Customer System SHALL prioritize Google Play Store first, followed by Apple App Store
4. WHEN accessing features, THE Customer System SHALL provide identical functionality across web and mobile with platform-optimized user interfaces
5. WHEN syncing data, THE Customer System SHALL synchronize User Account and bookings across web and mobile platforms

### Requirement 65: Comprehensive Payment System with Multiple Methods

**User Story:** As a tourist, I want flexible payment options including deposits, milestones, and full payment with different methods (PayPal, Bakong), so that I can book confidently while managing my budget.

#### Acceptance Criteria

1. WHEN booking tours, THE Customer System SHALL offer three payment options: 50-70% deposit, milestone payments (50%/25%/25%), or full payment with 5% discount
2. WHEN processing payments, THE Customer System SHALL support PayPal, Bakong (KHQR), and Visa card payments
3. WHEN using Bakong, THE Customer System SHALL integrate with merchant ID "choeng_rayu@aclb" and phone "+855969983479" for individual payments
4. WHEN payment is successful, THE Customer System SHALL send immediate confirmation notifications to users
5. WHEN payments are held, THE Payment Gateway SHALL use escrow protection until service delivery

### Requirement 66: Advanced Cancellation and Refund Policy

**User Story:** As a tourist who needs to change plans, I want clear cancellation policies with fair refunds based on timing, so that I can book with confidence knowing my investment is protected.

#### Acceptance Criteria

1. WHEN canceling 30+ days before trip, THE Customer System SHALL process full refund minus processing fees
2. WHEN canceling 7-30 days before trip, THE Customer System SHALL process 50% refund with clear policy explanation
3. WHEN canceling within 7 days, THE Customer System SHALL allow cancellation but provide only 50% refund or no refund based on payment type
4. WHEN processing refunds, THE Customer System SHALL handle PayPal and Bakong refunds according to their respective policies
5. WHEN refunds are processed, THE Customer System SHALL send confirmation notifications and update Booking Status

### Requirement 67: Post-Trip Feedback with Payment Verification

**User Story:** As a tourist who completed a trip, I want to provide feedback and ratings with verified payment status, so that I can help future travelers and improve service quality.

#### Acceptance Criteria

1. WHEN trip is completed, THE Customer System SHALL automatically prompt users for feedback within 24 hours
2. WHEN providing feedback, THE Customer System SHALL allow users to rate from 1-5 stars and write detailed comments
3. WHEN feedback is submitted, THE Customer System SHALL update service provider ratings and display reviews to future customers
4. WHEN payment verification is needed, THE Customer System SHALL check Bakong/PayPal payment status and send success notifications
5. WHEN reviews are published, THE Customer System SHALL display them with verification badges for confirmed bookings

### Requirement 68: Three-Type AI System with ChatGPT Integration

**User Story:** As a tourist, I want access to three different AI assistants (Streaming Chat, Quick Recommendations, Event-Based Planning), so that I can get the most appropriate help for my travel planning needs.

#### Acceptance Criteria

1. WHEN using AI Streaming Chat, THE AI Engine SHALL provide real-time conversations with ChatGPT for any booking or travel questions
2. WHEN using Quick Recommendations, THE AI Engine SHALL accept destination, budget, group size, and duration inputs for instant AI suggestions
3. WHEN AI recommends events, THE AI Engine SHALL include clickable links to book directly from the recommendation
4. WHEN AI provides recommendations, THE AI Engine SHALL include real festivals like Khmer New Year and popular cultural events
5. WHEN switching between AI types, THE Customer System SHALL maintain user context and preferences across all interactions

### Requirement 69: Telegram AI Bot Integration

**User Story:** As a user, I want to access AI assistance and booking through Telegram bot, so that I can get help and make bookings directly from my messaging app.

#### Acceptance Criteria

1. WHEN using Telegram bot, THE Telegram Bot SHALL provide AI assistance using bot API "7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM"
2. WHEN chatting with bot, THE Telegram Bot SHALL allow users to select different AI model types for recommendations or assistance
3. WHEN booking through Telegram, THE Telegram Bot SHALL enable payment completion using Bakong KHQR scanning, PayPal, or Visa card input
4. WHEN payments are processed, THE Telegram Bot SHALL provide confirmation and booking details
5. WHEN using bot services, THE Telegram Bot SHALL provide all features including AI recommendations, booking, and payment processing

### Requirement 70: Multi-Currency and Multi-Language Support

**User Story:** As an international tourist, I want to view prices in KHR or USD and use the platform in English, Khmer, or Chinese, so that I can understand and book services in my preferred language and currency.

#### Acceptance Criteria

1. WHEN viewing prices, THE Customer System SHALL display amounts in both KHR and USD with real-time conversion rates
2. WHEN selecting language, THE Customer System SHALL allow users to choose between English, Khmer, and Chinese with complete translation coverage
3. WHEN switching currency, THE Customer System SHALL update all prices, payment forms, and financial displays accordingly
4. WHEN using different languages, THE Customer System SHALL maintain cultural context and local terminology appropriately
5. WHEN processing payments, THE Payment Gateway SHALL handle currency conversion for international payment methods

### Requirement 71: Google Maps Integration for Booking and Navigation

**User Story:** As a tourist and service provider, I want integrated Google Maps for location selection, route planning, and navigation, so that I can easily find and reach destinations.

#### Acceptance Criteria

1. WHEN booking tours, THE Customer System SHALL use Google Maps for pickup/dropoff location selection with address autocomplete
2. WHEN drivers receive bookings, THE Telegram Bot SHALL provide Google Maps navigation with optimal route planning
3. WHEN tours are active, THE Customer System SHALL provide real-time location tracking using Google Maps integration
4. WHEN planning itineraries, THE AI Engine SHALL calculate distances and travel times between locations using Google Maps
5. WHEN emergencies occur, THE Customer System SHALL share precise GPS coordinates through Google Maps

### Requirement 72: Google Calendar Integration and Automated Reminders

**User Story:** As a tourist with confirmed bookings, I want automatic Google Calendar events and reminders, so that I don't miss my scheduled activities.

#### Acceptance Criteria

1. WHEN bookings are confirmed, THE Customer System SHALL automatically create Google Calendar events with trip details
2. WHEN adding to calendar, THE Customer System SHALL include location, guide contact, and preparation instructions
3. WHEN trips approach, THE Customer System SHALL send reminder notifications 24 hours before scheduled activities
4. WHEN bookings change, THE Customer System SHALL automatically update or remove calendar events
5. WHEN multiple bookings exist, THE Customer System SHALL display complete itinerary with travel times

### Requirement 73: Comprehensive Admin Dashboard with Real-Time Management

**User Story:** As an admin, I want complete oversight of hotels, bookings, guides, and transportation with real-time updates, so that I can manage operations effectively.

#### Acceptance Criteria

1. WHEN accessing admin dashboard, THE Hotel Admin Dashboard SHALL display real-time hotel availability, bookings, and user activity
2. WHEN managing hotels, THE Hotel Admin Dashboard SHALL enable admins to create, edit, and monitor hotel listings with Booking Status
3. WHEN viewing transportation, THE Super Admin Dashboard SHALL accept driver details (tuk tuk, car), seats, and availability status
4. WHEN managing guides, THE Super Admin Dashboard SHALL track specializations, languages, and real-time availability
5. WHEN resources update status, THE Super Admin Dashboard SHALL receive immediate notifications from Telegram Bot updates

### Requirement 74: Super Admin Analytics and Reporting

**User Story:** As a super admin, I want comprehensive analytics and reporting capabilities, so that I can track business performance and make informed decisions.

#### Acceptance Criteria

1. WHEN viewing analytics, THE Super Admin Dashboard SHALL display hotel occupancy, transportation utilization, guide performance, and revenue metrics
2. WHEN tracking income, THE Super Admin Dashboard SHALL display detailed financial reports with income and outcome analysis
3. WHEN monitoring activities, THE Super Admin Dashboard SHALL provide access to complete activity logs for all system operations
4. WHEN generating reports, THE Super Admin Dashboard SHALL export data as PDF or Excel files for external analysis
5. WHEN analyzing performance, THE Super Admin Dashboard SHALL provide insights on popular events, customer satisfaction, and booking trends

### Requirement 75: Deployment and Domain Configuration

**User Story:** As a system administrator, I want the platform deployed on Digital Ocean with proper domain configuration, so that users can access the service reliably.

#### Acceptance Criteria

1. WHEN deploying backend, THE Customer System SHALL be hosted on Digital Ocean droplet using Ubuntu server
2. WHEN deploying frontend, THE Customer System SHALL be hosted on Digital Ocean with proper SSL configuration
3. WHEN configuring domain, THE Customer System SHALL use "derlg.com" from NameCheap with proper DNS settings
4. WHEN setting up database, THE Customer System SHALL use MySQL hosted on Digital Ocean droplet with proper security configurations
5. WHEN monitoring traffic, THE Customer System SHALL integrate Google Analytics using tracking ID "G-CS4CQ72GZ6"

### Requirement 76: Additional Glossary Terms

**User Story:** As a system user, I want clear definitions of all technical terms used in the platform, so that I can understand system functionality and documentation.

#### Additional Glossary Terms

- **Telegram Bot**: The automated messaging interface that allows guides and drivers to update their status and users to access AI assistance and booking features through Telegram
- **Milestone Payment**: A payment schedule option where the total booking cost is split into multiple payments (typically 50%/25%/25%) at different time intervals
- **Escrow Protection**: A secure payment holding mechanism where funds are held by the Payment Gateway until service delivery is confirmed
- **Bakong**: Cambodia's national payment system (KHQR) integrated for local payment processing
- **Twilio**: The SMS service provider used for sending password reset codes and booking reminders via text message
- **Cloudinary**: The cloud-based media management service used for storing and optimizing hotel images and tour photos
- **Sequelize ORM**: The Object-Relational Mapping library used to interact with the MySQL database
- **Flutter**: The cross-platform mobile development framework used to build iOS and Android applications
- **Google OAuth 2.0**: The authentication protocol used for secure Google account login integration
- **Facebook Login API**: The authentication service used for secure Facebook account login integration
- **WCAG 2.1 Level AA**: Web Content Accessibility Guidelines standard ensuring the platform is accessible to users with disabilities
- **Lighthouse Score**: Google's performance metric measuring website speed, accessibility, and best practices
- **CSRF Protection**: Cross-Site Request Forgery security measures preventing unauthorized state-changing operations
- **XSS Attack**: Cross-Site Scripting vulnerability that the platform protects against through input sanitization
- **TLS 1.2**: Transport Layer Security protocol version ensuring encrypted HTTPS connections
- **Bcrypt**: The password hashing algorithm used to securely store user passwords
- **Socket.io**: The real-time communication library used for instant messaging between hotels and customers
- **Collaborative Filtering**: The machine learning technique used by the AI Engine to recommend hotels based on similar user preferences
- **Sentiment Analysis Score**: A numerical value (0.0-1.0) representing the emotional tone of customer reviews
- **Confidence Score**: A percentage (0-100) indicating the AI Engine's certainty in a recommendation's relevance
- **Digital Ocean Droplet**: The virtual private server instance hosting the platform's backend and database
- **Google Analytics Tracking ID**: The unique identifier (G-CS4CQ72GZ6) used to monitor platform traffic and user behavior

### Requirement 31: Budget-Based AI Tour Recommendations

**User Story:** As a tourist with a specific budget, I want to receive personalized tour recommendations that fit within my spending limits, so that I can plan my trip without exceeding my financial constraints.

#### Acceptance Criteria

1. WHEN a user provides their total budget and travel dates, THE AI Engine SHALL generate tour recommendations that stay within 90% of the specified budget
2. WHEN calculating recommendations, THE AI Engine SHALL include all costs (tours, transportation, accommodation, meals) with transparent pricing breakdown
3. IF the user's budget is insufficient for their preferences, THE AI Engine SHALL suggest alternative lower-cost options or shorter itineraries
4. WHEN budget constraints change, THE AI Engine SHALL update recommendations in real-time within 3 seconds
5. WHEN displaying recommendations, THE Customer System SHALL show remaining budget after each suggested activity

### Requirement 32: Multi-Role User Authentication System

**User Story:** As a platform user, I want to access the system with role-based permissions (Super Admin, Admin, Tourist), so that I can use features appropriate to my role while maintaining system security.

#### Acceptance Criteria

1. WHEN registering, THE Customer System SHALL support three user types: super_admin, admin, and tourist with distinct permission levels
2. WHEN tourists access without login, THE Customer System SHALL show only the homepage and require authentication for booking features
3. WHEN users register, THE Customer System SHALL offer manual registration, Google OAuth, and Facebook OAuth options for tourists only
4. WHEN authenticating, THE Customer System SHALL use JWT tokens with secrets from environment configuration for secure session management
5. WHEN accessing features, THE Customer System SHALL enforce role-based permissions with appropriate access controls for each user type

### Requirement 33: Enhanced Password Reset System

**User Story:** As a user who has forgotten my password, I want to reset it using either my phone number or email address, so that I can regain access to my account quickly and securely.

#### Acceptance Criteria

1. WHEN a user clicks "Forgot Password", THE Customer System SHALL allow input of either phone number or email address
2. WHEN a phone number is provided, THE Customer System SHALL send an SMS with a secure reset token link using Twilio within 30 seconds
3. WHEN an email is provided, THE Customer System SHALL send an email with a secure reset token link within 30 seconds
4. WHEN the reset token link is clicked, THE Customer System SHALL automatically redirect to password reset page with pre-validated token
5. WHEN new password is set, THE Customer System SHALL invalidate all existing JWT tokens and require fresh login with the new password

### Requirement 34: Role-Based Access Control and Permissions

**User Story:** As a system administrator, I want different user roles to have appropriate access levels, so that system security is maintained while users can perform their required functions.

#### Acceptance Criteria

1. WHEN Super Admin logs in, THE Super Admin Dashboard SHALL provide full system access including user management, guide/driver creation, system configuration, and all administrative functions
2. WHEN Admin logs in, THE Hotel Admin Dashboard SHALL provide access to booking management, user support, content management, and operational dashboards
3. WHEN Tourist logs in, THE Customer System SHALL provide access to booking services, AI recommendations, payment processing, and personal account management
4. WHEN Super Admin creates guides, THE Super Admin Dashboard SHALL create guide profiles with Telegram integration for status management without requiring platform login
5. WHEN Super Admin creates transportation providers, THE Super Admin Dashboard SHALL create driver profiles with Telegram bot access for status updates without platform authentication

### Requirement 35: Social Authentication Integration

**User Story:** As a tourist, I want to register and login using my Google or Facebook account, so that I can access the platform quickly without creating new credentials.

#### Acceptance Criteria

1. WHEN selecting Google login, THE Customer System SHALL use Google OAuth 2.0 for secure authentication and profile data retrieval
2. WHEN selecting Facebook login, THE Customer System SHALL use Facebook Login API for authentication and basic profile information
3. WHEN social login is successful, THE Customer System SHALL create or update user profile with social account information
4. WHEN social accounts are linked, THE Customer System SHALL allow login using either social authentication or manual credentials
5. WHEN social authentication fails, THE Customer System SHALL provide fallback to manual login with clear error messaging

### Requirement 36: AI-Powered Streaming Conversational Interface

**User Story:** As a tourist planning my trip, I want to chat with an AI assistant that understands my preferences and provides real-time suggestions, so that I can get personalized help without waiting for human support.

#### Acceptance Criteria

1. WHEN a user starts a conversation, THE AI Engine SHALL provide streaming responses within 2 seconds of user input using ChatGPT integration
2. WHEN discussing preferences, THE AI Engine SHALL remember context from previous messages in the same session
3. IF the user asks about specific locations, THE AI Engine SHALL provide accurate information about tours, hotels, and transportation options
4. WHEN generating itineraries, THE AI Engine SHALL consider user's stated interests, budget, travel dates, and group size
5. WHEN the conversation ends, THE Customer System SHALL save the chat history for future reference

### Requirement 37: Real-Time Cultural Event Integration

**User Story:** As a tourist, I want the AI assistant to suggest tours and activities based on current festivals and events happening during my visit, so that I can experience authentic local culture.

#### Acceptance Criteria

1. WHEN generating recommendations, THE AI Engine SHALL prioritize tours that include current festivals such as Khmer New Year or special cultural events
2. WHEN cultural events are scheduled, THE AI Engine SHALL automatically suggest relevant tours and provide cultural context
3. IF events are cancelled or rescheduled, THE AI Engine SHALL update recommendations and notify affected users within 1 hour
4. WHEN displaying event-based tours, THE Customer System SHALL explain the cultural significance and what to expect
5. WHEN events have limited capacity, THE AI Engine SHALL prioritize booking suggestions based on user preferences and booking history

### Requirement 38: Intelligent Itinerary Generation

**User Story:** As a tourist with limited time, I want the AI to create a complete day-by-day itinerary that maximizes my experience while staying within budget, so that I can make the most of my Cambodia visit.

#### Acceptance Criteria

1. WHEN creating itineraries, THE AI Engine SHALL optimize travel routes to minimize transportation time and costs using distance calculations
2. WHEN scheduling activities, THE AI Engine SHALL consider opening hours, travel time between locations, and meal breaks
3. IF weather conditions are unfavorable, THE AI Engine SHALL suggest indoor alternatives or reschedule outdoor activities
4. WHEN generating multi-day itineraries, THE AI Engine SHALL balance different activity types (cultural, adventure, relaxation)
5. WHEN presenting itineraries, THE Customer System SHALL provide detailed cost breakdowns and booking links for each activity

### Requirement 39: AI Personalization and Learning

**User Story:** As a returning user, I want the AI assistant to remember my preferences and past bookings, so that I can get increasingly personalized recommendations over time.

#### Acceptance Criteria

1. WHEN a user returns, THE AI Engine SHALL access their booking history and stated preferences from previous sessions
2. WHEN making recommendations, THE AI Engine SHALL avoid suggesting similar tours the user has already booked
3. IF a user frequently books certain types of activities, THE AI Engine SHALL prioritize similar recommendations
4. WHEN users provide feedback on suggestions, THE AI Engine SHALL learn and improve future recommendations
5. WHEN analyzing user behavior, THE AI Engine SHALL identify patterns to enhance the recommendation algorithm accuracy

### Requirement 40: Multi-Language AI Support

**User Story:** As an international tourist, I want to communicate with the AI assistant in my preferred language, so that I can get help without language barriers.

#### Acceptance Criteria

1. WHEN a user selects a language, THE AI Engine SHALL respond in English, Khmer, or Chinese as requested
2. WHEN translating responses, THE AI Engine SHALL maintain cultural context and local terminology
3. IF the AI Engine doesn't understand a query, THE AI Engine SHALL ask for clarification in the user's selected language
4. WHEN providing tour information, THE AI Engine SHALL include basic local phrases relevant to the activities
5. WHEN discussing cultural sites, THE AI Engine SHALL provide culturally appropriate explanations in the user's language

### Requirement 41: Three-Type AI System Architecture

**User Story:** As a tourist, I want access to different types of AI assistance depending on my needs, so that I can get the most appropriate help for my situation.

#### Acceptance Criteria

1. WHEN accessing AI assistance, THE Customer System SHALL provide three distinct AI types: Streaming Chat Assistant, Quick Recommendation Engine, and Event-Based Planner
2. WHEN using the Streaming Chat Assistant, THE Customer System SHALL enable real-time conversations about any booking or travel questions with ChatGPT integration
3. WHEN using Quick Recommendations, THE Customer System SHALL accept destination, budget, group size, and duration inputs to generate instant suggestions
4. WHEN AI recommends events, THE Customer System SHALL include clickable links to book directly from the recommendation
5. WHEN switching between AI types, THE Customer System SHALL maintain user context and preferences across all interactions

### Requirement 42: Advanced Payment Processing with Multiple Options

**User Story:** As a tourist making a booking, I want flexible payment options including deposits and milestone payments, so that I can book with confidence while managing my budget effectively.

#### Acceptance Criteria

1. WHEN booking a tour, THE Customer System SHALL offer multiple payment options: 50-70% deposit, milestone payments (50%/25%/25%), or full payment with 5% discount
2. WHEN selecting deposit payment, THE Customer System SHALL clearly display remaining balance due date and payment schedule
3. WHEN choosing milestone payments, THE Customer System SHALL automatically schedule payments (50% upfront, 25% one week before, 25% upon arrival)
4. WHEN making full payment upfront, THE Customer System SHALL apply 5% discount and offer bonus services like free airport pickup
5. WHEN any payment is processed, THE Customer System SHALL use escrow protection through Stripe/PayPal/Bakong and send immediate confirmation

### Requirement 43: Multi-Currency Payment Gateway Integration

**User Story:** As a tourist, I want to pay using PayPal, Bakong (KHQR), or Visa card in my preferred currency, so that I can complete bookings conveniently.

#### Acceptance Criteria

1. WHEN processing payments, THE Customer System SHALL support PayPal, Bakong (KHQR), and Visa card payments
2. WHEN using Bakong, THE Customer System SHALL integrate with merchant ID "choeng_rayu@aclb" and phone "+855969983479" for individual payments
3. WHEN displaying prices, THE Customer System SHALL show amounts in both KHR and USD with real-time conversion rates
4. WHEN payment is successful, THE Customer System SHALL send immediate confirmation notifications to users within 30 seconds
5. WHEN payments are held, THE Customer System SHALL use escrow protection through payment gateways until service delivery confirmation

### Requirement 44: Comprehensive Refund and Cancellation Policy

**User Story:** As a tourist who needs to change plans, I want transparent cancellation policies with fair refund options, so that I can book with confidence knowing my investment is protected.

#### Acceptance Criteria

1. WHEN a user cancels 30+ days before the trip, THE Customer System SHALL process a full refund minus processing fees within 5 business days
2. WHEN a user cancels 7-30 days before the trip, THE Customer System SHALL process a 50% refund with clear policy explanation
3. WHEN a user cancels within 7 days, THE Customer System SHALL process refunds based on deposit vs full payment terms
4. WHEN processing refunds for milestone payments, THE Customer System SHALL refund only payments already made according to the schedule
5. WHEN cancellation affects deposit bookings, THE Customer System SHALL retain deposit but refund any additional payments made

### Requirement 45: Telegram Bot Integration for Tourists

**User Story:** As a user, I want to access AI assistance and booking through Telegram bot, so that I can get help and make bookings directly from my messaging app.

#### Acceptance Criteria

1. WHEN using Telegram bot, THE Customer System SHALL provide access using bot API "7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM"
2. WHEN chatting with bot, THE Customer System SHALL allow users to select different AI model types for recommendations or assistance
3. WHEN booking through Telegram, THE Customer System SHALL enable payment completion using Bakong KHQR scanning, PayPal, or Visa card input
4. WHEN payments are processed through Telegram, THE Customer System SHALL provide confirmation and booking details
5. WHEN using bot services, THE Customer System SHALL provide all features including AI recommendations, booking, and payment processing

### Requirement 46: Telegram Bot Status Management for Guides and Drivers

**User Story:** As a driver or guide created by super admin, I want to easily update my work status through Telegram using my Telegram identity, so that I can manage my availability without needing to login to the main platform.

#### Acceptance Criteria

1. WHEN connecting to Telegram bot, THE Super Admin Dashboard SHALL authenticate drivers and guides using their Telegram user ID and username as identity verification
2. WHEN work is completed, THE Telegram bot SHALL allow users to click "Done" button to automatically update their status to "Available" in the main system
3. IF starting work, THE Telegram bot SHALL allow users to click "In Progress" to update status to "Unavailable" across all booking systems
4. WHEN status changes, THE Hotel Admin Dashboard SHALL receive real-time notifications with timestamp and Telegram user details
5. WHEN bot commands are used, THE Telegram bot SHALL provide confirmation messages and current status updates without requiring platform login

### Requirement 47: Google Maps Integration for Booking and Navigation

**User Story:** As a tourist and service provider, I want integrated Google Maps functionality for location selection, route planning, and real-time tracking, so that I can navigate and coordinate effectively.

#### Acceptance Criteria

1. WHEN booking transportation, THE Customer System SHALL use Google Maps for pickup/dropoff location selection with address autocomplete
2. WHEN drivers accept bookings, THE Hotel Admin Dashboard SHALL provide Google Maps navigation with optimal route planning
3. WHEN tours are in progress, THE Customer System SHALL show real-time location tracking for tourists and guides using Google Maps
4. WHEN planning custom itineraries, THE Customer System SHALL display locations on Google Maps with distance and travel time calculations
5. WHEN emergencies occur, THE Customer System SHALL use Google Maps to share precise location coordinates with emergency contacts

### Requirement 48: Google Calendar Integration and Reminders

**User Story:** As a tourist with confirmed bookings, I want automatic calendar reminders for my trips, so that I don't miss my scheduled activities and can prepare accordingly.

#### Acceptance Criteria

1. WHEN a booking is confirmed, THE Customer System SHALL automatically create Google Calendar events with trip details
2. WHEN adding to calendar, THE Customer System SHALL include location, guide contact information, and preparation instructions
3. IF the user prefers, THE Customer System SHALL send additional SMS and email reminders 24 hours before the trip
4. WHEN trips are cancelled or rescheduled, THE Customer System SHALL automatically update or remove calendar events
5. WHEN multiple bookings exist, THE Customer System SHALL display a complete itinerary with travel time between activities

### Requirement 49: Post-Trip Feedback and Rating System

**User Story:** As a tourist who has completed a trip, I want to easily provide feedback and ratings, so that I can help future travelers and improve service quality.

#### Acceptance Criteria

1. WHEN a trip is completed, THE Customer System SHALL automatically prompt users for feedback within 24 hours
2. WHEN providing ratings, THE Customer System SHALL allow users to rate from 1-5 stars for guide, transportation, overall experience, and value for money
3. IF writing reviews, THE Customer System SHALL allow users to add detailed comments about their experience
4. WHEN feedback is submitted, THE Customer System SHALL update guide and service provider ratings in real-time
5. WHEN reviews are published, THE Customer System SHALL display them to future customers with verification badges for confirmed bookings

### Requirement 50: Comprehensive Admin Dashboard System

**User Story:** As an administrator, I want complete oversight of hotels, bookings, and real-time operations, so that I can manage the platform effectively and ensure quality service.

#### Acceptance Criteria

1. WHEN accessing the admin dashboard, THE Hotel Admin Dashboard SHALL display real-time hotel availability, current bookings, and user activity
2. WHEN managing hotels, THE Hotel Admin Dashboard SHALL allow admins to create, edit, and monitor hotel listings with real-time booking status
3. IF viewing bookings, THE Hotel Admin Dashboard SHALL show detailed information about users who have booked and their booking status
4. WHEN monitoring operations, THE Hotel Admin Dashboard SHALL provide real-time notifications for new bookings, cancellations, and payment issues
5. WHEN generating reports, THE Hotel Admin Dashboard SHALL provide analytics on occupancy rates, revenue, and user satisfaction

### Requirement 51: Transportation and Guide Management System

**User Story:** As a transportation/guide manager, I want to efficiently manage drivers and guides with real-time status updates, so that I can optimize resource allocation and service quality.

#### Acceptance Criteria

1. WHEN adding transportation, THE Super Admin Dashboard SHALL allow input of vehicle details (tuk tuk, car), seat capacity, and driver information
2. WHEN managing guides, THE Super Admin Dashboard SHALL track guide specializations, languages, and availability status
3. IF resources are working, THE Super Admin Dashboard SHALL automatically change their status to "unavailable" and update across all booking systems
4. WHEN viewing the dashboard, THE Super Admin Dashboard SHALL display real-time status of all drivers and guides with availability indicators
5. WHEN resources become available, THE Super Admin Dashboard SHALL automatically update booking availability and send notifications

### Requirement 52: Super Admin Event Management System

**User Story:** As a super admin, I want complete CRUD (Create, Read, Update, Delete) control over events in the system, so that I can manage all cultural events, festivals, and activities available for booking.

#### Acceptance Criteria

1. WHEN creating events, THE Super Admin Dashboard SHALL allow input of event details including name, description, dates, location, pricing, and capacity
2. WHEN updating events, THE Super Admin Dashboard SHALL allow modification of any event information including rescheduling and price changes
3. WHEN viewing events, THE Super Admin Dashboard SHALL display a comprehensive list with status, booking counts, and revenue information
4. WHEN deleting events, THE Super Admin Dashboard SHALL handle existing bookings appropriately with refund processing if necessary
5. WHEN events are modified, THE Super Admin Dashboard SHALL automatically notify affected users and update AI recommendation systems

### Requirement 53: Promo Code and Discount Management System

**User Story:** As a super admin, I want to create and manage promotional codes and discounts, so that I can offer special pricing to attract customers and reward loyalty.

#### Acceptance Criteria

1. WHEN creating promo codes, THE Super Admin Dashboard SHALL allow setting code name, discount percentage/amount, validity dates, and usage limits
2. WHEN tourists apply promo codes, THE Customer System SHALL validate the code and apply appropriate discounts to their booking total
3. WHEN managing discounts, THE Super Admin Dashboard SHALL allow creation of seasonal promotions, first-time user discounts, and bulk booking discounts
4. WHEN promo codes expire, THE Super Admin Dashboard SHALL automatically deactivate them and prevent further usage
5. WHEN tracking promotions, THE Super Admin Dashboard SHALL display usage statistics, revenue impact, and customer acquisition metrics

### Requirement 54: Student Discount Program

**User Story:** As a student, I want to apply my school email to receive discounts on tour packages, so that I can explore Cambodia affordably while studying.

#### Acceptance Criteria

1. WHEN a student registers with a school email address, THE Customer System SHALL verify the email domain against a list of recognized educational institutions
2. WHEN verification is successful, THE Customer System SHALL grant the student account eligibility for 3 discount redemptions
3. WHEN a student applies the discount to a booking, THE Customer System SHALL apply the student discount rate and decrement the remaining usage count
4. WHEN a student has used all 3 discounts, THE Customer System SHALL display a message indicating the discount limit has been reached
5. THE Super Admin Dashboard SHALL allow configuration of student discount percentage and eligible email domains

### Requirement 55: User Database Schema and Role Management

**User Story:** As a system architect, I want a well-structured user database that supports login users and separate tables for guides/drivers, so that the platform can efficiently manage different user types and their data.

#### Acceptance Criteria

1. WHEN designing the users table, THE Customer System SHALL include user_type field with enum values: 'super_admin', 'admin', 'tourist' for login-enabled users
2. WHEN storing authentication data, THE Customer System SHALL include fields for email, phone, password_hash, google_id, facebook_id, and jwt_refresh_token for login users
3. WHEN creating guides table, THE Super Admin Dashboard SHALL include guide_id, name, specializations, telegram_user_id, telegram_username, status, and created_by_admin fields
4. WHEN creating transportation table, THE Super Admin Dashboard SHALL include driver_id, name, vehicle_type, telegram_user_id, telegram_username, status, and created_by_admin fields
5. WHEN implementing security, THE Customer System SHALL use bcrypt for password hashing for login users and Telegram identity verification for guides/drivers

### Requirement 56: Guest Access and Login Enforcement

**User Story:** As a platform visitor, I want to browse the home page without registration, but understand that I need to login to access booking features, so that I can explore the platform before committing to registration.

#### Acceptance Criteria

1. WHEN visiting the platform without login, THE Customer System SHALL display the home page with general information and tour previews
2. WHEN attempting to book or access AI features, THE Customer System SHALL redirect to login/registration page with clear messaging
3. WHEN on the login page, THE Customer System SHALL display options for manual login, Google OAuth, Facebook OAuth, and registration
4. WHEN registration is required, THE Customer System SHALL clearly explain the benefits of creating an account for tourists
5. WHEN login is successful, THE Customer System SHALL redirect users to their intended destination with appropriate role-based interface

### Requirement 57: Comprehensive Booking Flow System

**User Story:** As a tourist, I want multiple ways to create and customize my bookings, so that I can plan my trip exactly how I want it whether through AI recommendations or manual customization.

#### Acceptance Criteria

1. WHEN using AI recommendations, THE Customer System SHALL allow users to click on recommended events and customize details before payment
2. WHEN booking through AI suggestions, THE Customer System SHALL allow modification of dates, group size, add services, or remove components
3. WHEN creating manual bookings, THE Customer System SHALL provide a complete customization interface for building tours from scratch
4. WHEN customizing any booking, THE Customer System SHALL recalculate pricing in real-time and show payment options (deposit, milestone, full)
5. WHEN finalizing any booking type, THE Customer System SHALL display complete itinerary, terms & conditions, and payment schedule before confirmation

### Requirement 58: Backend Architecture with Separated Controllers

**User Story:** As a developer, I want a well-organized backend architecture with separated routes and controllers, so that the codebase is maintainable and follows best practices.

#### Acceptance Criteria

1. WHEN structuring the backend, THE Customer System SHALL implement separate controller files for each major functionality area
2. WHEN organizing routes, THE Customer System SHALL have dedicated route files that import and use appropriate controllers
3. WHEN implementing controllers, THE Customer System SHALL create AuthController, BookingController, EventController, AdminController, and AIController
4. WHEN managing user roles, THE Customer System SHALL implement role-specific methods and middleware for access control
5. WHEN handling requests, THE Customer System SHALL delegate business logic to controllers while maintaining clean separation of concerns

### Requirement 59: Technology Stack Implementation

**User Story:** As a developer, I want to use modern, scalable technologies that ensure performance and maintainability, so that the platform can grow and adapt to user needs.

#### Acceptance Criteria

1. WHEN building the backend, THE Customer System SHALL use TypeScript with Node.js and Express framework
2. WHEN managing data, THE Customer System SHALL use Sequelize ORM with MySQL database for reliable data operations
3. IF uploading media, THE Customer System SHALL use Cloudinary for image and video storage with optimization
4. WHEN building the frontend, THE Customer System SHALL use React with Next.js for optimal performance and SEO
5. WHEN developing mobile apps, THE Customer System SHALL use Flutter for cross-platform compatibility and native performance

### Requirement 60: Multi-Platform Application Development

**User Story:** As a user, I want to access the DerLg platform through website and mobile app, so that I can book tours and manage my travel plans from any device.

#### Acceptance Criteria

1. WHEN developing the website, THE Customer System SHALL use React with Next.js for optimal performance and SEO
2. WHEN building the mobile app, THE Customer System SHALL use Flutter for cross-platform compatibility on iOS and Android
3. WHEN deploying mobile app, THE Customer System SHALL prioritize Google Play Store first, followed by Apple App Store
4. WHEN accessing features, THE Customer System SHALL provide identical functionality across web and mobile with platform-optimized user interfaces
5. WHEN syncing data, THE Customer System SHALL synchronize user accounts and bookings across web and mobile platforms in real-time

### Requirement 61: Super Admin Analytics and Reporting

**User Story:** As a super admin, I want comprehensive analytics and reporting capabilities, so that I can track business performance and make informed decisions.

#### Acceptance Criteria

1. WHEN viewing analytics, THE Super Admin Dashboard SHALL display hotel occupancy, transportation utilization, guide performance, and revenue metrics
2. WHEN tracking income, THE Super Admin Dashboard SHALL provide detailed financial reports with income and outcome analysis
3. WHEN monitoring activities, THE Super Admin Dashboard SHALL provide access to complete activity logs for all system operations
4. WHEN generating reports, THE Super Admin Dashboard SHALL allow export of data as PDF or Excel files for external analysis
5. WHEN analyzing performance, THE Super Admin Dashboard SHALL provide insights on popular events, customer satisfaction, and booking trends

### Requirement 62: AI Performance Monitoring and Analytics

**User Story:** As a platform administrator, I want to track AI assistant usage and effectiveness, so that I can continuously improve the service and user experience.

#### Acceptance Criteria

1. WHEN users interact with the AI, THE Super Admin Dashboard SHALL track conversation length, topics discussed, and booking conversion rates
2. WHEN recommendations are made, THE Super Admin Dashboard SHALL monitor which suggestions lead to actual bookings
3. IF users abandon conversations, THE Super Admin Dashboard SHALL analyze exit points to identify improvement opportunities
4. WHEN collecting feedback, THE Customer System SHALL allow users to rate AI responses and provide improvement suggestions
5. WHEN generating reports, THE Super Admin Dashboard SHALL display AI performance metrics and user satisfaction scores

### Requirement 63: Deployment and Domain Configuration

**User Story:** As a system administrator, I want the platform deployed on Digital Ocean with proper domain configuration, so that users can access the service reliably.

#### Acceptance Criteria

1. WHEN deploying backend, THE Customer System SHALL be hosted on Digital Ocean droplet using Ubuntu server
2. WHEN deploying frontend, THE Customer System SHALL be hosted on Digital Ocean with proper SSL configuration
3. WHEN configuring domain, THE Customer System SHALL use "derlg.com" from NameCheap with proper DNS settings
4. WHEN setting up database, THE Customer System SHALL host MySQL on Digital Ocean droplet with proper security configurations
5. WHEN monitoring traffic, THE Customer System SHALL integrate Google Analytics using tracking ID "G-CS4CQ72GZ6"
