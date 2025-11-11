/**
 * Accessibility Utilities
 * Helpers for WCAG 2.1 Level AA compliance
 */

/**
 * Check color contrast ratio (WCAG 2.1)
 * Returns true if contrast ratio meets AA standards
 */
export const checkColorContrast = (
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean => {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);

  const contrast =
    (Math.max(fgLuminance, bgLuminance) + 0.05) /
    (Math.min(fgLuminance, bgLuminance) + 0.05);

  // AA standards: 4.5:1 for normal text, 3:1 for large text
  return largeText ? contrast >= 3 : contrast >= 4.5;
};

/**
 * Calculate relative luminance of a color
 */
const getRelativeLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): number[] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
};

/**
 * Generate ARIA label for interactive elements
 */
export const generateAriaLabel = (
  action: string,
  context?: string
): string => {
  return context ? `${action} ${context}` : action;
};

/**
 * Check if element is keyboard accessible
 */
export const isKeyboardAccessible = (element: HTMLElement): boolean => {
  const tabindex = element.getAttribute('tabindex');
  const isNaturallyFocusable =
    ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
      element.tagName
    ) && !element.hasAttribute('disabled');

  return isNaturallyFocusable || (tabindex !== null && parseInt(tabindex) >= 0);
};

/**
 * Add focus visible styles to element
 */
export const addFocusVisibleStyles = (element: HTMLElement): void => {
  element.style.outline = '2px solid #4F46E5';
  element.style.outlineOffset = '2px';
};

/**
 * Remove focus visible styles from element
 */
export const removeFocusVisibleStyles = (element: HTMLElement): void => {
  element.style.outline = '';
  element.style.outlineOffset = '';
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Skip to main content link
 */
export const createSkipLink = (): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className =
    'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2';

  return skipLink;
};

/**
 * Check if image has alt text
 */
export const hasAltText = (img: HTMLImageElement): boolean => {
  const alt = img.getAttribute('alt');
  return alt !== null && alt.trim().length > 0;
};

/**
 * Validate form accessibility
 */
export const validateFormAccessibility = (form: HTMLFormElement): string[] => {
  const errors: string[] = [];
  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach((input) => {
    const inputElement = input as HTMLInputElement;
    const id = inputElement.id;
    const ariaLabel = inputElement.getAttribute('aria-label');
    const label = id ? form.querySelector(`label[for="${id}"]`) : null;

    if (!id && !ariaLabel && !label) {
      errors.push(`Input without label or aria-label: ${inputElement.name}`);
    }
  });

  return errors;
};

/**
 * Get all focusable elements in a container
 */
export const getFocusableElements = (
  container: HTMLElement
): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(
    container.querySelectorAll(focusableSelectors.join(','))
  ) as HTMLElement[];
};

/**
 * Trap focus within a modal or dialog
 */
export const trapFocus = (
  container: HTMLElement,
  onEscape?: () => void
): (() => void) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && onEscape) {
      onEscape();
      return;
    }

    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

