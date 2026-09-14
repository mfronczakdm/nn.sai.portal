'use client';

import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, type KioskLocale } from '@/lib/i18n/config';
import { useKioskI18n } from './LocaleProvider';
import { cn } from '@/lib/utils';

function persistLocale(locale: KioskLocale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function LanguageSwitcher({ light = true }: { light?: boolean }) {
  const router = useRouter();
  const { locale, dictionary } = useKioskI18n();

  const setLocale = (next: KioskLocale) => {
    if (next === locale) return;
    persistLocale(next);
    router.refresh();
  };

  const buttonClass = (active: boolean) =>
    cn(
      'kiosk-tap min-w-[8.5rem] border-2 text-lg',
      light
        ? active
          ? 'border-white bg-white text-lcmc-navy'
          : 'border-white/80 bg-transparent text-white'
        : active
          ? 'border-lcmc-navy bg-lcmc-navy text-white'
          : 'border-lcmc-navy bg-white text-lcmc-navy'
    );

  return (
    <div className="flex gap-2" role="group" aria-label={dictionary.languageGroupLabel}>
      <button type="button" className={buttonClass(locale === 'en')} onClick={() => setLocale('en')}>
        {dictionary.languageEnglish}
      </button>
      <button
        type="button"
        className={buttonClass(locale === 'es-CO')}
        onClick={() => setLocale('es-CO')}
      >
        {dictionary.languageSpanish}
      </button>
    </div>
  );
}

export function resetKioskLocale() {
  persistLocale('en');
}
