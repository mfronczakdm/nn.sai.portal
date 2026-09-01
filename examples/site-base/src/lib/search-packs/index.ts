import { amesburytruthSearchPack } from './amesburytruth';
import { amkorSearchPack } from './amkor';
import { eraSearchPack } from './era';
import { pillsburylawSearchPack } from './pillsburylaw';
import { quanexSearchPack } from './quanex';
import type { SearchSitePack } from './types';

export type {
  AiCitation,
  AiSearchInsight,
  SearchFacetLabels,
  SearchInsightRule,
  SearchPackCopy,
  SearchResultItem,
  SearchSitePack,
  SearchTip,
} from './types';
export {
  RESULTS_PAGE_SIZE,
  detectSearchBuckets,
  itemMatchesQuery,
  itemMetadataLine,
  itemVisibleForDemoUser,
  normalizeQuery,
  relevanceScore,
  resolveSearchSiteName,
  selectAiSearchInsight,
  toSiteAwareHref,
} from './helpers';

const DEFAULT_PACK_SITE = 'quanex';

/** Registry of mock SearchResults catalogs. Keys match Sitecore site names / Pulse packs. */
export const SEARCH_SITE_PACKS: Readonly<Record<string, SearchSitePack>> = {
  quanex: quanexSearchPack,
  era: eraSearchPack,
  amesburytruth: amesburytruthSearchPack,
  pillsburylaw: pillsburylawSearchPack,
  amkor: amkorSearchPack,
};

export function normalizeSearchSiteName(siteName?: string | null): string {
  return (siteName || '').toLowerCase().trim();
}

/**
 * Resolve a SearchResults pack for the current site.
 * Unknown sites fall back to NEXT_PUBLIC_DEFAULT_SITE_NAME (except pillsburylaw),
 * then Quanex — never silently reuse the law-firm catalog on a Quanex-family host.
 */
export function getSearchPack(siteName?: string | null): SearchSitePack {
  const key = normalizeSearchSiteName(siteName);
  if (key && SEARCH_SITE_PACKS[key]) return SEARCH_SITE_PACKS[key];

  const envDefault = normalizeSearchSiteName(process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME);
  if (envDefault && envDefault !== 'pillsburylaw' && SEARCH_SITE_PACKS[envDefault]) {
    return SEARCH_SITE_PACKS[envDefault];
  }

  return SEARCH_SITE_PACKS[DEFAULT_PACK_SITE];
}

export function listSearchPackSiteNames(): string[] {
  return Object.keys(SEARCH_SITE_PACKS);
}
