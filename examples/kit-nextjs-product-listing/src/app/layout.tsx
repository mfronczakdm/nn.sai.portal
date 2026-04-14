import './globals.css';

import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';

const heading = localFont({
  src: [
    {
      path: '../assets/fonts/Boldonse-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

const body = IBM_Plex_Sans({
  weight: ['400', '500', '600'],
  variable: '--font-body',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
});

const accent = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  variable: '--font-accent',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${accent.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://edge-platform.sitecorecloud.io" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
