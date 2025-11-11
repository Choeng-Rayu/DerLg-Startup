'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Hotel } from '@/types';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'disable' | null>(null);

  const filterHotels = () => {
    let filtered = hotels;

    if (searchTerm) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((h) => h.status === statusFilter);
    }

    setFilteredHotels(filtered);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    filterHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels, searchTerm, statusFilter]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockHotels: Hotel[] = [
        {
          id: '1',
          name: 'Luxury Hotel Phnom Penh',
          email: 'admin@luxuryhotel.com',
          phone: '+855123456789',
          address: '123 Main St',
          city: 'Phnom Penh',
          country: 'Cambodia',
          status: 'pending_approval',
          adminId: 'admin1',
          adminName: 'John Doe',
          adminEmail: 'john@example.com',
          roomCount: 50,
          averageRating: 4.5,
          totalBookings: 120,
          totalRevenue: 50000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Riverside Resort',
          email: 'info@riverside.com',
          phone: '+855987654321',
          address: '456 River Rd',
          city: 'Siem Reap',
          country: 'Cambodia',
          status: 'active',
          adminId: 'admin2',
          adminName: 'Jane Smith',
          adminEmail: 'jane@example.com',
          roomCount: 75,
          averageRating: 4.8,
          totalBookings: 250,
          totalRevenue: 120000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setHotels(mockHotels);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };



  const handleApprove = async () => {
    if (!selectedHotel) return;
    try {
      // TODO: Call API to approve hotel
      setHotels(
        hotels.map((h) =>
          h.id === selectedHotel.id ? { ...h, status: 'active' } : h
        )
      );
      setShowModal(false);
      setSelectedHotel(null);
    } catch (err) {
      console.error('Error approving hotel:', err);
      setError('Failed to approve hotel');
    }
  };

  const handleReject = async () => {
    if (!selectedHotel) return;
    try {
      // TODO: Call API to reject hotel
      setHotels(
        hotels.map((h) =>
          h.id === selectedHotel.id
            ? { ...h, status: 'rejected', rejectionReason }
            : h
        )
      );
      setShowModal(false);
      setSelectedHotel(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting hotel:', err);
      setError('Failed to reject hotel');
    }
  };

  const handleDisable = async () => {
    if (!selectedHotel) return;
    try {
      // TODO: Call API to disable hotel
      setHotels(
        hotels.map((h) =>
          h.id === selectedHotel.id ? { ...h, status: 'disabled' } : h
        )
      );
      setShowModal(false);
      setSelectedHotel(null);
    } catch (err) {
      console.error('Error disabling hotel:', err);
      setError('Failed to disable hotel');
    }
  };

  const openModal = (hotel: Hotel, action: 'approve' | 'reject' | 'disable') => {
    setSelectedHotel(hotel);
    setModalAction(action);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      disabled: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hotel Management</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Hotels Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hotel Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Admin</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bookings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{hotel.name}</td>
                    <td className="px-6 py-4 text-gray-700">{hotel.adminName}</td>
                    <td className="px-6 py-4 text-gray-700">{hotel.city}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(hotel.status)}`}>
                        {hotel.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{hotel.totalBookings}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {hotel.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => openModal(hotel, 'approve')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openModal(hotel, 'reject')}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {hotel.status === 'active' && (
                          <button
                            onClick={() => openModal(hotel, 'disable')}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedHotel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {modalAction === 'approve' && 'Approve Hotel'}
                {modalAction === 'reject' && 'Reject Hotel'}
                {modalAction === 'disable' && 'Disable Hotel'}
              </h2>

              {modalAction === 'reject' && (
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (modalAction === 'approve') handleApprove();
                    else if (modalAction === 'reject') handleReject();
                    else if (modalAction === 'disable') handleDisable();
                  }}
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    modalAction === 'reject' || modalAction === 'disable'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {modalAction === 'approve' && 'Approve'}
                  {modalAction === 'reject' && 'Reject'}
                  {modalAction === 'disable' && 'Disable'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

