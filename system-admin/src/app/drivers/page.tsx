'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Driver } from '@/types';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    telegramUsername: '',
    vehicleType: 'car' as 'tuk_tuk' | 'car' | 'van' | 'bus',
    vehicleNumber: '',
    seatCapacity: 4,
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'Rith',
          phone: '+855987654321',
          telegramUsername: '@rith_driver',
          telegramUserId: '987654321',
          vehicleType: 'car',
          vehicleNumber: 'PP-1234',
          seatCapacity: 4,
          status: 'available',
          rating: 4.7,
          totalTrips: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setDrivers(mockDrivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Call API to add driver
      const newDriver: Driver = {
        id: String(drivers.length + 1),
        ...formData,
        status: 'available',
        rating: 0,
        totalTrips: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDrivers([...drivers, newDriver]);
      setFormData({
        name: '',
        phone: '',
        telegramUsername: '',
        vehicleType: 'car',
        vehicleNumber: '',
        seatCapacity: 4,
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error adding driver:', err);
      setError('Failed to add driver');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Driver'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Add Driver Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleAddDriver}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Driver Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Telegram Username (@username)"
                  value={formData.telegramUsername}
                  onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as 'tuk_tuk' | 'car' | 'van' | 'bus' })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tuk_tuk">Tuk Tuk</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                </select>
                <input
                  type="text"
                  placeholder="Vehicle Number"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Seat Capacity"
                  value={formData.seatCapacity}
                  onChange={(e) => setFormData({ ...formData, seatCapacity: parseInt(e.target.value) })}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Add Driver
              </button>
            </form>
          </div>
        )}

        {/* Drivers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Telegram</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trips</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{driver.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {driver.vehicleType.replace('_', ' ')} ({driver.vehicleNumber})
                    </td>
                    <td className="px-6 py-4 text-gray-700">{driver.telegramUsername}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        driver.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">⭐ {driver.rating}</td>
                    <td className="px-6 py-4 text-gray-700">{driver.totalTrips}</td>
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

