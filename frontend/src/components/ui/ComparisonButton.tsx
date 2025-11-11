'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import {
  addToComparison,
  removeFromComparison,
  isInComparison,
  canAddMore,
  getMaxLimit,
} from '@/lib/comparison';

interface ComparisonButtonProps {
  hotelId: string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ComparisonButton({
  hotelId,
  variant = 'outline',
  size = 'sm',
  className = '',
}: ComparisonButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [canAdd, setCanAdd] = useState(true);

  useEffect(() => {
    setIsAdded(isInComparison(hotelId));
    setCanAdd(canAddMore());
  }, [hotelId]);

  const handleToggle = () => {
    if (isAdded) {
      removeFromComparison(hotelId);
      setIsAdded(false);
      setCanAdd(true);
      
      // Dispatch custom event to update comparison count
      window.dispatchEvent(new CustomEvent('comparisonUpdated'));
    } else {
      if (canAddMore()) {
        const added = addToComparison(hotelId);
        if (added) {
          setIsAdded(true);
          setCanAdd(canAddMore());
          
          // Dispatch custom event to update comparison count
          window.dispatchEvent(new CustomEvent('comparisonUpdated'));
        }
      }
    }
  };

  if (isAdded) {
    return (
      <Button
        variant="default"
        size={size}
        onClick={handleToggle}
        className={className}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        Added to Compare
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={!canAdd && !isAdded}
      className={className}
    >
      <svg
        className="w-4 h-4 mr-2"
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
      {!canAdd && !isAdded ? `Max ${getMaxLimit()} hotels` : 'Compare'}
    </Button>
  );
}
