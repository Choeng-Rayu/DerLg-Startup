/**
 * Social Sharing Utilities
 * Handles sharing to various social media platforms and email
 */

export interface ShareData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  hotelId?: string;
}

/**
 * Track social share event for analytics
 */
export const trackSocialShare = async (
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'email',
  hotelId?: string
) => {
  try {
    // Send analytics event to backend
    const response = await fetch('/api/analytics/social-shares', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform,
        hotelId,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });

    if (!response.ok) {
      console.warn('Failed to track social share');
    }
  } catch (error) {
    console.error('Error tracking social share:', error);
  }
};

/**
 * Share to Facebook
 */
export const shareToFacebook = (data: ShareData) => {
  const url = new URL('https://www.facebook.com/sharer/sharer.php');
  url.searchParams.append('u', data.url);
  url.searchParams.append('quote', `${data.title} - ${data.description}`);

  window.open(url.toString(), 'facebook-share', 'width=600,height=400');
  trackSocialShare('facebook', data.hotelId);
};

/**
 * Share to Twitter
 */
export const shareToTwitter = (data: ShareData) => {
  const text = `Check out ${data.title}! ${data.description} ${data.url}`;
  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.append('text', text);
  url.searchParams.append('url', data.url);

  window.open(url.toString(), 'twitter-share', 'width=600,height=400');
  trackSocialShare('twitter', data.hotelId);
};

/**
 * Share to WhatsApp
 */
export const shareToWhatsApp = (data: ShareData) => {
  const text = `${data.title}\n${data.description}\n${data.url}`;
  const url = new URL('https://wa.me/');
  url.searchParams.append('text', text);

  window.open(url.toString(), 'whatsapp-share');
  trackSocialShare('whatsapp', data.hotelId);
};

/**
 * Share via Email
 */
export const shareViaEmail = (data: ShareData) => {
  const subject = `Check out ${data.title}`;
  const body = `Hi,\n\nI found this amazing place: ${data.title}\n\n${data.description}\n\nCheck it out: ${data.url}\n\nBest regards`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
  trackSocialShare('email', data.hotelId);
};

/**
 * Generate Open Graph meta tags for social sharing
 */
export const generateOpenGraphTags = (data: ShareData): Record<string, string> => {
  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:url': data.url,
    'og:type': 'website',
    'og:image': data.imageUrl || '/placeholder-hotel.jpg',
    'og:image:width': '1200',
    'og:image:height': '630',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.imageUrl || '/placeholder-hotel.jpg',
  };
};

/**
 * Generate shareable URL with tracking parameters
 */
export const generateShareableUrl = (baseUrl: string, hotelId: string, platform: string): string => {
  const url = new URL(baseUrl);
  url.searchParams.append('utm_source', 'social');
  url.searchParams.append('utm_medium', platform);
  url.searchParams.append('utm_campaign', `share_${hotelId}`);
  return url.toString();
};

/**
 * Copy share link to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

