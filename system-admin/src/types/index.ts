// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'tourist' | 'hotel_admin' | 'guide' | 'driver' | 'super_admin';
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  bookingCount?: number;
  totalSpent?: number;
}

// Hotel Types
export interface Hotel {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  description?: string;
  status: 'pending_approval' | 'active' | 'rejected' | 'disabled';
  adminId: string;
  adminName?: string;
  adminEmail?: string;
  roomCount?: number;
  averageRating?: number;
  totalBookings?: number;
  totalRevenue?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  rejectionReason?: string;
}

// Booking Types
export interface Booking {
  id: string;
  hotelId: string;
  hotelName?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  roomType: string;
  roomCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'completed' | 'refunded';
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Guide Types
export interface Guide {
  id: string;
  name: string;
  email?: string;
  phone: string;
  telegramUsername: string;
  telegramUserId?: string;
  specializations: string[];
  languages: string[];
  status: 'available' | 'unavailable' | 'on_tour';
  rating?: number;
  totalTours?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Driver Types
export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone: string;
  telegramUsername: string;
  telegramUserId?: string;
  vehicleType: 'tuk_tuk' | 'car' | 'van' | 'bus';
  vehicleNumber: string;
  seatCapacity: number;
  status: 'available' | 'unavailable' | 'on_trip';
  rating?: number;
  totalTrips?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: Date | string;
  endDate: Date | string;
  capacity: number;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  bookingCount?: number;
  revenue?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  validFrom: Date | string;
  validUntil: Date | string;
  usageLimit?: number;
  usageCount: number;
  applicableHotels?: string[];
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Analytics Types
export interface DashboardKPI {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  activeHotels: number;
  totalRevenue: number;
}

export interface AIMetrics {
  totalRecommendations: number;
  averageResponseTime: number;
  clickThroughRate: number;
  totalConversations: number;
  averageConversationLength: number;
  userSatisfactionRating: number;
}

export interface SentimentAnalysis {
  hotelId: string;
  hotelName: string;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageSentiment: number;
}

// Message Types
export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  senderType: 'admin' | 'customer';
  senderName?: string;
  content: string;
  isRead: boolean;
  readAt?: Date | string | null;
  createdAt: Date | string;
}

