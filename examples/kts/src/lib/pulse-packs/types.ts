import type { PulseSource, PulseSourceType } from '@/lib/pulse-types';

/**
 * Per-site Pulse pack: demo intents + Home scope for Experience Edge retrieval.
 * Keys match theme/skin site names (cooley).
 */
export type PulsePackIntent = {
  id: string;
  /** All tokens in a group must appear in the normalized question; any matching group wins. */
  matchAny: string[][];
  /** Ordered Sitecore item IDs; title/url/excerpt hydrate from Edge at ask-time. */
  citationItemIds: string[];
};

export type PulseTypeLabels = Partial<Record<PulseSourceType, string>> & {
  default?: string;
};

export type PulseSitePack = {
  siteName: string;
  brandName: string;
  homePath: string;
  homeRootId: string;
  typeLabels: PulseTypeLabels;
  starterPrompts: readonly string[];
  intents: PulsePackIntent[];
  enableStatePersona?: boolean;
  /**
   * Optional static metadata when Edge hydration misses an item.
   * Prefer published Edge content; do not grow this map.
   */
  citationFallbacks?: Record<string, Omit<PulseSource, 'score'>>;
};

export type MatchedPulseIntent = PulsePackIntent & {
  packSiteName: string;
};
