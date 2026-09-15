import type { DemoUserTaxonomy } from '@/lib/demo-taxonomy';

import type { AiSearchInsight, SearchInsightRule, SearchResultItem, SearchSitePack } from './types';

export const RESULTS_PAGE_SIZE = 8;

const QUERY_STOP_WORDS = new Set([
  'and',
  'or',
  'the',
  'for',
  'with',
  'from',
  'your',
  'our',
  'are',
  'you',
  'how',
  'what',
  'who',
  'should',
  'does',
  'about',
  'my',
  'a',
  'an',
  'in',
  'to',
  'of',
  'we',
  'is',
  'can',
  'help',
  'find',
  'need',
]);

export function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function detectSearchBuckets(
  q: string,
  synonyms: Record<string, readonly string[]>
): string[] {
  const n = normalizeQuery(q);
  if (!n) return [];
  const words = n.split(/\s+/).filter(Boolean);
  const hits = new Set<string>();
  for (const [bucket, syns] of Object.entries(synonyms)) {
    for (const syn of syns) {
      if (n.includes(syn) || words.some((w) => w.length > 2 && syn.startsWith(w))) {
        hits.add(bucket);
        break;
      }
    }
  }
  return [...hits];
}

export function itemVisibleForDemoUser(
  item: SearchResultItem,
  user: DemoUserTaxonomy | null
): boolean {
  if (!item.visibleForDemoUsers?.length) return true;
  if (!user) return false;
  return item.visibleForDemoUsers.includes(user);
}

function itemMatchesBuckets(item: SearchResultItem, buckets: string[]): boolean {
  if (!buckets.length) return true;
  return buckets.some((b) => item.searchBuckets.includes(b));
}

function significantQueryWords(n: string): string[] {
  return n
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !QUERY_STOP_WORDS.has(w));
}

export function itemMatchesQuery(
  item: SearchResultItem,
  q: string,
  synonyms: Record<string, readonly string[]>
): boolean {
  const n = normalizeQuery(q);
  if (!n) return true;
  const buckets = detectSearchBuckets(n, synonyms);
  const hay = [
    item.title,
    item.description,
    item.kbId,
    item.subtitle ?? '',
    ...(item.breadcrumb ?? []),
    ...(item.matchTerms ?? []),
  ]
    .join(' ')
    .toLowerCase();
  const words = significantQueryWords(n);
  if (!words.length) {
    return !buckets.length || itemMatchesBuckets(item, buckets);
  }
  if (buckets.length && itemMatchesBuckets(item, buckets)) {
    return true;
  }
  const hits = words.filter((w) => hay.includes(w));
  return hits.length >= Math.min(2, words.length) || words.every((w) => hay.includes(w));
}

export function relevanceScore(
  item: SearchResultItem,
  q: string,
  activeDemoUserTaxonomy: DemoUserTaxonomy | null,
  synonyms: Record<string, readonly string[]>,
  featuredLob?: string
): number {
  const n = normalizeQuery(q);
  if (!n) return 0;
  const words = significantQueryWords(n);
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const crumbs = (item.breadcrumb ?? []).join(' ').toLowerCase();
  const extra = (item.matchTerms ?? []).join(' ').toLowerCase();
  let score = 0;
  for (const w of words) {
    if (title.includes(w)) score += 5;
    if (item.kbId.toLowerCase().includes(w)) score += 2;
    if (desc.includes(w)) score += 2;
    if (crumbs.includes(w)) score += 1;
    if (extra.includes(w)) score += 3;
    if ((item.subtitle ?? '').toLowerCase().includes(w)) score += 3;
  }
  if (featuredLob && item.lob === featuredLob) score += 2;
  if (activeDemoUserTaxonomy && item.demoUserTaxonomy === activeDemoUserTaxonomy) score += 10;
  for (const b of detectSearchBuckets(n, synonyms)) {
    if (item.searchBuckets.includes(b)) score += 8;
  }
  return score;
}

export function itemMetadataLine(
  item: SearchResultItem,
  labels: SearchSitePack['facetLabels']
): string {
  const parts = [
    labels.lob[item.lob],
    item.subtitle,
    item.topics.map((t) => labels.topic[t]).filter(Boolean).slice(0, 2).join(' · ') || undefined,
    item.dateLabel,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function selectAiSearchInsight(
  q: string,
  rules: SearchInsightRule[]
): AiSearchInsight | null {
  const n = normalizeQuery(q);
  if (!n || n.length < 4) return null;

  let best: SearchInsightRule | null = null;
  let bestScore = 0;
  for (const rule of rules) {
    for (const group of rule.matchAny) {
      if (group.every((token) => n.includes(token))) {
        const score = group.length;
        if (score > bestScore) {
          best = rule;
          bestScore = score;
        }
      }
    }
  }
  if (!best) return null;
  return {
    ...best.insight,
    question: q.trim(),
  };
}

function firstPathSegment(pathname?: string | null): string {
  return (pathname || '').split('/').filter(Boolean)[0]?.toLowerCase().trim() || '';
}

function pickKnownSite(raw: string | null | undefined, known: Set<string>): string {
  const key = (raw || '').toLowerCase().trim();
  if (!key) return '';
  if (!known.size) return key;
  return known.has(key) ? key : '';
}

/**
 * Resolve which SearchResults pack to load on a shared editing host.
 *
 * Order:
 * 1. Explicit override (tests / Storybook)
 * 2. App Router `[site]` param or first pathname segment **if it is a known pack**
 *    (`/quanex/en/search` → quanex). Skips content paths like `/Products/...`
 *    on custom domains.
 * 3. Sitecore `page.siteName` (reliable on branded hosts; historically wrong
 *    in some Pages iframe cases — hence URL first when the segment is known)
 */
export function resolveSearchSiteName(options: {
  override?: string | null;
  sitecoreSite?: string | null;
  routeSite?: string | null;
  pathname?: string | null;
  knownSites?: readonly string[];
}): string {
  const known = new Set((options.knownSites || []).map((s) => s.toLowerCase().trim()));
  return (
    pickKnownSite(options.override, known) ||
    pickKnownSite(options.routeSite, known) ||
    pickKnownSite(firstPathSegment(options.pathname), known) ||
    pickKnownSite(options.sitecoreSite, known) ||
    (options.override || options.routeSite || firstPathSegment(options.pathname) || options.sitecoreSite || '')
      .toLowerCase()
      .trim()
  );
}

/**
 * Prefix catalog hrefs with `/[site]/[locale]` when the current URL is already
 * site-prefixed (shared editing host). Leave content-root hrefs unchanged on
 * custom domains where middleware resolves the site from host.
 */
export function toSiteAwareHref(
  href: string,
  pathname?: string | null,
  knownSites?: readonly string[]
): string {
  if (!href || /^(https?:|mailto:|#)/i.test(href)) return href;
  const path = href.startsWith('/') ? href : `/${href}`;
  const hyphenated = path.replace(/ /g, '-');
  const parts = (pathname || '').split('/').filter(Boolean);
  const site = parts[0]?.toLowerCase();
  const locale = parts[1];
  const known = (knownSites || []).map((s) => s.toLowerCase());
  if (!site || !locale || (known.length && !known.includes(site))) {
    return encodeURI(hyphenated);
  }
  if (hyphenated === `/${site}` || hyphenated.startsWith(`/${site}/`)) {
    return encodeURI(hyphenated);
  }
  return encodeURI(`/${site}/${locale}${hyphenated}`);
}
