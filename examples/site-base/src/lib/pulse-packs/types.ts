import type { PulseSource, PulseSourceType } from '@/lib/pulse-types';

/**
 * Per-site Pulse pack: demo intents + Home scope for Experience Edge retrieval.
 * Keys match theme/skin site names (quanex, era, amesburytruth, pillsburylaw, amkor).
 */
export type PulsePackIntentAnswer = {
  /** Answer narrative. `{question}` and `{brand}` are replaced at compose time. */
  intro: string;
};

export type PulsePackIntent = {
  id: string;
  /** All tokens in a group must appear in the normalized question; any matching group wins. */
  matchAny: string[][];
  /** Ordered Sitecore item IDs; title/url/excerpt hydrate from Edge at ask-time. */
  citationItemIds: string[];
  /** Optional pack-authored answer (Search-style insight). Site-specific copy lives here, not in pulse-answer.ts. */
  answer?: PulsePackIntentAnswer;
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
  /** Progressive-style FL/NC persona weighting; false for Quanex family. */
  enableStatePersona?: boolean;
  /**
   * Optional static metadata when Edge hydration misses an item (legacy Pillsbury demos).
   * Prefer published Edge content; do not grow this map for new sites.
   */
  citationFallbacks?: Record<string, Omit<PulseSource, 'score'>>;
};

export type MatchedPulseIntent = PulsePackIntent & {
  packSiteName: string;
};
