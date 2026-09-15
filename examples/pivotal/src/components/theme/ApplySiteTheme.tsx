/**
 * Applies `data-theme` on `<html>` for the current Sitecore site.
 *
 * Root layout cannot read `/[site]` params, so it ships a default `data-theme`.
 * This client component updates `document.documentElement` after hydrate / on
 * client navigations. Do not render a `<script>` here — React will not execute
 * it on the client and Pages editor throws (Next overlay).
 */
'use client';

import { useLayoutEffect } from 'react';
import type { AppTheme } from '@/lib/theme';

export function ApplySiteTheme({ theme }: { theme: AppTheme }) {
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.cookie = `app-theme=${theme}; path=/; SameSite=Lax`;
  }, [theme]);

  return null;
}
