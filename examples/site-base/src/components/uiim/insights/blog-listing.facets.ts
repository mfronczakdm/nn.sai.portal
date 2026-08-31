/**
 * Site-authored filter facets for BlogListing.
 *
 * The `FilterFacets` field on the BlogListing datasource holds one facet per line:
 *
 *   Advanced Packaging | packaging, ectc, 2.5d
 *   Sustainability     | cdp, climate, emissions
 *   Memory
 *
 * A line without a pipe uses its own label as the single keyword. When the field is
 * empty the component keeps its legacy behaviour (curated legal taxonomy), so sites
 * that have configured nothing are unaffected.
 */

export type BlogFacetRule = {
  label: string;
  keywords: string[];
};

function splitList(raw: string): string[] {
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function parseFacetConfig(raw?: string | null): BlogFacetRule[] {
  if (typeof raw !== 'string') return [];

  const rules = new Map<string, BlogFacetRule>();

  for (const line of raw.split(/\r?\n|<br\s*\/?>/i)) {
    const trimmed = line.replace(/<[^>]+>/g, '').trim();
    if (!trimmed) continue;

    const [rawLabel, rawKeywords = ''] = trimmed.split('|');
    const label = rawLabel.trim();
    if (!label) continue;

    const keywords = splitList(rawKeywords);
    const existing = rules.get(label);
    const merged = [
      ...(existing?.keywords ?? []),
      ...(keywords.length ? keywords : [label.toLowerCase()]),
    ];

    rules.set(label, { label, keywords: Array.from(new Set(merged)) });
  }

  return Array.from(rules.values());
}

export function hasFacetConfig(raw?: string | null): boolean {
  return parseFacetConfig(raw).length > 0;
}

export function matchFacets(rules: BlogFacetRule[], haystack: string): string[] {
  if (!rules.length) return [];
  const lower = (haystack || '').toLowerCase();
  return rules
    .filter(({ keywords }) => keywords.some((keyword) => keyword && lower.includes(keyword)))
    .map(({ label }) => label);
}
