'use client';

import React, { useState, useEffect } from 'react';
import { HotelAdmin } from '@/types';

interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export default function Header({ onMenuClick, onLogout }: HeaderProps) {
  const [admin, setAdmin] = useState<HotelAdmin | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load admin info from localStorage
    const adminData = localStorage.getItem('hotel_admin_user');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left side - Menu button */}
      <button
        onClick={onMenuClick}
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Right side - User menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <div className="text-right">
            <p className="font-semibold text-sm">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{admin?.role || 'Hotel Admin'}</p>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {admin?.name?.charAt(0) || 'A'}
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg">
              Settings
            </Link>
            <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              Profile
            </Link>
            <button
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Import Link
import Link from 'next/link';

