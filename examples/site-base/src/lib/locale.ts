/**
 * Sitecore language names, used verbatim as URL segments and layout-service locales.
 * Read from the public env var rather than sitecore.config so client components can import this.
 */
export const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

export const JAPANESE_LOCALE = 'ja-JP';
export const KOREAN_LOCALE = 'ko-KR';
export const SIMPLIFIED_CHINESE_LOCALE = 'zh-CN';
/** Atlanta Apparel Sitecore Spanish (Spain). */
export const SPANISH_LOCALE = 'es-ES';
/** LCMC / demo Sitecore Spanish (Colombia). Keep distinct from SPANISH_LOCALE. */
export const COLOMBIAN_SPANISH_LOCALE = 'es-CO';

export const ATLANTA_APPAREL_SITE_NAME = 'atlanta-apparel';

/** Sitecore language names used by the Atlanta Apparel header dropdown. */
export const ATLANTA_APPAREL_LOCALES = [DEFAULT_LOCALE, JAPANESE_LOCALE, SPANISH_LOCALE];

export const ADDITIONAL_LOCALES = [
  JAPANESE_LOCALE,
  KOREAN_LOCALE,
  SIMPLIFIED_CHINESE_LOCALE,
  SPANISH_LOCALE,
  COLOMBIAN_SPANISH_LOCALE,
];

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

export type LanguageSwitcherOption = {
  text: string;
  locale: string;
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  'en-GB': 'English',
  'en-CA': 'English',
  'ja-JP': 'Japanese',
  ja: 'Japanese',
  'es-ES': 'Spanish',
  'es-MX': 'Spanish',
  'es-CO': 'Spanish',
  es: 'Spanish',
};

export function getLocaleDisplayName(locale: string): string {
  return LANGUAGE_LABELS[locale] ?? LANGUAGE_LABELS[locale.split('-')[0]] ?? locale;
}

export function isAtlantaApparelSiteName(value?: string | null): boolean {
  return (value || '').toLowerCase().trim() === ATLANTA_APPAREL_SITE_NAME;
}

function normalizeLocaleCode(code: string): string | undefined {
  if (isSupportedLocale(code)) {
    return code;
  }
  const lower = code.toLowerCase();
  return SUPPORTED_LOCALES.find(
    (locale) => locale.toLowerCase() === lower || locale.toLowerCase().startsWith(`${lower}-`)
  );
}

/**
 * Atlanta Apparel language dropdown options.
 * Prefer Sitecore-provided site languages when they include English, Japanese, and Spanish;
 * otherwise fall back to the installed Sitecore names en / ja-JP / es-ES.
 * Short code `es` maps to es-ES (listed before es-CO in SUPPORTED_LOCALES).
 */
export function resolveAtlantaApparelLanguageOptions(
  availableLocales?: readonly string[] | null
): LanguageSwitcherOption[] {
  const wantedPrefixes = new Set(['en', 'ja', 'es']);
  const unique: string[] = [];

  for (const raw of availableLocales ?? []) {
    const code = normalizeLocaleCode(raw);
    if (!code || !wantedPrefixes.has(code.split('-')[0].toLowerCase()) || unique.includes(code)) {
      continue;
    }
    unique.push(code);
  }

  const hasJapanese = unique.some((code) => code.toLowerCase().startsWith('ja'));
  const hasSpanish = unique.some((code) => code.toLowerCase().startsWith('es'));
  const codes = hasJapanese && hasSpanish ? unique : [...ATLANTA_APPAREL_LOCALES];

  return codes.map((locale) => ({ locale, text: getLocaleDisplayName(locale) }));
}
