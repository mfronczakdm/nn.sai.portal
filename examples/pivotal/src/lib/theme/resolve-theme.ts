import { getConfiguredSkin } from './site-skins';
import { APP_THEMES, DEFAULT_THEME, isAppTheme, type AppTheme } from './themes';

export type ResolveThemeInput = {
  /** Sitecore site name from the `/[site]/…` route (preferred). */
  site?: string | null;
  /** Explicit Skin from Site definition when available (highest priority). */
  skin?: string | null;
};

/**
 * Resolve which `data-theme` to apply for a request.
 *
 * Priority:
 * 1. Explicit `skin` (Sitecore Site definition Skin field, when passed in)
 * 2. `SITE_SKINS[site]` map (mirrors Skin in code)
 * 3. Site name itself, if it is a registered theme key
 * 4. `NEXT_PUBLIC_APP_THEME` (local / single-site fallback only)
 * 5. `DEFAULT_THEME` (`bcbst`)
 */
export function resolveTheme(input: ResolveThemeInput = {}): AppTheme {
  const explicit = normalize(input.skin);
  if (isAppTheme(explicit)) return explicit;

  const fromMap = getConfiguredSkin(input.site);
  if (fromMap) return fromMap;

  const siteAsTheme = normalize(input.site);
  if (isAppTheme(siteAsTheme)) return siteAsTheme;

  const fromEnv = normalize(process.env.NEXT_PUBLIC_APP_THEME);
  if (isAppTheme(fromEnv)) return fromEnv;

  return DEFAULT_THEME;
}

/** @deprecated Prefer `resolveTheme({ site })`. Kept for older imports. */
export function resolveAppTheme(): AppTheme {
  return resolveTheme();
}

export function listThemes(): readonly AppTheme[] {
  return APP_THEMES;
}

function normalize(value: string | null | undefined): string | undefined {
  const trimmed = value?.toLowerCase().trim();
  return trimmed || undefined;
}
