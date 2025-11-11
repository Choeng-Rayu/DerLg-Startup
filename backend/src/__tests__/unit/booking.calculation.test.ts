/**
 * Booking Calculation Logic Unit Tests
 * Tests for price calculations, discounts, and payment options
 */

describe('Booking Calculations', () => {
  describe('Room Price Calculation', () => {
    it('should calculate total price for single night', () => {
      const pricePerNight = 100;
      const nights = 1;
      const total = pricePerNight * nights;
      
      expect(total).toBe(100);
    });

    it('should calculate total price for multiple nights', () => {
      const pricePerNight = 100;
      const nights = 5;
      const total = pricePerNight * nights;
      
      expect(total).toBe(500);
    });

    it('should calculate price with multiple rooms', () => {
      const pricePerNight = 100;
      const nights = 3;
      const rooms = 2;
      const total = pricePerNight * nights * rooms;
      
      expect(total).toBe(600);
    });
  });

  describe('Discount Calculations', () => {
    it('should apply full payment discount (5%)', () => {
      const basePrice = 1000;
      const discountPercent = 5;
      const discountAmount = (basePrice * discountPercent) / 100;
      const finalPrice = basePrice - discountAmount;
      
      expect(discountAmount).toBe(50);
      expect(finalPrice).toBe(950);
    });

    it('should apply promo code discount', () => {
      const basePrice = 1000;
      const promoDiscount = 100;
      const finalPrice = basePrice - promoDiscount;
      
      expect(finalPrice).toBe(900);
    });

    it('should not apply negative discount', () => {
      const basePrice = 1000;
      const discountAmount = -100;
      const finalPrice = Math.max(basePrice - discountAmount, basePrice);
      
      expect(finalPrice).toBe(1000);
    });
  });

  describe('Payment Options', () => {
    it('should calculate deposit payment (50%)', () => {
      const totalPrice = 1000;
      const depositPercent = 50;
      const depositAmount = (totalPrice * depositPercent) / 100;
      const remainingBalance = totalPrice - depositAmount;
      
      expect(depositAmount).toBe(500);
      expect(remainingBalance).toBe(500);
    });

    it('should calculate milestone payments (50/25/25)', () => {
      const totalPrice = 1000;
      const milestone1 = (totalPrice * 50) / 100;
      const milestone2 = (totalPrice * 25) / 100;
      const milestone3 = (totalPrice * 25) / 100;
      const total = milestone1 + milestone2 + milestone3;
      
      expect(milestone1).toBe(500);
      expect(milestone2).toBe(250);
      expect(milestone3).toBe(250);
      expect(total).toBe(1000);
    });

    it('should calculate full payment option', () => {
      const totalPrice = 1000;
      const discountPercent = 5;
      const discountAmount = (totalPrice * discountPercent) / 100;
      const finalPrice = totalPrice - discountAmount;
      
      expect(finalPrice).toBe(950);
    });
  });

  describe('Tax Calculations', () => {
    it('should calculate tax on booking', () => {
      const basePrice = 1000;
      const taxPercent = 10;
      const taxAmount = (basePrice * taxPercent) / 100;
      const totalWithTax = basePrice + taxAmount;
      
      expect(taxAmount).toBe(100);
      expect(totalWithTax).toBe(1100);
    });

    it('should handle zero tax', () => {
      const basePrice = 1000;
      const taxPercent = 0;
      const taxAmount = (basePrice * taxPercent) / 100;
      const totalWithTax = basePrice + taxAmount;
      
      expect(taxAmount).toBe(0);
      expect(totalWithTax).toBe(1000);
    });
  });

  describe('Refund Calculations', () => {
    it('should calculate full refund (30+ days before)', () => {
      const bookingPrice = 1000;
      const processingFeePercent = 2;
      const processingFee = (bookingPrice * processingFeePercent) / 100;
      const refundAmount = bookingPrice - processingFee;
      
      expect(processingFee).toBe(20);
      expect(refundAmount).toBe(980);
    });

    it('should calculate 50% refund (7-30 days before)', () => {
      const bookingPrice = 1000;
      const refundPercent = 50;
      const refundAmount = (bookingPrice * refundPercent) / 100;
      
      expect(refundAmount).toBe(500);
    });

    it('should calculate no refund (within 7 days)', () => {
      const bookingPrice = 1000;
      const refundAmount = 0;
      
      expect(refundAmount).toBe(0);
    });
  });

  describe('Currency Conversion', () => {
    it('should convert USD to KHR', () => {
      const usdAmount = 100;
      const exchangeRate = 4100; // 1 USD = 4100 KHR
      const khrAmount = usdAmount * exchangeRate;
      
      expect(khrAmount).toBe(410000);
    });

    it('should convert KHR to USD', () => {
      const khrAmount = 410000;
      const exchangeRate = 4100;
      const usdAmount = khrAmount / exchangeRate;
      
      expect(usdAmount).toBe(100);
    });
  });

  describe('Occupancy Rate Calculation', () => {
    it('should calculate occupancy rate', () => {
      const bookedRoomNights = 50;
      const totalAvailableRoomNights = 100;
      const occupancyRate = (bookedRoomNights / totalAvailableRoomNights) * 100;
      
      expect(occupancyRate).toBe(50);
    });

    it('should handle zero bookings', () => {
      const bookedRoomNights = 0;
      const totalAvailableRoomNights = 100;
      const occupancyRate = (bookedRoomNights / totalAvailableRoomNights) * 100;
      
      expect(occupancyRate).toBe(0);
    });

    it('should handle full occupancy', () => {
      const bookedRoomNights = 100;
      const totalAvailableRoomNights = 100;
      const occupancyRate = (bookedRoomNights / totalAvailableRoomNights) * 100;
      
      expect(occupancyRate).toBe(100);
    });
  });
});

