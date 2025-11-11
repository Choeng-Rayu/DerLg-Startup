'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { User } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'deactivate' | 'reset_password' | null>(null);

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+855123456789',
          userType: 'tourist',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          bookingCount: 5,
          totalSpent: 2500,
        },
        {
          id: '2',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+855987654321',
          userType: 'hotel_admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          bookingCount: 0,
          totalSpent: 0,
        },
      ];
      setUsers(mockUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    try {
      // TODO: Call API to deactivate user
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, isActive: false } : u
        )
      );
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deactivating user:', err);
      setError('Failed to deactivate user');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      // TODO: Call API to reset password
      alert(`Password reset email sent to ${selectedUser.email}`);
      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Failed to reset password');
    }
  };

  const openModal = (user: User, action: 'deactivate' | 'reset_password') => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <input
            type="text"
            placeholder="Search by email, first name, or last name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bookings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Spent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 text-gray-700 capitalize">{user.userType.replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-gray-700">{user.bookingCount || 0}</td>
                    <td className="px-6 py-4 text-gray-700">${user.totalSpent || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.isActive && (
                          <>
                            <button
                              onClick={() => openModal(user, 'reset_password')}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => openModal(user, 'deactivate')}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Deactivate
                            </button>
                          </>
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
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {modalAction === 'deactivate' && 'Deactivate User'}
                {modalAction === 'reset_password' && 'Reset Password'}
              </h2>

              <p className="text-gray-600 mb-6">
                {modalAction === 'deactivate' &&
                  `Are you sure you want to deactivate ${selectedUser.firstName} ${selectedUser.lastName}?`}
                {modalAction === 'reset_password' &&
                  `Send password reset email to ${selectedUser.email}?`}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (modalAction === 'deactivate') handleDeactivate();
                    else if (modalAction === 'reset_password') handleResetPassword();
                  }}
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    modalAction === 'deactivate'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {modalAction === 'deactivate' && 'Deactivate'}
                  {modalAction === 'reset_password' && 'Send Reset Email'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

