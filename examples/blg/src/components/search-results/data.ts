/**
 * BLG (Borden Ladner Gervais) search catalog — lawyers, insights, webinars,
 * events, podcasts, services, offices, and pages.
 * Hrefs use leftover Sitecore item slugs under /sitecore/content/pillsbury/blg/Home
 * (the starter resolves /Lawyers/..., /Insights/..., /Capabilities/... from Home).
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

/** Practice / service facet */
export type SearchPeril =
  | 'corporate'
  | 'disputes'
  | 'labour'
  | 'realEstate'
  | 'capitalMarkets'
  | 'indigenous'
  | 'infrastructure'
  | 'tax'
  | 'financialServices'
  | 'technology';

/** Office / geography facet — BLG Canadian offices only */
export type SearchTopic =
  | 'calgary'
  | 'montreal'
  | 'ottawa'
  | 'toronto'
  | 'vancouver'
  | 'national';

/** Keyword buckets for natural-language discovery */
export type SearchBucket =
  | 'tariffs'
  | 'trade'
  | 'construction'
  | 'genai'
  | 'esg'
  | 'indigenous'
  | 'labour'
  | 'insolvency'
  | 'distress'
  | 'litigation'
  | 'corporate'
  | 'tech'
  | 'ip'
  | 'expansion'
  | 'webinar'
  | 'podcast'
  | 'event'
  | 'careers';

export type SearchResultItem = {
  id: string;
  /** Short type code shown on cards (e.g. BIO, WEBINAR, PODCAST) */
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
    lawyer: 'People',
    insight: 'Insights & alerts',
    event: 'Webinars & events',
    podcast: 'Podcasts',
    capability: 'Services',
    office: 'Offices',
    career: 'Careers & openings',
    page: 'Site pages',
  },
  peril: {
    corporate: 'Corporate Commercial',
    disputes: 'Disputes',
    labour: 'Labour & Employment',
    realEstate: 'Commercial Real Estate',
    capitalMarkets: 'Capital Markets',
    indigenous: 'Indigenous Law',
    infrastructure: 'Infrastructure',
    tax: 'Tax',
    financialServices: 'Financial Services',
    technology: 'Technology',
  },
  topic: {
    calgary: 'Calgary',
    montreal: 'Montréal',
    ottawa: 'Ottawa',
    toronto: 'Toronto',
    vancouver: 'Vancouver',
    national: 'National / multi-office',
  },
} as const;

export const lobs = Object.keys(searchFacetLabels.lob) as SearchLob[];
export const perils = Object.keys(searchFacetLabels.peril) as SearchPeril[];
export const topics = Object.keys(searchFacetLabels.topic) as SearchTopic[];

/** Popular chips — careers plus Canada / tariffs / Construction Act / GenAI */
export const popularSearches = [
  "I'm looking for a career in corporate commercial. What openings do you have?",
  'Summer associate program',
  "We're entering Canada and have tariff questions. Who should we talk to?",
  'Construction Act holdback',
  'GenAI governance for a Canadian issuer',
  'ESG infrastructure project',
  'Toronto corporate lawyers',
  'Indigenous law counsel',
];

export const QUERY_BUCKET_SYNONYMS: Record<SearchBucket, readonly string[]> = {
  tariffs: [
    'tariff',
    'tariffs',
    'customs',
    'trade remedy',
    'trade remedies',
    'cbm',
    'duties',
  ],
  trade: ['international trade', 'trade', 'customs', 'cross-border', 'cross border'],
  construction: [
    'construction',
    'construction act',
    'holdback',
    'lien',
    'builder',
    'project claim',
  ],
  genai: ['genai', 'gen ai', 'generative ai', 'artificial intelligence', 'ai governance'],
  esg: ['esg', 'sustainability', 'climate', 'responsible investing'],
  indigenous: ['indigenous', 'first nations', 'reconciliation', 'duty to consult'],
  labour: ['labour', 'labor', 'employment', 'workplace', 'human rights'],
  insolvency: ['insolvency', 'restructuring', 'bankruptcy', 'creditor', 'ccaa'],
  distress: ['distress', 'distressed', 'troubled', 'financial distress'],
  litigation: ['litigation', 'trial', 'dispute', 'arbitration', 'disputes'],
  corporate: ['corporate', 'm&a', 'securities', 'capital markets', 'entity', 'governance'],
  tech: ['tech', 'technology', 'software', 'digital', 'data'],
  ip: ['ip', 'intellectual property', 'patent', 'trademark', 'copyright'],
  expansion: [
    'expand',
    'expanding',
    'expansion',
    'market entry',
    'entering',
    'enter',
    'doing business',
  ],
  webinar: ['webinar', 'webcast', 'virtual briefing'],
  podcast: ['podcast', 'trade talks', 'episode', 'listen'],
  event: ['event', 'cle', 'briefing', 'conference', 'seminar', 'workshop'],
  careers: [
    'career',
    'careers',
    'job',
    'jobs',
    'opening',
    'openings',
    'hiring',
    'apply',
    'application',
    'summer associate',
    'lateral',
    'recruiting',
    'business professional',
    'open role',
    'articling',
  ],
};

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

export function detectSearchBuckets(q: string): SearchBucket[] {
  const n = normalizeQuery(q);
  if (!n) return [];
  const words = n.split(/\s+/).filter(Boolean);
  const hits = new Set<SearchBucket>();
  for (const [bucket, synonyms] of Object.entries(QUERY_BUCKET_SYNONYMS) as [
    SearchBucket,
    readonly string[],
  ][]) {
    for (const syn of synonyms) {
      if (n.includes(syn) || words.some((w) => w.length > 2 && syn.startsWith(w))) {
        hits.add(bucket);
        break;
      }
    }
  }
  return [...hits];
}

export function itemVisibleForDemoUser(item: SearchResultItem, user: DemoUserTaxonomy | null): boolean {
  if (!item.visibleForDemoUsers?.length) return true;
  if (!user) return false;
  return item.visibleForDemoUsers.includes(user);
}

function itemMatchesBuckets(item: SearchResultItem, buckets: SearchBucket[]): boolean {
  if (!buckets.length) return true;
  return buckets.some((b) => item.searchBuckets.includes(b));
}

function significantQueryWords(n: string): string[] {
  return n
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !QUERY_STOP_WORDS.has(w));
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

/** Kept for SearchResults compatibility — no Edge KA overlay in this legal catalog. */
export function buildKnowledgeHrefIndex(
  _articles: Array<{
    name?: string;
    path?: string;
    url?: string | { path?: string };
    kbId?: unknown;
  }>
): Map<string, string> {
  void _articles;
  return new Map();
}

export function applyLiveKnowledgeHrefs(
  items: SearchResultItem[],
  _hrefIndex: Map<string, string>
): SearchResultItem[] {
  void _hrefIndex;
  return items;
}

export function supplementalResultsForDemoUserTaxonomy(_persona: DemoUserTaxonomy): SearchResultItem[] {
  void _persona;
  return [];
}

function entry(partial: SearchResultItem): SearchResultItem {
  return partial;
}

