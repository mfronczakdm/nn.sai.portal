/**
 * Nested files under /public (e.g. /lcmc/physicians/*.jpg). Locale + Multisite
 * proxies skip dotted paths in normal traffic, but Sitecore Pages preview bypasses
 * that skip and rewrites them as /[site]/… routes — so the JPG 404s in the editor
 * while Vercel (no preview cookie) still serves public/.
 */
export function isStaticAssetPath(pathname: string): boolean {
  return /\.[a-zA-Z0-9]{2,5}$/.test(pathname.split('?')[0] || '');
}
