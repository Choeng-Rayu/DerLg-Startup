'use client';

import { useState } from 'react';
import {
  shareToFacebook,
  shareToTwitter,
  shareToWhatsApp,
  shareViaEmail,
  copyToClipboard,
  type ShareData,
} from '@/lib/socialSharing';

interface SocialShareButtonsProps {
  data: ShareData;
  variant?: 'horizontal' | 'vertical';
  showLabel?: boolean;
  className?: string;
}

export default function SocialShareButtons({
  data,
  variant = 'horizontal',
  showLabel = true,
  className = '',
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(data.url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareButtons = [
    {
      id: 'facebook',
      label: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      onClick: () => shareToFacebook(data),
      color: 'hover:text-blue-600',
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.856.973 5 5 0 00-8.66 4.59 14.23 14.23 0 01-10.3-5.208 5 5 0 001.55 6.573 5 5 0 01-2.26-.616v.06a5 5 0 004.001 4.905 5 5 0 01-2.26.086 5 5 0 004.678 3.488 10.01 10.01 0 01-6.177 2.13c-.39 0-.779-.023-1.17-.067a14.23 14.23 0 007.713 2.262c9.256 0 14.296-7.657 14.296-14.297 0-.217-.005-.434-.015-.65a10.207 10.207 0 002.5-2.612z" />
        </svg>
      ),
      onClick: () => shareToTwitter(data),
      color: 'hover:text-blue-400',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.124 7.738L.929 23.589l8.257-2.414a9.86 9.86 0 004.737 1.202h.005c5.379 0 9.747-4.37 9.747-9.753 0-2.607-.983-5.058-2.768-6.9a9.776 9.776 0 00-6.932-2.87zm7.773 18.155h-.003a8.216 8.216 0 01-4.185-1.089l-.3-.178-3.104.913.931-3.391-.219-.292a8.203 8.203 0 01-1.241-4.402c0-4.552 3.733-8.248 8.32-8.248 2.236 0 4.331.824 5.908 2.334 1.579 1.51 2.443 3.557 2.443 5.74 0 4.553-3.733 8.248-8.32 8.248z" />
        </svg>
      ),
      onClick: () => shareToWhatsApp(data),
      color: 'hover:text-green-600',
    },
    {
      id: 'email',
      label: 'Email',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
      onClick: () => shareViaEmail(data),
      color: 'hover:text-gray-600',
    },
  ];

  const containerClass = variant === 'vertical' ? 'flex flex-col gap-3' : 'flex gap-3';

  return (
    <div className={`${containerClass} ${className}`}>
      {shareButtons.map((button) => (
        <button
          key={button.id}
          onClick={button.onClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 ${button.color}`}
          title={`Share on ${button.label}`}
          aria-label={`Share on ${button.label}`}
        >
          {button.icon}
          {showLabel && <span className="text-sm font-medium">{button.label}</span>}
        </button>
      ))}

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 hover:text-blue-600"
        title="Copy link to clipboard"
        aria-label="Copy link to clipboard"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        {showLabel && (
          <span className="text-sm font-medium">
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        )}
      </button>
    </div>
  );
}

