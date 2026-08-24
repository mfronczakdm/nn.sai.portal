import { cookies, headers } from 'next/headers';
import { DEFAULT_THEME, isAppTheme, type AppTheme } from '@/lib/theme';

import './globals.css';

import {
  Barlow_Condensed,
  Inter,
  Montserrat,
  Open_Sans,
  Roboto,
  Roboto_Condensed,
  Source_Sans_3,
} from 'next/font/google';

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

/** Quanex body — Roboto (site uses Roboto + Roboto Condensed) */
const roboto = Roboto({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-roboto',
  weight: ['400', '500', '700'],
  display: 'swap',
});

/** Rockland Trust + Pillsbury Law + Atlanta Apparel — Montserrat (Centra Andmore substitute) */
const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

const fontVariables = [
  inter.variable,
  sourceSans3.variable,
  barlowCondensed.variable,
  openSans.variable,
  robotoCondensed.variable,
  roboto.variable,
  montserrat.variable,
].join(' ');

/**
 * Root HTML shell. Nested `[site]/layout.tsx` cannot set `<html>` attributes.
 * Middleware sets `x-app-theme` from the URL/`sc_site`; cookie is a fallback.
 * ApplySiteTheme still updates `document.documentElement` when Sitecore page.siteName differs (Pages editor).
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerTheme = (await headers()).get('x-app-theme');
  const cookieTheme = (await cookies()).get('app-theme')?.value;
  const theme: AppTheme = isAppTheme(headerTheme)
    ? headerTheme
    : isAppTheme(cookieTheme)
      ? cookieTheme
      : DEFAULT_THEME;

  return (
    <html
      lang="en"
      className={fontVariables}
      data-theme={theme}
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
