'use client';

import { useEffect, useState } from 'react';
import { hasAltText, validateFormAccessibility } from '@/lib/accessibility';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: HTMLElement;
}

/**
 * Accessibility Audit Component
 * Runs accessibility checks and reports issues
 * Only visible in development mode
 */
export default function AccessibilityAudit() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const auditAccessibility = () => {
      const foundIssues: AccessibilityIssue[] = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!hasAltText(img)) {
          foundIssues.push({
            type: 'error',
            message: `Image missing alt text: ${img.src}`,
            element: img,
          });
        }
      });

      // Check for form accessibility
      const forms = document.querySelectorAll('form');
      forms.forEach((form) => {
        const formErrors = validateFormAccessibility(form);
        formErrors.forEach((error) => {
          foundIssues.push({
            type: 'error',
            message: error,
            element: form,
          });
        });
      });

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button) => {
        const hasText = button.textContent?.trim().length ?? 0 > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        const hasTitle = button.getAttribute('title');

        if (!hasText && !hasAriaLabel && !hasTitle) {
          foundIssues.push({
            type: 'warning',
            message: 'Button without accessible name',
            element: button,
          });
        }
      });

      // Check for links without accessible names
      const links = document.querySelectorAll('a');
      links.forEach((link) => {
        const hasText = link.textContent?.trim().length ?? 0 > 0;
        const hasAriaLabel = link.getAttribute('aria-label');
        const hasTitle = link.getAttribute('title');

        if (!hasText && !hasAriaLabel && !hasTitle) {
          foundIssues.push({
            type: 'warning',
            message: 'Link without accessible name',
            element: link,
          });
        }
      });

      // Check for headings hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1]);
        if (level - lastLevel > 1) {
          foundIssues.push({
            type: 'warning',
            message: `Heading hierarchy skipped from H${lastLevel} to H${level}`,
            element: heading as HTMLElement,
          });
        }
        lastLevel = level;
      });

      // Check for color contrast (basic check)
      const textElements = document.querySelectorAll('p, span, a, button, label');
      if (textElements.length > 0) {
        foundIssues.push({
          type: 'info',
          message: `Found ${textElements.length} text elements. Manual color contrast review recommended.`,
        });
      }

      setIssues(foundIssues);
    };

    // Run audit after a short delay to ensure DOM is ready
    const timer = setTimeout(auditAccessibility, 500);
    return () => clearTimeout(timer);
  }, []);

  if (process.env.NODE_ENV !== 'development' || issues.length === 0) {
    return null;
  }

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2"
        aria-label="Toggle accessibility audit panel"
      >
        <span>♿</span>
        <span>
          {errorCount} errors, {warningCount} warnings
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white border-2 border-yellow-500 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-lg mb-3">Accessibility Audit</h3>

          {issues.map((issue, index) => (
            <div
              key={index}
              className={`mb-3 p-2 rounded border-l-4 ${
                issue.type === 'error'
                  ? 'bg-red-50 border-red-500'
                  : issue.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="font-semibold text-sm capitalize">
                {issue.type}
              </div>
              <div className="text-sm text-gray-700">{issue.message}</div>
              {issue.element && (
                <button
                  onClick={() => {
                    issue.element?.scrollIntoView({ behavior: 'smooth' });
                    issue.element?.classList.add('ring-2', 'ring-red-500');
                  }}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  Highlight element
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

