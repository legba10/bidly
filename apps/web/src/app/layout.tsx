import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ruRU } from '../i18n/messages/ru-RU';
import './globals.css';
import './landing.css';

export const metadata: Metadata = {
  title: ruRU.metadata.title,
  description: ruRU.metadata.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
