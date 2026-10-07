import { SearchProvider } from '@/lib/sitecore-search/SearchProvider';

/**
 * Locale layout — wraps pages with Sitecore Search WidgetsProvider (legacy JS SDK).
 * Mirrors Prospera: industry-verticals/prospera/src/app/[site]/[locale]/[[...path]]/layout.tsx
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string; locale: string }>;
}) {
  const { locale } = await params;

  return <SearchProvider locale={locale}>{children}</SearchProvider>;
}
