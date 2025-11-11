'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Booking } from '@/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hotelFilter, setHotelFilter] = useState('all');

  const filterBookings = () => {
    let filtered = bookings;

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((b) => {
        const checkInDate = typeof b.checkInDate === 'string' ? new Date(b.checkInDate) : b.checkInDate;
        return checkInDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter((b) => {
        const checkInDate = typeof b.checkInDate === 'string' ? new Date(b.checkInDate) : b.checkInDate;
        return checkInDate <= toDate;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (hotelFilter !== 'all') {
      filtered = filtered.filter((b) => b.hotelId === hotelFilter);
    }

    setFilteredBookings(filtered);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, dateFrom, dateTo, statusFilter, hotelFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockBookings: Booking[] = [
        {
          id: 'BK001',
          hotelId: '1',
          hotelName: 'Luxury Hotel Phnom Penh',
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          checkInDate: new Date('2024-01-15'),
          checkOutDate: new Date('2024-01-18'),
          roomType: 'Deluxe Room',
          roomCount: 1,
          totalPrice: 450,
          status: 'confirmed',
          paymentStatus: 'completed',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
        },
        {
          id: 'BK002',
          hotelId: '2',
          hotelName: 'Riverside Resort',
          userId: 'user2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          checkInDate: new Date('2024-02-01'),
          checkOutDate: new Date('2024-02-05'),
          roomType: 'Suite',
          roomCount: 2,
          totalPrice: 1200,
          status: 'pending',
          paymentStatus: 'partial',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
        },
      ];
      setBookings(mockBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bookings Management</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
              <select
                value={hotelFilter}
                onChange={(e) => setHotelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Hotels</option>
                <option value="1">Luxury Hotel Phnom Penh</option>
                <option value="2">Riverside Resort</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Guest</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hotel</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-in</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-out</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4 text-gray-700">{booking.userName}</td>
                    <td className="px-6 py-4 text-gray-700">{booking.hotelName}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {typeof booking.checkInDate === 'string'
                        ? booking.checkInDate
                        : booking.checkInDate?.toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {typeof booking.checkOutDate === 'string'
                        ? booking.checkOutDate
                        : booking.checkOutDate?.toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${booking.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentBadge(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

