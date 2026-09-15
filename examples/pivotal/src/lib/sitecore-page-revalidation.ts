import scConfig from 'sitecore.config';

const DEFAULT_PAGE_REVALIDATE_SECONDS = 300;

/**
 * Time-based ISR interval for published Sitecore pages.
 * Set SITECORE_PAGE_REVALIDATE_SECONDS=0 to disable caching (fully dynamic).
 */
export function getSitecorePageRevalidateSeconds(): number {
  const raw = process.env.SITECORE_PAGE_REVALIDATE_SECONDS;

  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_PAGE_REVALIDATE_SECONDS;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_PAGE_REVALIDATE_SECONDS;
}

export function getSitecoreRevalidateSecret(): string | undefined {
  return process.env.SITECORE_REVALIDATE_SECRET?.trim() || undefined;
}

export function buildAppRouterPagePath(options: {
  site: string;
  locale: string;
  path?: string[];
}): string {
  const { site, locale, path } = options;
  const segments = [site, locale, ...(path ?? [])].filter(Boolean);
  return `/${segments.join('/')}`;
}

/**
 * Builds the internal App Router path for a published content URL.
 * Accepts either a full app path (/site/locale/...) or a content path (/about).
 */
export function resolveAppRouterPagePath(options: {
  path: string;
  site?: string;
  locale?: string;
}): string | null {
  const normalizedPath = options.path.trim();
  if (!normalizedPath) return null;

  if (!normalizedPath.startsWith('/')) {
    return null;
  }

  const segments = normalizedPath.split('/').filter(Boolean);
  const resolvedSite = options.site?.trim() || scConfig.defaultSite;
  const resolvedLocale = options.locale?.trim() || scConfig.defaultLanguage || 'en';

  if (
    segments.length >= 2 &&
    resolvedSite &&
    segments[0] === resolvedSite &&
    segments[1] === resolvedLocale
  ) {
    return normalizedPath.endsWith('/') ? normalizedPath.slice(0, -1) : normalizedPath;
  }

  if (!resolvedSite) return null;

  return buildAppRouterPagePath({
    site: resolvedSite,
    locale: resolvedLocale,
    path: segments,
  });
}
