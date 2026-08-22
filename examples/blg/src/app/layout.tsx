import './globals.css';

import {
  Barlow_Condensed,
  Inter,
  Montserrat,
  Open_Sans,
  Roboto_Condensed,
  Source_Sans_3,
} from 'next/font/google';
import { resolveAppTheme } from '@/lib/app-theme';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

/** Dwyer Omega — distinct from BCBS Inter stack */
const sourceSans3 = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-source-sans-3',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-barlow-condensed',
  weight: ['500', '600', '700'],
  display: 'swap',
});

/** Builders FirstSource / bldr.com — Open Sans body, Roboto Condensed display (industrial condensed headings, CTAs) */
const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-open-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-roboto-condensed',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/** Rockland Trust + Pillsbury Law headings — Montserrat */
const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const fontVariables = [
  inter.variable,
  sourceSans3.variable,
  barlowCondensed.variable,
  openSans.variable,
  robotoCondensed.variable,
  montserrat.variable,
].join(' ');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const appTheme = resolveAppTheme();

  return (
    <html
      lang="en"
      className={fontVariables}
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
