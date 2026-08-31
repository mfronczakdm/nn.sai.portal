/**
 * Sitecore language names, used verbatim as URL segments and layout-service locales.
 * Read from the public env var rather than sitecore.config so client components can import this.
 */
export const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

export const JAPANESE_LOCALE = 'ja-JP';
export const KOREAN_LOCALE = 'ko-KR';
export const SIMPLIFIED_CHINESE_LOCALE = 'zh-CN';

export const ADDITIONAL_LOCALES = [JAPANESE_LOCALE, KOREAN_LOCALE, SIMPLIFIED_CHINESE_LOCALE];

export const SUPPORTED_LOCALES = [
  DEFAULT_LOCALE,
  ...ADDITIONAL_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE),
];

/** Cookie keeps the chosen language across links that Sitecore renders without a locale prefix. */
export const LOCALE_COOKIE_NAME = 'app-locale';

export function isSupportedLocale(value: string | undefined | null): boolean {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value);
}

/** Locale occupies the first path segment, e.g. `/ja-JP/quality`. */
export function getLocaleFromPathname(pathname: string): string | undefined {
  const [firstSegment] = (pathname || '').split('/').filter(Boolean);
  return isSupportedLocale(firstSegment) ? firstSegment : undefined;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) {
    return pathname || '/';
  }
  const remainder = pathname.slice(locale.length + 1);
  return remainder.startsWith('/') ? remainder : `/${remainder}`;
}

/**
 * Locale-prefixed URL for a page path. The default language keeps clean URLs so
 * every other site in this editing host is unaffected.
 */
export function buildLocalePathname(pathname: string, locale: string): string {
  const basePath = stripLocaleFromPathname(pathname);
  const normalized = basePath === '/' ? '' : basePath.replace(/\/+$/, '');
  if (!isSupportedLocale(locale) || locale === DEFAULT_LOCALE) {
    return normalized || '/';
  }
  return `/${locale}${normalized}`;
}

/**
 * Language switcher target. Always prefixed — including the default language — so choosing
 * English clears a previously remembered language instead of inheriting it.
 */
export function buildLanguageSwitchPathname(pathname: string, locale: string): string {
  const basePath = stripLocaleFromPathname(pathname);
  const normalized = basePath === '/' ? '' : basePath.replace(/\/+$/, '');
  return `/${locale}${normalized}`;
}
