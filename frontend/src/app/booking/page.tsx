'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Hotel, Room, BookingGuests, GuestDetails, BookingPricing, PaymentType, PaymentMethod } from '@/types';
import { api, getAuthToken } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

interface PaymentOption {
  type: PaymentType;
  label: string;
  description: string;
  discount?: number;
  bonus?: string[];
  schedule?: { percentage: number; timing: string }[];
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL params
  const hotelId = searchParams.get('hotelId');
  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');

  // Data
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [nights, setNights] = useState(0);

  // Form state
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: '',
    email: '',
    phone: '',
    special_requests: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType>('full');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('paypal');

  // Payment options
  const paymentOptions: PaymentOption[] = [
    {
      type: 'full',
      label: 'Full Payment',
      description: 'Pay the full amount now and get 5% discount',
      discount: 5,
      bonus: ['Free airport pickup', 'Priority check-in'],
    },
    {
      type: 'deposit',
      label: 'Deposit Payment',
      description: 'Pay 50-70% now, rest before check-in',
      schedule: [
        { percentage: 60, timing: 'Now' },
        { percentage: 40, timing: 'Before check-in' },
      ],
    },
    {
      type: 'milestone',
      label: 'Milestone Payments',
      description: 'Split payment into 3 installments',
      schedule: [
        { percentage: 50, timing: 'Now' },
        { percentage: 25, timing: '1 week before arrival' },
        { percentage: 25, timing: 'Upon arrival' },
      ],
    },
  ];

  // Calculate pricing
  const calculatePricing = (): BookingPricing => {
    if (!room) {
      return {
        room_rate: 0,
        subtotal: 0,
        discount: 0,
        student_discount: 0,
        tax: 0,
        total: 0,
      };
    }

    const roomRate = room.price_per_night * (1 - room.discount_percentage / 100);
    const subtotal = roomRate * nights;
    
    let discount = promoDiscount;
    
    // Add full payment discount
    if (selectedPaymentType === 'full') {
      discount += subtotal * 0.05;
    }

    const tax = (subtotal - discount) * 0.1; // 10% tax
    const total = subtotal - discount + tax;

    return {
      room_rate: roomRate,
      subtotal,
      discount,
      promo_code: promoApplied ? promoCode : undefined,
      student_discount: 0,
      tax,
      total,
    };
  };

  const pricing = calculatePricing();

  // Calculate amount to pay now based on payment type
  const getAmountToPay = (): number => {
    switch (selectedPaymentType) {
      case 'full':
        return pricing.total;
      case 'deposit':
        return pricing.total * 0.6;
      case 'milestone':
        return pricing.total * 0.5;
      default:
        return pricing.total;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!hotelId || !roomId || !checkIn || !checkOut) {
        setError('Missing booking information');
        setLoading(false);
        return;
      }

      try {
        // Fetch hotel details
        const hotelResponse = await api.get<Hotel>(`/api/hotels/${hotelId}`);
        if (!hotelResponse.success || !hotelResponse.data) {
          throw new Error('Failed to fetch hotel details');
        }
        setHotel(hotelResponse.data);

        // Fetch room details
        const roomResponse = await api.get<Room>(`/api/hotels/${hotelId}/rooms/${roomId}`);
        if (!roomResponse.success || !roomResponse.data) {
          throw new Error('Failed to fetch room details');
        }
        setRoom(roomResponse.data);

        // Calculate nights
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nightsCount = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        setNights(nightsCount);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
        setLoading(false);
      }
    };

