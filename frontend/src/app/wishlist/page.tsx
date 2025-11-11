'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { WishlistItem, Hotel, Tour, Event } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

interface WishlistItemWithDetails extends WishlistItem {
  item: Hotel | Tour | Event | null;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'hotel' | 'tour' | 'event'>('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/wishlist');

      if (response.success && response.data) {
        setWishlistItems(response.data as WishlistItemWithDetails[]);
      } else {
        setError('Failed to load wishlist');
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('authenticated')) {
        router.push('/login?redirect=/wishlist');
      } else {
        setError(err.message || 'Failed to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
      return;
    }

    try {
      const response = await api.delete(`/wishlist/${itemId}`);

      if (response.success) {
        setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      } else {
        alert('Failed to remove item from wishlist');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove item from wishlist');
    }
  };

  const handleEditNote = (itemId: string, currentNote: string | undefined) => {
    setEditingNote(itemId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = async (itemId: string) => {
    try {
      const response = await api.put(`/wishlist/${itemId}`, {
        notes: noteText.trim() || null,
      });

      if (response.success) {
        setWishlistItems(wishlistItems.map(item =>
          item.id === itemId ? { ...item, notes: noteText.trim() || undefined } : item
        ));
        setEditingNote(null);
        setNoteText('');
      } else {
        alert('Failed to update note');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteText('');
  };

  const handleItemClick = (item: WishlistItemWithDetails) => {
    if (item.item_type === 'hotel') {
      router.push(`/hotels/${item.item_id}`);
    } else if (item.item_type === 'tour') {
      router.push(`/tours/${item.item_id}`);
    } else if (item.item_type === 'event') {
      router.push(`/events/${item.item_id}`);
    }
  };

  const getItemName = (item: WishlistItemWithDetails): string => {
    if (!item.item) return 'Unknown Item';
    return (item.item as any).name || 'Unknown Item';
  };

  const getItemImage = (item: WishlistItemWithDetails): string | null => {
    if (!item.item) return null;
    const images = (item.item as any).images;
    return images && images.length > 0 ? images[0] : null;
  };

  const getItemDescription = (item: WishlistItemWithDetails): string => {
    if (!item.item) return '';
    return (item.item as any).description || '';
  };

  const getItemPrice = (item: WishlistItemWithDetails): number | null => {
    if (!item.item) return null;
    
    if (item.item_type === 'hotel') {
      // Hotels don't have a single price, return null
      return null;
    } else if (item.item_type === 'tour') {
      return (item.item as Tour).price_per_person;
    } else if (item.item_type === 'event') {
      return (item.item as Event).pricing.base_price;
    }
    
    return null;
  };

  const filteredItems = filter === 'all' 
    ? wishlistItems 
    : wishlistItems.filter(item => item.item_type === filter);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Save your favorite hotels, tours, and events</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({wishlistItems.length})
          </button>
          <button
            onClick={() => setFilter('hotel')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'hotel'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hotels ({wishlistItems.filter(i => i.item_type === 'hotel').length})
          </button>
          <button
            onClick={() => setFilter('tour')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'tour'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tours ({wishlistItems.filter(i => i.item_type === 'tour').length})
          </button>
          <button
            onClick={() => setFilter('event')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'event'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Events ({wishlistItems.filter(i => i.item_type === 'event').length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <Card className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'Your wishlist is empty' : `No ${filter}s in your wishlist`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start adding your favorite {filter === 'all' ? 'items' : `${filter}s`} to your wishlist
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/hotels')}>
                Browse Hotels
              </Button>
              <Button onClick={() => router.push('/tours')} variant="outline">
                Browse Tours
              </Button>
              <Button onClick={() => router.push('/events')} variant="outline">
                Browse Events
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {/* Item Image */}
                <div 
                  className="relative h-48 bg-gray-200 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  {getItemImage(item) ? (
                    <img
                      src={getItemImage(item)!}
                      alt={getItemName(item)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold capitalize">
                      {item.item_type}
                    </span>
                  </div>
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                    className="absolute top-2 left-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition"
                    title="Remove from wishlist"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleItemClick(item)}
                  >
                    {getItemName(item)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {getItemDescription(item)}
                  </p>

                  {/* Price */}
                  {getItemPrice(item) !== null && (
                    <div className="mb-3">
                      <span className="text-xl font-bold text-blue-600">
                        ${getItemPrice(item)}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        {item.item_type === 'tour' ? 'per person' : ''}
                      </span>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    {editingNote === item.id ? (
                      <div>
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleSaveNote(item.id)}
                            className="flex-1"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {item.notes ? (
                          <div>
                            <p className="text-sm text-gray-700 mb-2">{item.notes}</p>
                            <button
                              onClick={() => handleEditNote(item.id, item.notes)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Edit note
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditNote(item.id, item.notes)}
                            className="text-sm text-gray-500 hover:text-blue-600"
                          >
                            + Add a note
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Button
                    onClick={() => handleItemClick(item)}
                    variant="outline"
                    className="w-full mt-3"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
