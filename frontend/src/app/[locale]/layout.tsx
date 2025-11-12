import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { i18n, type Locale } from "../../../i18n.config";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "DerLg.com - Discover Cambodia's Best Hotels, Tours & Experiences",
  description: "Book hotels, tours, and cultural experiences in Cambodia. AI-powered recommendations, flexible payment options, and authentic local experiences.",
  keywords: "Cambodia hotels, Cambodia tours, Angkor Wat, Phnom Penh hotels, Siem Reap accommodation, Cambodia travel",
  authors: [{ name: "DerLg.com" }],
  openGraph: {
    title: "DerLg.com - Discover Cambodia",
    description: "Your trusted platform for booking hotels, tours, and experiences in Cambodia",
    type: "website",
    locale: "en_US",
    siteName: "DerLg.com",
  },
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Await params in Next.js 15+
  const { locale } = await params;
  
  // Validate that the locale is supported
  if (!i18n.locales.includes(locale as Locale)) {
    notFound();
  }
  
  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </NextIntlClientProvider>
  );
}

