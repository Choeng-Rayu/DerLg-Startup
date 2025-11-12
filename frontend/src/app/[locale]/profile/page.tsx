'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken } from '@/lib/api';
import { User, Booking, WishlistItem, Hotel, Tour, Event } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { formatDate, formatCurrency } from '@/lib/utils';

type BookingCategory = 'upcoming' | 'active' | 'past';

interface WishlistItemWithDetails extends WishlistItem {
  item: Hotel | Tour | Event | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist'>('profile');
  const [bookingCategory, setBookingCategory] = useState<BookingCategory>('upcoming');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadUserData(token);
  }, [router]);

  const loadUserData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const userResponse = await api.get<User>('/api/user/profile', token);
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }

      // Load bookings
      const bookingsResponse = await api.get<Booking[]>('/api/bookings', token);
      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data);
      }

      // Load wishlist
      const wishlistResponse = await api.get<WishlistItemWithDetails[]>('/api/wishlist', token);
      if (wishlistResponse.success && wishlistResponse.data) {
        setWishlist(wishlistResponse.data);
      }
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const token = getAuthToken();
    if (!token) return;

    if (!confirm('Are you sure you want to cancel this booking? Refund will be processed according to the cancellation policy.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/bookings/${bookingId}/cancel`, token);
      if (response.success) {
        // Reload bookings
        const bookingsResponse = await api.get<Booking[]>('/api/bookings', token);
        if (bookingsResponse.success && bookingsResponse.data) {
          setBookings(bookingsResponse.data);
        }
        alert('Booking cancelled successfully');
      } else {
        alert(response.error?.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking');
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await api.delete(`/api/wishlist/${wishlistId}`, token);
      if (response.success) {
        setWishlist(wishlist.filter(item => item.id !== wishlistId));
      } else {
        alert(response.error?.message || 'Failed to remove from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove from wishlist');
    }
  };

  const categorizeBookings = () => {
    const now = new Date();
    const upcoming: Booking[] = [];
    const active: Booking[] = [];
    const past: Booking[] = [];

    bookings.forEach(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      if (booking.status === 'cancelled' || booking.status === 'rejected') {
        past.push(booking);
      } else if (booking.status === 'completed') {
        past.push(booking);
      } else if (now >= checkIn && now <= checkOut) {
        active.push(booking);
      } else if (now < checkIn) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    return { upcoming, active, past };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRefundAmount = (booking: Booking): number => {
    const now = new Date();
    const checkIn = new Date(booking.check_in);
    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilCheckIn >= 30) {
      // Full refund minus processing fees (assume 5%)
      return booking.pricing.total * 0.95;
    } else if (daysUntilCheckIn >= 7) {
      // 50% refund
      return booking.pricing.total * 0.5;
    } else {
      // Depends on payment type
      if (booking.payment.type === 'deposit') {
        return 0; // Deposit is non-refundable within 7 days
      } else {
        return booking.pricing.total * 0.25; // 25% refund
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const categorizedBookings = categorizeBookings();
  const displayBookings = categorizedBookings[bookingCategory];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account, bookings, and wishlist</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wishlist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wishlist ({wishlist.length})
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <p className="text-gray-900">{user.first_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <p className="text-gray-900">{user.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
                {user.email_verified && (
                  <span className="text-xs text-green-600">✓ Verified</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                {user.phone_verified && (
                  <span className="text-xs text-green-600">✓ Verified</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <p className="text-gray-900">
                  {user.language === 'en' ? 'English' : user.language === 'km' ? 'Khmer' : 'Chinese'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <p className="text-gray-900">{user.currency}</p>
              </div>
              {user.is_student && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Status
                  </label>
                  <p className="text-gray-900">
                    Student Email: {user.student_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Remaining discounts: {user.student_discount_remaining} / 3
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button onClick={() => router.push('/profile/edit')}>
                Edit Profile
              </Button>
            </div>
          </Card>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {/* Booking Category Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setBookingCategory('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  bookingCategory === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Upcoming ({categorizedBookings.upcoming.length})
              </button>
              <button
                onClick={() => setBookingCategory('active')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  bookingCategory === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Active ({categorizedBookings.active.length})
              </button>
              <button
                onClick={() => setBookingCategory('past')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  bookingCategory === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Past ({categorizedBookings.past.length})
              </button>
            </div>

            {/* Bookings List */}
            {displayBookings.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">No {bookingCategory} bookings</p>
                <Button
                  onClick={() => router.push('/hotels')}
                  className="mt-4"
                >
                  Browse Hotels
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayBookings.map(booking => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{booking.booking_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.check_in)} - {formatDate(booking.check_out)} ({booking.nights} nights)
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Guests</p>
                        <p className="text-gray-900">
                          {booking.guests.adults} Adult{booking.guests.adults > 1 ? 's' : ''}
                          {booking.guests.children > 0 && `, ${booking.guests.children} Child${booking.guests.children > 1 ? 'ren' : ''}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(booking.pricing.total, user.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Status</p>
                        <p className="text-gray-900 capitalize">{booking.payment.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Type</p>
                        <p className="text-gray-900 capitalize">{booking.payment.type}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/booking/confirmation/${booking.id}`)}
                      >
                        View Details
                      </Button>
                      {booking.status === 'confirmed' && bookingCategory === 'upcoming' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/booking/modify/${booking.id}`)}
                          >
                            Modify
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel (Refund: {formatCurrency(getRefundAmount(booking), user.currency)})
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">Your wishlist is empty</p>
                <Button
                  onClick={() => router.push('/hotels')}
                  className="mt-4"
                >
                  Browse Hotels
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(item => {
                  const itemData = item.item as any;
                  if (!itemData) return null;

                  const isHotel = item.item_type === 'hotel';
                  const isTour = item.item_type === 'tour';
                  const isEvent = item.item_type === 'event';

                  return (
                    <Card key={item.id} className="overflow-hidden">
                      {itemData.images && itemData.images.length > 0 && (
                        <img
                          src={itemData.images[0]}
                          alt={itemData.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {itemData.name}
                          </h3>
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 capitalize">
                          {item.item_type}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-700 mb-3 italic">
                            Note: {item.notes}
                          </p>
                        )}
                        {isHotel && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              {itemData.location?.city}, {itemData.location?.province}
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              From {formatCurrency(itemData.price_per_night || 0, user.currency)}/night
                            </p>
                          </div>
                        )}
                        {isTour && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              {itemData.duration?.days} days, {itemData.duration?.nights} nights
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              {formatCurrency(itemData.price_per_person || 0, user.currency)}/person
                            </p>
                          </div>
                        )}
                        {isEvent && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              {formatDate(itemData.start_date)} - {formatDate(itemData.end_date)}
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              From {formatCurrency(itemData.pricing?.base_price || 0, user.currency)}
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            if (isHotel) router.push(`/hotels/${item.item_id}`);
                            else if (isTour) router.push(`/tours/${item.item_id}`);
                            else if (isEvent) router.push(`/events/${item.item_id}`);
                          }}
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
