/**
 * Cooley search catalog — lawyers, insights, webinars/events, practices, industries.
 * Hrefs map to Cooley Home IA routes (People, Media and Insight, Practices, etc.).
 * UI lives in SearchResults.tsx.
 */

import { type DemoUserTaxonomy, parseDemoUserTaxonomy } from '@/lib/demo-taxonomy';

export type { DemoUserTaxonomy };
export { parseDemoUserTaxonomy };

/** Content-type facet (what kind of result) */
export type SearchLob =
  | 'lawyer'
  | 'insight'
  | 'event'
  | 'podcast'
  | 'capability'
  | 'office'
  | 'career'
  | 'page';

/** Practice / capability facet */
export type SearchPeril =
  | 'intellectualProperty'
  | 'corporate'
  | 'litigation'
  | 'insolvency'
  | 'internationalTrade'
  | 'insurance'
  | 'environmental'
  | 'funds'
  | 'technology'
  | 'regulatory';

/** Office / geography facet */
export type SearchTopic =
  | 'newYork'
  | 'washingtonDc'
  | 'losAngeles'
  | 'miami'
  | 'siliconValley'
  | 'austin'
  | 'doha'
  | 'riyadh'
  | 'london'
  | 'global';

/** Keyword buckets for natural-language discovery */
export type SearchBucket =
  | 'japan'
  | 'ip'
  | 'patent'
  | 'distress'
  | 'insolvency'
  | 'sanctions'
  | 'trade'
  | 'insurance'
  | 'funds'
  | 'litigation'
  | 'miami'
  | 'corporate'
  | 'mena'
  | 'construction'
  | 'tech'
  | 'expansion'
  | 'webinar'
  | 'podcast'
  | 'event'
  | 'careers'
  | 'venture'
  | 'lifesciences'
  | 'ai';

export type SearchResultItem = {
  id: string;
  /** Short type code shown on cards (e.g. BIO, WEBINAR, ARTICLE) */
  kbId: string;
  title: string;
  description: string;
  href: string;
  lob: SearchLob;
  perils: SearchPeril[];
  topics: SearchTopic[];
  searchBuckets: SearchBucket[];
  dateLabel?: string;
  breadcrumb?: string[];
  matchTerms?: string[];
  isNew?: boolean;
  /** Optional display name for lawyer role / office */
  subtitle?: string;
  demoUserTaxonomy?: DemoUserTaxonomy;
  visibleForDemoUsers?: DemoUserTaxonomy[];
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

export const RESULTS_PAGE_SIZE = 8;

export const searchFacetLabels = {
  lob: {
    lawyer: 'Lawyers',
    insight: 'Insights & alerts',
    event: 'Webinars & events',
    podcast: 'Podcasts',
    capability: 'Practices',
    office: 'Offices',
    career: 'Careers & openings',
    page: 'Site pages',
  },
  peril: {
    intellectualProperty: 'Intellectual Property',
    corporate: 'Corporate',
    litigation: 'Litigation',
    insolvency: 'Insolvency & Restructuring',
    internationalTrade: 'International Trade',
    insurance: 'Insurance',
    environmental: 'Environmental',
    funds: 'Venture / Funds',
    technology: 'Technology',
    regulatory: 'Regulatory / CooleyREG',
  },
  topic: {
    newYork: 'New York',
    washingtonDc: 'Washington, DC',
    losAngeles: 'Los Angeles',
    miami: 'Miami',
    siliconValley: 'Palo Alto / Silicon Valley',
    austin: 'Austin',
    doha: 'Doha',
    riyadh: 'Riyadh',
    london: 'London',
    global: 'Global / multi-office',
  },
} as const;

export const lobs = Object.keys(searchFacetLabels.lob) as SearchLob[];
export const perils = Object.keys(searchFacetLabels.peril) as SearchPeril[];
export const topics = Object.keys(searchFacetLabels.topic) as SearchTopic[];

/** Popular chips — Cooley demo narratives from Home IA */
export const popularSearches = [
  'Who should I talk to about a Series B venture financing?',
  'Life sciences IPO counsel',
  'AI governance webinar for boards',
  'Trade secret litigation Palo Alto',
  'Capital markets partner San Francisco',
  'Upcoming Cooley webinars',
  'Careers at Cooley summer associate',
  'Export controls and CFIUS',
];

export const QUERY_BUCKET_SYNONYMS: Record<SearchBucket, readonly string[]> = {
  japan: ['japan', 'japanese', 'tokyo'],
  ip: ['ip', 'intellectual property', 'patent', 'trademark', 'copyright', 'trade secret'],
  patent: ['patent', 'patent litigation'],
  distress: ['distress', 'distressed', 'troubled'],
  insolvency: ['insolvency', 'restructuring', 'bankruptcy'],
  sanctions: ['sanction', 'sanctions', 'export control', 'export-control', 'export controls', 'cfius', 'ofac'],
  trade: ['international trade', 'trade', 'customs'],
  insurance: ['insurance', 'coverage'],
  funds: ['funds', 'private equity', 'venture fund'],
  litigation: ['litigation', 'trial', 'dispute', 'arbitration', 'trade secret'],
  miami: ['miami', 'florida'],
  corporate: ['corporate', 'm&a', 'securities', 'capital markets', 'governance'],
  mena: ['mena', 'middle east', 'saudi', 'qatar', 'riyadh'],
  construction: ['construction', 'infrastructure'],
  tech: ['tech', 'technology', 'software', 'saas', 'platform'],
  expansion: ['expansion', 'expanding', 'international expansion'],
  webinar: ['webinar', 'webcast', 'virtual briefing', 'cle'],
  podcast: ['podcast'],
  event: ['event', 'events', 'conference', 'speaking'],
  careers: ['career', 'careers', 'job', 'opening', 'summer associate', 'recruiting'],
  venture: ['venture', 'series a', 'series b', 'seed', 'financing', 'startup', 'emerging company'],
  lifesciences: ['life sciences', 'biotech', 'pharma', 'healthcare', 'medtech'],
  ai: ['ai', 'artificial intelligence', 'generative ai', 'machine learning', 'board oversight'],
};

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

export { normalizeQuery };

const STOP = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'to',
  'for',
  'in',
  'on',
  'at',
  'with',
  'who',
  'what',
  'how',
  'do',
  'does',
  'i',
  'we',
  'you',
  'our',
  'your',
  'is',
  'are',
  'be',
  'about',
  'should',
  'talk',
  'me',
]);

