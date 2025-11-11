// User Types
export type UserType = 'super_admin' | 'admin' | 'tourist';
export type Language = 'en' | 'km' | 'zh';
export type Currency = 'USD' | 'KHR';

export interface User {
  id: string;
  user_type: UserType;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  language: Language;
  currency: Currency;
  is_student: boolean;
  student_email?: string;
  student_discount_remaining: number;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  created_at: Date;
}

// Hotel Types
export type HotelStatus = 'pending_approval' | 'active' | 'inactive' | 'rejected';

export interface HotelLocation {
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  google_maps_url?: string;
}

export interface HotelContact {
  phone: string;
  email: string;
  website?: string;
}

export interface Hotel {
  id: string;
  admin_id: string;
  name: string;
  description: string;
  location: HotelLocation;
  contact: HotelContact;
  amenities: string[];
  images: string[];
  logo?: string;
  star_rating: number;
  average_rating: number;
  total_reviews: number;
  status: HotelStatus;
  created_at: Date;
  updated_at: Date;
}

// Room Types
export interface Room {
  id: string;
  hotel_id: string;
  room_type: string;
  description: string;
  capacity: number;
  bed_type: string;
  size_sqm: number;
  price_per_night: number;
  discount_percentage: number;
  amenities: string[];
  images: string[];
  total_rooms: number;
  is_active: boolean;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
export type PaymentMethod = 'paypal' | 'bakong' | 'stripe';
export type PaymentType = 'deposit' | 'milestone' | 'full';
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'refunded';

export interface BookingGuests {
  adults: number;
  children: number;
}

export interface GuestDetails {
  name: string;
  email: string;
  phone: string;
  special_requests?: string;
}

export interface BookingPricing {
  room_rate: number;
  subtotal: number;
  discount: number;
  promo_code?: string;
  student_discount: number;
  tax: number;
  total: number;
}

export interface PaymentTransaction {
  id: string;
  transaction_id: string;
  gateway: PaymentMethod;
  amount: number;
  payment_type: PaymentType;
  status: PaymentStatus;
  created_at: Date;
}

export interface BookingPayment {
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  transactions: PaymentTransaction[];
  escrow_status: 'held' | 'released';
}

export interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  hotel_id: string;
  room_id: string;
  check_in: Date;
  check_out: Date;
  nights: number;
  guests: BookingGuests;
  guest_details: GuestDetails;
  pricing: BookingPricing;
  payment: BookingPayment;
  status: BookingStatus;
  created_at: Date;
  updated_at: Date;
}

// Tour Types
export type TourDifficulty = 'easy' | 'moderate' | 'challenging';

export interface TourDuration {
  days: number;
  nights: number;
}

export interface TourGroupSize {
  min: number;
  max: number;
}

export interface MeetingPoint {
  address: string;
  latitude: number;
  longitude: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  destination: string;
  duration: TourDuration;
  difficulty: TourDifficulty;
  category: string[];
  price_per_person: number;
  group_size: TourGroupSize;
  inclusions: string[];
  exclusions: string[];
  images: string[];
  meeting_point: MeetingPoint;
  guide_required: boolean;
  transportation_required: boolean;
  is_active: boolean;
  average_rating: number;
  total_bookings: number;
}

// Event Types
export type EventType = 'festival' | 'cultural' | 'seasonal';

export interface EventLocation {
  city: string;
  province: string;
  venue: string;
  latitude: number;
  longitude: number;
}

export interface EventPricing {
  base_price: number;
  vip_price: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  event_type: EventType;
  start_date: Date;
  end_date: Date;
  location: EventLocation;
  pricing: EventPricing;
  capacity: number;
  bookings_count: number;
  images: string[];
  cultural_significance: string;
  what_to_expect: string;
  related_tours: string[];
  is_active: boolean;
}

// Review Types
export interface ReviewRatings {
  overall: number;
  cleanliness: number;
  service: number;
  location: number;
  value: number;
}

export interface ReviewSentiment {
  score: number;
  classification: 'positive' | 'neutral' | 'negative';
  topics: { topic: string; sentiment: number }[];
}

export interface Review {
  id: string;
  user_id: string;
  booking_id: string;
  hotel_id: string;
  tour_id?: string;
  ratings: ReviewRatings;
  comment: string;
  sentiment: ReviewSentiment;
  images: string[];
  helpful_count: number;
  is_verified: boolean;
  admin_response?: string;
  created_at: Date;
}

// Search Types
export interface SearchParams {
  destination?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  rating?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Wishlist Types
export type WishlistItemType = 'hotel' | 'tour' | 'event';

export interface WishlistItem {
  id: string;
  user_id: string;
  item_type: WishlistItemType;
  item_id: string;
  notes?: string;
  created_at: Date;
}

// AI Types
export type AIType = 'streaming' | 'quick' | 'event-based';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIRecommendation {
  hotel_ids: string[];
  tour_ids: string[];
  event_ids: string[];
}
