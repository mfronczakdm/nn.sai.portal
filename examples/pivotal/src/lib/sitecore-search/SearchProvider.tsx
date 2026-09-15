'use client';

import React, { useEffect } from 'react';
import { PageController, WidgetsProvider } from '@sitecore-search/react';
import type { Environment } from '@sitecore-search/data';
import { isSitecoreSearchConfigured } from '@/lib/search-customizations';

const SEARCH_CONFIG = {
  // CEC documents env as prod | prodEu | apse2 (legacy samples sometimes use "dev"/"qa")
  env: (process.env.NEXT_PUBLIC_SEARCH_ENV || 'prod') as Environment,
  customerKey: process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY || '',
  apiKey: process.env.NEXT_PUBLIC_SEARCH_API_KEY || '',
};

function setSearchLocale(locale: string) {
  try {
    const context = PageController.getContext();
    const normalized = locale.toLowerCase();
    const [language, countryFromLocale] = normalized.split('-');

    const countryByLanguage: Record<string, string> = {
      en: 'us',
      fr: 'ca',
      ja: 'jp',
    };

    const country = countryFromLocale || countryByLanguage[language] || 'us';

    context.setLocaleLanguage(language);
    context.setLocaleCountry(country);
  } catch {
    // PageController may be unavailable before WidgetsProvider mounts
  }
}

type SearchProviderProps = {
  children: React.ReactNode;
  locale: string;
};

/**
 * Wraps the tree with Sitecore Search WidgetsProvider when legacy Search env vars are set.
 * Renders children unchanged when Search is not configured (local demos without CEC).
 */
export function SearchProvider({ children, locale }: SearchProviderProps) {
  const configured = isSitecoreSearchConfigured();

  useEffect(() => {
    if (configured) {
      setSearchLocale(locale);
    }
  }, [locale, configured]);

  if (!configured) {
    return <>{children}</>;
  }

  return (
    <WidgetsProvider
      env={SEARCH_CONFIG.env}
      customerKey={SEARCH_CONFIG.customerKey}
      apiKey={SEARCH_CONFIG.apiKey}
      publicSuffix
    >
      {children}
    </WidgetsProvider>
  );
}
