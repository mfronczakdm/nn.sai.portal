export function normalizeIndustryKey(raw: string | undefined | null): string {
  if (raw == null) return '';
  return raw.trim().toLowerCase();
}

export function isAllowedPortalHubPath(path: string): boolean {
  const normalized = path.trim();
  if (!normalized.startsWith('/sitecore/content/')) return false;
  if (normalized.includes('..')) return false;
  return true;
}
