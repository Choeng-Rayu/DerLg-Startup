# DerLg.com Customer Frontend

Customer-facing web application for the DerLg Tourism Platform built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 15.5.6 with App Router
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4
- **Build Tool**: Turbopack

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with Header/Footer
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx     # Main navigation header
│   │   │   └── Footer.tsx     # Site footer
│   │   └── ui/                # Reusable UI components
│   │       ├── Button.tsx     # Button component
│   │       ├── Input.tsx      # Input component
│   │       ├── Card.tsx       # Card component
│   │       └── Loading.tsx    # Loading states
│   ├── lib/
│   │   ├── api.ts             # API client utilities
│   │   ├── utils.ts           # Helper functions
│   │   └── constants.ts       # App constants
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── public/                     # Static assets
├── .env.local.example         # Environment variables template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:3000
- AI Engine running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_GA_ID=G-CS4CQ72GZ6
```

### Development

Run the development server with Turbopack:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Features

### Implemented

- ✅ Responsive layout with Header and Footer
- ✅ Next.js 15 App Router structure
- ✅ TypeScript type definitions
- ✅ Tailwind CSS v4 styling
- ✅ Reusable UI components (Button, Input, Card, Loading)
- ✅ API client utilities
- ✅ Helper functions (formatting, validation)
- ✅ Constants and configuration
- ✅ Homepage with hero section and search
- ✅ Mobile-responsive navigation

### To Be Implemented

- [ ] Authentication pages (login, register, password reset)
- [ ] Hotel search and listing pages
- [ ] Hotel detail page with booking
- [ ] Tour and event pages
- [ ] User profile and bookings management
- [ ] AI chat assistant interface
- [ ] Wishlist functionality
- [ ] Payment integration UI
- [ ] Multi-language support (i18n)
- [ ] Social sharing features
- [ ] Accessibility features (WCAG 2.1 AA)

## Key Components

### Layout Components

- **Header**: Sticky navigation with mobile menu, user actions, and main navigation links
- **Footer**: Site footer with links, social media, and company information

### UI Components

- **Button**: Customizable button with variants (primary, secondary, outline, ghost, danger) and sizes
- **Input**: Form input with label, error handling, and helper text
- **Card**: Container component with header, body, and footer sections
- **Loading**: Loading spinner with skeleton loaders for different content types

### Utilities

- **API Client**: Generic API request handlers for backend and AI services
- **Utils**: Helper functions for formatting, validation, and data manipulation
- **Constants**: Centralized configuration for endpoints, amenities, payment options, etc.

## Responsive Design

The application is fully responsive and supports screen widths from 320px to 2560px:

- **Mobile**: < 768px (sm breakpoint)
- **Tablet**: 768px - 1024px (md breakpoint)
- **Desktop**: > 1024px (lg, xl, 2xl breakpoints)

## API Integration

The frontend communicates with two backend services:

1. **Main API** (Node.js/Express): `/api/*` endpoints for hotels, bookings, auth, etc.
2. **AI Engine** (Python/FastAPI): `/api/recommend`, `/api/chat`, `/api/itinerary`

API client provides methods:
- `api.get()`, `api.post()`, `api.put()`, `api.delete()`
- `aiApi.get()`, `aiApi.post()`

Authentication tokens are stored in HTTP-only cookies for security.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_AI_API_URL` | AI Engine URL | `http://localhost:8000` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-CS4CQ72GZ6` |

## Performance

- **Turbopack**: Fast development builds and hot module replacement
- **Image Optimization**: Next.js Image component with Cloudinary integration
- **Code Splitting**: Automatic code splitting with App Router
- **Static Generation**: Pre-render public pages for better performance

## Accessibility

Following WCAG 2.1 Level AA guidelines:
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Color contrast ratios (4.5:1 for normal text)
- Alt text for images

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Follow Tailwind CSS utility-first approach
4. Ensure responsive design for all screen sizes
5. Test on multiple browsers and devices
6. Run linting before committing

## License

Proprietary - DerLg.com
