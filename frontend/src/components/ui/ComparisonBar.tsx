'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { getComparisonCount, clearComparison } from '@/lib/comparison';

export function ComparisonBar() {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initial count
    const initialCount = getComparisonCount();
    setCount(initialCount);
    setIsVisible(initialCount > 0);

    // Listen for comparison updates
    const handleUpdate = () => {
      const newCount = getComparisonCount();
      setCount(newCount);
      setIsVisible(newCount > 0);
    };

    window.addEventListener('comparisonUpdated', handleUpdate);
    return () => window.removeEventListener('comparisonUpdated', handleUpdate);
  }, []);

  const handleCompare = () => {
    router.push('/hotels/compare');
  };

  const handleClear = () => {
    clearComparison();
    setCount(0);
    setIsVisible(false);
    window.dispatchEvent(new CustomEvent('comparisonUpdated'));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white shadow-lg z-50 animate-slide-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="font-semibold">
                {count} {count === 1 ? 'hotel' : 'hotels'} selected for comparison
              </span>
            </div>
            {count < 4 && (
              <span className="text-sm text-blue-100">
                Add up to {4 - count} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="text-sm text-blue-100 hover:text-white transition-colors"
            >
              Clear all
            </button>
            <Button
              variant="default"
              size="md"
              onClick={handleCompare}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Compare Hotels
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
