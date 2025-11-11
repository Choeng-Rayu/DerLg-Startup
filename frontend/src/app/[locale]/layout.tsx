import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Validate that the locale is supported
  if (!i18n.locales.includes(params.locale as Locale)) {
    notFound();
  }

  const htmlLang = params.locale === 'km' ? 'km' : 'en';

  return (
    <html lang={htmlLang} className="h-full">
      <body className="font-sans antialiased h-full flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

