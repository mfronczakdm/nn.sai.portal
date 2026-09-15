import type { LucideIcon } from 'lucide-react';

import type { DemoUserTaxonomy } from '@/lib/demo-taxonomy';

export type SearchResultItem = {
  id: string;
  kbId: string;
  title: string;
  description: string;
  href: string;
  lob: string;
  perils: string[];
  topics: string[];
  searchBuckets: string[];
  dateLabel?: string;
  breadcrumb?: string[];
  matchTerms?: string[];
  isNew?: boolean;
  subtitle?: string;
  demoUserTaxonomy?: DemoUserTaxonomy;
  visibleForDemoUsers?: DemoUserTaxonomy[];
  /** Atlanta Apparel directory extras (ignored by Default cards). */
  booth?: string;
  linesShown?: number;
  matchingProducts?: { title: string; imageSrc?: string }[];
  imageSrc?: string;
};

export type AiCitation = {
  title: string;
  href: string;
  kbId?: string;
  excerpt?: string;
};

export type AiSearchInsight = {
  id: string;
  question: string;
  headline: string;
  answer: string;
  bullets: string[];
  citations: AiCitation[];
  stateCallout?: string | null;
  learnMoreHref: string;
  learnMoreLabel?: string;
};

export type SearchInsightRule = {
  id: string;
  matchAny: string[][];
  insight: Omit<AiSearchInsight, 'question'>;
};

export type SearchTip = {
  title: string;
  body: string;
};

export type SearchFacetLabels = {
  lob: Record<string, string>;
  peril: Record<string, string>;
  topic: Record<string, string>;
};

export type SearchPackCopy = {
  kicker: string;
  headingEmpty: string;
  intro: string;
  placeholder: string;
  emptyHint: string;
  resultsHint: string;
  aiHeading: string;
  citationsHeading: string;
  facetLob: string;
  facetPeril: string;
  facetTopic: string;
  tips: readonly SearchTip[];
};

export type SearchSitePack = {
  siteName: string;
  brandName: string;
  catalog: SearchResultItem[];
  facetLabels: SearchFacetLabels;
  bucketSynonyms: Record<string, readonly string[]>;
  popularSearches: readonly string[];
  insightRules: SearchInsightRule[];
  copy: SearchPackCopy;
  ctaByLob: Record<string, string>;
  defaultCta: string;
  iconByLob: Record<string, LucideIcon>;
  featuredLob?: string;
  enableDemoPersona?: boolean;
  registerHref?: string;
  signInHref?: string;
};
