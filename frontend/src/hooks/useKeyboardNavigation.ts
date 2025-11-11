'use client';

import { useEffect, useRef } from 'react';
import { trapFocus } from '@/lib/accessibility';

/**
 * Hook for keyboard navigation in modals and dialogs
 */
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  onEscape?: () => void
) {
  useEffect(() => {
    if (!containerRef.current) return;

    const cleanup = trapFocus(containerRef.current, onEscape);
    return cleanup;
  }, [containerRef, onEscape]);
}

/**
 * Hook for managing focus on mount
 */
export function useFocusOnMount(
  ref: React.RefObject<HTMLElement>,
  shouldFocus: boolean = true
) {
  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus, ref]);
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestoration() {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousActiveElement.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    previousActiveElement.current?.focus();
  };

  return { saveFocus, restoreFocus };
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = options?.ctrlKey ? e.ctrlKey : !e.ctrlKey;
      const matchesShift = options?.shiftKey ? e.shiftKey : !e.shiftKey;
      const matchesAlt = options?.altKey ? e.altKey : !e.altKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options]);
}

/**
 * Hook for managing skip links
 */
export function useSkipLink(targetId: string) {
  useEffect(() => {
    const handleSkipLink = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.altKey) {
        const target = document.getElementById(targetId);
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleSkipLink);
    return () => window.removeEventListener('keydown', handleSkipLink);
  }, [targetId]);
}

