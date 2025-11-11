# Homepage Quick Start Guide

## Overview
The DerLg.com homepage features a powerful search interface with live suggestions, featured hotels, and popular destinations.

## Quick Start

### 1. Start the Development Server

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 2. Access the Homepage
Navigate to: `http://localhost:3001`

## Features

### Live Search
- Type at least 2 characters in the destination field
- See real-time suggestions for cities and hotels
- Click on a suggestion to select it
- Press Enter or click "Search Hotels" to navigate to results

### Featured Hotels
- Automatically loads top 6 hotels from the backend
- Click any hotel card to view details
- Click "View All Hotels" to see the complete listing

### Popular Destinations
- Click any destination card to search hotels in that area
- Destinations include: Siem Reap, Phnom Penh, Sihanoukville, Battambang, Kampot, Koh Rong

## Component Usage

### Using SearchBar in Other Pages

```tsx
import SearchBar from '@/components/ui/SearchBar';

// With live search enabled (default)
<SearchBar showLiveResults={true} />

// Without live search
<SearchBar showLiveResults={false} />

// With custom search handler
<SearchBar 
  showLiveResults={true}
  onSearch={(params) => {
    console.log('Search params:', params);
    // Custom logic here
  }}
/>
```

### Using FeaturedHotels Component

```tsx
import FeaturedHotels from '@/components/home/FeaturedHotels';

// Simple usage
<FeaturedHotels />
```

### Using PopularDestinations Component

```tsx
import PopularDestinations from '@/components/home/PopularDestinations';

// Simple usage
<PopularDestinations />
```

## API Endpoints

### Get Hotels (Featured)
```
GET /api/hotels?limit=6
```

### Search Hotels (Live Search)
```
GET /api/hotels/search?destination={query}&limit=5
```

## Customization

### Modify Destinations
Edit `frontend/src/components/home/PopularDestinations.tsx`:

```tsx
const destinations: Destination[] = [
  {
    name: 'Your City',
    image: 'https://your-image-url.com',
    description: 'Your description',
    hotelCount: 100,
  },
  // Add more destinations
];
```

### Change Featured Hotels Limit
Edit `frontend/src/components/home/FeaturedHotels.tsx`:

```tsx
// Change limit from 6 to your desired number
const response = await api.get<{ hotels: Hotel[] }>('/api/hotels?limit=12');
```

### Adjust Debounce Delay
Edit `frontend/src/components/ui/SearchBar.tsx`:

```tsx
// Change from 300ms to your desired delay
debounceTimer.current = setTimeout(() => {
  searchDestinations(destination);
}, 500); // 500ms delay
```

## Styling

### Tailwind CSS Classes
All components use Tailwind CSS v4. Key classes:

- `bg-gradient-to-r from-blue-600 to-blue-800` - Hero gradient
- `hover:shadow-xl transition-shadow` - Card hover effects
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Responsive grid

### Custom Styles
Add custom styles in `frontend/src/app/globals.css` if needed.

## Troubleshooting

### Live Search Not Working
1. Check backend is running on port 3000
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for errors
4. Ensure hotels exist in database

### Featured Hotels Not Loading
1. Verify backend API is accessible
2. Check if hotels exist in database with status 'active'
3. Run hotel seeding script: `npm run seed:hotels` (in backend)

### Images Not Displaying
1. Check Cloudinary configuration
2. Verify image URLs in database
3. Check browser console for CORS errors

## Performance Tips

1. **Image Optimization**: Use Cloudinary transformations
2. **Caching**: Implement Redis caching for hotel lists
3. **Lazy Loading**: Images below fold are lazy-loaded
4. **Debouncing**: Search is debounced to reduce API calls

## Accessibility

- All inputs have proper labels
- Keyboard navigation supported
- ARIA labels for screen readers
- Proper color contrast ratios

## Mobile Responsiveness

Tested on:
- iPhone (320px - 428px)
- iPad (768px - 1024px)
- Desktop (1280px+)

## Next Steps

1. Implement AI recommendations integration
2. Add user authentication for personalized results
3. Implement search history
4. Add more filter options
5. Integrate with backend-ai service for smart recommendations

## Support

For issues or questions:
1. Check the main README.md
2. Review API documentation in `backend/docs/`
3. Check component source code for inline comments
