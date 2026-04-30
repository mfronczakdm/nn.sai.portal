import './globals.css';

import { Inter } from 'next/font/google';
import { resolveAppTheme } from '@/lib/app-theme';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appTheme = resolveAppTheme();

  return (
    <html
      lang="en"
      className={inter.variable}
      data-theme={appTheme}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://edge-platform.sitecorecloud.io" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
