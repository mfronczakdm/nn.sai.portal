/**
 * Registered visual themes (skins) for this rendering host.
 *
 * Each key must match:
 * 1. A Sitecore Site definition `Skin` field value
 * 2. `<html data-theme="<key>">`
 * 3. A CSS package under `src/assets/styles/themes/<key>.css` (or shared tokens)
 *
 * Themes may add extra CSS variables beyond the standard set — that is allowed.
 * New themes: follow `docs/ai/skills/create-new-theme.md`.
 */

export const DEFAULT_THEME = 'bcbst' as const;

export const APP_THEMES = [
  'bcbst',
  'dwyeromega',
  'builderfs',
  'rockland',
  'pkm',
  'pillsburylaw',
  'quanex',
  'amesburytruth',
  'era',
  'dfsupply',
  'amkor',
  'atlanta-apparel',
  'americasmart',
] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export function isAppTheme(value: string | null | undefined): value is AppTheme {
  if (!value) return false;
  return (APP_THEMES as readonly string[]).includes(value);
}
