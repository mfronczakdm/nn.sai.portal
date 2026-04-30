/**
 * Visual brand theme for CSS variables (`<html data-theme="…">`).
 * Set via NEXT_PUBLIC_APP_THEME in XM Cloud / local env.
 */
export const APP_THEMES = ['bcbst', 'dwyeromega'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export function resolveAppTheme(): AppTheme {
  const raw = process.env.NEXT_PUBLIC_APP_THEME?.toLowerCase().trim();
  if (raw === 'dwyeromega') {
    return 'dwyeromega';
  }
  return 'bcbst';
}
