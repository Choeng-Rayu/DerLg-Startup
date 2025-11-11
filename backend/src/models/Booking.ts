import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Hotel from './Hotel';
import Room from './Room';

// Guests interface
interface Guests {
  adults: number;
  children: number;
}

// Guest details interface
interface GuestDetails {
  name: string;
  email: string;
  phone: string;
  special_requests: string;
}

// Pricing interface
interface Pricing {
  room_rate: number;
  subtotal: number;
  discount: number;
  promo_code: string | null;
  student_discount: number;
  tax: number;
  total: number;
}

// Payment transaction interface
interface PaymentTransactionInfo {
  transaction_id: string;
  amount: number;
  payment_type: string;
  status: string;
  timestamp: Date;
}

// Payment interface
interface Payment {
  method: 'paypal' | 'bakong' | 'stripe';
  type: 'deposit' | 'milestone' | 'full';
  status: 'pending' | 'partial' | 'completed' | 'refunded';
  transactions: PaymentTransactionInfo[];
  escrow_status: 'held' | 'released';
}

// Cancellation interface
interface Cancellation {
  cancelled_at: Date;
  reason: string;
  refund_amount: number;
  refund_status: string;
}

// Booking status enum
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

// Payment method enum
export enum PaymentMethod {
  PAYPAL = 'paypal',
  BAKONG = 'bakong',
  STRIPE = 'stripe',
}

// Payment type enum
export enum PaymentType {
  DEPOSIT = 'deposit',
  MILESTONE = 'milestone',
  FULL = 'full',
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

// Escrow status enum
export enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
}

class Booking extends Model<
  InferAttributes<Booking>,
  InferCreationAttributes<Booking>
