'use client';

import React, { useState, useEffect } from 'react';
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
  date: string;
  revenue: number;
  bookings: number;
}

interface RoomTypePerformance {
  roomType: string;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

interface AnalyticsData {
  revenueData: RevenueData[];
  roomPerformance: RoomTypePerformance[];
  totalRevenue: number;
  totalBookings: number;
  averageOccupancyRate: number;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const hotelInfo = localStorage.getItem('hotel_info');
      const hotelId = hotelInfo ? JSON.parse(hotelInfo).id : 'default';

      // TODO: Replace with actual API call to backend
      const mockData: AnalyticsData = {
        revenueData: [
          { date: 'Jan 1', revenue: 2400, bookings: 8 },
          { date: 'Jan 5', revenue: 3210, bookings: 12 },
          { date: 'Jan 10', revenue: 2290, bookings: 10 },
          { date: 'Jan 15', revenue: 2000, bookings: 7 },
          { date: 'Jan 20', revenue: 2181, bookings: 9 },
          { date: 'Jan 25', revenue: 2500, bookings: 11 },
          { date: 'Jan 30', revenue: 2100, bookings: 8 },
        ],
        roomPerformance: [
          { roomType: 'Deluxe Room', bookings: 45, revenue: 13500, occupancyRate: 85 },
          { roomType: 'Standard Room', bookings: 62, revenue: 12400, occupancyRate: 92 },
          { roomType: 'Suite', bookings: 28, revenue: 14000, occupancyRate: 78 },
          { roomType: 'Economy Room', bookings: 35, revenue: 7000, occupancyRate: 88 },
        ],
        totalRevenue: 46900,
        totalBookings: 170,
        averageOccupancyRate: 85.75,
      };

      setAnalyticsData(mockData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analyticsData) return;

    // Prepare CSV data
    const csvContent = [
      ['Analytics Report'],
      ['Date Range', dateRange],
      [''],
      ['Summary'],
      ['Total Revenue', `$${analyticsData.totalRevenue}`],
      ['Total Bookings', analyticsData.totalBookings],
      ['Average Occupancy Rate', `${analyticsData.averageOccupancyRate}%`],
      [''],
      ['Revenue Trend'],
      ['Date', 'Revenue', 'Bookings'],
      ...analyticsData.revenueData.map((d) => [d.date, `$${d.revenue}`, d.bookings]),
      [''],
      ['Room Type Performance'],
      ['Room Type', 'Bookings', 'Revenue', 'Occupancy Rate'],
      ...analyticsData.roomPerformance.map((r) => [
        r.roomType,
        r.bookings,
        `$${r.revenue}`,
        `${r.occupancyRate}%`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics & Reports</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${analyticsData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Average Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.averageOccupancyRate}%</p>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#10b981"
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Room Type Performance */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Room Type Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.roomPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="roomType" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="bookings" fill="#2563eb" name="Bookings" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Room Type Performance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Room Type Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Room Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bookings</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.roomPerformance.map((room, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{room.roomType}</td>
                      <td className="px-6 py-4 text-gray-700">{room.bookings}</td>
                      <td className="px-6 py-4 text-gray-700">${room.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${room.occupancyRate}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-700 font-semibold">{room.occupancyRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

