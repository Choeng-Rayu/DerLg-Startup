'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { DashboardKPI } from '@/types';
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

interface GrowthData {
  month: string;
  users: number;
  hotels: number;
  bookings: number;
  revenue: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPI | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockKPIs: DashboardKPI = {
        totalUsers: 1250,
        totalHotels: 85,
        totalBookings: 3420,
        monthlyRevenue: 125000,
        pendingApprovals: 12,
        activeHotels: 78,
        totalRevenue: 1250000,
      };

      const mockGrowthData: GrowthData[] = [
        { month: 'Jan', users: 800, hotels: 45, bookings: 1200, revenue: 80000 },
        { month: 'Feb', users: 950, hotels: 58, bookings: 1800, revenue: 95000 },
        { month: 'Mar', users: 1100, hotels: 72, bookings: 2400, revenue: 110000 },
        { month: 'Apr', users: 1250, hotels: 85, bookings: 3420, revenue: 125000 },
      ];

      setKpis(mockKPIs);
      setGrowthData(mockGrowthData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Overview</h1>

        {kpis && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Active users on platform</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Hotels</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.totalHotels}</p>
                <p className="text-xs text-gray-500 mt-2">{kpis.activeHotels} active</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.totalBookings.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">All-time bookings</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${(kpis.monthlyRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500 mt-2">Current month</p>
              </div>
            </div>

            {/* Alerts */}
            {kpis.pendingApprovals > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-yellow-800 font-semibold">
                  ⚠️ {kpis.pendingApprovals} hotel(s) pending approval
                </p>
              </div>
            )}

            {/* Growth Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* User & Hotel Growth */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">User & Hotel Growth</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="users"
                      stroke="#2563eb"
                      name="Users"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="hotels"
                      stroke="#10b981"
                      name="Hotels"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bookings & Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings & Revenue</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="bookings" fill="#2563eb" name="Bookings" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(kpis.totalRevenue / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Average Booking Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Math.round(kpis.totalRevenue / kpis.totalBookings)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2">Hotels Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{kpis.pendingApprovals}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

