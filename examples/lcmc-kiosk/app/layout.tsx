import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { htmlLang } from '@/lib/i18n/config';
import { getKioskLocale } from '@/lib/i18n/get-locale';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'LCMC Health Hospital Kiosk',
  description: 'Touch-screen directory and wayfinding for LCMC Health lobbies.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = getKioskLocale();

  return (
    <html lang={htmlLang(locale)}>
      <body className={`${geistSans.variable} h-full antialiased`}>{children}</body>
    </html>
  );
}
