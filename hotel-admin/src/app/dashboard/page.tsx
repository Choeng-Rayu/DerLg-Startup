'use client';

import React, { useState, useEffect } from 'react';
import { DashboardKPI, BookingTrend, RoomTypePerformance } from '@/types';
import KPICard from '@/components/dashboard/KPICard';
import BookingTrendChart from '@/components/dashboard/BookingTrendChart';
import RoomPerformanceChart from '@/components/dashboard/RoomPerformanceChart';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPI | null>(null);
  const [trends, setTrends] = useState<BookingTrend[]>([]);
  const [roomPerformance, setRoomPerformance] = useState<RoomTypePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get hotel ID from localStorage
        const hotelInfo = localStorage.getItem('hotel_info');
        const hotelId = hotelInfo ? JSON.parse(hotelInfo).id : 'default';

        // Fetch KPIs
        const kpiResponse = await fetch(`/api/dashboard/kpis?hotelId=${hotelId}`);
        const kpiData = await kpiResponse.json();
        if (kpiData.success) {
          setKpis(kpiData.data);
        }

        // Fetch Trends
        const trendsResponse = await fetch(`/api/dashboard/trends?hotelId=${hotelId}&days=30`);
        const trendsData = await trendsResponse.json();
        if (trendsData.success) {
          setTrends(trendsData.data);
        }

        // Fetch Room Performance
        const roomResponse = await fetch(`/api/dashboard/room-performance?hotelId=${hotelId}`);
        const roomData = await roomResponse.json();
        if (roomData.success) {
          setRoomPerformance(roomData.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Bookings"
          value={kpis?.totalBookings || 0}
          icon="📅"
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Total Revenue"
          value={`$${(kpis?.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Occupancy Rate"
          value={`${kpis?.averageOccupancyRate || 0}%`}
          icon="📊"
          color="orange"
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Avg Rating"
          value={`${kpis?.averageCustomerRating || 0}`}
          icon="⭐"
          unit="/ 5"
          color="purple"
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Daily Bookings"
          value={kpis?.dailyBookings || 0}
          icon="📈"
          color="blue"
        />
        <KPICard
          title="Monthly Bookings"
          value={kpis?.monthlyBookings || 0}
          icon="📊"
          color="green"
        />
        <KPICard
          title="Pending Bookings"
          value={kpis?.pendingBookings || 0}
          icon="⏳"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BookingTrendChart data={trends} />
        <RoomPerformanceChart data={roomPerformance} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/bookings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-gray-900">View Bookings</p>
            <p className="text-sm text-gray-600">Manage all bookings</p>
          </a>
          <a
            href="/rooms"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-gray-900">Manage Rooms</p>
            <p className="text-sm text-gray-600">Update room inventory</p>
          </a>
          <a
            href="/messages"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-gray-900">Messages</p>
            <p className="text-sm text-gray-600">Chat with guests</p>
          </a>
          <a
            href="/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-gray-900">Reports</p>
            <p className="text-sm text-gray-600">Export analytics</p>
          </a>
        </div>
      </div>
    </div>
  );
}

