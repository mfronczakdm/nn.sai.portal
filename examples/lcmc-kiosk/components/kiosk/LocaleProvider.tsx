'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { getDictionary } from '@/lib/i18n/dictionary';
import type { KioskLocale } from '@/lib/i18n/config';

type LocaleContextValue = {
  locale: KioskLocale;
  dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: KioskLocale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, dictionary: getDictionary(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useKioskI18n(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('useKioskI18n must be used within LocaleProvider');
  }
  return value;
}
