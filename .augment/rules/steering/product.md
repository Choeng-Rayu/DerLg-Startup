# Product Overview

DerLg.com is a comprehensive tourism booking platform for Cambodia that connects travelers with hotels, tours, and cultural experiences. The platform consists of four interconnected systems:

## Core Systems

1. **Customer System** (`backend/` + `frontend/` + `mobile_app/`) - Tourist-facing web and mobile applications for browsing, booking, and managing travel experiences. The backend serves both the web frontend and mobile app.

2. **Super Admin Dashboard** (`system-admin/`) - Fullstack Next.js application for platform oversight, managing hotels, users, guides, transportation, events, and analytics. This is a standalone app with its own backend and frontend.

3. **AI Recommendation Engine** (`backend-ai/`) - Dedicated Python FastAPI microservice for AI recommendation processing only, providing personalized recommendations, chatbot assistance, and sentiment analysis.

## Key Features

- Hotel and tour search with advanced filtering
- AI-powered personalized recommendations and chat assistant
- Multi-payment options (PayPal, Bakong/KHQR, Stripe) with flexible payment schedules (deposit, milestone, full)
- Student discount program (3 uses per verified student email)
- Real-time booking management and messaging
- Review and rating system with AI sentiment analysis
- Multi-language support (English, Khmer, Chinese)
- Telegram bot integration for service providers (guides, drivers)
- Cultural events and festivals booking
- Google Calendar integration for booking management

## Target Users

- **Tourists**: International and domestic travelers seeking accommodations and experiences in Cambodia
- **Hotel Administrators**: Property owners and managers
- **Platform Administrators**: DerLg staff managing the entire ecosystem
- **Service Providers**: Tour guides and transportation providers

## Domain

Production domain: derlg.com (hosted on NameCheap)
