'use client';

import React, { useState, useEffect } from 'react';
import { PromoCode } from '@/types';

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountPercentage: '',
    discountAmount: '',
    expirationDate: '',
    usageLimit: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const hotelInfo = localStorage.getItem('hotel_info');
      const hotelId = hotelInfo ? JSON.parse(hotelInfo).id : 'default';

      const response = await fetch(`/api/promo-codes?hotelId=${hotelId}`);
      const data = await response.json();

      if (data.success) {
        setPromoCodes(data.data);
      } else {
        setError('Failed to load promo codes');
      }
    } catch (err) {
      console.error('Error fetching promo codes:', err);
      setError('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code) {
      setError('Promo code is required');
      return;
    }

    if (formData.discountType === 'percentage') {
      const discount = parseFloat(formData.discountPercentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        setError('Discount percentage must be between 0 and 100');
        return;
      }
    } else {
      const discount = parseFloat(formData.discountAmount);
      if (isNaN(discount) || discount <= 0) {
        setError('Discount amount must be positive');
        return;
      }
    }

    if (formData.usageLimit) {
      const limit = parseInt(formData.usageLimit);
      if (isNaN(limit) || limit < 1) {
        setError('Usage limit must be at least 1');
        return;
      }
    }

    try {
      const hotelInfo = localStorage.getItem('hotel_info');
      const hotelId = hotelInfo ? JSON.parse(hotelInfo).id : 'default';

      if (editingPromo) {
        // Update promo code
        const response = await fetch(`/api/promo-codes/${editingPromo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discountPercentage: formData.discountType === 'percentage' ? parseFloat(formData.discountPercentage) : null,
            discountAmount: formData.discountType === 'fixed' ? parseFloat(formData.discountAmount) : null,
            expirationDate: formData.expirationDate,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setPromoCodes(promoCodes.map((p) => (p.id === editingPromo.id ? { ...p, ...data.data } : p)));
          resetForm();
        }
      } else {
        // Create new promo code
        const response = await fetch('/api/promo-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotelId,
            code: formData.code.toUpperCase(),
            discountPercentage: formData.discountType === 'percentage' ? parseFloat(formData.discountPercentage) : null,
            discountAmount: formData.discountType === 'fixed' ? parseFloat(formData.discountAmount) : null,
            expirationDate: formData.expirationDate,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setPromoCodes([...promoCodes, data.data]);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Error saving promo code:', err);
      setError('Failed to save promo code');
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    const expirationDateStr = typeof promo.expirationDate === 'string'
      ? promo.expirationDate
      : promo.expirationDate?.toISOString().split('T')[0] || '';

    setFormData({
      code: promo.code,
      discountType: promo.discountPercentage ? 'percentage' : 'fixed',
      discountPercentage: promo.discountPercentage?.toString() || '',
      discountAmount: promo.discountAmount?.toString() || '',
      expirationDate: expirationDateStr,
      usageLimit: promo.usageLimit?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const response = await fetch(`/api/promo-codes/${promoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setPromoCodes(promoCodes.filter((p) => p.id !== promoId));
      }
    } catch (err) {
      console.error('Error deleting promo code:', err);
      setError('Failed to delete promo code');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountPercentage: '',
      discountAmount: '',
      expirationDate: '',
      usageLimit: '',
    });
    setEditingPromo(null);
    setShowForm(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading promo codes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + Create Promo Code
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Promo Code Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SUMMER20"
                  disabled={!!editingPromo}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.discountType === 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage *</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount ($) *</label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {editingPromo ? 'Update Promo Code' : 'Create Promo Code'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {promoCodes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No promo codes created yet. Click &quot;Create Promo Code&quot; to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expiration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Usage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-semibold">{promo.code}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {promo.discountPercentage ? `${promo.discountPercentage}%` : `$${promo.discountAmount}`}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {typeof promo.expirationDate === 'string'
                        ? promo.expirationDate
                        : promo.expirationDate?.toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {promo.usageLimit ? `${promo.usageCount}/${promo.usageLimit}` : `${promo.usageCount}/∞`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          promo.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(promo)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

