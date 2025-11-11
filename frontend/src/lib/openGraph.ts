/**
 * Open Graph Meta Tags Utility
 * Handles dynamic generation and setting of Open Graph meta tags for social sharing
 */

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: string;
  locale?: string;
  siteName?: string;
}

/**
 * Set Open Graph meta tags in the document head
 */
export const setOpenGraphTags = (data: OpenGraphData) => {
  const tags = {
    'og:title': data.title,
    'og:description': data.description,
    'og:url': data.url,
    'og:type': data.type || 'website',
    'og:image': data.imageUrl || '/placeholder-hotel.jpg',
    'og:image:width': String(data.imageWidth || 1200),
    'og:image:height': String(data.imageHeight || 630),
    'og:locale': data.locale || 'en_US',
    'og:site_name': data.siteName || 'DerLg.com',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': data.imageUrl || '/placeholder-hotel.jpg',
  };

  Object.entries(tags).forEach(([property, content]) => {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  });

  // Also set standard meta tags
  setMetaTag('description', data.description);
  setMetaTag('twitter:site', '@DerLgCambodia');
};

/**
 * Set a single meta tag
 */
const setMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.content = content;
};

/**
 * Generate canonical URL meta tag
 */
export const setCanonicalUrl = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
};

/**
 * Generate structured data (JSON-LD) for rich snippets
 */
export const setStructuredData = (data: Record<string, any>) => {
  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

/**
 * Generate Hotel structured data
 */
export const generateHotelStructuredData = (hotelData: {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  url?: string;
  priceRange?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotelData.name,
    description: hotelData.description,
    image: hotelData.imageUrl || '/placeholder-hotel.jpg',
    url: hotelData.url || `https://derlg.com/hotels/${hotelData.id}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotelData.address || '',
      addressCountry: 'KH',
    },
    telephone: hotelData.phone || '',
    aggregateRating: hotelData.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: hotelData.rating,
          reviewCount: hotelData.reviewCount || 0,
        }
      : undefined,
    priceRange: hotelData.priceRange || '$$',
  };
};

/**
 * Generate Tour structured data
 */
export const generateTourStructuredData = (tourData: {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  duration?: string;
  price?: number;
  url?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: tourData.name,
    description: tourData.description,
    image: tourData.imageUrl || '/placeholder-tour.jpg',
    url: tourData.url || `https://derlg.com/tours/${tourData.id}`,
  };
};

