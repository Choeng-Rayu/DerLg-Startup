'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Guide } from '@/types';

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    telegramUsername: '',
    specializations: [] as string[],
    languages: [] as string[],
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockGuides: Guide[] = [
        {
          id: '1',
          name: 'Sokha',
          phone: '+855123456789',
          telegramUsername: '@sokha_guide',
          telegramUserId: '123456789',
          specializations: ['Angkor Wat', 'Phnom Penh'],
          languages: ['Khmer', 'English'],
          status: 'available',
          rating: 4.8,
          totalTours: 45,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setGuides(mockGuides);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError('Failed to load guides');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Call API to add guide
      const newGuide: Guide = {
        id: String(guides.length + 1),
        ...formData,
        status: 'available',
        rating: 0,
        totalTours: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setGuides([...guides, newGuide]);
      setFormData({
        name: '',
        phone: '',
        telegramUsername: '',
        specializations: [],
        languages: [],
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error adding guide:', err);
      setError('Failed to add guide');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading guides...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guide Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Guide'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Add Guide Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleAddGuide}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Guide Name"
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
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Add Guide
              </button>
            </form>
          </div>
        )}

        {/* Guides Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Telegram</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tours</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((guide) => (
                  <tr key={guide.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{guide.name}</td>
                    <td className="px-6 py-4 text-gray-700">{guide.telegramUsername}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        guide.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {guide.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">⭐ {guide.rating}</td>
                    <td className="px-6 py-4 text-gray-700">{guide.totalTours}</td>
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