function significantQueryWords(n: string): string[] {
  return n
    .split(/[^a-z0-9+]+/i)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 1 && !STOP.has(w));
}

export function detectSearchBuckets(n: string): SearchBucket[] {
  const found: SearchBucket[] = [];
  (Object.keys(QUERY_BUCKET_SYNONYMS) as SearchBucket[]).forEach((bucket) => {
    if (QUERY_BUCKET_SYNONYMS[bucket].some((syn) => n.includes(syn))) {
      found.push(bucket);
    }
  });
  return found;
}

function itemMatchesBuckets(item: SearchResultItem, buckets: SearchBucket[]): boolean {
  return buckets.some((b) => item.searchBuckets.includes(b));
}

export function itemVisibleForDemoUser(
  item: SearchResultItem,
  active: DemoUserTaxonomy | null
): boolean {
  if (!item.visibleForDemoUsers?.length) return true;
  if (!active) return true;
  return item.visibleForDemoUsers.includes(active);
}

export function itemMatchesQuery(item: SearchResultItem, q: string): boolean {
  const n = normalizeQuery(q);
  if (!n) return true;
  const buckets = detectSearchBuckets(n);
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
  activeDemoUserTaxonomy: DemoUserTaxonomy | null
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
  if (item.lob === 'lawyer') score += 2;
  if (activeDemoUserTaxonomy && item.demoUserTaxonomy === activeDemoUserTaxonomy) score += 10;
  for (const b of detectSearchBuckets(n)) {
    if (item.searchBuckets.includes(b)) score += 8;
  }
  return score;
}

