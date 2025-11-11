/**
 * DerLg Tourism Platform - Frontend TypeScript Type Definitions
 * 
 * This file contains all TypeScript interfaces and types that match
 * the backend API models. Frontend developers should copy these types
 * to their project (e.g., frontend/src/types/api.ts)
 * 
 * Last Updated: October 23, 2025
 * Backend Version: 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TOURIST = 'tourist',
}

export enum Language {
  ENGLISH = 'en',
  KHMER = 'km',
  CHINESE = 'zh',
}

export enum Currency {
  USD = 'USD',
  KHR = 'KHR',
}

export enum HotelStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum PaymentMethod {
  PAYPAL = 'paypal',
  BAKONG = 'bakong',
  STRIPE = 'stripe',
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  MILESTONE = 'milestone',
  FULL = 'full',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum TourDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  CHALLENGING = 'challenging',
}

export enum EventType {
  FESTIVAL = 'festival',
  CULTURAL = 'cultural',
  SEASONAL = 'seasonal',
}

export enum SentimentClassification {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
}

// ============================================================================
// PAYMENT OPTIONS TYPES
// ============================================================================

/**
 * Payment schedule for milestone payments
 */
export interface PaymentSchedule {
  milestone: number;
  percentage: number;
  amount: number;
  due_date: string | Date;
  description: string;
}

/**
 * Payment option calculation result
 */
export interface PaymentOption {
  payment_type: 'deposit' | 'milestone' | 'full';
  original_total: number;
  discount_amount: number;
  final_total: number;
  deposit_amount?: number;
  remaining_balance?: number;
  payment_schedule?: PaymentSchedule[];
  bonus_services?: string[];
}

/**
 * Response from GET /api/bookings/payment-options
 */
export interface PaymentOptionsResponse {
  pricing_breakdown: {
    room_rate: number;
    nights: number;
    subtotal: number;
    room_discount: number;
    student_discount: number;
    tax: number;
    total: number;
  };
  payment_options: {
    deposit: PaymentOption;
    milestone: PaymentOption;
    full: PaymentOption;
  };
}

/**
 * Request body for POST /api/bookings/payment-options
 */
