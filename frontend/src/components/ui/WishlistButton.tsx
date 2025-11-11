'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { WishlistItemType } from '@/types';

interface WishlistButtonProps {
  itemType: WishlistItemType;
  itemId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WishlistButton({ 
  itemType, 
  itemId, 
  className = '',
  size = 'md'
}: WishlistButtonProps) {
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkWishlistStatus();
  }, [itemId]);

  const checkWishlistStatus = async () => {
    try {
      setChecking(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setChecking(false);
        return;
      }

      const response = await api.get('/wishlist');

      if (response.success && response.data) {
        const items = response.data as Array<{ id: string; item_type: string; item_id: string }>;
        const existingItem = items.find(
          item => item.item_type === itemType && item.item_id === itemId
        );

        if (existingItem) {
          setIsInWishlist(true);
          setWishlistItemId(existingItem.id);
        }
      }
    } catch (err: any) {
      // Silently fail if not authenticated
      console.error('Error checking wishlist status:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist && wishlistItemId) {
        // Remove from wishlist
        const response = await api.delete(`/wishlist/${wishlistItemId}`);

        if (response.success) {
          setIsInWishlist(false);
          setWishlistItemId(null);
        } else {
          alert('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await api.post('/wishlist', {
          item_type: itemType,
          item_id: itemId,
        });

        if (response.success && response.data) {
          setIsInWishlist(true);
          setWishlistItemId((response.data as any).id);
        } else {
          alert('Failed to add to wishlist');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('authenticated')) {
        router.push(`/login?redirect=${window.location.pathname}`);
      } else {
        alert(err.message || 'Failed to update wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (checking) {
    return (
      <button
        className={`${sizeClasses[size]} flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md ${className}`}
        disabled
      >
        <svg className={`${iconSizeClasses[size]} text-gray-400 animate-pulse`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`${sizeClasses[size]} flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isInWishlist ? (
        <svg className={`${iconSizeClasses[size]} text-red-600`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className={`${iconSizeClasses[size]} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}
