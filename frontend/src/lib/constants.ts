// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    GOOGLE: '/api/auth/social/google',
    FACEBOOK: '/api/auth/social/facebook',
  },
  
  // Hotels
  HOTELS: {
    LIST: '/api/hotels',
    SEARCH: '/api/hotels/search',
    DETAIL: (id: string) => `/api/hotels/${id}`,
    AVAILABILITY: (id: string) => `/api/hotels/${id}/availability`,
    ROOMS: (id: string) => `/api/hotels/${id}/rooms`,
  },
  
  // Bookings
  BOOKINGS: {
    CREATE: '/api/bookings',
    LIST: '/api/bookings',
    DETAIL: (id: string) => `/api/bookings/${id}`,
    UPDATE: (id: string) => `/api/bookings/${id}`,
    CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    PAYMENT: (id: string) => `/api/bookings/${id}/payment`,
    PROMO_CODE: (id: string) => `/api/bookings/${id}/promo-code`,
  },
  
  // Tours
  TOURS: {
    LIST: '/api/tours',
    DETAIL: (id: string) => `/api/tours/${id}`,
    BOOK: '/api/bookings/tours',
  },
  
  // Events
  EVENTS: {
    LIST: '/api/events',
    DETAIL: (id: string) => `/api/events/${id}`,
    BY_DATE: (date: string) => `/api/events/date/${date}`,
  },
  
  // Reviews
  REVIEWS: {
    CREATE: '/api/reviews',
    BY_HOTEL: (hotelId: string) => `/api/reviews/hotel/${hotelId}`,
    UPDATE: (id: string) => `/api/reviews/${id}`,
  },
  
  // Wishlist
  WISHLIST: {
    LIST: '/api/wishlist',
    ADD: '/api/wishlist',
    REMOVE: (id: string) => `/api/wishlist/${id}`,
  },
  
  // AI
  AI: {
    RECOMMEND: '/api/recommend',
    CHAT: '/api/chat',
    ITINERARY: '/api/itinerary',
  },
};

// Amenities
export const HOTEL_AMENITIES = [
  { id: 'wifi', label: 'Free WiFi', icon: '📶' },
  { id: 'parking', label: 'Free Parking', icon: '🅿️' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'breakfast', label: 'Breakfast Included', icon: '🍳' },
  { id: 'gym', label: 'Fitness Center', icon: '💪' },
  { id: 'spa', label: 'Spa', icon: '💆' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'bar', label: 'Bar', icon: '🍸' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'minibar', label: 'Minibar', icon: '🍾' },
  { id: 'safe', label: 'Safe', icon: '🔒' },
  { id: 'laundry', label: 'Laundry Service', icon: '👔' },
  { id: 'concierge', label: 'Concierge', icon: '🛎️' },
  { id: 'airport_shuttle', label: 'Airport Shuttle', icon: '🚐' },
  { id: 'pet_friendly', label: 'Pet Friendly', icon: '🐕' },
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: '♿' },
  { id: 'family_rooms', label: 'Family Rooms', icon: '👨‍👩‍👧‍👦' },
];

// Room Amenities
export const ROOM_AMENITIES = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'tv', label: 'TV' },
  { id: 'minibar', label: 'Minibar' },
  { id: 'safe', label: 'Safe' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'bathtub', label: 'Bathtub' },
  { id: 'shower', label: 'Shower' },
  { id: 'hairdryer', label: 'Hair Dryer' },
  { id: 'iron', label: 'Iron' },
  { id: 'desk', label: 'Work Desk' },
  { id: 'coffee_maker', label: 'Coffee Maker' },
];

// Tour Categories
export const TOUR_CATEGORIES = [
  { id: 'cultural', label: 'Cultural', icon: '🏛️' },
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'food', label: 'Food & Dining', icon: '🍜' },
  { id: 'history', label: 'Historical', icon: '📜' },
  { id: 'religious', label: 'Religious', icon: '🕉️' },
  { id: 'beach', label: 'Beach & Water', icon: '🏖️' },
  { id: 'city', label: 'City Tours', icon: '🏙️' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal', icon: '💳' },
  { id: 'stripe', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'bakong', label: 'Bakong (KHQR)', icon: '📱' },
];

// Payment Options
export const PAYMENT_OPTIONS = [
  {
    id: 'deposit',
    label: 'Pay Deposit',
    description: 'Pay 50-70% now, rest later',
    badge: 'Flexible',
  },
  {
    id: 'milestone',
    label: 'Milestone Payments',
    description: 'Split into 3 payments',
    badge: 'Popular',
  },
  {
    id: 'full',
    label: 'Pay in Full',
    description: 'Get 5% discount + bonus',
    badge: 'Best Value',
  },
];

// Booking Status Labels
export const BOOKING_STATUS_LABELS = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'green' },
  completed: { label: 'Completed', color: 'blue' },
  cancelled: { label: 'Cancelled', color: 'red' },
  rejected: { label: 'Rejected', color: 'red' },
};

// Languages
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'km', label: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

// Currencies
export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'KHR', label: 'Cambodian Riel', symbol: '៛' },
];

// Popular Destinations
export const POPULAR_DESTINATIONS = [
  { id: 'siem-reap', name: 'Siem Reap', image: '/destinations/siem-reap.jpg' },
  { id: 'phnom-penh', name: 'Phnom Penh', image: '/destinations/phnom-penh.jpg' },
  { id: 'sihanoukville', name: 'Sihanoukville', image: '/destinations/sihanoukville.jpg' },
  { id: 'battambang', name: 'Battambang', image: '/destinations/battambang.jpg' },
  { id: 'kampot', name: 'Kampot', image: '/destinations/kampot.jpg' },
  { id: 'koh-rong', name: 'Koh Rong', image: '/destinations/koh-rong.jpg' },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'Email already registered.',
  BOOKING_FAILED: 'Booking failed. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INVALID_PROMO_CODE: 'Invalid or expired promo code.',
  ROOM_UNAVAILABLE: 'Room is no longer available for selected dates.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  BOOKING_SUCCESS: 'Booking confirmed successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  WISHLIST_ADDED: 'Added to wishlist!',
  WISHLIST_REMOVED: 'Removed from wishlist.',
};

// Responsive Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Date Format
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48];

// Rating
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Price Range (USD)
export const PRICE_RANGE = {
  min: 0,
  max: 1000,
  step: 10,
};

// Student Discount
export const STUDENT_DISCOUNT_PERCENTAGE = 10;
export const STUDENT_DISCOUNT_MAX_USES = 3;

// Full Payment Discount
export const FULL_PAYMENT_DISCOUNT_PERCENTAGE = 5;

// Deposit Percentage Range
export const DEPOSIT_PERCENTAGE = {
  min: 50,
  max: 70,
};

// Cancellation Policy
export const CANCELLATION_HOURS_BEFORE = 48;

// Booking Reservation Time (minutes)
export const BOOKING_RESERVATION_TIME = 15;

// Image Optimization
export const IMAGE_QUALITY = {
  thumbnail: 60,
  medium: 75,
  high: 85,
};

export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 200 },
  card: { width: 600, height: 400 },
  detail: { width: 1200, height: 800 },
};
