import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ruRU } from '../i18n/messages/ru-RU';
import './globals.css';
import './landing.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'),
  title: ruRU.metadata.title,
  description: ruRU.metadata.description,
  applicationName: 'Bidly',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' },
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
    ],
  },
  openGraph: {
    description: ruRU.metadata.description,
    images: [{ alt: 'Bidly — компании конкурируют за ваш выбор', url: '/brand/bidly-og.svg' }],
    title: ruRU.metadata.title,
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