/** Catalog of searchable site content with valid BLG Home routes (leftover item slugs). */
export const searchCatalog: SearchResultItem[] = [
  // —— People (Bios) — leftover slugs, BLG display names ——
  entry({
    id: 'bio-line-abecassis',
    kbId: 'BIO',
    title: 'Line Abecassis',
    subtitle: 'Partner · Commercial Real Estate',
    description:
      'Montréal partner advising on commercial real estate acquisitions, leasing, and development across Québec and national portfolios. LAbecassis@blg.com',
    href: '/Lawyers/Bios/Andrew-V-Alfano',
    lob: 'lawyer',
    perils: ['realEstate'],
    topics: ['montreal'],
    searchBuckets: ['construction', 'corporate'],
    breadcrumb: ['People', 'Bios', 'Line Abecassis'],
    matchTerms: ['line', 'abecassis', 'montreal', 'montréal', 'real estate', 'leasing'],
    isNew: true,
  }),
  entry({
    id: 'bio-marc-abdelsayed',
    kbId: 'BIO',
    title: 'Marc Abdelsayed',
    subtitle: 'Senior Associate · Corporate Commercial',
    description:
      'Montréal corporate commercial lawyer advising inbound clients on Canadian entity setup, M&A, and tariff-sensitive supply chains. MAbdelsayed@blg.com',
    href: '/Lawyers/Bios/Ata-A-Akiner',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['montreal', 'national'],
    searchBuckets: ['tariffs', 'trade', 'corporate', 'expansion'],
    breadcrumb: ['People', 'Bios', 'Marc Abdelsayed'],
    matchTerms: ['marc', 'abdelsayed', 'tariff', 'canada', 'corporate', 'talk to', 'entering'],
    isNew: true,
  }),
  entry({
    id: 'bio-ali-abdulla',
    kbId: 'BIO',
    title: 'Ali Abdulla',
    subtitle: 'Associate · Tax',
    description:
      'Calgary tax associate advising on corporate tax, commodity tax, and cross-border structuring for energy and private-company clients.',
    href: '/Lawyers/Bios/James-L-Alberg',
    lob: 'lawyer',
    perils: ['tax', 'corporate'],
    topics: ['calgary'],
    searchBuckets: ['corporate', 'trade'],
    breadcrumb: ['People', 'Bios', 'Ali Abdulla'],
    matchTerms: ['ali', 'abdulla', 'tax', 'calgary', 'commodity'],
  }),
  entry({
    id: 'bio-suhuyini-abudulai',
    kbId: 'BIO',
    title: 'Suhuyini Abudulai',
    subtitle: 'Partner · Financial Services',
    description:
      'Toronto partner in banking and financial services, advising lenders and institutional clients on Canadian regulatory and transactional matters.',
    href: '/Lawyers/Bios/Jennifer-Altman',
    lob: 'lawyer',
    perils: ['financialServices'],
    topics: ['toronto'],
    searchBuckets: ['corporate', 'distress', 'insolvency'],
    breadcrumb: ['People', 'Bios', 'Suhuyini Abudulai'],
    matchTerms: ['suhuyini', 'abudulai', 'toronto', 'banking', 'financial services'],
  }),
  entry({
    id: 'bio-amanda-afeich',
    kbId: 'BIO',
    title: 'Amanda Afeich',
    subtitle: 'Associate · Disputes',
    description:
      'Montréal disputes associate supporting commercial litigation, public-law matters, and trade-related conflicts for Canadian and inbound clients.',
    href: '/Lawyers/Bios/Khalid-A-AlArfaj',
    lob: 'lawyer',
    perils: ['disputes'],
    topics: ['montreal'],
    searchBuckets: ['litigation', 'tariffs', 'trade'],
    breadcrumb: ['People', 'Bios', 'Amanda Afeich'],
    matchTerms: ['amanda', 'afeich', 'disputes', 'montreal', 'litigation'],
  }),
  entry({
    id: 'bio-kate-agyemang',
    kbId: 'BIO',
    title: 'Kate L. Agyemang',
    subtitle: 'Associate · Labour and Employment',
    description:
      'Ottawa labour and employment associate advising employers on workplace investigations, human rights, and federal/provincial employment standards.',
    href: '/Lawyers/Bios/Lee-Alexander',
    lob: 'lawyer',
    perils: ['labour'],
    topics: ['ottawa'],
    searchBuckets: ['labour'],
    breadcrumb: ['People', 'Bios', 'Kate L. Agyemang'],
    matchTerms: ['kate', 'agyemang', 'ottawa', 'employment', 'labour'],
  }),
  entry({
    id: 'bio-wiam-akil',
    kbId: 'BIO',
    title: 'Wiam Akil',
    subtitle: 'Associate · Banking / Commercial Real Estate',
    description:
      'Ottawa associate advising on banking and commercial real estate financing for lenders and developers.',
    href: '/Lawyers/Bios/Leonie-Arendt-Cassetta',
    lob: 'lawyer',
    perils: ['financialServices', 'realEstate'],
    topics: ['ottawa'],
    searchBuckets: ['corporate', 'construction'],
    breadcrumb: ['People', 'Bios', 'Wiam Akil'],
    matchTerms: ['wiam', 'akil', 'ottawa', 'banking', 'real estate'],
  }),
  entry({
    id: 'bio-michael-akins',
    kbId: 'BIO',
    title: 'Michael Akins',
    subtitle: 'Associate · Commercial Real Estate',
    description:
      'Calgary commercial real estate associate supporting acquisitions, leasing, and development in Alberta.',
    href: '/Lawyers/Bios/Mark-Bio',
    lob: 'lawyer',
    perils: ['realEstate'],
    topics: ['calgary'],
    searchBuckets: ['construction', 'corporate'],
    breadcrumb: ['People', 'Bios', 'Michael Akins'],
    matchTerms: ['michael', 'akins', 'calgary', 'real estate'],
  }),
  entry({
    id: 'bio-don-alberga',
    kbId: 'BIO',
    title: 'Don J. Alberga',
    subtitle: 'Partner · Labour and Employment',
    description:
      'Montréal labour and employment partner advising employers on union relations, workplace investigations, and Québec employment law. DAlberga@blg.com',
    href: '/Lawyers/Bios/Mark-Abate',
    lob: 'lawyer',
    perils: ['labour'],
    topics: ['montreal'],
    searchBuckets: ['labour'],
    breadcrumb: ['People', 'Bios', 'Don J. Alberga'],
    matchTerms: ['don', 'alberga', 'montreal', 'labour', 'employment', 'quebec'],
    isNew: true,
  }),
  entry({
    id: 'bio-jp-alexandrowicz',
    kbId: 'BIO',
    title: 'John-Paul Alexandrowicz',
    subtitle: 'Partner · Labour and Employment',
    description:
      'Toronto labour and employment partner advising national employers on workplace strategy, human rights, and labour relations.',
    href: '/Lawyers/Bios/Mediha-M-Ali',
    lob: 'lawyer',
    perils: ['labour'],
    topics: ['toronto'],
    searchBuckets: ['labour'],
    breadcrumb: ['People', 'Bios', 'John-Paul Alexandrowicz'],
    matchTerms: ['john-paul', 'alexandrowicz', 'toronto', 'labour', 'employment'],
  }),
  entry({
    id: 'bio-kendall-andersen',
    kbId: 'BIO',
    title: 'Kendall Andersen',
    subtitle: 'Partner · Banking / Insolvency',
    description:
      'Vancouver partner advising lenders and distressed companies on insolvency, CCAA, and banking restructurings across Western Canada.',
    href: '/Lawyers/Bios/Natalie-Alexander',
    lob: 'lawyer',
    perils: ['financialServices'],
    topics: ['vancouver'],
    searchBuckets: ['insolvency', 'distress'],
    breadcrumb: ['People', 'Bios', 'Kendall Andersen'],
    matchTerms: ['kendall', 'andersen', 'vancouver', 'insolvency', 'ccaa', 'restructuring'],
  }),
  entry({
    id: 'bio-makena-anderson',
    kbId: 'BIO',
    title: 'Makena Anderson',
    subtitle: 'Associate · Capital Markets',
    description:
      'Vancouver capital markets associate advising issuers and underwriters on public offerings and GenAI-related disclosure. MakAnderson@blg.com',
    href: '/Lawyers/Bios/Osama-Abu-Dehays',
    lob: 'lawyer',
    perils: ['capitalMarkets', 'technology'],
    topics: ['vancouver'],
    searchBuckets: ['corporate', 'genai', 'tech'],
    breadcrumb: ['People', 'Bios', 'Makena Anderson'],
    matchTerms: ['makena', 'anderson', 'vancouver', 'capital markets', 'genai'],
  }),
  entry({
    id: 'bio-benjamin-anstess',
    kbId: 'BIO',
    title: 'Benjamin Anstess',
    subtitle: 'Associate · Commercial Real Estate',
    description:
      'Toronto commercial real estate associate supporting leasing, acquisitions, and development matters.',
    href: '/Lawyers/Bios/Ranjini-Acharya',
    lob: 'lawyer',
    perils: ['realEstate'],
    topics: ['toronto'],
    searchBuckets: ['construction', 'corporate'],
    breadcrumb: ['People', 'Bios', 'Benjamin Anstess'],
    matchTerms: ['benjamin', 'anstess', 'toronto', 'real estate'],
  }),
  entry({
    id: 'bio-jennifer-archer',
    kbId: 'BIO',
    title: 'Jennifer Archer',
    subtitle: 'Partner · Corporate Commercial',
    description:
      'Vancouver corporate commercial partner advising on M&A, governance, and ESG-related corporate transactions.',
    href: '/Lawyers/Bios/Rolando-T-Acosta',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['vancouver'],
    searchBuckets: ['corporate', 'esg'],
    breadcrumb: ['People', 'Bios', 'Jennifer Archer'],
    matchTerms: ['jennifer', 'archer', 'vancouver', 'm&a', 'esg'],
  }),
  entry({
    id: 'bio-frank-arnone',
    kbId: 'BIO',
    title: 'Frank Arnone',
    subtitle: 'Partner · Commercial Real Estate',
    description:
      'Toronto commercial real estate partner advising on development, Construction Act holdbacks, and national real estate portfolios. farnone@blg.com',
    href: '/Lawyers/Bios/Ryan-R-Adelsperger',
    lob: 'lawyer',
    perils: ['realEstate', 'infrastructure'],
    topics: ['toronto'],
    searchBuckets: ['construction', 'corporate'],
    breadcrumb: ['People', 'Bios', 'Frank Arnone'],
    matchTerms: ['frank', 'arnone', 'toronto', 'construction act', 'holdback', 'real estate'],
    isNew: true,
  }),
  entry({
    id: 'bio-camden-amos',
    kbId: 'BIO',
    title: 'Camden Amos',
    subtitle: 'Associate · Disputes',
    description:
      'Ottawa disputes associate supporting commercial litigation and public-law files for Canadian and government clients.',
    href: '/Lawyers/Bios/Semma-G-Arzapalo',
    lob: 'lawyer',
    perils: ['disputes'],
    topics: ['ottawa'],
    searchBuckets: ['litigation'],
    breadcrumb: ['People', 'Bios', 'Camden Amos'],
    matchTerms: ['camden', 'amos', 'ottawa', 'disputes', 'litigation'],
  }),
  entry({
    id: 'bio-duncan-ault',
    kbId: 'BIO',
    title: 'Duncan Ault',
    subtitle: 'Partner · Disputes',
    description:
      'Ottawa disputes partner advising on commercial litigation, public law, and tariff / trade-remedy conflicts for inbound and Canadian clients.',
    href: '/Lawyers/Bios/Shinya-Akiyama',
    lob: 'lawyer',
    perils: ['disputes'],
    topics: ['ottawa', 'national'],
    searchBuckets: ['litigation', 'tariffs', 'trade', 'expansion'],
    breadcrumb: ['People', 'Bios', 'Duncan Ault'],
    matchTerms: ['duncan', 'ault', 'ottawa', 'disputes', 'tariff', 'trade', 'talk to'],
    isNew: true,
  }),
  entry({
    id: 'bio-mira-azzi',
    kbId: 'BIO',
    title: 'Mira Azzi',
    subtitle: 'Associate · Corporate Commercial',
    description:
      'Ottawa corporate commercial associate supporting M&A, governance, and doing-business-in-Canada work for inbound clients.',
    href: '/Lawyers/Bios/Stephanie-Amaru',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['ottawa'],
    searchBuckets: ['corporate', 'expansion'],
    breadcrumb: ['People', 'Bios', 'Mira Azzi'],
    matchTerms: ['mira', 'azzi', 'ottawa', 'corporate', 'm&a'],
  }),
  entry({
    id: 'bio-shane-barnes',
    kbId: 'BIO',
    title: 'Shane Barnes',
    subtitle: 'Partner · Capital Markets',
    description:
      'Calgary capital markets partner advising issuers and underwriters on public and private offerings, including energy and technology issuers. SBarnes@blg.com',
    href: '/Lawyers/Bios/Stephanie-Angkadjaja',
    lob: 'lawyer',
    perils: ['capitalMarkets'],
    topics: ['calgary'],
    searchBuckets: ['corporate', 'genai'],
    breadcrumb: ['People', 'Bios', 'Shane Barnes'],
    matchTerms: ['shane', 'barnes', 'calgary', 'capital markets', 'securities'],
  }),
  entry({
    id: 'bio-sarah-bird',
    kbId: 'BIO',
    title: 'Sarah Bird',
    subtitle: 'Partner · Infrastructure',
    description:
      'Vancouver partner advising on infrastructure, Indigenous law, construction, and ESG for major Canadian projects. SBird@blg.com',
    href: '/Lawyers/Bios/Stephen-C-Ashley',
    lob: 'lawyer',
    perils: ['infrastructure', 'indigenous'],
    topics: ['vancouver', 'national'],
    searchBuckets: ['construction', 'esg', 'indigenous'],
    breadcrumb: ['People', 'Bios', 'Sarah Bird'],
    matchTerms: ['sarah', 'bird', 'vancouver', 'infrastructure', 'indigenous', 'esg', 'construction'],
    isNew: true,
  }),
  entry({
    id: 'bio-julie-bogle',
    kbId: 'BIO',
    title: 'Julie Bogle',
    subtitle: 'Partner · Capital Markets',
    description:
      'Vancouver capital markets partner advising Canadian issuers on offerings, continuous disclosure, and GenAI governance. JBogle@blg.com',
    href: '/Lawyers/Bios/Stephen-S-Asay',
    lob: 'lawyer',
    perils: ['capitalMarkets', 'technology'],
    topics: ['vancouver'],
    searchBuckets: ['corporate', 'genai', 'tech'],
    breadcrumb: ['People', 'Bios', 'Julie Bogle'],
    matchTerms: ['julie', 'bogle', 'vancouver', 'capital markets', 'genai', 'issuer'],
    isNew: true,
  }),

  // —— Insights ——
  entry({
    id: 'insight-blogs-hub',
    kbId: 'HUB',
    title: 'Insights · Blogs',
    description: 'Browse BLG blog hubs and thought leadership from Canada’s Law Firm.',
    href: '/Insights/Blogs',
    lob: 'insight',
    perils: ['corporate', 'disputes', 'technology'],
    topics: ['national'],
    searchBuckets: ['corporate', 'litigation', 'tech'],
    breadcrumb: ['Insights', 'Blogs'],
    matchTerms: ['blogs', 'insights', 'thought leadership'],
  }),
  entry({
    id: 'insight-global-trade',
    kbId: 'BLOG',
    title: 'Tariffs and Trade',
    subtitle: 'Insights · Blog',
    description:
      'Analysis of Canadian tariffs, trade remedies, customs, and cross-border supply-chain developments.',
    href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law',
    lob: 'insight',
    perils: ['corporate', 'disputes'],
    topics: ['national', 'ottawa'],
    searchBuckets: ['tariffs', 'trade', 'expansion'],
    breadcrumb: ['Insights', 'Blogs', 'Tariffs and Trade'],
    matchTerms: ['tariffs', 'trade blog', 'customs', 'canada'],
  }),
  entry({
    id: 'insight-investment-fund',
    kbId: 'BLOG',
    title: 'Financial Services Insights',
    subtitle: 'Insights · Blog',
    description: 'Guidance for Canadian lenders, funds, and institutional investors.',
    href: '/Insights/Blogs/Investment-Fund-Law',
    lob: 'insight',
    perils: ['financialServices', 'corporate'],
    topics: ['national'],
    searchBuckets: ['corporate'],
    breadcrumb: ['Insights', 'Blogs', 'Financial Services Insights'],
    matchTerms: ['financial services', 'funds', 'banking blog'],
  }),
  entry({
    id: 'insight-sourcing-speak',
    kbId: 'BLOG',
    title: 'Technology & Digital',
    subtitle: 'Insights · Blog',
    description: 'Technology transactions, GenAI contracting, and digital transformation commentary.',
    href: '/Insights/Blogs/Sourcing-Speak',
    lob: 'insight',
    perils: ['technology'],
    topics: ['national'],
    searchBuckets: ['tech', 'genai'],
    breadcrumb: ['Insights', 'Blogs', 'Technology & Digital'],
    matchTerms: ['technology', 'genai', 'digital', 'saas'],
  }),
  entry({
    id: 'insight-gravel',
    kbId: 'BLOG',
    title: 'Energy & Infrastructure',
    subtitle: 'Insights · Blog',
    description: 'Energy, infrastructure, ESG, and project-development commentary from BLG.',
    href: '/Insights/Blogs/Gravel2Gavel',
    lob: 'insight',
    perils: ['infrastructure', 'indigenous'],
    topics: ['national', 'calgary', 'vancouver'],
    searchBuckets: ['esg', 'construction', 'indigenous'],
    breadcrumb: ['Insights', 'Blogs', 'Energy & Infrastructure'],
    matchTerms: ['energy', 'infrastructure', 'esg', 'renewables'],
  }),

  // —— Services ——
  entry({
    id: 'cap-corporate',
    kbId: 'SERVICE',
    title: 'Corporate Commercial',
    subtitle: 'Services',
    description: 'M&A, private company, and corporate governance counsel from BLG’s national team.',
    href: '/Capabilities/Services/Corporate-and-Transactional',
    lob: 'capability',
    perils: ['corporate'],
    topics: ['national'],
    searchBuckets: ['corporate'],
    breadcrumb: ['Services', 'Corporate Commercial'],
    matchTerms: ['m&a', 'transactions', 'corporate commercial'],
  }),
  entry({
    id: 'cap-disputes',
    kbId: 'SERVICE',
    title: 'Disputes',
    subtitle: 'Services',
    description: 'Commercial litigation, class actions, arbitration, and appellate advocacy.',
    href: '/Capabilities/Services/Litigation',
    lob: 'capability',
    perils: ['disputes'],
    topics: ['national'],
    searchBuckets: ['litigation'],
    breadcrumb: ['Services', 'Disputes'],
    matchTerms: ['disputes', 'litigation', 'trial'],
  }),
  entry({
    id: 'cap-cre',
    kbId: 'SERVICE',
    title: 'Commercial Real Estate and Construction',
    subtitle: 'Services',
    description: 'Leasing, development, financing, Construction Act, and infrastructure real estate.',
    href: '/Capabilities/Services/Real-Estate-and-Construction',
    lob: 'capability',
    perils: ['realEstate', 'infrastructure'],
    topics: ['national'],
    searchBuckets: ['construction'],
    breadcrumb: ['Services', 'Commercial Real Estate'],
    matchTerms: ['real estate', 'construction act', 'holdback'],
  }),
  entry({
    id: 'cap-financial',
    kbId: 'SERVICE',
    title: 'Financial Services',
    subtitle: 'Services',
    description: 'Regulation, consumer finance, payments, and institutional transactions.',
    href: '/Capabilities/Services/Financial-Services',
    lob: 'capability',
    perils: ['financialServices'],
    topics: ['national'],
    searchBuckets: ['corporate', 'insolvency'],
    breadcrumb: ['Services', 'Financial Services'],
    matchTerms: ['financial services', 'banking', 'payments'],
  }),
  entry({
    id: 'cap-technology',
    kbId: 'SERVICE',
    title: 'Technology',
    subtitle: 'Services',
    description: 'Counsel for Canadian and cross-border technology companies, including GenAI.',
    href: '/Capabilities/Services/Technology',
    lob: 'capability',
    perils: ['technology', 'corporate'],
    topics: ['national'],
    searchBuckets: ['tech', 'genai', 'corporate'],
    breadcrumb: ['Services', 'Technology'],
    matchTerms: ['tech sector', 'genai', 'technology practice'],
  }),
  entry({
    id: 'cap-ip',
    kbId: 'SERVICE',
    title: 'Intellectual Property',
    subtitle: 'Services',
    description: 'Patents, trademarks, and IP strategy for Canadian and international clients.',
    href: '/Capabilities/Services/Intellectual-Property',
    lob: 'capability',
    perils: ['technology'],
    topics: ['national'],
    searchBuckets: ['ip', 'tech'],
    breadcrumb: ['Services', 'Intellectual Property'],
    matchTerms: ['ip practice', 'patent', 'trademark'],
  }),
  entry({
    id: 'cap-energy',
    kbId: 'SERVICE',
    title: 'Energy',
    subtitle: 'Services',
    description: 'Oil and gas, power, renewables, and energy transactions across Canada.',
    href: '/Capabilities/Services/Energy',
    lob: 'capability',
    perils: ['infrastructure'],
    topics: ['calgary', 'national'],
    searchBuckets: ['esg', 'construction'],
    breadcrumb: ['Services', 'Energy'],
    matchTerms: ['energy', 'oil', 'gas', 'renewables'],
  }),

  // —— Offices ——
  entry({
    id: 'office-calgary',
    kbId: 'OFFICE',
    title: 'Calgary',
    subtitle: 'Office',
    description: 'BLG Calgary — energy, capital markets, tax, and commercial real estate. 403.232.9500',
    href: '/Lawyers/Offices/Calgary',
    lob: 'office',
    perils: ['corporate', 'capitalMarkets', 'tax', 'realEstate'],
    topics: ['calgary'],
    searchBuckets: ['corporate'],
    breadcrumb: ['People', 'Offices', 'Calgary'],
    matchTerms: ['calgary office', 'alberta'],
  }),
  entry({
    id: 'office-montreal',
    kbId: 'OFFICE',
    title: 'Montréal',
    subtitle: 'Office',
    description: 'BLG Montréal — corporate commercial, disputes, labour, and real estate. 514.879.1212',
    href: '/Lawyers/Offices/Montreal',
    lob: 'office',
    perils: ['corporate', 'disputes', 'labour', 'realEstate'],
    topics: ['montreal'],
    searchBuckets: ['corporate', 'litigation', 'labour'],
    breadcrumb: ['People', 'Offices', 'Montréal'],
    matchTerms: ['montreal', 'montréal', 'quebec', 'québec'],
  }),
  entry({
    id: 'office-ottawa',
    kbId: 'OFFICE',
    title: 'Ottawa',
    subtitle: 'Office',
    description: 'BLG Ottawa — disputes, public law, labour, and corporate commercial. 613.237.5160',
    href: '/Lawyers/Offices/Ottawa',
    lob: 'office',
    perils: ['disputes', 'labour', 'corporate'],
    topics: ['ottawa'],
    searchBuckets: ['litigation', 'labour', 'tariffs'],
    breadcrumb: ['People', 'Offices', 'Ottawa'],
    matchTerms: ['ottawa office', 'national capital'],
  }),
  entry({
    id: 'office-toronto',
    kbId: 'OFFICE',
    title: 'Toronto',
    subtitle: 'Office',
    description:
      'BLG Toronto — corporate commercial, financial services, labour, and commercial real estate. 416.367.6000',
    href: '/Lawyers/Offices/Toronto',
    lob: 'office',
    perils: ['corporate', 'financialServices', 'labour', 'realEstate'],
    topics: ['toronto'],
    searchBuckets: ['corporate', 'construction'],
    breadcrumb: ['People', 'Offices', 'Toronto'],
    matchTerms: ['toronto office', 'ontario'],
  }),
  entry({
    id: 'office-vancouver',
    kbId: 'OFFICE',
    title: 'Vancouver',
    subtitle: 'Office',
    description:
      'BLG Vancouver — capital markets, infrastructure, Indigenous law, and insolvency. 604.687.5744',
    href: '/Lawyers/Offices/Vancouver',
    lob: 'office',
    perils: ['capitalMarkets', 'infrastructure', 'indigenous', 'financialServices'],
    topics: ['vancouver'],
    searchBuckets: ['corporate', 'esg', 'indigenous', 'genai'],
    breadcrumb: ['People', 'Offices', 'Vancouver'],
    matchTerms: ['vancouver office', 'british columbia', 'bc'],
  }),

  // —— Webinars & events (Canada / tariffs / Construction Act / GenAI) ——
  entry({
    id: 'blog-canada-tariffs-supply-chains',
    kbId: 'BLOG',
    title: 'Canada Tariffs and Supply Chains',
    subtitle: 'Tariffs and Trade · Marc Abdelsayed',
    description:
      'Practical diligence for inbound clients navigating Canadian tariffs, customs, and supply-chain contracts—pairing Montréal corporate counsel with Ottawa disputes.',
    href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law/Saudi-Expansion-and-US-Export-Controls',
    lob: 'insight',
    perils: ['corporate', 'disputes'],
    topics: ['montreal', 'ottawa', 'national'],
    searchBuckets: ['tariffs', 'trade', 'expansion'],
    dateLabel: 'Blog post',
    breadcrumb: ['Insights', 'Blogs', 'Tariffs and Trade', 'Canada Tariffs'],
    matchTerms: ['tariff', 'supply chain', 'canada', 'blog', 'abdelsayed'],
    isNew: true,
  }),
  entry({
    id: 'webinar-tariffs-trade-centre',
    kbId: 'WEBINAR',
    title: 'Tariffs and Trade Resource Centre',
    subtitle: 'Webinar · Corporate Commercial & Disputes',
    description:
      'Practical guidance for Canadian businesses navigating tariffs, trade remedies, and cross-border supply chains—with Marc Abdelsayed and Duncan Ault.',
    href: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
    lob: 'event',
    perils: ['corporate', 'disputes'],
    topics: ['ottawa', 'montreal', 'national'],
    searchBuckets: ['tariffs', 'trade', 'expansion', 'webinar', 'event'],
    dateLabel: 'Upcoming webinar',
    breadcrumb: ['Insights', 'Events', 'Webinar', 'Tariffs and Trade'],
    matchTerms: ['webinar', 'tariff', 'trade', 'canada', 'entering', 'who should we talk'],
    isNew: true,
  }),
  entry({
    id: 'webinar-doing-business-canada',
    kbId: 'WEBINAR',
    title: 'Doing Business in Canada: Corporate Setup',
    subtitle: 'Webinar · Corporate Commercial',
    description:
      'Standing up a Canadian entity and aligning tariff, employment, and governance work across BLG’s five offices.',
    href: '/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
    lob: 'event',
    perils: ['corporate'],
    topics: ['national'],
    searchBuckets: ['corporate', 'expansion', 'trade', 'webinar', 'event'],
    dateLabel: 'On demand',
    breadcrumb: ['Insights', 'Events', 'Webinar', 'Doing Business in Canada'],
    matchTerms: ['doing business', 'canada', 'entity', 'corporate setup', 'webinar'],
    isNew: true,
  }),
  entry({
    id: 'cle-tariffs-ottawa-toronto',
    kbId: 'CLE',
    title: 'Tariffs & Trade Briefing: Ottawa & Toronto',
    subtitle: 'CLE Event · Live',
    description:
      'Half-day briefing for in-house teams managing Canadian tariff and trade-remedy risk—with Ault and Abdelsayed.',
    href: '/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
    lob: 'event',
    perils: ['disputes', 'corporate'],
    topics: ['ottawa', 'toronto'],
    searchBuckets: ['tariffs', 'trade', 'expansion', 'event'],
    dateLabel: 'CLE · Live',
    breadcrumb: ['Insights', 'Events', 'CLE', 'Ottawa & Toronto Briefing'],
    matchTerms: ['cle', 'briefing', 'ottawa', 'tariff', 'canada', 'event'],
    isNew: true,
  }),
  entry({
    id: 'hub-events',
    kbId: 'HUB',
    title: 'Insights · Events',
    subtitle: 'Webinars, CLE & speaking',
    description: 'Browse BLG webinars, CLE programs, and speaking engagements.',
    href: '/Insights/Events',
    lob: 'event',
    perils: ['corporate', 'disputes'],
    topics: ['national'],
    searchBuckets: ['event', 'webinar', 'expansion'],
    breadcrumb: ['Insights', 'Events'],
    matchTerms: ['events hub', 'webinars', 'cle calendar'],
  }),
  entry({
    id: 'hub-webinars',
    kbId: 'HUB',
    title: 'Webinars',
    subtitle: 'Events · Webinar',
    description: 'Client webinars including tariffs, doing business in Canada, Construction Act, and GenAI.',
    href: '/Insights/Events/Webinar',
    lob: 'event',
    perils: ['corporate', 'technology'],
    topics: ['national'],
    searchBuckets: ['webinar', 'event', 'tariffs', 'genai'],
    breadcrumb: ['Insights', 'Events', 'Webinar'],
    matchTerms: ['webinar list', 'virtual events'],
  }),

  // —— Podcasts & thought leadership ——
  entry({
    id: 'podcast-trade-talks-canada-tariffs',
    kbId: 'PODCAST',
    title: 'Trade Talks: Canada’s Tariff Response',
    subtitle: 'Podcast episode',
    description:
      'When to involve Montréal corporate counsel vs Ottawa disputes counsel—and how webinars complement intake.',
    href: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
    lob: 'podcast',
    perils: ['corporate', 'disputes'],
    topics: ['ottawa', 'montreal', 'national'],
    searchBuckets: ['tariffs', 'trade', 'expansion', 'podcast'],
    dateLabel: 'Listen now',
    breadcrumb: ['Insights', 'Thought Leadership', 'Podcast', 'Trade Talks'],
    matchTerms: ['podcast', 'tariff', 'trade talks', 'canada', 'listen'],
    isNew: true,
  }),
  entry({
    id: 'hub-podcasts',
    kbId: 'HUB',
    title: 'Podcasts',
    subtitle: 'Thought Leadership · Podcast',
    description: 'BLG podcasts on tariffs, Construction Act, GenAI, and ESG.',
    href: '/Insights/Thought-Leadership/Podcast',
    lob: 'podcast',
    perils: ['corporate'],
    topics: ['national'],
    searchBuckets: ['podcast', 'trade', 'tariffs'],
    breadcrumb: ['Insights', 'Thought Leadership', 'Podcast'],
    matchTerms: ['podcast series', 'audio'],
  }),
  entry({
    id: 'alert-canada-tariff-update',
    kbId: 'ALERT',
    title: 'Canada Tariff Update',
    subtitle: 'Legal alert',
    description: 'Recent tariff and customs developments for companies doing business in Canada.',
    href: '/Insights/Thought-Leadership/Alert/Gulf-Expansion-EAR-OFAC-Update',
    lob: 'insight',
    perils: ['corporate', 'disputes'],
    topics: ['national', 'ottawa'],
    searchBuckets: ['tariffs', 'trade', 'expansion'],
    dateLabel: 'Alert',
    breadcrumb: ['Insights', 'Thought Leadership', 'Alert', 'Canada Tariff Update'],
    matchTerms: ['alert', 'tariff', 'customs', 'canada'],
    isNew: true,
  }),
  entry({
    id: 'whitepaper-doing-business-canada',
    kbId: 'PAPER',
    title: 'Checklist: Doing Business in Canada',
    subtitle: 'White paper',
    description:
      'Corporate setup, contracting, employment, and tariff diligence for inbound market entry—built for GCs.',
    href: '/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
    lob: 'insight',
    perils: ['corporate'],
    topics: ['national'],
    searchBuckets: ['corporate', 'expansion', 'trade', 'tariffs'],
    dateLabel: 'White paper',
    breadcrumb: ['Insights', 'Thought Leadership', 'White Paper', 'Doing Business in Canada'],
    matchTerms: ['checklist', 'white paper', 'doing business', 'canada', 'market entry'],
    isNew: true,
  }),
  entry({
    id: 'presentation-genai-diligence',
    kbId: 'DECK',
    title: 'GenAI Diligence for Canadian Issuers',
    subtitle: 'Presentation',
    description:
      'Workshop outline: disclosure, governance, and RACI for capital-markets and technology counsel on GenAI.',
    href: '/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
    lob: 'insight',
    perils: ['capitalMarkets', 'technology'],
    topics: ['vancouver', 'national'],
    searchBuckets: ['genai', 'tech', 'corporate', 'event'],
    breadcrumb: ['Insights', 'Thought Leadership', 'Presentation', 'GenAI Diligence'],
    matchTerms: ['presentation', 'genai', 'issuer', 'governance', 'workshop'],
  }),
  entry({
    id: 'article-who-to-talk-to-canada',
    kbId: 'GUIDE',
    title: 'Who Should We Talk To? Tariffs & Doing Business in Canada',
    subtitle: 'Client guide',
    description:
      'Recommended lawyer pairing (Abdelsayed + Ault) plus webinars, podcast, alert, and checklist for inbound teams.',
    href: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
    lob: 'insight',
    perils: ['corporate', 'disputes'],
    topics: ['montreal', 'ottawa'],
    searchBuckets: ['tariffs', 'trade', 'expansion', 'webinar', 'podcast'],
    breadcrumb: ['Insights', 'Thought Leadership', 'Article', 'Who to Talk To'],
    matchTerms: [
      'who should we talk',
      'who to talk',
      'talk to',
      'entering canada',
      'tariff questions',
      'guide',
    ],
    isNew: true,
  }),
  entry({
    id: 'insight-construction-act',
    kbId: 'GUIDE',
    title: 'Construction Act Holdbacks',
    subtitle: 'Client guide',
    description:
      'Ontario Construction Act holdback, lien, and prompt-payment issues for owners, contractors, and lenders.',
    href: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
    lob: 'insight',
    perils: ['realEstate', 'infrastructure'],
    topics: ['toronto'],
    searchBuckets: ['construction'],
    breadcrumb: ['Insights', 'Thought Leadership', 'Construction Act'],
    matchTerms: ['construction act', 'holdback', 'lien', 'prompt payment'],
    isNew: true,
  }),

  // —— Careers & openings (leftover slugs; Canadian titles) ——
  entry({
    id: 'career-hub',
    kbId: 'CAREERS',
    title: 'Careers at BLG',
    description:
      'Explore open roles for associates, summer associates, laterals, and business professionals across Calgary, Montréal, Ottawa, Toronto, and Vancouver.',
    href: '/Lawyers/Careers',
    lob: 'career',
    perils: ['corporate', 'disputes'],
    topics: ['national'],
    searchBuckets: ['careers', 'corporate'],
    breadcrumb: ['People', 'Careers'],
    matchTerms: ['careers', 'jobs', 'openings', 'hiring', 'work at blg'],
    isNew: true,
  }),
  entry({
    id: 'career-associate-disputes-ottawa',
    kbId: 'ROLE',
    title: 'Associate — Disputes (Ottawa)',
    description:
      'Open associate role on commercial litigation, public law, and related regulatory matters from Ottawa.',
    href: '/Lawyers/Careers/Associate-International-Trade-Washington-DC',
    lob: 'career',
    perils: ['disputes'],
    topics: ['ottawa'],
    searchBuckets: ['careers', 'litigation', 'tariffs'],
    breadcrumb: ['People', 'Careers', 'Open Role'],
    matchTerms: [
      'associate',
      'disputes career',
      'ottawa associate',
      'litigation job',
      'openings',
    ],
    subtitle: 'Ottawa · Open role',
    dateLabel: 'Open',
    isNew: true,
  }),
  entry({
    id: 'career-associate-corporate-toronto',
    kbId: 'ROLE',
    title: 'Associate — Corporate Commercial (Toronto)',
    description:
      'Corporate commercial associate opening in Toronto for public and private M&A, capital markets, and governance.',
    href: '/Lawyers/Careers/Associate-Corporate-New-York',
    lob: 'career',
    perils: ['corporate'],
    topics: ['toronto'],
    searchBuckets: ['careers', 'corporate'],
    breadcrumb: ['People', 'Careers', 'Open Role'],
    matchTerms: ['corporate associate', 'toronto job', 'm&a associate', 'career'],
    subtitle: 'Toronto · Open role',
    dateLabel: 'Open',
    isNew: true,
  }),
  entry({
    id: 'career-summer-associate',
    kbId: 'PROGRAM',
    title: 'Summer Associate Program',
    description:
      'Law-student summer program with live matters, mentoring, and a path to articling and associate offers across Canadian offices.',
    href: '/Lawyers/Careers/Summer-Associate-Program',
    lob: 'career',
    perils: ['corporate', 'disputes'],
    topics: ['national'],
    searchBuckets: ['careers'],
    breadcrumb: ['People', 'Careers', 'Students'],
    matchTerms: ['summer associate', 'law student', 'articling', 'recruiting', 'internship'],
    subtitle: 'Law students',
    isNew: true,
  }),
  entry({
    id: 'career-lateral-ip',
    kbId: 'ROLE',
    title: 'Lateral Partner — Intellectual Property',
    description:
      'Lateral partner conversations for IP litigators and counselors joining BLG’s national Intellectual Property platform.',
    href: '/Lawyers/Careers/Lateral-Partner-Intellectual-Property',
    lob: 'career',
    perils: ['technology'],
    topics: ['national'],
    searchBuckets: ['careers', 'ip'],
    breadcrumb: ['People', 'Careers', 'Lateral'],
    matchTerms: ['lateral', 'partner opening', 'ip career', 'patent partner'],
    subtitle: 'Lateral · IP',
    dateLabel: 'Open',
    isNew: true,
  }),
  entry({
    id: 'career-legal-ops',
    kbId: 'ROLE',
    title: 'Legal Operations Specialist',
    description:
      'Business professional role supporting matter workflow, technology adoption, and practice enablement at BLG.',
    href: '/Lawyers/Careers/Legal-Operations-Specialist',
    lob: 'career',
    perils: ['technology'],
    topics: ['national'],
    searchBuckets: ['careers', 'tech'],
    breadcrumb: ['People', 'Careers', 'Business Professionals'],
    matchTerms: ['business professional', 'legal operations', 'non-lawyer career', 'staff career'],
    subtitle: 'Business professionals',
    dateLabel: 'Open',
    isNew: true,
  }),
  entry({
    id: 'career-how-to-apply',
    kbId: 'GUIDE',
    title: 'How to Apply',
    description:
      'Short guide to applying for associate, summer, lateral, and business professional roles at BLG.',
    href: '/Lawyers/Careers/How-to-Apply',
    lob: 'career',
    perils: ['corporate'],
    topics: ['national'],
    searchBuckets: ['careers'],
    breadcrumb: ['People', 'Careers', 'Guide'],
    matchTerms: ['how to apply', 'application', 'submit resume', 'recruiting'],
    isNew: true,
  }),

  // —— Hub pages ——
  entry({
    id: 'page-lawyers',
    kbId: 'PAGE',
    title: 'People',
    description: 'Explore BLG lawyers, offices, careers, and about us.',
    href: '/Lawyers',
    lob: 'page',
    perils: ['corporate', 'disputes'],
    topics: ['national'],
    searchBuckets: ['corporate', 'litigation', 'careers'],
    breadcrumb: ['People'],
    matchTerms: ['attorney directory', 'find a lawyer', 'people'],
  }),
  entry({
    id: 'page-bios',
    kbId: 'PAGE',
    title: 'Lawyer Bios',
    description: 'Search and browse lawyer biographies across practices and Canadian offices.',
    href: '/Lawyers/Bios',
    lob: 'page',
    perils: ['corporate', 'disputes'],
    topics: ['national'],
    searchBuckets: ['corporate', 'litigation'],
    breadcrumb: ['People', 'Bios'],
    matchTerms: ['bios', 'biographies', 'people', 'lawyers'],
  }),
  entry({
    id: 'page-offices',
    kbId: 'PAGE',
    title: 'Offices',
    description: 'Canadian office directory for Borden Ladner Gervais — Calgary, Montréal, Ottawa, Toronto, Vancouver.',
    href: '/Lawyers/Offices',
    lob: 'page',
    perils: ['corporate'],
    topics: ['national'],
    searchBuckets: ['corporate'],
    breadcrumb: ['People', 'Offices'],
    matchTerms: ['locations', 'office directory'],
  }),
  entry({
    id: 'page-contact',
    kbId: 'PAGE',
    title: 'Contact',
    description: 'Contact BLG for legal inquiries and business development.',
    href: '/Contact',
    lob: 'page',
    perils: ['corporate'],
    topics: ['national'],
    searchBuckets: ['corporate'],
    breadcrumb: ['Contact'],
    matchTerms: ['contact us', 'get in touch'],
  }),
  entry({
    id: 'page-capabilities',
    kbId: 'PAGE',
    title: 'Services',
    description: 'Overview of BLG’s practices, industries, and national solutions.',
    href: '/Capabilities',
    lob: 'page',
    perils: ['corporate', 'disputes', 'technology'],
    topics: ['national'],
    searchBuckets: ['corporate', 'litigation', 'tech'],
    breadcrumb: ['Services'],
    matchTerms: ['practices', 'services overview'],
  }),
];

