'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RoomTypePerformance } from '@/types';

interface RoomPerformanceChartProps {
  data: RoomTypePerformance[];
  title?: string;
  height?: number;
}

export default function RoomPerformanceChart({
  data,
  title = 'Top Performing Room Types',
  height = 400,
}: RoomPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="roomType" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return value.toLocaleString();
              }
              return value;
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="bookings"
            fill="#2563eb"
            name="Bookings"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="revenue"
            fill="#10b981"
            name="Revenue ($)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Room Type Details Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Room Type</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Bookings</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Revenue</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {data.map((room, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{room.roomType}</td>
                <td className="px-4 py-3 text-right text-gray-700">{room.bookings}</td>
                <td className="px-4 py-3 text-right text-gray-700">${room.revenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {room.occupancyRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

