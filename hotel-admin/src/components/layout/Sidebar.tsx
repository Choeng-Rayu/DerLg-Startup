'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Bookings', href: '/bookings', icon: '📅' },
  { label: 'Rooms', href: '/rooms', icon: '🛏️' },
  { label: 'Hotel Profile', href: '/hotel-profile', icon: '🏨' },
  { label: 'Messages', href: '/messages', icon: '💬' },
  { label: 'Analytics', href: '/analytics', icon: '📈' },
  { label: 'Promo Codes', href: '/promo-codes', icon: '🎟️' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="text-2xl">🏨</div>
            {isOpen && <span className="font-bold text-lg">DerLg Admin</span>}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onToggle}
            className="w-full text-left text-gray-300 hover:text-white transition-colors"
          >
            {isOpen ? '← Collapse' : '→ Expand'}
          </button>
        </div>
      </aside>
    </>
  );
}