type InsightRule = {
  id: string;
  matchAny: string[][];
  insight: Omit<AiSearchInsight, 'question'>;
};

const AI_INSIGHT_RULES: InsightRule[] = [
  {
    id: 'careers',
    matchAny: [
      ['career', 'corporate'],
      ['looking', 'career'],
      ['career', 'opening'],
      ['job', 'opening'],
      ['summer', 'associate'],
      ['how', 'apply'],
      ['lateral', 'partner'],
      ['business', 'professional'],
      ['careers', 'blg'],
      ['find', 'career'],
      ['looking', 'job'],
      ['open', 'role'],
    ],
    insight: {
      id: 'ai-careers-find-opening',
      headline: 'Find a career at BLG',
      answer:
        'Start at Careers, open the role that matches your practice and city, then follow How to Apply. For corporate commercial in Toronto, the Associate — Corporate Commercial posting is the clearest next step. For disputes in Ottawa, open the Disputes associate role. Pulse and search surface the same path from a natural-language ask.',
      bullets: [
        'Open role: Associate — Corporate Commercial (Toronto).',
        'Also browse: Disputes associate (Ottawa), Summer Associate Program, Lateral IP, and Legal Operations.',
        'Use How to Apply for resume / cover-letter steps.',
        'Optional practice contact: Marc Abdelsayed (Corporate Commercial, Montréal) or Duncan Ault (Disputes, Ottawa).',
      ],
      citations: [
        {
          title: 'Associate — Corporate Commercial (Toronto)',
          href: '/Lawyers/Careers/Associate-Corporate-New-York',
          kbId: 'ROLE',
          excerpt: 'Open associate role in M&A, capital markets, and governance.',
        },
        {
          title: 'Careers at BLG',
          href: '/Lawyers/Careers',
          kbId: 'CAREERS',
          excerpt: 'Hub for lawyer and business professional openings.',
        },
        {
          title: 'How to Apply',
          href: '/Lawyers/Careers/How-to-Apply',
          kbId: 'GUIDE',
          excerpt: 'Application steps for students, associates, laterals, and staff.',
        },
        {
          title: 'Summer Associate Program',
          href: '/Lawyers/Careers/Summer-Associate-Program',
          kbId: 'PROGRAM',
          excerpt: 'Law-student summer path into articling and associate offers.',
        },
        {
          title: 'Duncan Ault',
          href: '/Lawyers/Bios/Shinya-Akiyama',
          kbId: 'BIO',
          excerpt: 'Disputes practice contact (Ottawa).',
        },
      ],
      learnMoreHref: '/Lawyers/Careers',
      learnMoreLabel: 'Browse all careers',
      stateCallout: 'Demo journey: natural-language career ask → openings + how to apply.',
    },
  },
  {
    id: 'genai',
    matchAny: [
      ['genai'],
      ['gen', 'ai'],
      ['generative', 'ai'],
      ['ai', 'governance'],
      ['ai', 'issuer'],
    ],
    insight: {
      id: 'ai-genai-issuer',
      headline: 'GenAI governance for Canadian issuers',
      answer:
        'For GenAI disclosure and governance on a Canadian capital-markets file, start with capital-markets counsel in Vancouver, then add a second capital-markets seat in Calgary when the issuer is energy- or technology-facing.',
      bullets: [
        'Lead with Julie Bogle (Capital Markets, Vancouver).',
        'Add Makena Anderson or Shane Barnes for offering and disclosure support.',
        'Brief the board with the GenAI diligence presentation.',
      ],
      citations: [
        {
          title: 'Julie Bogle',
          href: '/Lawyers/Bios/Stephen-S-Asay',
          kbId: 'BIO',
          excerpt: 'Capital markets partner for GenAI governance and issuer disclosure (Vancouver).',
        },
        {
          title: 'Makena Anderson',
          href: '/Lawyers/Bios/Osama-Abu-Dehays',
          kbId: 'BIO',
          excerpt: 'Capital markets associate — public offerings and GenAI disclosure.',
        },
        {
          title: 'GenAI Diligence for Canadian Issuers',
          href: '/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
          kbId: 'DECK',
          excerpt: 'Workshop outline for disclosure, governance, and counsel RACI.',
        },
      ],
      learnMoreHref: '/Lawyers/Bios/Stephen-S-Asay',
      learnMoreLabel: 'Open capital markets bio',
    },
  },
  {
    id: 'distress',
    matchAny: [['distress'], ['insolvency'], ['restructur'], ['bankrupt'], ['ccaa']],
    insight: {
      id: 'ai-distress',
      headline: 'Distressed portfolio company counsel',
      answer:
        'When a portfolio company is under financial pressure, pair Vancouver insolvency counsel with Toronto financial-services counsel so creditors, sponsors, and lenders stay coordinated.',
      bullets: [
        'Kendall Andersen for insolvency, CCAA, and banking restructurings (Vancouver).',
        'Suhuyini Abudulai for institutional / financial-services alignment (Toronto).',
        'Situation-led asks beat searching only “bankruptcy” or “banking.”',
      ],
      citations: [
        {
          title: 'Kendall Andersen',
          href: '/Lawyers/Bios/Natalie-Alexander',
          kbId: 'BIO',
          excerpt: 'Banking / insolvency partner in Vancouver.',
        },
        {
          title: 'Suhuyini Abudulai',
          href: '/Lawyers/Bios/Jennifer-Altman',
          kbId: 'BIO',
          excerpt: 'Financial services partner in Toronto.',
        },
      ],
      learnMoreHref: '/Lawyers/Bios/Natalie-Alexander',
      learnMoreLabel: 'Open insolvency bio',
    },
  },
  {
    id: 'tariffs',
    matchAny: [
      ['entering', 'canada'],
      ['doing', 'business', 'canada'],
      ['tariff'],
      ['expanding', 'canada'],
      ['canada', 'talk'],
      ['trade', 'canada'],
      ['customs'],
    ],
    insight: {
      id: 'ai-canada-tariffs',
      headline: 'Entering Canada with tariff questions',
      answer:
        'Start with a two-lawyer team—Montréal corporate commercial for entity and contracting, and Ottawa disputes for tariff and trade-remedy risk—then use the resource-centre webinar, a CLE briefing, and a short podcast to brief the business side before the first intake call.',
      bullets: [
        'Talk to Marc Abdelsayed (Corporate Commercial, Montréal) for entity setup and supply-chain contracts.',
        'Talk to Duncan Ault (Disputes, Ottawa) for tariff and trade-remedy conflicts.',
        'Optional disputes coverage: Amanda Afeich (Montréal).',
        'Brief the team with the Tariffs and Trade webinar, Trade Talks podcast, Canada tariff alert, and doing-business checklist.',
      ],
      citations: [
        {
          title: 'Marc Abdelsayed',
          href: '/Lawyers/Bios/Ata-A-Akiner',
          kbId: 'BIO',
          excerpt: 'Corporate Commercial — inbound Canada and tariff-sensitive supply chains (Montréal).',
        },
        {
          title: 'Duncan Ault',
          href: '/Lawyers/Bios/Shinya-Akiyama',
          kbId: 'BIO',
          excerpt: 'Disputes counsel for tariff and public-law matters (Ottawa).',
        },
        {
          title: 'Tariffs and Trade Resource Centre',
          href: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
          kbId: 'WEBINAR',
          excerpt: 'Webinar featuring Abdelsayed and Ault on tariffs and supply chains.',
        },
        {
          title: 'Trade Talks: Canada’s Tariff Response',
          href: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
          kbId: 'PODCAST',
          excerpt: 'Podcast for inbound teams balancing growth and Canadian trade rules.',
        },
        {
          title: 'Who Should We Talk To? Tariffs & Doing Business in Canada',
          href: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
          kbId: 'GUIDE',
          excerpt: 'Client guide pairing people + learning assets for this exact question.',
        },
      ],
      learnMoreHref: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
      learnMoreLabel: 'Open the who-to-talk-to guide',
      stateCallout: 'Demo journey: people first, then webinar / podcast / alert / checklist.',
    },
  },
  {
    id: 'construction',
    matchAny: [
      ['construction', 'act'],
      ['holdback'],
      ['construction', 'claim'],
      ['lien'],
      ['prompt', 'payment'],
    ],
    insight: {
      id: 'ai-construction-act',
      headline: 'Construction Act holdbacks and project claims',
      answer:
        'Ontario Construction Act holdback and lien disputes are a natural fit for Toronto commercial real estate counsel, with infrastructure and Montréal real-estate support when the project spans provinces.',
      bullets: [
        'Frank Arnone for Construction Act holdbacks and Toronto real estate.',
        'Line Abecassis for Québec / national portfolio real estate.',
        'Sarah Bird when the file is infrastructure or Indigenous-facing.',
      ],
      citations: [
        {
          title: 'Frank Arnone',
          href: '/Lawyers/Bios/Ryan-R-Adelsperger',
          kbId: 'BIO',
          excerpt: 'Commercial real estate partner — Construction Act and development (Toronto).',
        },
        {
          title: 'Line Abecassis',
          href: '/Lawyers/Bios/Andrew-V-Alfano',
          kbId: 'BIO',
          excerpt: 'Commercial real estate partner in Montréal.',
        },
        {
          title: 'Sarah Bird',
          href: '/Lawyers/Bios/Stephen-C-Ashley',
          kbId: 'BIO',
          excerpt: 'Infrastructure, Indigenous law, and construction (Vancouver).',
        },
      ],
      learnMoreHref: '/Lawyers/Bios/Ryan-R-Adelsperger',
      learnMoreLabel: 'Open Construction Act bio',
    },
  },
];

export function selectAiSearchInsight(
  q: string,
  _persona: DemoUserTaxonomy | null
): AiSearchInsight | null {
  void _persona;
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
