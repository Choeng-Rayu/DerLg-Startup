'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Booking, Hotel, Room } from '@/types';
import { api, getAuthToken } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch booking details
        const bookingResponse = await api.get<Booking>(`/api/bookings/${bookingId}`, token);
        if (!bookingResponse.success || !bookingResponse.data) {
          throw new Error('Failed to fetch booking details');
        }
        setBooking(bookingResponse.data);

        // Fetch hotel details
        const hotelResponse = await api.get<Hotel>(`/api/hotels/${bookingResponse.data.hotel_id}`);
        if (hotelResponse.success && hotelResponse.data) {
          setHotel(hotelResponse.data);
        }

        // Fetch room details
        const roomResponse = await api.get<Room>(
          `/api/hotels/${bookingResponse.data.hotel_id}/rooms/${bookingResponse.data.room_id}`
        );
        if (roomResponse.success && roomResponse.data) {
          setRoom(roomResponse.data);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
          <Button onClick={() => router.push('/')}>Go to Homepage</Button>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      case 'pending':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your booking has been successfully created. A confirmation email has been sent to{' '}
            {booking.guest_details.email}
          </p>
        </div>

        {/* Booking Details */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-500 mt-1">Booking #{booking.booking_number}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          {/* Hotel & Room Info */}
          {hotel && room && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-lg mb-2">{hotel.name}</h3>
              <p className="text-gray-600 mb-1">{room.room_type}</p>
              <p className="text-sm text-gray-500">{hotel.location.address}</p>
            </div>
          )}

          {/* Stay Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Stay Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{formatDate(booking.check_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{formatDate(booking.check_out)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span className="font-medium">{booking.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">
                    {booking.guests.adults} {booking.guests.adults === 1 ? 'Adult' : 'Adults'}
                    {booking.guests.children > 0 &&
                      `, ${booking.guests.children} ${booking.guests.children === 1 ? 'Child' : 'Children'}`}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Guest Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{booking.guest_details.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{booking.guest_details.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{booking.guest_details.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.guest_details.special_requests && (
            <div className="mb-6 pb-6 border-b">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Special Requests</h4>
              <p className="text-sm text-gray-600">{booking.guest_details.special_requests}</p>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="mb-6 pb-6 border-b">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Pricing Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Room rate (per night)</span>
                <span>${booking.pricing.room_rate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({booking.nights} nights)</span>
                <span>${booking.pricing.subtotal.toFixed(2)}</span>
              </div>
              {booking.pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount
                    {booking.pricing.promo_code && ` (${booking.pricing.promo_code})`}
                  </span>
                  <span>-${booking.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${booking.pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>${booking.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">{booking.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type</span>
                <span className="font-medium capitalize">{booking.payment.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-medium capitalize ${getPaymentStatusColor(booking.payment.status)}`}>
                  {booking.payment.status}
                </span>
              </div>
              {booking.payment.type !== 'full' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You have selected {booking.payment.type} payment. You will receive
                    reminders for upcoming payments.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-gray-600">
                  We've sent a confirmation email with all the details and a calendar invite.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">Prepare for your stay</p>
                <p className="text-gray-600">
                  Review the hotel's check-in policy and prepare any required documents.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">Get reminders</p>
                <p className="text-gray-600">
                  We'll send you reminders 24 hours before your check-in date.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/bookings" className="flex-1">
            <Button variant="secondary" className="w-full">
              View All Bookings
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full">Back to Homepage</Button>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="mailto:support@derlg.com" className="text-blue-600 hover:underline">
              support@derlg.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
