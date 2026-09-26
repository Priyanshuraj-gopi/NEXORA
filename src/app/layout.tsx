import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CookieBanner } from '@/components/cookie-banner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nexoraaiphotobooth.vercel.app'),
  title: 'NEXORA: Same You. Different Era.',
  description:
    'Professional digital photo booth application for events and exhibitions. Stylistic portrait transformations with strict biometric privacy compliance.',
  keywords: [
    'photo booth',
    'portrait transformation',
    'event kiosk',
    'Nexora',
    'digital photography',
  ],
  authors: [{ name: 'Nexora Digital Systems' }],
  openGraph: {
    title: 'NEXORA: Same You. Different Era.',
    description:
      'Professional digital photo booth application for events and exhibitions.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Nexora Photo Booth',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXORA: Same You. Different Era.',
    description:
      'Professional digital photo booth application for events and exhibitions.',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Nexora AI Photo Booth',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    description:
      'Professional digital photo booth system for events and commercial stall activations. Ephemeral processing with strict biometric privacy guarantees.',
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased bg-[#08090C] text-[#F9FAFB] flex flex-col justify-between">
        <div className="flex-1 flex flex-col">{children}</div>
        <CookieBanner />
      </body>
    </html>
  );
}
