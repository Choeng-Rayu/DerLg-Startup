import { PaymentType } from '../models/Booking';

/**
 * Payment schedule interface for milestone payments
 */
export interface PaymentSchedule {
  milestone: number;
  percentage: number;
  amount: number;
  due_date: Date | string;
  description: string;
}

/**
 * Payment option calculation result
 */
export interface PaymentOptionResult {
  payment_type: PaymentType;
  original_total: number;
  discount_amount: number;
  final_total: number;
  deposit_amount?: number;
  remaining_balance?: number;
  payment_schedule?: PaymentSchedule[];
  bonus_services?: string[];
}

/**
 * Calculate deposit payment option (50-70% upfront)
 */
export const calculateDepositPayment = (
  totalAmount: number,
  depositPercentage: number = 60,
  checkInDate: Date
): PaymentOptionResult => {
  // Validate deposit percentage
  if (depositPercentage < 50 || depositPercentage > 70) {
    throw new Error('Deposit percentage must be between 50% and 70%');
  }

  const depositAmount = Math.round((totalAmount * depositPercentage) / 100 * 100) / 100;
  const remainingBalance = Math.round((totalAmount - depositAmount) * 100) / 100;

  return {
    payment_type: PaymentType.DEPOSIT,
    original_total: totalAmount,
    discount_amount: 0,
    final_total: totalAmount,
    deposit_amount: depositAmount,
    remaining_balance: remainingBalance,
    payment_schedule: [
      {
        milestone: 1,
        percentage: depositPercentage,
        amount: depositAmount,
        due_date: new Date(),
        description: 'Initial deposit payment',
      },
      {
        milestone: 2,
        percentage: 100 - depositPercentage,
        amount: remainingBalance,
        due_date: checkInDate,
        description: 'Remaining balance due at check-in',
      },
    ],
  };
};

/**
 * Calculate milestone payment option (50%/25%/25%)
 */
export const calculateMilestonePayment = (
  totalAmount: number,
  checkInDate: Date
): PaymentOptionResult => {
  const checkIn = new Date(checkInDate);
  
  // Calculate milestone amounts
  const firstPayment = Math.round((totalAmount * 0.50) * 100) / 100;
  const secondPayment = Math.round((totalAmount * 0.25) * 100) / 100;
  const thirdPayment = Math.round((totalAmount - firstPayment - secondPayment) * 100) / 100;

  // Calculate due dates
  const now = new Date();
  const oneWeekBefore = new Date(checkIn);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

  return {
    payment_type: PaymentType.MILESTONE,
    original_total: totalAmount,
    discount_amount: 0,
    final_total: totalAmount,
    payment_schedule: [
      {
        milestone: 1,
        percentage: 50,
        amount: firstPayment,
        due_date: now,
        description: '50% upfront payment',
      },
      {
        milestone: 2,
        percentage: 25,
        amount: secondPayment,
        due_date: oneWeekBefore,
        description: '25% payment one week before check-in',
      },
      {
        milestone: 3,
        percentage: 25,
        amount: thirdPayment,
        due_date: checkIn,
        description: '25% payment upon arrival',
      },
    ],
  };
};

/**
 * Calculate full payment option with 5% discount and bonus services
 */
export const calculateFullPayment = (
  totalAmount: number
): PaymentOptionResult => {
  const discountPercentage = 5;
  const discountAmount = Math.round((totalAmount * discountPercentage) / 100 * 100) / 100;
  const finalTotal = Math.round((totalAmount - discountAmount) * 100) / 100;

  return {
    payment_type: PaymentType.FULL,
    original_total: totalAmount,
    discount_amount: discountAmount,
    final_total: finalTotal,
    bonus_services: [
      'Free airport pickup',
      'Priority check-in',
      'Complimentary welcome drink',
    ],
  };
};

/**
 * Get all payment options for a booking
 */
export const getAllPaymentOptions = (
  totalAmount: number,
  checkInDate: Date,
  depositPercentage: number = 60
): {
  deposit: PaymentOptionResult;
  milestone: PaymentOptionResult;
  full: PaymentOptionResult;
} => {
  return {
    deposit: calculateDepositPayment(totalAmount, depositPercentage, checkInDate),
    milestone: calculateMilestonePayment(totalAmount, checkInDate),
    full: calculateFullPayment(totalAmount),
  };
};

/**
 * Calculate the amount due for a specific payment type
 */
export const calculateAmountDue = (
  paymentType: PaymentType,
  totalAmount: number,
  depositPercentage: number = 60
): number => {
  switch (paymentType) {
    case PaymentType.DEPOSIT:
      return Math.round((totalAmount * depositPercentage) / 100 * 100) / 100;
    
    case PaymentType.MILESTONE:
      // First milestone is 50%
      return Math.round((totalAmount * 0.50) * 100) / 100;
    
    case PaymentType.FULL:
      // Apply 5% discount
      return Math.round((totalAmount * 0.95) * 100) / 100;
    
    default:
      return totalAmount;
  }
};

/**
 * Validate payment type selection
 */
export const validatePaymentType = (paymentType: string): boolean => {
  return Object.values(PaymentType).includes(paymentType as PaymentType);
};