export interface PaymentOptionsRequest {
  room_id: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  guests: {
    adults: number;
    children: number;
  };
  deposit_percentage?: number; // 50-70, default 60
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  user_type: UserType;
  email: string;
  phone: string | null;
  google_id: string | null;
  facebook_id: string | null;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  language: Language;
  currency: Currency;
  is_student: boolean;
  student_email: string | null;
  student_discount_remaining: number;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  language?: Language;
  currency?: Currency;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ============================================================================
// HOTEL TYPES
// ============================================================================

export interface HotelLocation {
  address: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
}

export interface HotelContact {
  phone: string;
  email: string;
  website: string;
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
  star_rating: number;
  average_rating: number;
  total_reviews: number;
  total_bookings: number;
  status: HotelStatus;
  created_at: string;
  updated_at: string;
}

export interface HotelSearchParams {
  destination?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  amenities?: string[];
  star_rating?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
}

export interface HotelListItem {
  id: string;
  name: string;
  description: string;
  location: {
    city: string;
    province: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  images: string[];
  star_rating: number;
  average_rating: number;
  total_reviews: number;
  starting_price: number;
  amenities: string[];
  status: HotelStatus;
}

// ============================================================================
// ROOM TYPES
// ============================================================================

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
  final_price: number;
  amenities: string[];
  images: string[];
  total_rooms: number;
  available_rooms?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomCreate {
  room_type: string;
  description: string;
  capacity: number;
  bed_type: string;
  size_sqm: number;
  price_per_night: number;
  discount_percentage?: number;
  amenities: string[];
  images: string[];
  total_rooms: number;
  is_active?: boolean;
}

export interface AvailableRoom {
  id: string;
  room_type: string;
  capacity: number;
  price_per_night: number;
  discount_percentage: number;
  final_price: number;
  total_price: number;
  available_count: number;
  images: string[];
  amenities: string[];
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export interface BookingGuests {
  adults: number;
  children: number;
}

export interface GuestDetails {
  name: string;
  email: string;
  phone: string;
  special_requests: string;
}

export interface BookingPricing {
  room_rate: number;
  subtotal: number;
  discount: number;
  promo_code: string | null;
  student_discount: number;
  tax: number;
  total: number;
}

export interface PaymentTransactionInfo {
  transaction_id: string;
  amount: number;
  payment_type: string;
  status: string;
  timestamp: string;
}

export interface BookingPayment {
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  transactions: PaymentTransactionInfo[];
  escrow_status: EscrowStatus;
}

export interface BookingCancellation {
  cancelled_at: string;
  reason: string;
  refund_amount: number;
  refund_status: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  hotel_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: BookingGuests;
  guest_details: GuestDetails;
  pricing: BookingPricing;
  payment: BookingPayment;
  status: BookingStatus;
  cancellation: BookingCancellation | null;
  calendar_event_id: string | null;
  is_upcoming?: boolean;
  is_active?: boolean;
  is_past?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  hotel_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests: BookingGuests;
  guest_details: GuestDetails;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  promo_code?: string;
}

export interface BookingWithDetails extends Booking {
  hotel: HotelListItem;
  room: Room;
  user?: User;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  transaction_id: string;
  gateway: PaymentMethod;
  amount: number;
  currency: Currency;
  payment_type: string;
  status: TransactionStatus;
  gateway_response: any;
  escrow_status: EscrowStatus;
  escrow_release_date: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayPalPaymentIntent {
  order_id: string;
  approval_url: string;
  status: string;
}

export interface BakongPaymentIntent {
  qr_code: string;
  md5_hash: string;
  amount: number;
  currency: Currency;
  merchant_id: string;
  expires_at: string;
}

export interface StripePaymentIntent {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: Currency;
  status: string;
}

export interface PaymentCreateRequest {
  booking_id: string;
  amount: number;
  currency: Currency;
  payment_type: string;
}

export interface PaymentCaptureRequest {
  order_id?: string;
  payment_intent_id?: string;
  payment_method_id?: string;
  md5_hash?: string;
  booking_id: string;
}

// ============================================================================
// TOUR TYPES
// ============================================================================

export interface TourDuration {
  days: number;
  nights: number;
}

export interface TourGroupSize {
  min: number;
  max: number;
}

export interface TourMeetingPoint {
  address: string;
  latitude: number;
  longitude: number;
}

export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation: string | null;
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
  itinerary: DayItinerary[];
  images: string[];
  meeting_point: TourMeetingPoint;
  guide_required: boolean;
  transportation_required: boolean;
  is_active: boolean;
  average_rating: number;
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

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
  start_date: string;
  end_date: string;
  location: EventLocation;
  pricing: EventPricing;
  capacity: number;
  bookings_count: number;
  images: string[];
  cultural_significance: string;
  what_to_expect: string;
  related_tours: string[];
  is_active: boolean;
  created_by: string;
  is_upcoming?: boolean;
  is_ongoing?: boolean;
  is_past?: boolean;
  available_spots?: number;
  duration_days?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ReviewRatings {
  overall: number;
  cleanliness: number;
  service: number;
  location: number;
  value: number;
}

export interface SentimentTopic {
  topic: string;
  sentiment: number;
}

export interface ReviewSentiment {
  score: number;
  classification: SentimentClassification;
  topics: SentimentTopic[];
}

export interface Review {
  id: string;
  user_id: string;
  booking_id: string;
  hotel_id: string | null;
  tour_id: string | null;
  ratings: ReviewRatings;
  comment: string;
  sentiment: ReviewSentiment | null;
  images: string[];
  helpful_count: number;
  is_verified: boolean;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
}

export interface ReviewCreate {
  booking_id: string;
  hotel_id?: string;
  tour_id?: string;
  ratings: ReviewRatings;
  comment: string;
  images?: string[];
}

// ============================================================================
// WISHLIST TYPES
// ============================================================================

export interface Wishlist {
  id: string;
  user_id: string;
  item_type: 'hotel' | 'tour' | 'event';
  item_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistWithItem extends Wishlist {
  item: Hotel | Tour | Event;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_type: 'user' | 'hotel_admin' | 'super_admin';
  recipient_id: string;
  recipient_type: 'user' | 'hotel_admin' | 'super_admin';
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
}

// ============================================================================
// AI CONVERSATION TYPES
// ============================================================================

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  session_id: string;
  ai_type: 'streaming' | 'quick' | 'event_based';
  messages: AIMessage[];
  context: any;
  recommendations: any;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROMO CODE TYPES
// ============================================================================

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  usage_count: number;
  applicable_to: 'all' | 'hotels' | 'tours' | 'events';
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================================================
// UTILITY TYPE GUARDS
// ============================================================================

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

// ============================================================================
// EXAMPLE API CLIENT USAGE
// ============================================================================

/**
 * Example API client implementation:
 * 
 * ```typescript
 * import axios from 'axios';
 * import type { ApiResponse, AuthResponse, UserLogin } from './types/api';
 * 
 * const api = axios.create({
 *   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 * });
 * 
 * // Add auth token to requests
 * api.interceptors.request.use((config) => {
 *   const token = localStorage.getItem('access_token');
 *   if (token) {
 *     config.headers.Authorization = `Bearer ${token}`;
 *   }
 *   return config;
 * });
 * 
 * // Handle token refresh on 401
 * api.interceptors.response.use(
 *   (response) => response,
 *   async (error) => {
 *     if (error.response?.status === 401) {
 *       // Attempt token refresh
 *       const refreshToken = localStorage.getItem('refresh_token');
 *       if (refreshToken) {
 *         try {
 *           const { data } = await axios.post('/auth/refresh-token', {
 *             refresh_token: refreshToken,
 *           });
 *           localStorage.setItem('access_token', data.data.access_token);
 *           localStorage.setItem('refresh_token', data.data.refresh_token);
 *           // Retry original request
 *           return api.request(error.config);
 *         } catch {
 *           // Refresh failed, redirect to login
 *           window.location.href = '/login';
 *         }
 *       }
 *     }
 *     return Promise.reject(error);
 *   }
 * );
 * 
 * // Example API methods
 * export const authApi = {
 *   login: async (credentials: UserLogin): Promise<AuthResponse> => {
 *     const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
 *     if (isApiSuccess(data)) {
 *       return data.data;
 *     }
 *     throw new Error(data.error.message);
 *   },
 *   
 *   register: async (userData: UserRegistration): Promise<AuthResponse> => {
 *     const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
 *     if (isApiSuccess(data)) {
 *       return data.data;
 *     }
 *     throw new Error(data.error.message);
 *   },
 *   
 *   getCurrentUser: async (): Promise<User> => {
 *     const { data } = await api.get<ApiResponse<User>>('/auth/me');
 *     if (isApiSuccess(data)) {
 *       return data.data;
 *     }
 *     throw new Error(data.error.message);
 *   },
 * };
 * 
 * export const hotelApi = {
 *   search: async (params: HotelSearchParams): Promise<PaginatedResponse<HotelListItem>> => {
 *     const { data } = await api.get<ApiResponse<PaginatedResponse<HotelListItem>>>('/hotels/search', { params });
 *     if (isApiSuccess(data)) {
 *       return data.data;
 *     }
 *     throw new Error(data.error.message);
 *   },
 *   
 *   getById: async (id: string): Promise<Hotel> => {
 *     const { data } = await api.get<ApiResponse<Hotel>>(`/hotels/${id}`);
 *     if (isApiSuccess(data)) {
 *       return data.data;
 *     }
 *     throw new Error(data.error.message);
 *   },
 * };
 * 
 * export const bookingApi = {
 *   create: async (bookingData: BookingCreate): Promise<{ booking: Booking; payment_intent: any }> => {
 *     const { data } = await api.post<ApiResponse<{ booking: Booking; payment_intent: any }>>('/bookings', bookingData);
 *     if (isApiSuccess(data)) {
 *       return data.data;
 *     }
 *     throw new Error(data.error.message);
 *   },
 * };
 * ```
 */
