'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';

const BOOKING_STATUSES = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete' | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const hotelInfo = localStorage.getItem('hotel_info');
      const hotelId = hotelInfo ? JSON.parse(hotelInfo).id : 'default';

      const url = selectedStatus
        ? `/api/bookings?hotelId=${hotelId}&status=${selectedStatus}`
        : `/api/bookings?hotelId=${hotelId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (booking: Booking, action: 'approve' | 'reject' | 'complete') => {
    setSelectedBooking(booking);
    setActionType(action);
    setActionReason('');
    setShowModal(true);
  };

  const submitAction = async () => {
    if (!selectedBooking || !actionType) return;

    try {
      let newStatus = '';
      if (actionType === 'approve') newStatus = 'confirmed';
      else if (actionType === 'reject') newStatus = 'rejected';
      else if (actionType === 'complete') newStatus = 'completed';

      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingStatus: newStatus,
          reason: actionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookings(
          bookings.map((b) =>
            b.id === selectedBooking.id
              ? { ...b, bookingStatus: newStatus as 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled' }
              : b
          )
        );
        setShowModal(false);
        setSelectedBooking(null);
        setActionType(null);
      } else {
        setError(data.message || 'Failed to update booking');
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Bookings</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStatus(null)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            selectedStatus === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Bookings
        </button>
        {BOOKING_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Guest</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Room Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-in</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-out</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">{booking.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{booking.guestName}</p>
                        <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{booking.roomType}</td>
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
                    <td className="px-6 py-4 text-gray-900 font-semibold">${booking.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[booking.bookingStatus || 'pending']}`}>
                        {booking.bookingStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {booking.bookingStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(booking, 'approve')}
                              className="text-green-600 hover:text-green-800 font-semibold text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(booking, 'reject')}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.bookingStatus === 'confirmed' && (
                          <button
                            onClick={() => handleAction(booking, 'complete')}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">
              {actionType === 'approve' && 'Approve Booking'}
              {actionType === 'reject' && 'Reject Booking'}
              {actionType === 'complete' && 'Mark as Completed'}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Booking ID: {selectedBooking.id}</p>
              <p className="text-sm text-gray-600">Guest: {selectedBooking.guestName}</p>
              <p className="text-sm text-gray-600">Amount: ${selectedBooking.totalAmount}</p>
            </div>

            {(actionType === 'reject' || actionType === 'complete') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {actionType === 'reject' ? 'Rejection Reason' : 'Notes'}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={submitAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold transition-colors ${
                  actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionType === 'approve' && 'Approve'}
                {actionType === 'reject' && 'Reject'}
                {actionType === 'complete' && 'Complete'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                  setActionType(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

