/**
 * Site name → Skin key.
 *
 * Source of truth in Sitecore: Site definition item
 *   template {E46F3AF2-39FA-4866-A157-7017C4B2A40C}
 *   path: /sitecore/content/<collection>/<site>/Settings/Site Grouping/<site>
 *   field: Skin
 *
 * Experience Edge `sites.json` does not include custom Site fields, so this
 * map mirrors the Skin values authors set in Sitecore. Keep them in sync.
 *
 * Rules:
 * - Skin value must be a registered theme key (`APP_THEMES`).
 * - Omit a site here if Skin === site name and that name is already a theme
 *   (convention fallback in resolveTheme).
 * - Map explicitly when a site reuses another brand's skin
 *   (e.g. a demo site that uses `rockland`).
 */

import type { AppTheme } from './themes';

/**
 * Explicit overrides / documented skins.
 * Prefer matching Sitecore Skin field values exactly (lowercase).
 */
export const SITE_SKINS: Readonly<Record<string, AppTheme>> = {
  // Sites whose name matches a theme key are covered by convention;
  // listed here so the map is a readable inventory of branded sites.
  dwyeromega: 'dwyeromega',
  builderfs: 'builderfs',
  rockland: 'rockland',
  pkm: 'pkm',
  pillsburylaw: 'pillsburylaw',
  quanex: 'quanex',
  amesburytruth: 'amesburytruth',
  era: 'era',
  dfsupply: 'dfsupply',
  /** DFS manager portal site — Skin field should be `dfsupply` in Sitecore. */
  dfs: 'dfsupply',
  amkor: 'amkor',
  'atlanta-apparel': 'atlanta-apparel',
  americasmart: 'americasmart',
  lcmc: 'lcmc',

  // Example: site name differs from skin
  // 'acme-demo': 'rockland',
};

export function getConfiguredSkin(siteName: string | null | undefined): AppTheme | undefined {
  if (!siteName) return undefined;
  const key = siteName.toLowerCase().trim();
  return SITE_SKINS[key];
}
