'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

interface BookingData {
  week: string;
  bookings: number;
  cancellations: number;
}

interface GrowthData {
  month: string;
  users: number;
  hotels: number;
  bookings: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [bookingData, setBookingData] = useState<BookingData[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockRevenueData = [
        { month: 'Jan', revenue: 45000, target: 50000 },
        { month: 'Feb', revenue: 52000, target: 50000 },
        { month: 'Mar', revenue: 48000, target: 50000 },
        { month: 'Apr', revenue: 61000, target: 55000 },
        { month: 'May', revenue: 55000, target: 55000 },
        { month: 'Jun', revenue: 67000, target: 60000 },
      ];

      const mockBookingData = [
        { week: 'Week 1', bookings: 120, cancellations: 8 },
        { week: 'Week 2', bookings: 145, cancellations: 10 },
        { week: 'Week 3', bookings: 132, cancellations: 7 },
        { week: 'Week 4', bookings: 158, cancellations: 12 },
      ];

      const mockGrowthData = [
        { month: 'Jan', users: 1200, hotels: 45, bookings: 320 },
        { month: 'Feb', users: 1450, hotels: 52, bookings: 380 },
        { month: 'Mar', users: 1680, hotels: 58, bookings: 420 },
        { month: 'Apr', users: 1920, hotels: 65, bookings: 480 },
        { month: 'May', users: 2150, hotels: 72, bookings: 540 },
        { month: 'Jun', users: 2450, hotels: 80, bookings: 620 },
      ];

      setRevenueData(mockRevenueData);
      setBookingData(mockBookingData);
      setGrowthData(mockGrowthData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      // TODO: Implement CSV export
      const csvContent = [
        ['Month', 'Revenue', 'Target'],
        ...revenueData.map((d) => [d.month, d.revenue, d.target]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics_report.csv';
      a.click();
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError('Failed to export CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      // TODO: Implement PDF export
      alert('PDF export functionality coming soon');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export PDF');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics & Reports</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Revenue vs Target</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Actual Revenue" />
              <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Booking Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#3b82f6" name="New Bookings" />
              <Bar dataKey="cancellations" fill="#ef4444" name="Cancellations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Metrics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Growth Metrics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
              <Line yAxisId="left" type="monotone" dataKey="hotels" stroke="#10b981" strokeWidth={2} name="Hotels" />
              <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={2} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue (6 months)</p>
            <p className="text-3xl font-bold text-gray-900">
              ${revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Bookings (6 months)</p>
            <p className="text-3xl font-bold text-gray-900">
              {growthData.reduce((sum, d) => sum + d.bookings, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">User Growth</p>
            <p className="text-3xl font-bold text-gray-900">
              +{((growthData[growthData.length - 1].users - growthData[0].users) / growthData[0].users * 100).toFixed(0)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-2">Hotel Growth</p>
            <p className="text-3xl font-bold text-gray-900">
              +{((growthData[growthData.length - 1].hotels - growthData[0].hotels) / growthData[0].hotels * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

