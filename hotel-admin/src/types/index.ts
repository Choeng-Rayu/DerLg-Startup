/**
 * Hotel Admin Dashboard Types
 */

export interface HotelAdmin {
  id: string;
  hotelId: string;
  email: string;
  name: string;
  phone: string;
  role: 'hotel_admin' | 'hotel_manager' | 'hotel_staff';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  images: string[];
  amenities: string[];
  starRating: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  hotelId: string;
  roomType: string;
  description: string;
  price: number;
  capacity: number;
  images: string[];
  amenities: string[];
  availability: boolean;
  totalRooms: number;
  bookedRooms: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  hotelId: string;
  roomId?: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType?: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  numberOfGuests?: number;
  totalPrice?: number;
  totalAmount?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  bookingStatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus?: 'pending' | 'completed' | 'refunded' | 'paid';
  notes?: string;
  specialRequests?: string;
  createdAt?: Date | string;
  updatedAt: Date;
}

export interface Message {
  id: string;
  bookingId?: string;
  conversationId?: string;
  senderId: string;
  senderType: 'admin' | 'customer';
  senderName?: string;
  content: string;
  isRead: boolean;
  readAt?: Date | string | null;
  createdAt: Date | string;
}

export interface PromoCode {
  id: string;
  hotelId: string;
  code: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  expirationDate: string | Date;
  usageLimit?: number | null;
  usageCount: number;
  applicableRoomTypes?: string[];
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface DashboardKPI {
  totalBookings: number;
  dailyBookings: number;
  monthlyBookings: number;
  yearlyBookings: number;
  totalRevenue: number;
  averageOccupancyRate: number;
  averageCustomerRating: number;
  pendingBookings: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
}

export interface RoomTypePerformance {
  roomType: string;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: HotelAdmin;
  hotel?: Hotel;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

