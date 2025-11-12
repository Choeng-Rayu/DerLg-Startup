import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AccessibilityAudit from "@/components/accessibility/AccessibilityAudit";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased h-full flex flex-col`} suppressHydrationWarning>
        {children}
        <AccessibilityAudit />
        <PerformanceMonitor />
      </body>
    </html>
  );
}
