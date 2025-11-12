import { getRequestConfig } from 'next-intl/server';
import { i18n, Locale } from '../../i18n.config';

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid, fallback to default
  const validLocale = (locale && i18n.locales.includes(locale as Locale)) 
    ? locale 
    : i18n.defaultLocale;
    
  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  };
});

