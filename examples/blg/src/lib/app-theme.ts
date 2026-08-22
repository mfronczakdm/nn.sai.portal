/**
 * Visual brand theme for CSS variables (`<html data-theme="…">`).
 * Color tokens: `src/assets/styles/globals.css`. App Tailwind entry: `src/app/globals.css` (portal pattern).
 * Set via NEXT_PUBLIC_APP_THEME in XM Cloud / local env.
 */
export const APP_THEMES = ['bcbst', 'dwyeromega', 'builderfs', 'rockland', 'pkm', 'pillsburylaw'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export function resolveAppTheme(): AppTheme {
  const raw = process.env.NEXT_PUBLIC_APP_THEME?.toLowerCase().trim();
  if (!raw) {
    return 'bcbst';
  }
  const match = APP_THEMES.find((t) => t === raw);
  return match ?? 'bcbst';
}
