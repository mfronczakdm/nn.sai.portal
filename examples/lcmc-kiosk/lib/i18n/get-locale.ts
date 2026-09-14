import { cookies } from 'next/headers';
import { DEFAULT_KIOSK_LOCALE, LOCALE_COOKIE, parseKioskLocale, type KioskLocale } from './config';
import { getDictionary, type Dictionary } from './dictionary';

export function getKioskLocale(): KioskLocale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value ? parseKioskLocale(value) : DEFAULT_KIOSK_LOCALE;
}

export function getRequestI18n(): { locale: KioskLocale; dictionary: Dictionary } {
  const locale = getKioskLocale();
  return { locale, dictionary: getDictionary(locale) };
}