    fetchData();
  }, [hotelId, roomId, checkIn, checkOut]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setApplyingPromo(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await api.post<{ discount: number; message: string }>(
        '/api/promo-codes/validate',
        {
          code: promoCode,
          booking_amount: pricing.subtotal,
        },
        token || undefined
      );

      if (response.success && response.data) {
        setPromoApplied(true);
        setPromoDiscount(response.data.discount);
      } else {
        setError(response.error?.message || 'Invalid promo code');
      }
    } catch (err) {
      setError('Failed to apply promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hotel || !room || !checkIn || !checkOut) return;

    // Validate guest details
    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      setError('Please fill in all required guest details');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        router.push(`/login?redirect=/booking?hotelId=${hotelId}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`);
        return;
      }

      const bookingData = {
        hotel_id: hotel.id,
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: {
          adults,
          children,
        },
        guest_details: guestDetails,
        payment_type: selectedPaymentType,
        payment_method: selectedPaymentMethod,
        promo_code: promoApplied ? promoCode : undefined,
      };

      const response = await api.post<{ booking_id: string; payment_url?: string }>(
        '/api/bookings',
        bookingData,
        token
      );

      if (response.success && response.data) {
        // Redirect to payment gateway or confirmation page
        if (response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          router.push(`/booking/confirmation/${response.data.booking_id}`);
        }
      } else {
        setError(response.error?.message || 'Failed to create booking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Guest Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={guestDetails.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
                <Input
                  label="Email"
                  type="email"
                  value={guestDetails.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={guestDetails.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                  required
                  placeholder="+855 12 345 678"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={guestDetails.special_requests}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGuestDetails({ ...guestDetails, special_requests: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Early check-in, high floor, etc."
                  />
                </div>
              </form>
            </Card>

            {/* Payment Options */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
              <div className="space-y-4">
                {paymentOptions.map((option) => (
                  <div
                    key={option.type}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentType === option.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentType(option.type)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={selectedPaymentType === option.type}
                            onChange={() => setSelectedPaymentType(option.type)}
                            className="w-4 h-4"
                          />
                          <h3 className="font-semibold">{option.label}</h3>
                          {option.discount && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {option.discount}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 ml-6">{option.description}</p>
                        
                        {option.schedule && (
                          <div className="mt-2 ml-6 space-y-1">
                            {option.schedule.map((payment, idx) => (
                              <div key={idx} className="text-sm text-gray-700">
                                • {payment.percentage}% - {payment.timing}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {option.bonus && (
                          <div className="mt-2 ml-6">
                            <p className="text-sm font-medium text-green-700">Bonus:</p>
                            {option.bonus.map((item, idx) => (
                              <div key={idx} className="text-sm text-green-600">
                                ✓ {item}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">PayPal</div>
                    <div className="text-xs text-gray-500 mt-1">Credit/Debit Card</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('bakong')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'bakong'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Bakong</div>
                    <div className="text-xs text-gray-500 mt-1">KHQR</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('stripe')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Stripe</div>
                    <div className="text-xs text-gray-500 mt-1">Card Payment</div>
                  </div>
                </button>
              </div>
            </Card>

            {/* Promo Code */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Promo Code</h2>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  disabled={promoApplied}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleApplyPromoCode}
                  disabled={applyingPromo || promoApplied || !promoCode.trim()}
                  variant={promoApplied ? 'secondary' : 'primary'}
                >
                  {applyingPromo ? 'Applying...' : promoApplied ? 'Applied' : 'Apply'}
                </Button>
              </div>
              {promoApplied && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Promo code applied! You saved ${promoDiscount.toFixed(2)}
                </p>
              )}
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              
              {hotel && room && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">{room.room_type}</p>
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">{checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">{checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights</span>
                      <span className="font-medium">{nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests</span>
                      <span className="font-medium">
                        {adults} {adults === 1 ? 'Adult' : 'Adults'}
                        {children > 0 && `, ${children} ${children === 1 ? 'Child' : 'Children'}`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room rate (per night)</span>
                      <span>${pricing.room_rate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({nights} nights)</span>
                      <span>${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span>${pricing.tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${pricing.total.toFixed(2)}</span>
                    </div>
                    {selectedPaymentType !== 'full' && (
                      <div className="flex justify-between text-sm text-blue-600 mt-2">
                        <span>Amount to pay now</span>
                        <span className="font-semibold">${getAmountToPay().toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? 'Processing...' : `Pay $${getAmountToPay().toFixed(2)}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By clicking "Pay", you agree to our terms and conditions
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
