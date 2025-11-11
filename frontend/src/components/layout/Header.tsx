'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              DerLg
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/hotels" className="text-gray-700 hover:text-blue-600 transition">
              {t('navigation.hotels')}
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600 transition">
              {t('navigation.tours')}
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-blue-600 transition">
              {t('navigation.events')}
            </Link>
            <Link href="/chat-ai" className="text-gray-700 hover:text-blue-600 transition">
              {t('navigation.chat')}
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/wishlist" className="text-gray-700 hover:text-blue-600 transition" aria-label={t('navigation.wishlist')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition" aria-label={t('navigation.profile')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <LanguageSelector />
            <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
              {t('navigation.login')}
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              {t('auth.createAccount')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/hotels" className="text-gray-700 hover:text-blue-600 transition">
                {t('navigation.hotels')}
              </Link>
              <Link href="/tours" className="text-gray-700 hover:text-blue-600 transition">
                {t('navigation.tours')}
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-blue-600 transition">
                {t('navigation.events')}
              </Link>
              <Link href="/chat-ai" className="text-gray-700 hover:text-blue-600 transition">
                {t('navigation.chat')}
              </Link>
              <Link href="/wishlist" className="text-gray-700 hover:text-blue-600 transition">
                {t('navigation.wishlist')}
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition">
                {t('navigation.profile')}
              </Link>
              <LanguageSelector />
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
                {t('navigation.login')}
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center">
                {t('auth.createAccount')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