> {
  declare id: CreationOptional<string>;
  declare booking_number: CreationOptional<string>;
  declare user_id: ForeignKey<User['id']>;
  declare hotel_id: ForeignKey<Hotel['id']>;
  declare room_id: ForeignKey<Room['id']>;
  declare check_in: Date;
  declare check_out: Date;
  declare nights: CreationOptional<number>;
  declare guests: Guests;
  declare guest_details: GuestDetails;
  declare pricing: Pricing;
  declare payment: Payment;
  declare status: CreationOptional<BookingStatus>;
  declare cancellation: Cancellation | null;
  declare calendar_event_id: string | null;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare messages?: any[];

  // Instance method to calculate nights
  calculateNights(): number {
    const checkIn = new Date(this.check_in);
    const checkOut = new Date(this.check_out);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Instance method to check if booking is upcoming
  isUpcoming(): boolean {
    const now = new Date();
    const checkIn = new Date(this.check_in);
    return checkIn > now && this.status === BookingStatus.CONFIRMED;
  }

  // Instance method to check if booking is active
  isActive(): boolean {
    const now = new Date();
    const checkIn = new Date(this.check_in);
    const checkOut = new Date(this.check_out);
    return (
      now >= checkIn &&
      now <= checkOut &&
      this.status === BookingStatus.CONFIRMED
    );
  }

  // Instance method to check if booking is past
  isPast(): boolean {
    const now = new Date();
    const checkOut = new Date(this.check_out);
    return checkOut < now;
  }

  // Instance method to calculate refund amount based on cancellation policy
  calculateRefundAmount(): number {
    const now = new Date();
    const checkIn = new Date(this.check_in);
    const daysUntilCheckIn = Math.ceil(
      (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let refundPercentage = 0;

    if (daysUntilCheckIn >= 30) {
      refundPercentage = 100; // Full refund minus processing fees
    } else if (daysUntilCheckIn >= 7) {
      refundPercentage = 50;
    } else {
      // Check payment type
      if (this.payment.type === PaymentType.DEPOSIT) {
        refundPercentage = 0; // Deposit retained
      } else {
        refundPercentage = 50;
      }
    }

    return (this.pricing.total * refundPercentage) / 100;
  }

  // Instance method to get safe object
  toSafeObject() {
    const booking = this.toJSON();
    return {
      ...booking,
      nights: this.nights || this.calculateNights(),
      is_upcoming: this.isUpcoming(),
      is_active: this.isActive(),
      is_past: this.isPast(),
    };
  }
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    booking_number: {
      type: DataTypes.STRING(50),
      allowNull: true, // Will be generated in beforeCreate hook
      unique: {
        name: 'unique_booking_number',
        msg: 'Booking number already exists',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    hotel_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'hotels',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    check_in: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isNotPast(value: string) {
          const checkInDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (checkInDate < today) {
            throw new Error('Check-in date cannot be in the past');
          }
        },
      },
    },
    check_out: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isAfterCheckIn(value: string) {
          const checkIn = (this as any).check_in;
          if (checkIn) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(value);
            if (checkOutDate <= checkInDate) {
              throw new Error('Check-out date must be after check-in date');
            }
          }
        },
      },
    },
    nights: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Nights must be at least 1',
        },
      },
    },
    guests: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidGuests(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Guests must be a valid object');
          }
          if (typeof value.adults !== 'number' || value.adults < 1) {
            throw new Error('At least 1 adult is required');
          }
          if (typeof value.children !== 'number' || value.children < 0) {
            throw new Error('Children count cannot be negative');
          }
        },
      },
    },
    guest_details: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidGuestDetails(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Guest details must be a valid object');
          }
          const required = ['name', 'email', 'phone'];
          for (const field of required) {
            if (!value[field]) {
              throw new Error(`Guest details.${field} is required`);
            }
          }
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.email)) {
            throw new Error('Guest email must be valid');
          }
        },
      },
    },
    pricing: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidPricing(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Pricing must be a valid object');
          }
          const required = ['room_rate', 'subtotal', 'discount', 'student_discount', 'tax', 'total'];
          for (const field of required) {
            if (typeof value[field] !== 'number') {
              throw new Error(`Pricing.${field} must be a number`);
            }
          }
          if (value.total < 0) {
            throw new Error('Total price cannot be negative');
          }
        },
      },
    },
    payment: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidPayment(value: any) {
          if (!value || typeof value !== 'object') {
            throw new Error('Payment must be a valid object');
          }
          if (!['paypal', 'bakong', 'stripe'].includes(value.method)) {
            throw new Error('Payment method must be paypal, bakong, or stripe');
          }
          if (!['deposit', 'milestone', 'full'].includes(value.type)) {
            throw new Error('Payment type must be deposit, milestone, or full');
          }
          if (!['pending', 'partial', 'completed', 'refunded'].includes(value.status)) {
            throw new Error('Payment status must be pending, partial, completed, or refunded');
          }
          if (!['held', 'released'].includes(value.escrow_status)) {
            throw new Error('Escrow status must be held or released');
          }
          if (!Array.isArray(value.transactions)) {
            throw new Error('Payment transactions must be an array');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BookingStatus)),
      allowNull: false,
      defaultValue: BookingStatus.PENDING,
    },
    cancellation: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidCancellation(value: any) {
          if (value !== null && value !== undefined && typeof value !== 'object') {
            throw new Error('Cancellation must be a valid object or null');
          }
          if (value && typeof value === 'object') {
            const required = ['cancelled_at', 'reason', 'refund_amount', 'refund_status'];
            for (const field of required) {
              if (!value[field]) {
                throw new Error(`Cancellation.${field} is required`);
              }
            }
          }
        },
      },
    },
    calendar_event_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_bookings_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_bookings_hotel_id',
        fields: ['hotel_id'],
      },
      {
        name: 'idx_bookings_status',
        fields: ['status'],
      },
      {
        name: 'idx_bookings_check_in',
        fields: ['check_in'],
      },
      {
        name: 'idx_bookings_booking_number',
        fields: ['booking_number'],
      },
      {
        name: 'idx_bookings_room_id',
        fields: ['room_id'],
      },
    ],
    hooks: {
      beforeCreate: (booking) => {
        // Generate booking number if not provided
        if (!booking.booking_number) {
          const timestamp = Date.now().toString(36).toUpperCase();
          const random = Math.random().toString(36).substring(2, 6).toUpperCase();
          booking.booking_number = `BK-${timestamp}-${random}`;
        }

        // Calculate nights if not provided
        if (!booking.nights) {
          const checkIn = new Date(booking.check_in);
          const checkOut = new Date(booking.check_out);
          const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
          booking.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Initialize payment transactions array if not provided
        if (!booking.payment.transactions) {
          booking.payment.transactions = [];
        }
      },
      beforeUpdate: (booking) => {
        // Recalculate nights if dates changed
        if (booking.changed('check_in') || booking.changed('check_out')) {
          const checkIn = new Date(booking.check_in);
          const checkOut = new Date(booking.check_out);
          const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
          booking.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      },
    },
  }
);

export default Booking;
