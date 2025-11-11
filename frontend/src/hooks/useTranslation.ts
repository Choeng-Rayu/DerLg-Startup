'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';

export function useTranslation() {
  return useNextIntlTranslations();
}

export function useTranslationKey(key: string): string {
  const t = useNextIntlTranslations();
  try {
    return t(key);
  } catch {
    return key;
  }
}

