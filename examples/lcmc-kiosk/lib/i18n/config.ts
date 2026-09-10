export const LOCALE_COOKIE = 'lcmc_kiosk_locale';

export const KIOSK_LOCALES = ['en', 'es-CO'] as const;

export type KioskLocale = (typeof KIOSK_LOCALES)[number];

export const DEFAULT_KIOSK_LOCALE: KioskLocale = 'en';

export function isKioskLocale(value: string | undefined | null): value is KioskLocale {
  return value === 'en' || value === 'es-CO';
}

export function parseKioskLocale(value: string | undefined | null): KioskLocale {
  if (value === 'es' || value === 'es-CO' || value === 'es-MX' || value === 'es-ES') {
    return 'es-CO';
  }
  return 'en';
}

export function htmlLang(locale: KioskLocale): string {
  return locale === 'es-CO' ? 'es-CO' : 'en';
}

export function sitecoreLanguage(locale: KioskLocale): string {
  return locale;
}
