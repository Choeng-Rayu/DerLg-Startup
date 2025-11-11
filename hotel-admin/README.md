# Hotel Admin Dashboard

A comprehensive Next.js fullstack application for hotel administrators to manage bookings, rooms, analytics, and customer communications.

## Features

- **Dashboard Overview**: KPIs including total bookings, revenue, occupancy rates, and customer ratings
- **Booking Management**: View, approve, reject, and manage hotel bookings
- **Room Inventory**: Add, edit, and manage room types and availability
- **Hotel Profile**: Manage hotel information, amenities, and images
- **Customer Messaging**: Real-time messaging with customers
- **Analytics & Reports**: Detailed reports with charts and CSV export
- **Promo Codes**: Create and manage promotional codes
- **Role-Based Access Control**: Secure authentication and authorization

## Tech Stack

- **Framework**: Next.js 15.5.6
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Real-time**: Socket.io
- **Image Storage**: Cloudinary
- **HTTP Client**: Axios
- **Internationalization**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── bookings/          # Booking management
│   ├── rooms/             # Room inventory
│   ├── hotel-profile/     # Hotel profile management
│   ├── messages/          # Customer messaging
│   ├── analytics/         # Reports and analytics
│   ├── promo-codes/       # Promo code management
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── layout/           # Layout components (Sidebar, Header)
│   ├── dashboard/        # Dashboard components
│   └── ...
├── lib/                   # Utility functions
│   └── api.ts            # API client
├── types/                 # TypeScript types
└── middleware.ts          # Authentication middleware
```

## Available Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Linting
npm run lint
```

## Task Implementation Status

- [x] Task 59: Set up Hotel Admin Dashboard structure
- [ ] Task 60: Implement hotel admin dashboard overview
- [ ] Task 61: Implement hotel profile management
- [ ] Task 62: Implement room inventory management
- [ ] Task 63: Implement booking management for hotel admins
- [ ] Task 64: Implement hotel-customer messaging
- [ ] Task 65: Implement analytics and reports
- [ ] Task 66: Implement promo code management for hotel admins

## License

ISC

