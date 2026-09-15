/**
 * Pillsbury Law search catalog — lawyers, insights, webinars, events, podcasts,
 * capabilities, offices, and pages. Every href maps to the pillsburylaw content tree.
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
    lawyer: 'Lawyers',
    insight: 'Insights & alerts',
    event: 'Webinars & events',
    podcast: 'Podcasts',
    capability: 'Capabilities',
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
    insurance: 'Insurance Recovery',
    environmental: 'Environmental',
    funds: 'Funds / Private Equity',
    technology: 'Technology',
    regulatory: 'Regulatory',
  },
  topic: {
    newYork: 'New York',
    washingtonDc: 'Washington, DC',
    losAngeles: 'Los Angeles',
    miami: 'Miami',
    siliconValley: 'Silicon Valley',
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

/** Popular chips — lead with careers + Saudi expansion demo narratives */
export const popularSearches = [
  "I'm looking for a career in international trade. What openings do you have?",
  'Summer associate program',
  "We're expanding into Saudi Arabia and have export-control questions. Who should we talk to?",
  'Saudi Arabia export control webinar',
  'MENA corporate setup',
  'Japanese company acquisition',
  'financial distress restructuring',
  'New York corporate lawyers',
];

export const QUERY_BUCKET_SYNONYMS: Record<SearchBucket, readonly string[]> = {
  japan: ['japan', 'japanese', 'tokyo', 'japan practice'],
  ip: ['ip', 'intellectual property', 'patent', 'trademark', 'copyright', 'trade secret'],
  patent: ['patent', 'patent litigation', 'ip trial'],
  distress: ['distress', 'distressed', 'troubled', 'financial distress'],
  insolvency: ['insolvency', 'restructuring', 'bankruptcy', 'creditor'],
  sanctions: [
    'sanction',
    'sanctions',
    'export control',
    'export-control',
    'export controls',
    'ofac',
    'ear',
    'national security',
  ],
  trade: ['international trade', 'trade', 'customs'],
  insurance: ['insurance', 'coverage', 'carrier', 'policyholder', 'insurance recovery'],
  funds: ['funds', 'private equity', 'institutional investor', 'lp ', 'limited partner'],
  litigation: ['litigation', 'trial', 'dispute', 'arbitration'],
  miami: ['miami', 'florida'],
  corporate: ['corporate', 'm&a', 'securities', 'capital markets', 'venture', 'entity', 'jv'],
  mena: [
    'mena',
    'middle east',
    'saudi',
    'saudi arabia',
    'kingdom',
    'ksa',
    'qatar',
    'doha',
    'riyadh',
    'vision 2030',
    'gulf',
  ],
  construction: ['construction', 'builder', 'project claim'],
  tech: ['tech', 'technology', 'software', 'silicon valley'],
  expansion: ['expand', 'expanding', 'expansion', 'market entry', 'entering', 'enter'],
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
  // Prefer soft match: majority of significant words
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

/** Catalog of searchable site content with valid pillsburylaw routes */
export const searchCatalog: SearchResultItem[] = [
  // —— Lawyers (Bios) ——
  entry({
    id: 'bio-mark-abate',
    kbId: 'BIO',
    title: 'Mark Abate',
    subtitle: 'Partner · Intellectual Property',
    description:
      'Widely recognized IP trial lawyer known for strategic insight and technical mastery in patent litigation. Based in New York.',
    href: '/Lawyers/Bios/Mark-Abate',
    lob: 'lawyer',
    perils: ['intellectualProperty', 'litigation'],
    topics: ['newYork'],
    searchBuckets: ['ip', 'patent', 'litigation'],
    breadcrumb: ['Lawyers', 'Bios', 'Mark Abate'],
    matchTerms: ['mark', 'abate', 'patent', 'ip', 'new york'],
    isNew: true,
  }),
  entry({
    id: 'bio-ranjini-acharya',
    kbId: 'BIO',
    title: 'Ranjini Acharya',
    subtitle: 'Partner · Intellectual Property',
    description:
      'Multidisciplinary IP partner focused on patents, trade secrets, trademarks and copyright. Silicon Valley.',
    href: '/Lawyers/Bios/Ranjini-Acharya',
    lob: 'lawyer',
    perils: ['intellectualProperty', 'technology'],
    topics: ['siliconValley'],
    searchBuckets: ['ip', 'patent', 'tech'],
    breadcrumb: ['Lawyers', 'Bios', 'Ranjini Acharya'],
    matchTerms: ['ranjini', 'acharya', 'silicon valley', 'trade secret'],
  }),
  entry({
    id: 'bio-shinya-akiyama',
    kbId: 'BIO',
    title: 'Shinya Akiyama',
    subtitle: 'Partner · Corporate · Japan Practice',
    description:
      'Corporate partner and Japan Practice co-leader advising Japanese companies on U.S. acquisitions and operations. New York.',
    href: '/Lawyers/Bios/Shinya-Akiyama',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['newYork', 'global'],
    searchBuckets: ['japan', 'corporate', 'tech'],
    breadcrumb: ['Lawyers', 'Bios', 'Shinya Akiyama'],
    matchTerms: ['shinya', 'akiyama', 'japanese', 'japan', 'acquisition', 'm&a'],
    isNew: true,
  }),
  entry({
    id: 'bio-andrew-alfano',
    kbId: 'BIO',
    title: 'Andrew V. Alfano',
    subtitle: 'Counsel · Insolvency & Restructuring',
    description:
      'Advises distressed companies, investors, and creditors through complex restructurings. New York.',
    href: '/Lawyers/Bios/Andrew-V-Alfano',
    lob: 'lawyer',
    perils: ['insolvency', 'corporate'],
    topics: ['newYork'],
    searchBuckets: ['distress', 'insolvency', 'funds'],
    breadcrumb: ['Lawyers', 'Bios', 'Andrew Alfano'],
    matchTerms: ['alfano', 'andrew', 'bankruptcy', 'creditor', 'restructuring'],
  }),
  entry({
    id: 'bio-semma-arzapalo',
    kbId: 'BIO',
    title: 'Semma G. Arzapalo',
    subtitle: 'Partner · Corporate · Funds',
    description:
      'Global leader of Pillsbury’s Funds practice representing institutional investors in private equity. Los Angeles.',
    href: '/Lawyers/Bios/Semma-G-Arzapalo',
    lob: 'lawyer',
    perils: ['funds', 'corporate'],
    topics: ['losAngeles'],
    searchBuckets: ['funds', 'corporate'],
    breadcrumb: ['Lawyers', 'Bios', 'Semma Arzapalo'],
    matchTerms: ['semma', 'arzapalo', 'private equity', 'institutional', 'lp'],
  }),
  entry({
    id: 'bio-ata-akiner',
    kbId: 'BIO',
    title: 'Ata A. Akiner',
    subtitle: 'Senior Associate · International Trade',
    description:
      'Helps clients navigate international trade, export controls, and national-security regulatory matters. Washington, DC.',
    href: '/Lawyers/Bios/Ata-A-Akiner',
    lob: 'lawyer',
    perils: ['internationalTrade', 'regulatory'],
    topics: ['washingtonDc'],
    searchBuckets: ['sanctions', 'trade', 'mena', 'expansion'],
    breadcrumb: ['Lawyers', 'Bios', 'Ata Akiner'],
    matchTerms: ['ata', 'akiner', 'export', 'sanctions', 'trade', 'export-control', 'talk to'],
  }),
  entry({
    id: 'bio-osama-abu-dehays',
    kbId: 'BIO',
    title: 'Osama Abu-Dehays',
    subtitle: 'Partner · Corporate',
    description:
      'Corporate partner known across MENA for commercial, technology, media and telecommunications law. Doha / London.',
    href: '/Lawyers/Bios/Osama-Abu-Dehays',
    lob: 'lawyer',
    perils: ['corporate', 'technology'],
    topics: ['doha', 'london', 'global'],
    searchBuckets: ['mena', 'corporate', 'tech', 'expansion'],
    breadcrumb: ['Lawyers', 'Bios', 'Osama Abu-Dehays'],
    matchTerms: ['osama', 'abu-dehays', 'qatar', 'doha', 'middle east'],
  }),
  entry({
    id: 'bio-khalid-alarfaj',
    kbId: 'BIO',
    title: 'Khalid A. AlArfaj',
    subtitle: 'Partner · Corporate',
    description:
      'Advises national and international clients on complex corporate matters across Saudi Arabia and the U.S. Riyadh.',
    href: '/Lawyers/Bios/Khalid-A-AlArfaj',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['riyadh', 'global'],
    searchBuckets: ['mena', 'corporate', 'expansion', 'trade'],
    breadcrumb: ['Lawyers', 'Bios', 'Khalid AlArfaj'],
    matchTerms: ['khalid', 'alarfaj', 'saudi', 'riyadh', 'expanding', 'who should we talk'],
  }),
  entry({
    id: 'bio-stephen-asay',
    kbId: 'BIO',
    title: 'Stephen S. Asay',
    subtitle: 'Partner · Insurance Recovery',
    description:
      'Advises on risk management and complex insurance coverage and construction claims. Washington, DC.',
    href: '/Lawyers/Bios/Stephen-S-Asay',
    lob: 'lawyer',
    perils: ['insurance', 'litigation'],
    topics: ['washingtonDc'],
    searchBuckets: ['insurance', 'construction', 'litigation'],
    breadcrumb: ['Lawyers', 'Bios', 'Stephen Asay'],
    matchTerms: ['asay', 'stephen', 'coverage', 'carrier', 'construction'],
  }),
  entry({
    id: 'bio-jennifer-altman',
    kbId: 'BIO',
    title: 'Jennifer Altman',
    subtitle: 'Partner · Litigation · Miami Managing Partner',
    description:
      'Chambers-recognized commercial litigator and managing partner of Pillsbury’s Miami office.',
    href: '/Lawyers/Bios/Jennifer-Altman',
    lob: 'lawyer',
    perils: ['litigation'],
    topics: ['miami'],
    searchBuckets: ['litigation', 'miami', 'insurance'],
    breadcrumb: ['Lawyers', 'Bios', 'Jennifer Altman'],
    matchTerms: ['jennifer', 'altman', 'miami', 'trial', 'arbitration'],
  }),
  entry({
    id: 'bio-rolando-acosta',
    kbId: 'BIO',
    title: 'Rolando T. Acosta',
    subtitle: 'Partner · Litigation',
    description:
      'Former New York judge with 25+ years of experience guiding clients through all phases of litigation.',
    href: '/Lawyers/Bios/Rolando-T-Acosta',
    lob: 'lawyer',
    perils: ['litigation'],
    topics: ['newYork'],
    searchBuckets: ['litigation'],
    breadcrumb: ['Lawyers', 'Bios', 'Rolando Acosta'],
    matchTerms: ['rolando', 'acosta', 'judge', 'litigation'],
  }),
  entry({
    id: 'bio-mediha-ali',
    kbId: 'BIO',
    title: 'Mediha M. Ali',
    subtitle: 'Counsel · Corporate',
    description:
      'Focuses on securities transactions, IPOs, M&A, and venture capital financings. Silicon Valley.',
    href: '/Lawyers/Bios/Mediha-M-Ali',
    lob: 'lawyer',
    perils: ['corporate', 'technology'],
    topics: ['siliconValley'],
    searchBuckets: ['corporate', 'tech'],
    breadcrumb: ['Lawyers', 'Bios', 'Mediha Ali'],
    matchTerms: ['mediha', 'ali', 'ipo', 'venture', 'securities'],
  }),
  entry({
    id: 'bio-james-alberg',
    kbId: 'BIO',
    title: 'James L. Alberg',
    subtitle: 'Senior Counsel · Global Sourcing',
    description:
      'Authority on software, technology and IT outsourcing transactions. Washington, DC.',
    href: '/Lawyers/Bios/James-L-Alberg',
    lob: 'lawyer',
    perils: ['technology', 'corporate'],
    topics: ['washingtonDc'],
    searchBuckets: ['tech', 'corporate'],
    breadcrumb: ['Lawyers', 'Bios', 'James Alberg'],
    matchTerms: ['alberg', 'james', 'outsourcing', 'sourcing'],
  }),
  entry({
    id: 'bio-stephen-ashley',
    kbId: 'BIO',
    title: 'Stephen C. Ashley',
    subtitle: 'Partner · Corporate',
    description:
      'Advises issuers and underwriters on domestic and cross-border capital markets transactions. New York.',
    href: '/Lawyers/Bios/Stephen-C-Ashley',
    lob: 'lawyer',
    perils: ['corporate'],
    topics: ['newYork'],
    searchBuckets: ['corporate'],
    breadcrumb: ['Lawyers', 'Bios', 'Stephen Ashley'],
    matchTerms: ['ashley', 'stephen', 'securities', 'capital markets'],
  }),

  // —— Insights ——
  entry({
    id: 'insight-policyholder-pulse',
    kbId: 'BLOG',
    title: 'Policyholder Pulse',
    subtitle: 'Insights · Blog',
    description:
      'Insurance coverage and policyholder perspectives from Pillsbury’s Insurance Recovery practice.',
    href: '/Insights/Blogs/Policyholder-Pulse',
    lob: 'insight',
    perils: ['insurance'],
    topics: ['global'],
    searchBuckets: ['insurance'],
    breadcrumb: ['Insights', 'Blogs', 'Policyholder Pulse'],
    matchTerms: ['policyholder', 'pulse', 'blog', 'insurance coverage'],
  }),
  entry({
    id: 'insight-global-trade',
    kbId: 'BLOG',
    title: 'Global Trade and Sanctions Law',
    subtitle: 'Insights · Blog',
    description:
      'Analysis of export controls, sanctions, and international trade developments.',
    href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law',
    lob: 'insight',
    perils: ['internationalTrade', 'regulatory'],
    topics: ['global', 'washingtonDc'],
    searchBuckets: ['sanctions', 'trade', 'mena'],
    breadcrumb: ['Insights', 'Blogs', 'Global Trade and Sanctions Law'],
    matchTerms: ['sanctions', 'export', 'trade blog'],
  }),
  entry({
    id: 'insight-investment-fund',
    kbId: 'BLOG',
    title: 'Investment Fund Law',
    subtitle: 'Insights · Blog',
    description: 'Guidance for fund sponsors, LPs, and private capital transactions.',
    href: '/Insights/Blogs/Investment-Fund-Law',
    lob: 'insight',
    perils: ['funds', 'corporate'],
    topics: ['global'],
    searchBuckets: ['funds', 'corporate'],
    breadcrumb: ['Insights', 'Blogs', 'Investment Fund Law'],
    matchTerms: ['investment fund', 'private equity blog'],
  }),
  entry({
    id: 'insight-sourcing-speak',
    kbId: 'BLOG',
    title: 'Sourcing Speak',
    subtitle: 'Insights · Blog',
    description: 'Technology sourcing, outsourcing, and digital transformation commentary.',
    href: '/Insights/Blogs/Sourcing-Speak',
    lob: 'insight',
    perils: ['technology'],
    topics: ['global'],
    searchBuckets: ['tech'],
    breadcrumb: ['Insights', 'Blogs', 'Sourcing Speak'],
    matchTerms: ['sourcing', 'outsourcing', 'it'],
  }),
  entry({
    id: 'insight-blogs-hub',
    kbId: 'HUB',
    title: 'Insights · Blogs',
    description: 'Browse all Pillsbury blog hubs and thought leadership channels.',
    href: '/Insights/Blogs',
    lob: 'insight',
    perils: ['corporate', 'litigation', 'technology'],
    topics: ['global'],
    searchBuckets: ['corporate', 'litigation', 'tech'],
    breadcrumb: ['Insights', 'Blogs'],
    matchTerms: ['blogs', 'insights', 'thought leadership'],
  }),

  // —— Capabilities ——
  entry({
    id: 'cap-ip',
    kbId: 'SERVICE',
    title: 'Intellectual Property',
    subtitle: 'Capabilities · Services',
    description: 'Patent, trademark, copyright, and trade secret counseling and litigation.',
    href: '/Capabilities/Services/Intellectual-Property',
    lob: 'capability',
    perils: ['intellectualProperty', 'litigation'],
    topics: ['global'],
    searchBuckets: ['ip', 'patent'],
    breadcrumb: ['Capabilities', 'Services', 'Intellectual Property'],
    matchTerms: ['ip practice', 'patent practice'],
  }),
  entry({
    id: 'cap-litigation',
    kbId: 'SERVICE',
    title: 'Litigation',
    subtitle: 'Capabilities · Services',
    description: 'Complex commercial litigation, arbitration, and dispute resolution.',
    href: '/Capabilities/Services/Litigation',
    lob: 'capability',
    perils: ['litigation'],
    topics: ['global'],
    searchBuckets: ['litigation'],
    breadcrumb: ['Capabilities', 'Services', 'Litigation'],
    matchTerms: ['disputes', 'trial practice'],
  }),
  entry({
    id: 'cap-corporate',
    kbId: 'SERVICE',
    title: 'Corporate and Transactional',
    subtitle: 'Capabilities · Services',
    description: 'M&A, securities, venture, and corporate governance counsel.',
    href: '/Capabilities/Services/Corporate-and-Transactional',
    lob: 'capability',
    perils: ['corporate'],
    topics: ['global'],
    searchBuckets: ['corporate'],
    breadcrumb: ['Capabilities', 'Services', 'Corporate and Transactional'],
    matchTerms: ['m&a', 'transactions', 'corporate practice'],
  }),
  entry({
    id: 'cap-technology',
    kbId: 'SERVICE',
    title: 'Technology',
    subtitle: 'Capabilities · Services',
    description: 'Counsel for technology companies, platforms, and digital transformation.',
    href: '/Capabilities/Services/Technology',
    lob: 'capability',
    perils: ['technology', 'corporate'],
    topics: ['global', 'siliconValley'],
    searchBuckets: ['tech', 'corporate'],
    breadcrumb: ['Capabilities', 'Services', 'Technology'],
    matchTerms: ['tech sector', 'technology practice'],
  }),
  entry({
    id: 'cap-regulatory',
    kbId: 'SERVICE',
    title: 'Regulatory',
    subtitle: 'Capabilities · Services',
    description: 'Regulatory counseling across industries and jurisdictions.',
    href: '/Capabilities/Services/Regulatory',
    lob: 'capability',
    perils: ['regulatory', 'internationalTrade'],
    topics: ['global', 'washingtonDc'],
    searchBuckets: ['sanctions', 'trade'],
    breadcrumb: ['Capabilities', 'Services', 'Regulatory'],
    matchTerms: ['regulatory practice', 'compliance'],
  }),

  // —— Offices ——
  entry({
    id: 'office-ny',
    kbId: 'OFFICE',
    title: 'New York',
    subtitle: 'Office',
    description: 'Pillsbury’s New York office — corporate, litigation, IP, and restructuring.',
    href: '/Lawyers/Offices/New-York',
    lob: 'office',
    perils: ['corporate', 'litigation', 'intellectualProperty', 'insolvency'],
    topics: ['newYork'],
    searchBuckets: ['corporate', 'litigation', 'ip', 'insolvency'],
    breadcrumb: ['Lawyers', 'Offices', 'New York'],
    matchTerms: ['nyc', 'new york office', 'manhattan'],
  }),
  entry({
    id: 'office-dc',
    kbId: 'OFFICE',
    title: 'Washington, DC',
    subtitle: 'Office',
    description: 'Washington, DC office — regulatory, trade, insurance recovery, and technology.',
    href: '/Lawyers/Offices/Washington-DC',
    lob: 'office',
    perils: ['regulatory', 'internationalTrade', 'insurance', 'technology'],
    topics: ['washingtonDc'],
    searchBuckets: ['sanctions', 'trade', 'insurance', 'tech'],
    breadcrumb: ['Lawyers', 'Offices', 'Washington DC'],
    matchTerms: ['dc', 'washington', 'district of columbia'],
  }),
  entry({
    id: 'office-la',
    kbId: 'OFFICE',
    title: 'Los Angeles',
    subtitle: 'Office',
    description: 'Los Angeles office — funds, corporate, and environmental matters.',
    href: '/Lawyers/Offices/Los-Angeles',
    lob: 'office',
    perils: ['funds', 'corporate', 'environmental'],
    topics: ['losAngeles'],
    searchBuckets: ['funds', 'corporate'],
    breadcrumb: ['Lawyers', 'Offices', 'Los Angeles'],
    matchTerms: ['la', 'los angeles office'],
  }),
  entry({
    id: 'office-miami',
    kbId: 'OFFICE',
    title: 'Miami',
    subtitle: 'Office',
    description: 'Miami office — commercial litigation and Latin America–facing disputes.',
    href: '/Lawyers/Offices/Miami',
    lob: 'office',
    perils: ['litigation'],
    topics: ['miami'],
    searchBuckets: ['miami', 'litigation'],
    breadcrumb: ['Lawyers', 'Offices', 'Miami'],
    matchTerms: ['miami office', 'florida office'],
  }),
  entry({
    id: 'office-sv',
    kbId: 'OFFICE',
    title: 'Silicon Valley',
    subtitle: 'Office',
    description: 'Silicon Valley office — technology, IP, venture, and corporate transactions.',
    href: '/Lawyers/Offices/Silicon-Valley',
    lob: 'office',
    perils: ['technology', 'intellectualProperty', 'corporate'],
    topics: ['siliconValley'],
    searchBuckets: ['tech', 'ip', 'corporate'],
    breadcrumb: ['Lawyers', 'Offices', 'Silicon Valley'],
    matchTerms: ['palo alto', 'silicon valley office'],
  }),
  entry({
    id: 'office-riyadh',
    kbId: 'OFFICE',
    title: 'Riyadh',
    subtitle: 'Office',
    description: 'Riyadh office — corporate and commercial counsel for Saudi and cross-border matters.',
    href: '/Lawyers/Offices/Riyadh',
    lob: 'office',
    perils: ['corporate'],
    topics: ['riyadh'],
    searchBuckets: ['mena', 'corporate'],
    breadcrumb: ['Lawyers', 'Offices', 'Riyadh'],
    matchTerms: ['saudi office', 'riyadh office'],
  }),

  // —— Webinars & events (Saudi expansion / export-control journey) ——
  entry({
    id: 'blog-saudi-expansion-export-controls',
    kbId: 'BLOG',
    title: 'Saudi Expansion and U.S. Export Controls',
    subtitle: 'Global Trade & Sanctions Law · Ata A. Akiner',
    description:
      'EAR/OFAC diligence for Vision 2030 market entry—pairing DC trade counsel with Riyadh corporate counsel.',
    href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law/Saudi-Expansion-and-US-Export-Controls',
    lob: 'insight',
    perils: ['internationalTrade', 'regulatory'],
    topics: ['washingtonDc', 'riyadh', 'global'],
    searchBuckets: ['mena', 'sanctions', 'trade', 'expansion'],
    dateLabel: 'Blog post',
    breadcrumb: ['Insights', 'Blogs', 'Global Trade', 'Saudi Expansion'],
    matchTerms: [
      'saudi expansion',
      'export',
      'akiner',
      'vision 2030',
      'blog',
      'ear',
      'ofac',
    ],
    isNew: true,
  }),
  entry({
    id: 'webinar-saudi-export-controls-101',
    kbId: 'WEBINAR',
    title: 'Expanding into Saudi Arabia: Export Controls 101',
    subtitle: 'Webinar · International Trade & Corporate',
    description:
      'EAR, OFAC, and practical diligence for U.S. companies entering the Kingdom—with Ata Akiner (DC) and Khalid AlArfaj (Riyadh).',
    href: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
    lob: 'event',
    perils: ['internationalTrade', 'corporate', 'regulatory'],
    topics: ['riyadh', 'washingtonDc', 'global'],
    searchBuckets: ['mena', 'sanctions', 'trade', 'expansion', 'webinar', 'event'],
    dateLabel: 'Upcoming webinar',
    breadcrumb: ['Insights', 'Events', 'Webinar', 'Export Controls 101'],
    matchTerms: [
      'webinar',
      'saudi',
      'export',
      'export control',
      'expanding',
      'arabia',
      'ear',
      'ofac',
      'who should we talk',
    ],
    isNew: true,
  }),
  entry({
    id: 'webinar-mena-corporate-export',
    kbId: 'WEBINAR',
    title: 'MENA Corporate Setup & U.S. Export Compliance',
    subtitle: 'Webinar · Corporate & International Trade',
    description:
      'Standing up a Saudi or Qatar entity without missing U.S. trade controls—Riyadh, Doha, and Washington together.',
    href: '/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
    lob: 'event',
    perils: ['corporate', 'internationalTrade', 'regulatory'],
    topics: ['riyadh', 'doha', 'washingtonDc', 'global'],
    searchBuckets: ['mena', 'corporate', 'sanctions', 'trade', 'expansion', 'webinar', 'event'],
    dateLabel: 'On demand',
    breadcrumb: ['Insights', 'Events', 'Webinar', 'MENA Corporate Setup'],
    matchTerms: ['mena', 'corporate setup', 'entity', 'qatar', 'saudi', 'webinar', 'export'],
    isNew: true,
  }),
  entry({
    id: 'cle-riyadh-dc-trade',
    kbId: 'CLE',
    title: 'International Trade Briefing: Riyadh & DC',
    subtitle: 'CLE Event · Live',
    description:
      'Half-day CLE for in-house teams managing Saudi expansion and export-control risk—with AlArfaj and Akiner.',
    href: '/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
    lob: 'event',
    perils: ['internationalTrade', 'corporate', 'regulatory'],
    topics: ['riyadh', 'washingtonDc'],
    searchBuckets: ['mena', 'sanctions', 'trade', 'expansion', 'event'],
    dateLabel: 'CLE · Live',
    breadcrumb: ['Insights', 'Events', 'CLE', 'Riyadh & DC Briefing'],
    matchTerms: ['cle', 'briefing', 'riyadh', 'export', 'saudi', 'event', 'talk to'],
    isNew: true,
  }),
  entry({
    id: 'hub-events',
    kbId: 'HUB',
    title: 'Insights · Events',
    subtitle: 'Webinars, CLE & speaking',
    description: 'Browse Pillsbury webinars, CLE programs, and speaking engagements.',
    href: '/Insights/Events',
    lob: 'event',
    perils: ['corporate', 'internationalTrade'],
    topics: ['global'],
    searchBuckets: ['event', 'webinar', 'expansion'],
    breadcrumb: ['Insights', 'Events'],
    matchTerms: ['events hub', 'webinars', 'cle calendar'],
  }),
  entry({
    id: 'hub-webinars',
    kbId: 'HUB',
    title: 'Webinars',
    subtitle: 'Events · Webinar',
    description:
      'Client webinars including Saudi Arabia expansion and U.S. export-control briefings.',
    href: '/Insights/Events/Webinar',
    lob: 'event',
    perils: ['internationalTrade', 'corporate'],
    topics: ['global'],
    searchBuckets: ['webinar', 'event', 'mena', 'sanctions'],
    breadcrumb: ['Insights', 'Events', 'Webinar'],
    matchTerms: ['webinar list', 'virtual events'],
  }),

  // —— Podcasts & thought leadership (Saudi / export journey) ——
  entry({
    id: 'podcast-trade-talks-vision-2030',
    kbId: 'PODCAST',
    title: 'Trade Talks: Saudi Vision 2030 & Export Controls',
    subtitle: 'Podcast episode',
    description:
      'When to involve DC trade counsel vs Riyadh corporate counsel—and how webinars/CLE complement intake.',
    href: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
    lob: 'podcast',
    perils: ['internationalTrade', 'corporate', 'regulatory'],
    topics: ['riyadh', 'washingtonDc', 'global'],
    searchBuckets: ['mena', 'sanctions', 'trade', 'expansion', 'podcast'],
    dateLabel: 'Listen now',
    breadcrumb: ['Insights', 'Thought Leadership', 'Podcast', 'Trade Talks'],
    matchTerms: ['podcast', 'vision 2030', 'trade talks', 'saudi', 'export', 'listen'],
    isNew: true,
  }),
  entry({
    id: 'hub-podcasts',
    kbId: 'HUB',
    title: 'Podcasts',
    subtitle: 'Thought Leadership · Podcast',
    description: 'Pillsbury podcasts on international trade, Vision 2030, and export-control readiness.',
    href: '/Insights/Thought-Leadership/Podcast',
    lob: 'podcast',
    perils: ['internationalTrade'],
    topics: ['global'],
    searchBuckets: ['podcast', 'trade', 'mena'],
    breadcrumb: ['Insights', 'Thought Leadership', 'Podcast'],
    matchTerms: ['podcast series', 'audio'],
  }),
  entry({
    id: 'alert-gulf-ear-ofac',
    kbId: 'ALERT',
    title: 'Gulf Expansion: EAR & OFAC Update',
    subtitle: 'Legal alert',
    description:
      'Recent EAR and OFAC developments for U.S. companies expanding into Saudi Arabia and the Gulf.',
    href: '/Insights/Thought-Leadership/Alert/Gulf-Expansion-EAR-OFAC-Update',
    lob: 'insight',
    perils: ['internationalTrade', 'regulatory'],
    topics: ['riyadh', 'washingtonDc', 'global'],
    searchBuckets: ['mena', 'sanctions', 'trade', 'expansion'],
    dateLabel: 'Alert',
    breadcrumb: ['Insights', 'Thought Leadership', 'Alert', 'Gulf Expansion'],
    matchTerms: ['alert', 'ofac', 'ear', 'gulf', 'saudi', 'export'],
    isNew: true,
  }),
  entry({
    id: 'whitepaper-ksa-checklist',
    kbId: 'PAPER',
    title: 'Checklist: U.S. Companies Entering KSA',
    subtitle: 'White paper',
    description:
      'Corporate setup, contracting, and U.S. export-control diligence for Saudi market entry—built for GCs and expansion leads.',
    href: '/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
    lob: 'insight',
    perils: ['corporate', 'internationalTrade', 'regulatory'],
    topics: ['riyadh', 'global'],
    searchBuckets: ['mena', 'corporate', 'sanctions', 'expansion', 'trade'],
    dateLabel: 'White paper',
    breadcrumb: ['Insights', 'Thought Leadership', 'White Paper', 'KSA Checklist'],
    matchTerms: ['checklist', 'white paper', 'ksa', 'entering', 'saudi', 'market entry'],
    isNew: true,
  }),
  entry({
    id: 'presentation-mena-diligence',
    kbId: 'DECK',
    title: 'Export-Control Diligence for MENA Deals',
    subtitle: 'Presentation',
    description:
      'Workshop outline: deal screening, technology classification, and RACI for DC trade vs MENA corporate counsel.',
    href: '/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
    lob: 'insight',
    perils: ['internationalTrade', 'corporate'],
    topics: ['global', 'riyadh', 'washingtonDc'],
    searchBuckets: ['mena', 'sanctions', 'trade', 'expansion', 'event'],
    breadcrumb: ['Insights', 'Thought Leadership', 'Presentation', 'MENA Diligence'],
    matchTerms: ['presentation', 'diligence', 'mena deals', 'workshop', 'raci'],
  }),
  entry({
    id: 'article-who-to-talk-to-saudi',
    kbId: 'GUIDE',
    title: 'Who Should We Talk To? Saudi Expansion & Export Controls',
    subtitle: 'Client guide',
    description:
      'Recommended lawyer pairing (Akiner + AlArfaj) plus webinars, podcast, alert, and checklist for expansion teams.',
    href: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
    lob: 'insight',
    perils: ['internationalTrade', 'corporate'],
    topics: ['riyadh', 'washingtonDc'],
    searchBuckets: ['mena', 'sanctions', 'trade', 'expansion', 'webinar', 'podcast'],
    breadcrumb: ['Insights', 'Thought Leadership', 'Article', 'Who to Talk To'],
    matchTerms: [
      'who should we talk',
      'who to talk',
      'talk to',
      'expanding into saudi',
      'export-control questions',
      'guide',
    ],
    isNew: true,
  }),

  // —— Careers & openings ——
  entry({
    id: 'career-hub',
    kbId: 'CAREERS',
    title: 'Careers at Pillsbury',
    description:
      'Explore open roles for associates, summer associates, laterals, and business professionals—or ask Pulse where you fit.',
    href: '/Lawyers/Careers',
    lob: 'career',
    perils: ['corporate', 'internationalTrade', 'intellectualProperty'],
    topics: ['global'],
    searchBuckets: ['careers', 'corporate', 'trade'],
    breadcrumb: ['Lawyers', 'Careers'],
    matchTerms: ['careers', 'jobs', 'openings', 'hiring', 'work at pillsbury'],
    isNew: true,
  }),
  entry({
    id: 'career-associate-trade-dc',
    kbId: 'ROLE',
    title: 'Associate — International Trade (Washington, DC)',
    description:
      'Open associate role advising on EAR, OFAC, customs, and national-security trade matters from Washington, DC.',
    href: '/Lawyers/Careers/Associate-International-Trade-Washington-DC',
    lob: 'career',
    perils: ['internationalTrade', 'regulatory'],
    topics: ['washingtonDc'],
    searchBuckets: ['careers', 'trade', 'sanctions'],
    breadcrumb: ['Lawyers', 'Careers', 'Open Role'],
    matchTerms: [
      'associate',
      'international trade career',
      'trade job',
      'export control career',
      'washington dc associate',
      'openings',
    ],
    subtitle: 'Washington, DC · Open role',
    dateLabel: 'Open',
    isNew: true,
  }),
  entry({
    id: 'career-associate-corporate-ny',
    kbId: 'ROLE',
    title: 'Associate — Corporate (New York)',
    description:
      'Corporate associate opening in New York for M&A, capital markets, and governance deal experience.',
    href: '/Lawyers/Careers/Associate-Corporate-New-York',
    lob: 'career',
    perils: ['corporate'],
    topics: ['newYork'],
    searchBuckets: ['careers', 'corporate'],
    breadcrumb: ['Lawyers', 'Careers', 'Open Role'],
    matchTerms: ['corporate associate', 'new york job', 'm&a associate', 'career'],
    subtitle: 'New York · Open role',
    dateLabel: 'Open',
    isNew: true,
  }),
  entry({
    id: 'career-summer-associate',
    kbId: 'PROGRAM',
    title: 'Summer Associate Program',
    description:
      'Law-student summer program with real matter experience, mentoring, and a path to full-time offers.',
    href: '/Lawyers/Careers/Summer-Associate-Program',
    lob: 'career',
    perils: ['corporate', 'litigation', 'internationalTrade', 'intellectualProperty'],
    topics: ['global'],
    searchBuckets: ['careers'],
    breadcrumb: ['Lawyers', 'Careers', 'Students'],
    matchTerms: ['summer associate', 'law student', '2L', '3L', 'recruiting', 'internship'],
    subtitle: 'Law students',
    isNew: true,
  }),
  entry({
    id: 'career-lateral-ip',
    kbId: 'ROLE',
    title: 'Lateral Partner — Intellectual Property',
    description:
      'Lateral partner opportunity for IP litigators and counselors joining Pillsbury’s Intellectual Property platform.',
    href: '/Lawyers/Careers/Lateral-Partner-Intellectual-Property',
    lob: 'career',
    perils: ['intellectualProperty'],
    topics: ['global'],
    searchBuckets: ['careers', 'ip', 'patent'],
    breadcrumb: ['Lawyers', 'Careers', 'Lateral'],
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
      'Business professional role supporting matter workflow, technology adoption, and practice enablement.',
    href: '/Lawyers/Careers/Legal-Operations-Specialist',
    lob: 'career',
    perils: ['technology'],
    topics: ['global'],
    searchBuckets: ['careers', 'tech'],
    breadcrumb: ['Lawyers', 'Careers', 'Business Professionals'],
    matchTerms: [
      'business professional',
      'legal operations',
      'non-lawyer career',
      'staff career',
    ],
    subtitle: 'Business professionals',
    dateLabel: 'Open',
    isNew: true,
  }),
  entry({
    id: 'career-how-to-apply',
    kbId: 'GUIDE',
    title: 'How to Apply',
    description:
      'Short guide to applying for associate, summer, lateral, and business professional roles—and how search or Pulse finds the right opening.',
    href: '/Lawyers/Careers/How-to-Apply',
    lob: 'career',
    perils: ['corporate'],
    topics: ['global'],
    searchBuckets: ['careers'],
    breadcrumb: ['Lawyers', 'Careers', 'Guide'],
    matchTerms: ['how to apply', 'application', 'submit resume', 'recruiting'],
    isNew: true,
  }),

  // —— Hub pages ——
  entry({
    id: 'page-lawyers',
    kbId: 'PAGE',
    title: 'Lawyers',
    description: 'Explore Pillsbury lawyers, offices, careers, and about us.',
    href: '/Lawyers',
    lob: 'page',
    perils: ['corporate', 'litigation'],
    topics: ['global'],
    searchBuckets: ['corporate', 'litigation', 'careers'],
    breadcrumb: ['Lawyers'],
    matchTerms: ['attorney directory', 'find a lawyer'],
  }),
  entry({
    id: 'page-bios',
    kbId: 'PAGE',
    title: 'Lawyer Bios',
    description: 'Search and browse attorney biographies across practices and offices.',
    href: '/Lawyers/Bios',
    lob: 'page',
    perils: ['corporate', 'litigation', 'intellectualProperty'],
    topics: ['global'],
    searchBuckets: ['corporate', 'litigation', 'ip'],
    breadcrumb: ['Lawyers', 'Bios'],
    matchTerms: ['bios', 'biographies', 'people', 'attorneys'],
  }),
  entry({
    id: 'page-offices',
    kbId: 'PAGE',
    title: 'Offices',
    description: 'Global office directory for Pillsbury Winthrop Shaw Pittman.',
    href: '/Lawyers/Offices',
    lob: 'page',
    perils: ['corporate'],
    topics: ['global'],
    searchBuckets: ['corporate'],
    breadcrumb: ['Lawyers', 'Offices'],
    matchTerms: ['locations', 'office directory'],
  }),
  entry({
    id: 'page-contact',
    kbId: 'PAGE',
    title: 'Contact',
    description: 'Contact Pillsbury for legal inquiries and business development.',
    href: '/Contact',
    lob: 'page',
    perils: ['corporate'],
    topics: ['global'],
    searchBuckets: ['corporate'],
    breadcrumb: ['Contact'],
    matchTerms: ['contact us', 'get in touch'],
  }),
  entry({
    id: 'page-capabilities',
    kbId: 'PAGE',
    title: 'Capabilities',
    description: 'Overview of Pillsbury’s approach, services, and sector expertise.',
    href: '/Capabilities',
    lob: 'page',
    perils: ['corporate', 'litigation', 'technology'],
    topics: ['global'],
    searchBuckets: ['corporate', 'litigation', 'tech'],
    breadcrumb: ['Capabilities'],
    matchTerms: ['practices', 'services overview'],
  }),
];

export type InsightRule = {
  id: string;
  matchAny: string[][];
  insight: Omit<AiSearchInsight, 'question'>;
};

export const AI_INSIGHT_RULES: InsightRule[] = [
  {
    id: 'careers',
    matchAny: [
      ['career', 'international', 'trade'],
      ['looking', 'career'],
      ['career', 'trade'],
      ['career', 'opening'],
      ['job', 'opening'],
      ['summer', 'associate'],
      ['how', 'apply'],
      ['lateral', 'partner'],
      ['business', 'professional'],
      ['careers', 'pillsbury'],
      ['find', 'career'],
      ['looking', 'job'],
      ['open', 'role'],
    ],
    insight: {
      id: 'ai-careers-find-opening',
      headline: 'Find a career at Pillsbury',
      answer:
        'Start at Careers, open the role that matches your practice and city, then follow How to Apply. For international trade in Washington, DC, the Associate — International Trade posting is the clearest next step—Pulse and search surface the same path from a natural-language ask.',
      bullets: [
        'Open role: Associate — International Trade (Washington, DC).',
        'Also browse: Corporate associate (New York), Summer Associate Program, Lateral IP, and Legal Operations.',
        'Use How to Apply for resume / cover-letter steps.',
        'Optional practice contact for trade: Ata A. Akiner (Washington, DC).',
      ],
      citations: [
        {
          title: 'Associate — International Trade (Washington, DC)',
          href: '/Lawyers/Careers/Associate-International-Trade-Washington-DC',
          kbId: 'ROLE',
          excerpt: 'Open associate role in EAR / OFAC / trade compliance.',
        },
        {
          title: 'Careers at Pillsbury',
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
          excerpt: 'Law-student summer path into full-time offers.',
        },
        {
          title: 'Ata A. Akiner',
          href: '/Lawyers/Bios/Ata-A-Akiner',
          kbId: 'BIO',
          excerpt: 'International Trade practice contact (Washington, DC).',
        },
      ],
      learnMoreHref: '/Lawyers/Careers',
      learnMoreLabel: 'Browse all careers',
      stateCallout: 'Demo journey: natural-language career ask → openings + how to apply.',
    },
  },
  {
    id: 'japan-deal',
    matchAny: [
      ['japan'],
      ['japanese'],
      ['japan', 'acqui'],
    ],
    insight: {
      id: 'ai-japan-deal',
      headline: 'Cross-border Japan–U.S. technology deals',
      answer:
        'For a Japanese company acquiring or expanding a U.S. tech business, start with Japan Practice corporate counsel, then add IP litigation support when patents or trade secrets are in play.',
      bullets: [
        'Lead with Shinya Akiyama (Corporate / Japan Practice, New York).',
        'Add Mark Abate or Ranjini Acharya for patent and IP risk.',
        'Keyword search alone rarely connects “Japan + M&A + IP” in one step.',
      ],
      citations: [
        {
          title: 'Shinya Akiyama',
          href: '/Lawyers/Bios/Shinya-Akiyama',
          kbId: 'BIO',
          excerpt: 'Japan Practice co-leader for U.S. acquisitions and operations.',
        },
        {
          title: 'Mark Abate',
          href: '/Lawyers/Bios/Mark-Abate',
          kbId: 'BIO',
          excerpt: 'IP trial counsel for patent-heavy tech deals.',
        },
      ],
      learnMoreHref: '/Lawyers/Bios/Shinya-Akiyama',
      learnMoreLabel: 'Open Japan Practice bio',
    },
  },
  {
    id: 'distress',
    matchAny: [['distress'], ['insolvency'], ['restructur'], ['bankrupt']],
    insight: {
      id: 'ai-distress',
      headline: 'Distressed portfolio company counsel',
      answer:
        'When a portfolio company is under financial pressure, pair insolvency counsel with funds counsel so creditors, sponsors, and LPs stay coordinated.',
      bullets: [
        'Andrew Alfano for insolvency and restructuring.',
        'Semma Arzapalo for institutional investor / funds alignment.',
        'Situation-led asks beat searching only “bankruptcy” or “PE.”',
      ],
      citations: [
        {
          title: 'Andrew V. Alfano',
          href: '/Lawyers/Bios/Andrew-V-Alfano',
          kbId: 'BIO',
          excerpt: 'Insolvency & Restructuring counsel in New York.',
        },
        {
          title: 'Semma G. Arzapalo',
          href: '/Lawyers/Bios/Semma-G-Arzapalo',
          kbId: 'BIO',
          excerpt: 'Global Funds practice leader in Los Angeles.',
        },
      ],
      learnMoreHref: '/Lawyers/Bios/Andrew-V-Alfano',
      learnMoreLabel: 'Open restructuring bio',
    },
  },
  {
    id: 'sanctions',
    matchAny: [
      ['saudi', 'export'],
      ['expanding', 'saudi'],
      ['saudi', 'talk'],
      ['export-control'],
      ['export control'],
      ['sanction'],
      ['ofac'],
      ['mena'],
      ['riyadh', 'export'],
      ['qatar'],
    ],
    insight: {
      id: 'ai-saudi-expansion-export',
      headline: 'Saudi expansion with export-control questions',
      answer:
        'Start with a two-lawyer team—Washington international trade for EAR/OFAC, and Riyadh corporate for local entity and commercial setup—then use webinars, a CLE briefing, and a short podcast to brief the business side before the first intake call.',
      bullets: [
        'Talk to Ata A. Akiner (International Trade, Washington, DC) for export controls and sanctions.',
        'Talk to Khalid A. AlArfaj (Corporate, Riyadh) for Kingdom entity and commercial issues.',
        'Optional MENA corporate coverage: Osama Abu-Dehays (Doha).',
        'Brief the team with the Export Controls 101 webinar, Trade Talks podcast, Gulf EAR/OFAC alert, and KSA entry checklist.',
      ],
      citations: [
        {
          title: 'Ata A. Akiner',
          href: '/Lawyers/Bios/Ata-A-Akiner',
          kbId: 'BIO',
          excerpt: 'International Trade — export controls & national security (Washington, DC).',
        },
        {
          title: 'Khalid A. AlArfaj',
          href: '/Lawyers/Bios/Khalid-A-AlArfaj',
          kbId: 'BIO',
          excerpt: 'Corporate counsel for Saudi Arabia and cross-border matters (Riyadh).',
        },
        {
          title: 'Expanding into Saudi Arabia: Export Controls 101',
          href: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
          kbId: 'WEBINAR',
          excerpt: 'Webinar featuring Akiner and AlArfaj on EAR/OFAC + market entry.',
        },
        {
          title: 'Trade Talks: Saudi Vision 2030 & Export Controls',
          href: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
          kbId: 'PODCAST',
          excerpt: 'Podcast for expansion teams balancing growth and U.S. trade rules.',
        },
        {
          title: 'Who Should We Talk To? Saudi Expansion & Export Controls',
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
    id: 'insurance',
    matchAny: [['insurance'], ['coverage', 'fight'], ['carrier'], ['policyholder']],
    insight: {
      id: 'ai-insurance',
      headline: 'Insurance coverage and construction claims',
      answer:
        'Coverage fights with carriers—especially on construction projects—are a natural fit for Insurance Recovery counsel, with trial support when disputes harden.',
      bullets: [
        'Stephen Asay for insurance recovery and construction coverage (DC).',
        'Jennifer Altman for hard-fought commercial litigation (Miami).',
        'Follow Policyholder Pulse for coverage commentary.',
      ],
      citations: [
        {
          title: 'Stephen S. Asay',
          href: '/Lawyers/Bios/Stephen-S-Asay',
          kbId: 'BIO',
          excerpt: 'Insurance Recovery & Advisory, Washington, DC.',
        },
        {
          title: 'Policyholder Pulse',
          href: '/Insights/Blogs/Policyholder-Pulse',
          kbId: 'BLOG',
          excerpt: 'Insurance coverage insights blog.',
        },
      ],
      learnMoreHref: '/Lawyers/Bios/Stephen-S-Asay',
      learnMoreLabel: 'Open insurance bio',
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