export function itemMetadataLine(item: SearchResultItem): string {
  const parts = [
    searchFacetLabels.lob[item.lob],
    item.subtitle,
    item.topics.map((t) => searchFacetLabels.topic[t]).slice(0, 2).join(' · ') || undefined,
    item.dateLabel,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function buildKnowledgeHrefIndex(
  _articles: Array<{
    name?: string;
    path?: string;
    url?: string | { path?: string };
    kbId?: unknown;
  }>
): Map<string, string> {
  return new Map();
}

export function applyLiveKnowledgeHrefs(
  items: SearchResultItem[],
  _hrefIndex: Map<string, string>
): SearchResultItem[] {
  return items;
}

export function supplementalResultsForDemoUserTaxonomy(_persona: DemoUserTaxonomy): SearchResultItem[] {
  return [];
}

function entry(partial: SearchResultItem): SearchResultItem {
  return partial;
}

/** Catalog of searchable Cooley Home content */
export const searchCatalog: SearchResultItem[] = [
  // —— Lawyers (Home/People) ——
  entry({
    id: 'bio-david-peinsipp',
    kbId: 'BIO',
    title: 'David Peinsipp',
    subtitle: 'Partner · Capital Markets · San Francisco',
    description:
      'Co-chair of Cooley’s global capital markets group. Advises emerging and public companies on IPOs, follow-ons, PIPEs, and deSPACs.',
    href: '/People/David-Peinsipp',
    lob: 'lawyer',
    perils: ['corporate', 'funds'],
    topics: ['siliconValley', 'global'],
    searchBuckets: ['corporate', 'venture', 'tech'],
    breadcrumb: ['People', 'David Peinsipp'],
    matchTerms: ['david', 'peinsipp', 'ipo', 'capital markets', 'san francisco', 'series'],
    isNew: true,
  }),
  entry({
    id: 'bio-amanda-main',
    kbId: 'BIO',
    title: 'Amanda A. Main',
    subtitle: 'Partner · Commercial Litigation · Palo Alto',
    description:
      'Head of business litigation for Cooley’s Palo Alto office. Trade secret and competitor disputes, post-acquisition litigation, and investigations.',
    href: '/People/Amanda-Main',
    lob: 'lawyer',
    perils: ['litigation', 'intellectualProperty'],
    topics: ['siliconValley'],
    searchBuckets: ['litigation', 'ip', 'tech'],
    breadcrumb: ['People', 'Amanda Main'],
    matchTerms: ['amanda', 'main', 'trade secret', 'litigation', 'palo alto'],
    isNew: true,
  }),
  entry({
    id: 'bio-claire-keast-butler',
    kbId: 'BIO',
    title: 'Claire Keast-Butler',
    subtitle: 'Co-Partner in Charge · London · Capital Markets',
    description:
      'Co-Partner in Charge of Cooley’s London office. Focuses on capital markets and mergers and acquisitions for growth companies.',
    href: '/People/Claire-Keast-Butler',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['london', 'global'],
    searchBuckets: ['corporate', 'venture', 'tech'],
    breadcrumb: ['People', 'Claire Keast-Butler'],
    matchTerms: ['claire', 'keast', 'butler', 'london', 'capital markets', 'm&a'],
  }),
  entry({
    id: 'bio-joshua-mates',
    kbId: 'BIO',
    title: 'Joshua Mates',
    subtitle: 'Partner · Emerging Companies · Palo Alto',
    description:
      'Counsels startups and venture-backed companies on formation, financings, and growth-stage corporate matters.',
    href: '/People/Joshua-Mates',
    lob: 'lawyer',
    perils: ['corporate', 'funds'],
    topics: ['siliconValley'],
    searchBuckets: ['venture', 'corporate', 'tech'],
    breadcrumb: ['People', 'Joshua Mates'],
    matchTerms: ['joshua', 'mates', 'emerging companies', 'series a', 'series b', 'startup'],
  }),
  entry({
    id: 'bio-shannon-eagan',
    kbId: 'BIO',
    title: 'Shannon Eagan',
    subtitle: 'Partner · Intellectual Property · Palo Alto',
    description:
      'IP partner advising technology and life sciences clients on patents, disputes, and portfolio strategy.',
    href: '/People/Shannon-Eagan',
    lob: 'lawyer',
    perils: ['intellectualProperty', 'technology'],
    topics: ['siliconValley'],
    searchBuckets: ['ip', 'patent', 'tech', 'lifesciences'],
    breadcrumb: ['People', 'Shannon Eagan'],
    matchTerms: ['shannon', 'eagan', 'patent', 'ip', 'life sciences'],
  }),
  entry({
    id: 'bio-joe-conroy',
    kbId: 'BIO',
    title: 'Joe Conroy',
    subtitle: 'Partner and Chairman · New York',
    description:
      'Chairman of Cooley and leader of the firm’s board of directors. Previously served as the firm’s chief executive officer.',
    href: '/People/Joe-Conroy',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['newYork', 'global'],
    searchBuckets: ['corporate'],
    breadcrumb: ['People', 'Joe Conroy'],
    matchTerms: ['joe', 'conroy', 'chairman', 'new york'],
  }),
  entry({
    id: 'bio-james-maton',
    kbId: 'BIO',
    title: 'James Maton',
    subtitle: 'Co-Partner in Charge · London · Disputes',
    description:
      'Heads the UK disputes practice. Commercial litigation and international arbitration for technology and life sciences clients.',
    href: '/People/James-Maton',
    lob: 'lawyer',
    perils: ['litigation'],
    topics: ['london', 'global'],
    searchBuckets: ['litigation'],
    breadcrumb: ['People', 'James Maton'],
    matchTerms: ['james', 'maton', 'london', 'arbitration', 'disputes'],
  }),
  entry({
    id: 'bio-andrew-goldstein',
    kbId: 'BIO',
    title: 'Andrew Goldstein',
    subtitle: 'Partner · Washington, DC',
    description:
      'Washington, DC partner counseling clients on regulatory, corporate, and market-facing matters.',
    href: '/People/Andrew-Goldstein',
    lob: 'lawyer',
    perils: ['regulatory', 'corporate'],
    topics: ['washingtonDc'],
    searchBuckets: ['sanctions', 'trade'],
    breadcrumb: ['People', 'Andrew Goldstein'],
    matchTerms: ['andrew', 'goldstein', 'washington', 'dc', 'regulatory'],
  }),

  // —— Insights / articles ——
  entry({
    id: 'insight-venture-financing-trends',
    kbId: 'ARTICLE',
    title: 'Venture financing trends: what founders should expect this year',
    description:
      'Cooley practitioners break down valuation resets, insider rounds, and term-sheet shifts for Series A and Series B companies.',
    href: '/Media-and-Insight/Insights/Venture-Financing-Trends',
    lob: 'insight',
    perils: ['corporate', 'funds'],
    topics: ['siliconValley', 'global'],
    searchBuckets: ['venture', 'corporate', 'tech'],
    dateLabel: 'Insight · 2026',
    breadcrumb: ['Media and Insight', 'Insights', 'Venture Financing Trends'],
    matchTerms: ['venture', 'financing', 'series b', 'term sheet', 'founders'],
    isNew: true,
  }),
  entry({
    id: 'insight-ai-governance-boards',
    kbId: 'ARTICLE',
    title: 'AI governance for boards: questions directors should ask',
    description:
      'A practical checklist for board oversight of generative AI—risk, IP ownership, vendor diligence, and disclosure.',
    href: '/Media-and-Insight/Insights/AI-Governance-for-Boards',
    lob: 'insight',
    perils: ['technology', 'regulatory', 'corporate'],
    topics: ['global'],
    searchBuckets: ['ai', 'tech', 'corporate'],
    dateLabel: 'Insight · 2026',
    breadcrumb: ['Media and Insight', 'Insights', 'AI Governance for Boards'],
    matchTerms: ['ai', 'board', 'governance', 'generative', 'directors'],
    isNew: true,
  }),
  entry({
    id: 'insight-life-sciences-ipo',
    kbId: 'ARTICLE',
    title: 'Life sciences IPO outlook: preparation checklist',
    description:
      'What biotech and medtech companies should line up before a public offering—clinical data, disclosure, and syndicate timing.',
    href: '/Media-and-Insight/Insights/Life-Sciences-IPO-Outlook',
    lob: 'insight',
    perils: ['corporate', 'technology'],
    topics: ['siliconValley', 'newYork', 'global'],
    searchBuckets: ['lifesciences', 'corporate', 'venture'],
    dateLabel: 'Insight · 2026',
    breadcrumb: ['Media and Insight', 'Insights', 'Life Sciences IPO Outlook'],
    matchTerms: ['life sciences', 'ipo', 'biotech', 'medtech', 'public offering'],
    isNew: true,
  }),
  entry({
    id: 'insight-export-controls-alert',
    kbId: 'ALERT',
    title: 'Export controls alert: what tech companies should watch next',
    description:
      'Short client alert on recent export-control and national-security developments affecting software and hardware exporters.',
    href: '/Media-and-Insight/Alerts',
    lob: 'insight',
    perils: ['regulatory', 'internationalTrade'],
    topics: ['washingtonDc', 'global'],
    searchBuckets: ['sanctions', 'trade', 'tech'],
    dateLabel: 'Alert',
    breadcrumb: ['Media and Insight', 'Alerts'],
    matchTerms: ['export', 'controls', 'cfius', 'sanctions', 'alert'],
  }),

  // —— Webinars & events ——
  entry({
    id: 'webinar-ai-board-oversight',
    kbId: 'WEBINAR',
    title: 'Webinar: AI oversight for public and private company boards',
    description:
      '60-minute CLE-eligible briefing on board questions, disclosure themes, and vendor diligence for generative AI programs.',
    href: '/Media-and-Insight/Events/AI-Board-Oversight-Webinar',
    lob: 'event',
    perils: ['technology', 'corporate', 'regulatory'],
    topics: ['global'],
    searchBuckets: ['webinar', 'event', 'ai', 'tech'],
    dateLabel: 'Upcoming webinar',
    breadcrumb: ['Media and Insight', 'Events', 'AI Board Oversight Webinar'],
    matchTerms: ['webinar', 'ai', 'board', 'cle', 'oversight'],
    isNew: true,
  }),
  entry({
    id: 'webinar-venture-term-sheets',
    kbId: 'WEBINAR',
    title: 'Webinar: Reading today’s venture term sheets',
    description:
      'Walk-through of liquidation preferences, pay-to-play, and governance terms founders and investors are negotiating now.',
    href: '/Media-and-Insight/Events/Venture-Term-Sheets-Webinar',
    lob: 'event',
    perils: ['corporate', 'funds'],
    topics: ['siliconValley', 'global'],
    searchBuckets: ['webinar', 'event', 'venture', 'corporate'],
    dateLabel: 'Upcoming webinar',
    breadcrumb: ['Media and Insight', 'Events', 'Venture Term Sheets Webinar'],
    matchTerms: ['webinar', 'term sheet', 'venture', 'series a', 'series b'],
    isNew: true,
  }),
  entry({
    id: 'webinar-life-sciences-capital',
    kbId: 'WEBINAR',
    title: 'Webinar: Raising capital in life sciences',
    description:
      'Panel for biotech CFOs and GCs on crossover rounds, IPO windows, and partnering deals.',
    href: '/Media-and-Insight/Events/Life-Sciences-Capital-Webinar',
    lob: 'event',
    perils: ['corporate', 'funds'],
    topics: ['siliconValley', 'newYork', 'global'],
    searchBuckets: ['webinar', 'event', 'lifesciences', 'venture'],
    dateLabel: 'Upcoming webinar',
    breadcrumb: ['Media and Insight', 'Events', 'Life Sciences Capital Webinar'],
    matchTerms: ['webinar', 'life sciences', 'biotech', 'capital', 'ipo'],
    isNew: true,
  }),
  entry({
    id: 'hub-events',
    kbId: 'HUB',
    title: 'Events & webinars',
    description: 'Browse Cooley client webinars, CLE programs, and speaking engagements.',
    href: '/Media-and-Insight/Events',
    lob: 'event',
    perils: ['corporate', 'technology'],
    topics: ['global'],
    searchBuckets: ['event', 'webinar'],
    breadcrumb: ['Media and Insight', 'Events'],
    matchTerms: ['events hub', 'webinars', 'cle calendar'],
  }),

  // —— Practices & industries ——
  entry({
    id: 'practice-venture-capital',
    kbId: 'PRACTICE',
    title: 'Venture Capital',
    description:
      'Preferred stock financings, convertibles, and later-stage rounds for companies and funds across the venture ecosystem.',
    href: '/Practices/Corporate/Venture-Capital',
    lob: 'capability',
    perils: ['corporate', 'funds'],
    topics: ['siliconValley', 'global'],
    searchBuckets: ['venture', 'corporate', 'funds'],
    breadcrumb: ['Practices', 'Corporate', 'Venture Capital'],
    matchTerms: ['venture capital', 'financing', 'preferred stock'],
  }),
  entry({
    id: 'practice-emerging-companies',
    kbId: 'PRACTICE',
    title: 'Emerging Companies',
    description:
      'Formation, founder arrangements, and seed-to-late venture financings—Cooley’s signature company counsel offering.',
    href: '/Practices/Corporate/Emerging-Companies',
    lob: 'capability',
    perils: ['corporate', 'funds'],
    topics: ['siliconValley', 'global'],
    searchBuckets: ['venture', 'corporate', 'tech'],
    breadcrumb: ['Practices', 'Corporate', 'Emerging Companies'],
    matchTerms: ['emerging companies', 'startup', 'formation'],
  }),
  entry({
    id: 'practice-export-controls',
    kbId: 'PRACTICE',
    title: 'Export Controls and Economic Sanctions',
    description:
      'CooleyREG counsel on export controls, economic sanctions, and related national-security reviews.',
    href: '/Practices/CooleyREG/Export-Controls-and-Economic-Sanctions',
    lob: 'capability',
    perils: ['regulatory', 'internationalTrade'],
    topics: ['washingtonDc', 'global'],
    searchBuckets: ['sanctions', 'trade'],
    breadcrumb: ['Practices', 'CooleyREG', 'Export Controls'],
    matchTerms: ['export controls', 'sanctions', 'cfius', 'ofac'],
  }),
  entry({
    id: 'industry-life-sciences',
    kbId: 'INDUSTRY',
    title: 'Life Sciences and Healthcare',
    description:
      'Biotechnology, pharma, devices, and healthcare—corporate, IP, FDA, and disputes for pipeline-driven companies.',
    href: '/Industries/Life-Sciences-and-Healthcare',
    lob: 'page',
    perils: ['corporate', 'intellectualProperty', 'regulatory'],
    topics: ['global'],
    searchBuckets: ['lifesciences'],
    breadcrumb: ['Industries', 'Life Sciences and Healthcare'],
    matchTerms: ['life sciences', 'healthcare', 'biotech', 'pharma'],
  }),
  entry({
    id: 'industry-ai',
    kbId: 'INDUSTRY',
    title: 'Artificial Intelligence',
    description:
      'Industry team for AI companies and enterprises adopting AI—transactions, IP, privacy, and regulation.',
    href: '/Industries/Artificial-Intelligence',
    lob: 'page',
    perils: ['technology', 'intellectualProperty', 'regulatory'],
    topics: ['global'],
    searchBuckets: ['ai', 'tech'],
    breadcrumb: ['Industries', 'Artificial Intelligence'],
    matchTerms: ['artificial intelligence', 'ai industry', 'generative'],
  }),
  entry({
    id: 'hub-people',
    kbId: 'HUB',
    title: 'People',
    description: 'Find Cooley lawyers and professionals by name, office, or practice.',
    href: '/People',
    lob: 'page',
    perils: ['corporate', 'litigation'],
    topics: ['global'],
    searchBuckets: ['corporate'],
    breadcrumb: ['People'],
    matchTerms: ['directory', 'bios', 'lawyers'],
  }),
  entry({
    id: 'hub-insights',
    kbId: 'HUB',
    title: 'Insights',
    description: 'Longer-form analysis on venture, IPOs, AI, life sciences, privacy, and litigation.',
    href: '/Media-and-Insight/Insights',
    lob: 'insight',
    perils: ['corporate', 'technology'],
    topics: ['global'],
    searchBuckets: ['venture', 'ai', 'lifesciences'],
    breadcrumb: ['Media and Insight', 'Insights'],
    matchTerms: ['insights hub', 'thought leadership'],
  }),
  entry({
    id: 'hub-careers',
    kbId: 'HUB',
    title: 'Careers at Cooley',
    description:
      'Paths for law students, lawyers, and business professionals. Summer programs, laterals, and recruiting contacts.',
    href: '/Careers',
    lob: 'career',
    perils: ['corporate'],
    topics: ['global'],
    searchBuckets: ['careers'],
    breadcrumb: ['Careers'],
    matchTerms: ['careers', 'summer associate', 'recruiting', 'jobs'],
  }),
];

type InsightRule = {
  matchAny: string[][];
  insight: Omit<AiSearchInsight, 'question'>;
};

const AI_INSIGHT_RULES: InsightRule[] = [
  {
    matchAny: [
      ['series', 'b'],
      ['venture', 'financ'],
      ['who', 'talk', 'venture'],
      ['term', 'sheet'],
    ],
    insight: {
      id: 'ai-venture-financing',
      headline: 'Start with emerging companies + capital markets counsel',
      answer:
        'For a Series B or similar venture financing, Cooley typically staffs an Emerging Companies / Venture Capital partner alongside capital markets specialists when a public path is in view. Use People search for Palo Alto and San Francisco corporate partners, then add the venture financing insight and term-sheet webinar for prep materials.',
      bullets: [
        'Talk to Emerging Companies / Venture Capital partners (e.g. Joshua Mates) for the financing.',
        'Loop in Capital Markets (e.g. David Peinsipp) if IPO or public-company readiness is on the roadmap.',
        'Share the Venture Financing Trends insight and Venture Term Sheets webinar with your team.',
      ],
      citations: [
        {
          title: 'Joshua Mates',
          href: '/People/Joshua-Mates',
          kbId: 'BIO',
          excerpt: 'Emerging companies and growth-stage corporate counsel.',
        },
        {
          title: 'David Peinsipp',
          href: '/People/David-Peinsipp',
          kbId: 'BIO',
          excerpt: 'Global capital markets co-chair — IPOs and follow-ons.',
        },
        {
          title: 'Venture financing trends',
          href: '/Media-and-Insight/Insights/Venture-Financing-Trends',
          kbId: 'ARTICLE',
          excerpt: 'What founders should expect in today’s rounds.',
        },
        {
          title: 'Webinar: Reading today’s venture term sheets',
          href: '/Media-and-Insight/Events/Venture-Term-Sheets-Webinar',
          kbId: 'WEBINAR',
          excerpt: 'Live walk-through of current term-sheet points.',
        },
      ],
      learnMoreHref: '/Practices/Corporate/Venture-Capital',
      learnMoreLabel: 'Explore Venture Capital',
    },
  },
  {
    matchAny: [
      ['life', 'science', 'ipo'],
      ['biotech', 'ipo'],
      ['life', 'sciences', 'counsel'],
    ],
    insight: {
      id: 'ai-life-sciences-ipo',
      headline: 'Life sciences IPO = capital markets + industry team',
      answer:
        'Life sciences offerings combine Capital Markets execution with Life Sciences industry judgment. Pair a capital markets partner with the Life Sciences IPO Outlook article and the Raising Capital in Life Sciences webinar so legal and business stakeholders hear the same prep checklist.',
      bullets: [
        'Engage Capital Markets counsel experienced with biotech/medtech offerings.',
        'Review the Life Sciences IPO Outlook insight for disclosure and syndicate timing.',
        'Register for the Life Sciences Capital webinar for a client-facing briefing.',
      ],
      citations: [
        {
          title: 'David Peinsipp',
          href: '/People/David-Peinsipp',
          kbId: 'BIO',
          excerpt: 'Capital markets co-chair for emerging and public companies.',
        },
        {
          title: 'Life sciences IPO outlook',
          href: '/Media-and-Insight/Insights/Life-Sciences-IPO-Outlook',
          kbId: 'ARTICLE',
          excerpt: 'Preparation checklist before a public offering.',
        },
        {
          title: 'Webinar: Raising capital in life sciences',
          href: '/Media-and-Insight/Events/Life-Sciences-Capital-Webinar',
          kbId: 'WEBINAR',
          excerpt: 'Panel for biotech CFOs and GCs.',
        },
        {
          title: 'Life Sciences and Healthcare',
          href: '/Industries/Life-Sciences-and-Healthcare',
          kbId: 'INDUSTRY',
          excerpt: 'Industry hub for biotech, pharma, and medtech.',
        },
      ],
      learnMoreHref: '/Industries/Life-Sciences-and-Healthcare',
      learnMoreLabel: 'Browse life sciences industry',
    },
  },
  {
    matchAny: [
      ['ai', 'board'],
      ['ai', 'governance'],
      ['ai', 'webinar'],
      ['generative', 'ai'],
    ],
    insight: {
      id: 'ai-board-governance',
      headline: 'Board AI oversight: insight + live webinar',
      answer:
        'Directors usually want a short written checklist plus a live briefing. Point them to the AI Governance for Boards insight and the AI Board Oversight webinar, and route deeper IP or regulatory questions through the Artificial Intelligence industry page.',
      bullets: [
        'Share the AI governance article as pre-read for the board packet.',
        'Invite stakeholders to the AI Board Oversight webinar (CLE-eligible).',
        'Use the Artificial Intelligence industry page for practice/industry contacts.',
      ],
      citations: [
        {
          title: 'AI governance for boards',
          href: '/Media-and-Insight/Insights/AI-Governance-for-Boards',
          kbId: 'ARTICLE',
          excerpt: 'Questions directors should ask about generative AI.',
        },
        {
          title: 'Webinar: AI oversight for boards',
          href: '/Media-and-Insight/Events/AI-Board-Oversight-Webinar',
          kbId: 'WEBINAR',
          excerpt: '60-minute briefing on risk, disclosure, and diligence.',
        },
        {
          title: 'Artificial Intelligence',
          href: '/Industries/Artificial-Intelligence',
          kbId: 'INDUSTRY',
          excerpt: 'Industry team for AI companies and adopters.',
        },
      ],
      learnMoreHref: '/Media-and-Insight/Events/AI-Board-Oversight-Webinar',
      learnMoreLabel: 'Open AI webinar',
    },
  },
  {
    matchAny: [
      ['trade', 'secret'],
      ['litigation', 'palo'],
      ['competitor', 'dispute'],
    ],
    insight: {
      id: 'ai-trade-secret',
      headline: 'Trade secret disputes — Palo Alto litigation',
      answer:
        'For competitor and trade-secret matters in Silicon Valley, start with Palo Alto business litigation leadership. Amanda Main heads business litigation for the Palo Alto office and focuses on trade secret and post-acquisition disputes.',
      bullets: [
        'Contact Amanda Main for trade secret and competitor disputes.',
        'Filter Lawyers by Litigation + Palo Alto / Silicon Valley.',
        'Add IP partners when the matter overlaps patents or portfolios.',
      ],
      citations: [
        {
          title: 'Amanda A. Main',
          href: '/People/Amanda-Main',
          kbId: 'BIO',
          excerpt: 'Palo Alto business litigation — trade secret focus.',
        },
        {
          title: 'Shannon Eagan',
          href: '/People/Shannon-Eagan',
          kbId: 'BIO',
          excerpt: 'IP partner for technology and life sciences.',
        },
      ],
      learnMoreHref: '/People/Amanda-Main',
      learnMoreLabel: 'View Amanda Main bio',
    },
  },
  {
    matchAny: [
      ['export', 'control'],
      ['cfius'],
      ['sanction'],
    ],
    insight: {
      id: 'ai-export-controls',
      headline: 'Export controls & sanctions — CooleyREG',
      answer:
        'National-security and export-control questions run through CooleyREG (Export Controls and Economic Sanctions) with Washington, DC support. Pair the practice page with the export-controls alert for a short client update.',
      bullets: [
        'Open the Export Controls and Economic Sanctions practice page.',
        'Share the export-controls alert with in-house counsel.',
        'Add DC regulatory contacts for agency-facing work.',
      ],
      citations: [
        {
          title: 'Export Controls and Economic Sanctions',
          href: '/Practices/CooleyREG/Export-Controls-and-Economic-Sanctions',
          kbId: 'PRACTICE',
          excerpt: 'CooleyREG counsel on export controls and sanctions.',
        },
        {
          title: 'Export controls alert',
          href: '/Media-and-Insight/Alerts',
          kbId: 'ALERT',
          excerpt: 'Timely notes for tech exporters.',
        },
      ],
      learnMoreHref: '/Practices/CooleyREG/Export-Controls-and-Economic-Sanctions',
      learnMoreLabel: 'Open CooleyREG practice',
    },
  },
  {
    matchAny: [
      ['career'],
      ['summer', 'associate'],
      ['job', 'opening'],
    ],
    insight: {
      id: 'ai-careers',
      headline: 'Careers & recruiting at Cooley',
      answer:
        'Cooley’s Careers hub covers law students (including summer programs), practicing lawyers, and business professionals. Use it as the landing page for recruiting conversations in demos.',
      bullets: [
        'Send candidates to the Careers page for paths and recruiting contacts.',
        'Mention summer associate programs for law-student narratives.',
        'Pair with People bios when highlighting practice culture.',
      ],
      citations: [
        {
          title: 'Careers at Cooley',
          href: '/Careers',
          kbId: 'HUB',
          excerpt: 'Students, lawyers, and business professional paths.',
        },
        {
          title: 'People',
          href: '/People',
          kbId: 'HUB',
          excerpt: 'Lawyer directory for culture and practice examples.',
        },
      ],
      learnMoreHref: '/Careers',
      learnMoreLabel: 'Explore careers',
    },
  },
];

export function selectAiSearchInsight(
  q: string,
  _persona: DemoUserTaxonomy | null
): AiSearchInsight | null {
  const n = normalizeQuery(q);
  if (!n || n.length < 4) return null;

  let best: InsightRule | null = null;
  let bestScore = 0;
  for (const rule of AI_INSIGHT_RULES) {
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
