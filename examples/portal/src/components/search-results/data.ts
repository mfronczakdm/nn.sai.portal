/**
 * Mock search catalog for Dwyer Omega–style instrumentation demo.
 * Data only — UI lives in SearchResults.tsx.
 */

export type DemoUserTaxonomy = 'Maintenance Engineer' | 'Engineering Consultant' | 'Plant Technician';

export type SearchContentType = 'product' | 'featuredArticle' | 'technicalResource' | 'productManual';

/** Left-rail facet: measurement / application family */
export type SearchCategory =
  | 'pressure'
  | 'temperature'
  | 'flowLevel'
  | 'dataAcquisition'
  | 'wirelessIiot'
  | 'calibrationServices';

/** Brand / product line facet */
export type SearchBrand = 'dwyer' | 'omega' | 'redLion';

/** Which keyword buckets surface this row (OR within bucket; AND with query text when no bucket hit) */
export type SearchBucket = 'pressure' | 'datalogger' | 'iiot';

export type SearchResultItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  contentType: SearchContentType;
  categories: SearchCategory[];
  brands: SearchBrand[];
  /** Keyword buckets for curated queries (pressure regulators, data loggers, IIoT / wireless) */
  searchBuckets: SearchBucket[];
  dateLabel?: string;
  breadcrumb?: string[];
  matchTerms?: string[];
  imageSrc?: string;
  isNew?: boolean;
  /** When set, strong relevance boost for that demo persona */
  demoUserTaxonomy?: DemoUserTaxonomy;
  /** If set, this row only appears for these personas (different result sets per user) */
  visibleForDemoUsers?: DemoUserTaxonomy[];
  /** Mock SKU for products */
  sku?: string;
  /** e.g. "From $245" */
  priceLabel?: string;
};

export type AiSearchInsight = {
  id: string;
  headline: string;
  body: string;
  bullets: string[];
  learnMoreHref: string;
  learnMoreLabel?: string;
};

export const DWYER_OMEGA_BASE = 'https://www.dwyeromega.com/';

export const RESULTS_PAGE_SIZE = 9;

export const searchFacetLabels = {
  contentType: {
    product: 'Products',
    featuredArticle: 'Featured articles',
    technicalResource: 'Technical resources',
    productManual: 'Product manuals',
  },
  category: {
    pressure: 'Pressure & valves',
    temperature: 'Temperature & process',
    flowLevel: 'Flow & level',
    dataAcquisition: 'Data acquisition & recording',
    wirelessIiot: 'Wireless & IIoT',
    calibrationServices: 'Calibration & services',
  },
  brand: {
    dwyer: 'Dwyer Instruments',
    omega: 'Omega',
    redLion: 'Red Lion / connectivity',
  },
} as const;

export const popularSearches = [
  'Pressure regulators',
  'Data loggers',
  'IIoT and Wireless Systems',
  'Series 2000 transmitter',
  'Thermocouple reference',
];

/** Synonyms → bucket; used to mimic category landing search */
export const QUERY_BUCKET_SYNONYMS: Record<SearchBucket, readonly string[]> = {
  pressure: [
    'pressure',
    'regulator',
    'regulators',
    'valve',
    'valves',
    'gauge',
    'gauges',
    'manifold',
    'transmitter',
    'dp',
    'differential',
  ],
  datalogger: [
    'data',
    'logger',
    'loggers',
    'logging',
    'log',
    'recorder',
    'recording',
    'acquisition',
    'daq',
    'chart',
    'portable',
    'usb',
  ],
  iiot: [
    'iiot',
    'iot',
    'wireless',
    'gateway',
    'gateways',
    'cloud',
    'remote',
    'mesh',
    'cellular',
    'systems',
    'system',
    'network',
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
]);

function unsplash(path: string) {
  return `https://images.unsplash.com/${path}?auto=format&fit=crop&w=800&h=520&q=80`;
}

export function parseDemoUserTaxonomy(raw: string | undefined | null): DemoUserTaxonomy | null {
  const t = raw?.trim();
  if (t === 'Maintenance Engineer' || t === 'Engineering Consultant' || t === 'Plant Technician') {
    return t;
  }
  return null;
}

export function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function detectSearchBuckets(q: string): SearchBucket[] {
  const n = normalizeQuery(q);
  if (!n) return [];
  const words = n.split(/\s+/).filter(Boolean);
  const hits = new Set<SearchBucket>();
  for (const [bucket, synonyms] of Object.entries(QUERY_BUCKET_SYNONYMS) as [SearchBucket, readonly string[]][]) {
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
  if (buckets.length) {
    if (!itemMatchesBuckets(item, buckets)) return false;
  }
  const hay = [
    item.title,
    item.description,
    ...(item.breadcrumb ?? []),
    ...(item.matchTerms ?? []),
    ...(item.sku ? [item.sku] : []),
  ]
    .join(' ')
    .toLowerCase();
  const words = significantQueryWords(n);
  if (!words.length) return true;
  if (buckets.length) {
    return words.some((w) => hay.includes(w));
  }
  return words.every((w) => hay.includes(w));
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
    if (desc.includes(w)) score += 2;
    if (crumbs.includes(w)) score += 1;
    if (extra.includes(w)) score += 3;
  }
  if (activeDemoUserTaxonomy && item.demoUserTaxonomy === activeDemoUserTaxonomy) {
    score += 25;
  }
  const buckets = detectSearchBuckets(n);
  if (buckets.length) {
    for (const b of buckets) {
      if (item.searchBuckets.includes(b)) score += 8;
    }
  }
  return score;
}

/** Persona-specific supplemental rows (always merged when a demo user is active) */
export function supplementalResultsForDemoUserTaxonomy(plan: DemoUserTaxonomy): SearchResultItem[] {
  const code = plan === 'Maintenance Engineer' ? 'me' : plan === 'Engineering Consultant' ? 'ec' : 'pt';
  const rows: Omit<SearchResultItem, 'id' | 'demoUserTaxonomy'>[] =
    plan === 'Maintenance Engineer'
      ? [
          {
            sku: 'ME-SP-01',
            priceLabel: 'Field kit',
            imageSrc: unsplash('photo-1581091226825-a6a2a5aee158'),
            isNew: true,
            title: 'Spare regulator seats & diaphragm kit — PM checklist',
            description:
              'O-rings and soft goods matched to common Dwyer low-pressure regulators. Stock for turnaround windows and reduce emergency orders.',
            href: DWYER_OMEGA_BASE,
            contentType: 'technicalResource',
            categories: ['pressure', 'calibrationServices'],
            brands: ['dwyer'],
            searchBuckets: ['pressure'],
            dateLabel: 'PM brief',
            breadcrumb: ['Maintenance', 'Spares'],
            matchTerms: ['spare', 'regulator', 'diaphragm', 'maintenance', 'kit'],
          },
          {
            imageSrc: unsplash('photo-1581092160562-40aa08f11460'),
            title: 'Rounds log: compare field gauge vs control room DP',
            description:
              'One-page template for differential pressure checks across filters and coils — aligns with daily operator rounds.',
            href: DWYER_OMEGA_BASE,
            contentType: 'productManual',
            categories: ['pressure', 'dataAcquisition'],
            brands: ['omega'],
            searchBuckets: ['pressure', 'datalogger'],
            dateLabel: 'PDF',
            breadcrumb: ['Operations', 'Rounds'],
            matchTerms: ['rounds', 'differential', 'field', 'log'],
          },
        ]
      : plan === 'Engineering Consultant'
        ? [
            {
              sku: 'EC-SPEC-88',
              priceLabel: 'Consulting',
              imageSrc: unsplash('photo-1581092918056-0c4c1ac51795'),
              isNew: true,
              title: 'Spec sheet bundle: regulators for cleanroom cascades',
              description:
                'Accuracy classes, crack pressures, and authority limits for specifying Dwyer regulators in ISO-rated spaces.',
              href: DWYER_OMEGA_BASE,
              contentType: 'technicalResource',
              categories: ['pressure', 'calibrationServices'],
              brands: ['dwyer'],
              searchBuckets: ['pressure'],
              dateLabel: 'Specifier',
              breadcrumb: ['Design', 'HVAC'],
              matchTerms: ['specification', 'cleanroom', 'cascade', 'regulator'],
            },
            {
              imageSrc: unsplash('photo-1518770660439-4636190af475'),
              title: 'IIoT architecture note: edge vs cloud historian',
              description:
                'When to buffer logs at the gateway versus streaming to SCADA — written for retrofit projects using Omega wireless layers.',
              href: DWYER_OMEGA_BASE,
              contentType: 'featuredArticle',
              categories: ['wirelessIiot', 'dataAcquisition'],
              brands: ['omega', 'redLion'],
              searchBuckets: ['iiot', 'datalogger'],
              dateLabel: 'Insight',
              breadcrumb: ['Engineering', 'IIoT'],
              matchTerms: ['edge', 'historian', 'gateway', 'architecture'],
            },
          ]
        : [
            {
              sku: 'PT-CHK-03',
              imageSrc: unsplash('photo-1582719478250-c89cae4dc85b'),
              title: 'Line break card: zero-energy verification for regulators',
              description:
                'Field safety steps before swapping a failed pressure reducing station — includes tag-out references.',
              href: DWYER_OMEGA_BASE,
              contentType: 'productManual',
              categories: ['pressure'],
              brands: ['dwyer'],
              searchBuckets: ['pressure'],
              dateLabel: 'Safety',
              breadcrumb: ['Plant', 'Safety'],
              matchTerms: ['lockout', 'regulator', 'zero energy', 'line break'],
            },
            {
              imageSrc: unsplash('photo-1558346490-bff35548aedf'),
              title: 'Wireless logger placement for rotating equipment',
              description:
                'Vibration and temperature logger mounting patterns that survive washdown — plant technician playbook.',
              href: DWYER_OMEGA_BASE,
              contentType: 'technicalResource',
              categories: ['wirelessIiot', 'dataAcquisition', 'temperature'],
              brands: ['omega'],
              searchBuckets: ['iiot', 'datalogger'],
              dateLabel: 'How-to',
              breadcrumb: ['Reliability', 'Wireless'],
              matchTerms: ['wireless', 'logger', 'vibration', 'mounting'],
            },
          ];

  return rows.map((row, i) => ({
    ...row,
    id: `demo-sup-${code}-${i + 1}`,
    demoUserTaxonomy: plan,
  }));
}

const defaultImg = unsplash('photo-1581092160562-40aa08f11460');

function p(
  partial: Omit<SearchResultItem, 'id' | 'href'> & { id: string; href?: string }
): SearchResultItem {
  return {
    href: partial.href ?? DWYER_OMEGA_BASE,
    imageSrc: partial.imageSrc ?? defaultImg,
    ...partial,
  };
}

/**
 * Rich mock catalog: multi-bucket tags + persona-only rows → different sets per query × user.
 * ≥18 rows per major bucket after filters (for two pages at 9/page).
 */
export const searchCatalog: SearchResultItem[] = [
  // —— Pressure / regulators (shared + varied) ——
  p({
    id: 'pr-1',
    sku: 'DRF-SS',
    priceLabel: 'From $189',
    title: 'Series DRF Carbon Steel Pressure Regulator',
    description:
      'Precision diaphragm regulator for air and compatible gases — stable outlet pressure across varying inlet conditions.',
    contentType: 'product',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['pressure', 'regulator', 'regulators', 'air', 'diaphragm'],
    imageSrc: unsplash('photo-1558346490-bff35548aedf'),
    isNew: true,
    breadcrumb: ['Products', 'Pressure', 'Regulators'],
  }),
  p({
    id: 'pr-2',
    sku: 'M4-02',
    priceLabel: 'From $312',
    title: 'Miniature Pressure Regulator — Brass Body',
    description:
      'Compact low-flow regulator for panels and analyzers; ideal OEM footprint for instrumentation skids.',
    contentType: 'product',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['regulator', 'brass', 'miniature', 'panel', 'low flow'],
    imageSrc: unsplash('photo-1504917595217-d002cbf56fc7'),
    breadcrumb: ['Products', 'Pressure'],
  }),
  p({
    id: 'pr-3',
    sku: '160G-15',
    priceLabel: '$98',
    title: '160 Series Stainless Pressure Gauge',
    description:
      'Liquid-filled option for pulsation damping on pumps and compressors — maintenance-friendly ¼ NPT lower mount.',
    contentType: 'product',
    categories: ['pressure', 'calibrationServices'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['gauge', 'pressure', 'stainless', 'liquid filled'],
    imageSrc: unsplash('photo-1581091226825-a6a2a5aee158'),
    breadcrumb: ['Products', 'Pressure', 'Gauges'],
  }),
  p({
    id: 'pr-4',
    title: 'Featured article: Selecting a pressure regulator for natural gas test benches',
    description:
      'Walkthrough of setpoint drift, lockup, and droop — authored for test-and-measurement teams standardizing on Dwyer hardware.',
    contentType: 'featuredArticle',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['regulator', 'selection', 'natural gas', 'test bench'],
    imageSrc: unsplash('photo-1581092162384-8987c1d64718'),
    breadcrumb: ['Learn', 'Featured'],
  }),
  p({
    id: 'pr-5',
    title: 'Technical resource: Differential pressure across coalescing filters',
    description:
      'Trend interpretation for DP transmitters and manifolds; includes alarm thresholds for loaded elements.',
    contentType: 'technicalResource',
    categories: ['pressure', 'flowLevel'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['differential', 'dp', 'filter', 'trend'],
    imageSrc: unsplash('photo-1565514020163-395f34250af5'),
    breadcrumb: ['Resources', 'Application notes'],
  }),
  p({
    id: 'pr-6',
    title: 'Product manual: RPF Series regulator installation & startup',
    description:
      'PDF manual with torque values, startup sequence, and leak-check procedure for field technicians.',
    contentType: 'productManual',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['manual', 'installation', 'regulator', 'startup'],
    imageSrc: unsplash('photo-1581092918056-0c4c1ac51795'),
    breadcrumb: ['Support', 'Manuals'],
  }),
  p({
    id: 'pr-me-only',
    sku: 'PM-KIT-7',
    title: 'Maintenance-only: Field rebuild kit for legacy miniature regulators',
    description:
      'Diaphragm and seat assortment sized for high-cycle panel regulators — not shown in standard catalog filters.',
    contentType: 'product',
    categories: ['pressure', 'calibrationServices'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['rebuild', 'regulator', 'field', 'maintenance'],
    imageSrc: unsplash('photo-1581092160562-40aa08f11460'),
    visibleForDemoUsers: ['Maintenance Engineer'],
    demoUserTaxonomy: 'Maintenance Engineer',
    breadcrumb: ['Maintenance', 'Kits'],
  }),
  p({
    id: 'pr-ec-only',
    title: 'Consulting-only: Authority & turndown whitepaper for regulator stations',
    description:
      'Engineering memo on parallel regulator sizing for N+1 redundancy in campus steam PRV stations.',
    contentType: 'technicalResource',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['authority', 'turndown', 'engineering', 'prv'],
    imageSrc: unsplash('photo-1531297484001-80022131f5a1'),
    visibleForDemoUsers: ['Engineering Consultant'],
    demoUserTaxonomy: 'Engineering Consultant',
    breadcrumb: ['Resources', 'Whitepapers'],
  }),
  p({
    id: 'pr-pt-only',
    title: 'Technician-only: Shift card — regulator creep test in 5 minutes',
    description:
      'Quick isolation and downstream bleed steps to verify seat leakage before returning a line to service.',
    contentType: 'productManual',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['creep', 'test', 'regulator', 'leak'],
    imageSrc: unsplash('photo-1581092162384-8987c1d64718'),
    visibleForDemoUsers: ['Plant Technician'],
    demoUserTaxonomy: 'Plant Technician',
    breadcrumb: ['Operations', 'Shift aids'],
  }),
  p({
    id: 'pr-7',
    sku: 'AT2-110A',
    priceLabel: '$1,245',
    title: 'AT2 Series Electronic Pressure Transmitter',
    description:
      '4–20 mA loop-powered transmitter with field-selectable ranges — pairs with Omega displays for turnkey panels.',
    contentType: 'product',
    categories: ['pressure', 'dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['pressure', 'datalogger'],
    matchTerms: ['transmitter', '4-20', 'pressure', 'loop'],
    imageSrc: unsplash('photo-1518770660439-4636190af475'),
    breadcrumb: ['Products', 'Pressure', 'Transmitters'],
  }),
  p({
    id: 'pr-8',
    sku: 'MAGNEHELIC',
    priceLabel: 'From $67',
    title: 'Magnehelic® Differential Pressure Gauge',
    description:
      'Industry-standard DP indication for filters, fans, and isolation rooms — high-visibility dial options.',
    contentType: 'product',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['differential', 'magnehelic', 'gauge', 'filter'],
    imageSrc: unsplash('photo-1551288049-bebda4e38f71'),
    isNew: true,
    breadcrumb: ['Products', 'Pressure'],
  }),
  p({
    id: 'pr-9',
    title: 'Featured article: Best practices for regulator stations in hydronic systems',
    description:
      'Avoid hunting and water hammer with staged pressure drops and proper bypass — written for consulting engineers.',
    contentType: 'featuredArticle',
    categories: ['pressure', 'flowLevel'],
    brands: ['dwyer', 'omega'],
    searchBuckets: ['pressure'],
    matchTerms: ['hydronic', 'regulator', 'bypass', 'engineering'],
    imageSrc: unsplash('photo-1504328345606-18bbc8c9d7d1'),
    breadcrumb: ['Learn', 'HVAC'],
  }),
  p({
    id: 'pr-10',
    title: 'Product manual: Minihelic® / Photohelic® installation addendum',
    description:
      'Wiring, setpoint, and relay configuration for switching gauges used in fan proving applications.',
    contentType: 'productManual',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['photohelic', 'minihelic', 'relay', 'manual'],
    imageSrc: unsplash('photo-1589829545856-d10d557cf95f'),
    breadcrumb: ['Support', 'Manuals'],
  }),
  p({
    id: 'pr-11',
    sku: 'PRV-2LF',
    priceLabel: '$156',
    title: 'Low-flow precision regulator for analyzers',
    description:
      'Stainless seat option for corrosive sample gases — outlet stability for GC and CEMS sample conditioning.',
    contentType: 'product',
    categories: ['pressure', 'calibrationServices'],
    brands: ['omega'],
    searchBuckets: ['pressure'],
    matchTerms: ['regulator', 'low flow', 'analyzer', 'sample'],
    imageSrc: unsplash('photo-1581091226825-a6a2a5aee158'),
    breadcrumb: ['Products', 'Pressure'],
  }),
  p({
    id: 'pr-12',
    title: 'Technical resource: Sizing a relief valve upstream of a regulator',
    description:
      'Avoid nuisance lifts when inlet pressure spikes — includes capacity curves and vent line sizing notes.',
    contentType: 'technicalResource',
    categories: ['pressure', 'flowLevel'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['relief', 'regulator', 'sizing', 'inlet'],
    imageSrc: unsplash('photo-1565043666747-69f6646db940'),
    breadcrumb: ['Resources', 'Safety'],
  }),
  p({
    id: 'pr-13',
    sku: 'DH3-004',
    priceLabel: '$412',
    title: 'Differential pressure manifold — 3-valve block for transmitters',
    description:
      'Isolate, equalize, and vent in one compact body for DP transmitters on steam and hydronic systems.',
    contentType: 'product',
    categories: ['pressure'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['manifold', 'differential', 'transmitter', 'block'],
    imageSrc: unsplash('photo-1581092162384-8987c1d64718'),
    breadcrumb: ['Products', 'Valves'],
  }),
  p({
    id: 'pr-14',
    title: 'Featured article: Digital vs mechanical regulators in skids',
    description:
      'When electronic piloting pays off versus traditional spring-loaded regulators for packaged equipment OEMs.',
    contentType: 'featuredArticle',
    categories: ['pressure', 'dataAcquisition'],
    brands: ['dwyer', 'omega'],
    searchBuckets: ['pressure'],
    matchTerms: ['digital', 'regulator', 'skid', 'oem'],
    imageSrc: unsplash('photo-1531297484001-80022131f5a1'),
    breadcrumb: ['Learn', 'OEM'],
  }),
  p({
    id: 'pr-15',
    title: 'Product manual: Field verification of regulator lockup pressure',
    description:
      'Step-by-step procedure with data sheet template for QA sign-off after maintenance.',
    contentType: 'productManual',
    categories: ['pressure', 'calibrationServices'],
    brands: ['dwyer'],
    searchBuckets: ['pressure'],
    matchTerms: ['lockup', 'regulator', 'verification', 'manual'],
    imageSrc: unsplash('photo-1576091160550-2173dba999ef'),
    breadcrumb: ['Support', 'Field'],
  }),

  // —— Data loggers / acquisition ——
  p({
    id: 'dl-1',
    sku: 'OM-CP-OCTPRO',
    priceLabel: 'From $389',
    title: 'OM-CP-OctPro Multi-Channel Temperature Logger',
    description:
      'Eight thermocouple channels with onboard memory and USB offload — suited for oven mapping and cold chain studies.',
    contentType: 'product',
    categories: ['dataAcquisition', 'temperature'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['data', 'logger', 'temperature', 'thermocouple', 'mapping'],
    imageSrc: unsplash('photo-1582719478250-c89cae4dc85b'),
    isNew: true,
    breadcrumb: ['Products', 'Data acquisition'],
  }),
  p({
    id: 'dl-2',
    sku: 'OM-DAQ-1200',
    priceLabel: '$2,150',
    title: 'Portable USB DAQ — 16-bit, 100 kS/s',
    description:
      'Benchtop acquisition for lab characterization with bundled Omega software drivers and example projects.',
    contentType: 'product',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['daq', 'usb', 'acquisition', 'logger', 'portable'],
    imageSrc: unsplash('photo-1518770660439-4636190af475'),
    breadcrumb: ['Products', 'DAQ'],
  }),
  p({
    id: 'dl-3',
    title: 'Featured article: Mapping an autoclave with battery-powered loggers',
    description:
      'Sensor placement, sampling intervals, and report generation for validation engineers.',
    contentType: 'featuredArticle',
    categories: ['dataAcquisition', 'temperature'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['mapping', 'logger', 'autoclave', 'validation'],
    imageSrc: unsplash('photo-1576091160399-112ba8d25d1d'),
    breadcrumb: ['Learn', 'Life sciences'],
  }),
  p({
    id: 'dl-4',
    title: 'Technical resource: Alarming and statistics in Omega data software',
    description:
      'How to configure rolling min/max, MKT, and email alerts for cold rooms using Omega desktop suite.',
    contentType: 'technicalResource',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['alarm', 'software', 'data', 'logger'],
    imageSrc: unsplash('photo-1551288049-bebda4e38f71'),
    breadcrumb: ['Resources', 'Software'],
  }),
  p({
    id: 'dl-5',
    title: 'Product manual: OM-CP series quick start & calibration certificate template',
    description:
      'PDF quick start with traceable calibration worksheet references for auditors.',
    contentType: 'productManual',
    categories: ['dataAcquisition', 'calibrationServices'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['manual', 'calibration', 'certificate', 'logger'],
    imageSrc: unsplash('photo-1587854692152-cbe660dbde88'),
    breadcrumb: ['Support', 'Manuals'],
  }),
  p({
    id: 'dl-me-only',
    title: 'Maintenance-only: Logger battery rotation matrix',
    description:
      'SKU cross-reference for coin-cell and lithium packs used across Omega OM-CP loggers — reduces stockouts.',
    contentType: 'technicalResource',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['battery', 'logger', 'maintenance', 'stock'],
    imageSrc: unsplash('photo-1565043666747-69f6646db940'),
    visibleForDemoUsers: ['Maintenance Engineer'],
    demoUserTaxonomy: 'Maintenance Engineer',
    breadcrumb: ['Maintenance', 'CMMS'],
  }),
  p({
    id: 'dl-ec-only',
    title: 'Consulting-only: Uncertainty budget for multi-channel logger systems',
    description:
      'Worked example combining sensor interchangeability, cold junction error, and logger quantization.',
    contentType: 'technicalResource',
    categories: ['dataAcquisition', 'calibrationServices'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['uncertainty', 'logger', 'engineering', 'budget'],
    imageSrc: unsplash('photo-1504711434969-e33886168f5c'),
    visibleForDemoUsers: ['Engineering Consultant'],
    demoUserTaxonomy: 'Engineering Consultant',
    breadcrumb: ['Resources', 'Metrology'],
  }),
  p({
    id: 'dl-pt-only',
    title: 'Technician-only: Field swap guide — logger vs chart recorder legacy loops',
    description:
      'Stepwise decommission of circular chart drives and reuse of existing TC wells with digital loggers.',
    contentType: 'productManual',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['chart', 'recorder', 'swap', 'technician'],
    imageSrc: unsplash('photo-1581092160562-40aa08f11460'),
    visibleForDemoUsers: ['Plant Technician'],
    demoUserTaxonomy: 'Plant Technician',
    breadcrumb: ['Operations', 'Retrofits'],
  }),
  p({
    id: 'dl-6',
    sku: 'DW-LOG-PRO',
    priceLabel: '$425',
    title: 'Dwyer Series DW-LOG Pressure & Temperature Logger',
    description:
      'Combined absolute/gauge pressure with ambient temperature logging for compressed air audits.',
    contentType: 'product',
    categories: ['dataAcquisition', 'pressure'],
    brands: ['dwyer'],
    searchBuckets: ['datalogger', 'pressure'],
    matchTerms: ['logger', 'pressure', 'temperature', 'audit'],
    imageSrc: unsplash('photo-1505751172876-fa1923c5c528'),
    breadcrumb: ['Products', 'Loggers'],
  }),
  p({
    id: 'dl-7',
    sku: 'OM-SQ-2040',
    priceLabel: '$199',
    title: 'Single-use temperature logger — flat shipping profile',
    description:
      'Cold chain compliance with PDF trip report on USB — ideal for lane qualification studies.',
    contentType: 'product',
    categories: ['dataAcquisition', 'temperature'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['cold chain', 'logger', 'usb', 'pdf'],
    imageSrc: unsplash('photo-1571019613454-1cb2f99b2d8b'),
    breadcrumb: ['Products', 'Loggers'],
  }),
  p({
    id: 'dl-8',
    title: 'Featured article: From strip charts to digital historians on a budget',
    description:
      'Migration path for small utilities upgrading legacy recording without rip-and-replace DCS work.',
    contentType: 'featuredArticle',
    categories: ['dataAcquisition'],
    brands: ['omega', 'redLion'],
    searchBuckets: ['datalogger'],
    matchTerms: ['historian', 'digital', 'migration', 'logger'],
    imageSrc: unsplash('photo-1451187580459-43490279c0fa'),
    breadcrumb: ['Learn', 'Utilities'],
  }),
  p({
    id: 'dl-9',
    title: 'Product manual: DAQ driver installation for Windows 11 environments',
    description:
      'Signed driver packages, UAC prompts, and firewall exceptions for lab PCs.',
    contentType: 'productManual',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['driver', 'daq', 'windows', 'manual'],
    imageSrc: unsplash('photo-1517694712202-3dd5170e001d'),
    breadcrumb: ['Support', 'IT'],
  }),
  p({
    id: 'dl-10',
    sku: 'OM-EL-USB',
    priceLabel: '$72',
    title: 'EL-USB Temperature & Humidity Logger',
    description:
      'Set-and-forget USB logger with LED status — thousands deployed in warehouses and clinics.',
    contentType: 'product',
    categories: ['dataAcquisition', 'temperature'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['usb', 'logger', 'humidity', 'temperature'],
    imageSrc: unsplash('photo-1581091226825-a6a2a5aee158'),
    isNew: true,
    breadcrumb: ['Products', 'Loggers'],
  }),
  p({
    id: 'dl-11',
    sku: 'OM-DAQ-USB8',
    priceLabel: '$289',
    title: '8-channel voltage logger with software triggers',
    description:
      'Log 0–10 V and 4–20 mA with configurable thresholds — ship logs to CSV for Six Sigma studies.',
    contentType: 'product',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['logger', 'channel', 'voltage', 'csv'],
    imageSrc: unsplash('photo-1581092918056-0c4c1ac51795'),
    breadcrumb: ['Products', 'DAQ'],
  }),
  p({
    id: 'dl-12',
    title: 'Technical resource: Logger sampling jitter and aliasing primer',
    description:
      'Short guide for engineers choosing sample rates for rotating equipment and fast thermal transients.',
    contentType: 'technicalResource',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['sampling', 'logger', 'aliasing', 'engineering'],
    imageSrc: unsplash('photo-1504711434969-e33886168f5c'),
    breadcrumb: ['Resources', 'Education'],
  }),
  p({
    id: 'dl-13',
    sku: 'DW-SCADA-LITE',
    priceLabel: '$560',
    title: 'Lightweight SCADA logger bridge for small utilities',
    description:
      'Poll Modbus registers and persist to removable media — bridge legacy PLCs to modern reporting.',
    contentType: 'product',
    categories: ['dataAcquisition', 'wirelessIiot'],
    brands: ['dwyer'],
    searchBuckets: ['datalogger'],
    matchTerms: ['scada', 'logger', 'modbus', 'utility'],
    imageSrc: unsplash('photo-1551288049-bebda4e38f71'),
    breadcrumb: ['Products', 'Software'],
  }),
  p({
    id: 'dl-14',
    title: 'Featured article: Data integrity for 21 CFR Part 11 studies',
    description:
      'Audit trails, user accounts, and electronic signatures when Omega software is used in regulated labs.',
    contentType: 'featuredArticle',
    categories: ['dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['data', 'logger', 'compliance', 'cfr'],
    imageSrc: unsplash('photo-1576091160399-112ba8d25d1d'),
    breadcrumb: ['Learn', 'Regulatory'],
  }),
  p({
    id: 'dl-15',
    title: 'Product manual: Ethernet logger firewall exceptions',
    description:
      'IT-friendly port matrix for Omega Ethernet loggers in segmented OT networks.',
    contentType: 'productManual',
    categories: ['dataAcquisition', 'wirelessIiot'],
    brands: ['omega'],
    searchBuckets: ['datalogger'],
    matchTerms: ['ethernet', 'logger', 'firewall', 'manual'],
    imageSrc: unsplash('photo-1517694712202-3dd5170e001d'),
    breadcrumb: ['Support', 'IT'],
  }),

  // —— IIoT / Wireless ——
  p({
    id: 'iot-1',
    sku: 'OM-WLS-01',
    priceLabel: 'From $510',
    title: 'Wireless Temperature Transmitter — Mesh repeater capable',
    description:
      'License-free sub-GHz mesh for plant-wide temperature visibility without running new conduit.',
    contentType: 'product',
    categories: ['wirelessIiot', 'temperature', 'dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['iiot'],
    matchTerms: ['wireless', 'mesh', 'iiot', 'transmitter', 'temperature'],
    imageSrc: unsplash('photo-1558346490-bff35548aedf'),
    isNew: true,
    breadcrumb: ['Products', 'Wireless'],
  }),
  p({
    id: 'iot-2',
    sku: 'RL-GW-IO',
    priceLabel: '$1,890',
    title: 'Red Lion Edge Gateway — MQTT & Sparkplug B',
    description:
      'Publish OT tags to cloud historians with store-and-forward for unreliable cellular uplinks.',
    contentType: 'product',
    categories: ['wirelessIiot', 'dataAcquisition'],
    brands: ['redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['gateway', 'mqtt', 'iiot', 'edge', 'cloud'],
    imageSrc: unsplash('photo-1518770660439-4636190af475'),
    breadcrumb: ['Products', 'Connectivity'],
  }),
  p({
    id: 'iot-3',
    title: 'Featured article: Designing a secure IIoT pilot on brownfield assets',
    description:
      'Segmentation, read-only PLC taps, and certificate rotation patterns for first production pilots.',
    contentType: 'featuredArticle',
    categories: ['wirelessIiot'],
    brands: ['omega', 'redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['iiot', 'secure', 'pilot', 'plc'],
    imageSrc: unsplash('photo-1451187580459-43490279c0fa'),
    breadcrumb: ['Learn', 'IIoT'],
  }),
  p({
    id: 'iot-4',
    title: 'Technical resource: Wireless site survey checklist for metal buildings',
    description:
      'RSSI targets, antenna height rules, and interference sources common in process plants.',
    contentType: 'technicalResource',
    categories: ['wirelessIiot'],
    brands: ['omega'],
    searchBuckets: ['iiot'],
    matchTerms: ['wireless', 'survey', 'antenna', 'rssi'],
    imageSrc: unsplash('photo-1565514020163-395f34250af5'),
    breadcrumb: ['Resources', 'Field'],
  }),
  p({
    id: 'iot-5',
    title: 'Product manual: Edge gateway commissioning & SIM provisioning',
    description:
      'APN settings, firewall pinholes, and OT/IT handoff checklist for operations teams.',
    contentType: 'productManual',
    categories: ['wirelessIiot'],
    brands: ['redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['gateway', 'sim', 'commissioning', 'manual'],
    imageSrc: unsplash('photo-1581092918056-0c4c1ac51795'),
    breadcrumb: ['Support', 'Manuals'],
  }),
  p({
    id: 'iot-me-only',
    title: 'Maintenance-only: Spare antenna kit list by panel type',
    description:
      'Cross-reference whip vs remote-mount kits for Omega wireless receivers in MCC rooms.',
    contentType: 'technicalResource',
    categories: ['wirelessIiot'],
    brands: ['omega'],
    searchBuckets: ['iiot'],
    matchTerms: ['antenna', 'spare', 'wireless', 'maintenance'],
    imageSrc: unsplash('photo-1581092160562-40aa08f11460'),
    visibleForDemoUsers: ['Maintenance Engineer'],
    demoUserTaxonomy: 'Maintenance Engineer',
    breadcrumb: ['Maintenance', 'Spares'],
  }),
  p({
    id: 'iot-ec-only',
    title: 'Consulting-only: Reference architecture — SCADA to cloud via Sparkplug',
    description:
      'Single-line diagrams and topic naming conventions for multi-site OEM rollouts.',
    contentType: 'technicalResource',
    categories: ['wirelessIiot', 'dataAcquisition'],
    brands: ['redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['sparkplug', 'scada', 'architecture', 'cloud'],
    imageSrc: unsplash('photo-1531297484001-80022131f5a1'),
    visibleForDemoUsers: ['Engineering Consultant'],
    demoUserTaxonomy: 'Engineering Consultant',
    breadcrumb: ['Resources', 'Architecture'],
  }),
  p({
    id: 'iot-pt-only',
    title: 'Technician-only: Swap procedure — cellular gateway without process downtime',
    description:
      'Hot-swap using redundant path and validation pings before cutover.',
    contentType: 'productManual',
    categories: ['wirelessIiot'],
    brands: ['redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['cellular', 'gateway', 'swap', 'downtime'],
    imageSrc: unsplash('photo-1581092162384-8987c1d64718'),
    visibleForDemoUsers: ['Plant Technician'],
    demoUserTaxonomy: 'Plant Technician',
    breadcrumb: ['Operations', 'Runbooks'],
  }),
  p({
    id: 'iot-6',
    sku: 'OM-CLOUD-LITE',
    priceLabel: '$29/mo',
    title: 'Omega Cloud Lite — dashboards for wireless loggers',
    description:
      'Pre-built tiles for min/max, excursions, and CSV export — pairs with Omega wireless endpoints.',
    contentType: 'product',
    categories: ['wirelessIiot', 'dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['iiot', 'datalogger'],
    matchTerms: ['cloud', 'dashboard', 'wireless', 'logger'],
    imageSrc: unsplash('photo-1551288049-bebda4e38f71'),
    breadcrumb: ['Products', 'Software'],
  }),
  p({
    id: 'iot-7',
    sku: 'DW-WPT',
    priceLabel: '$268',
    title: 'Wireless Pressure Transmitter — battery powered',
    description:
      'Remote monitoring for filter banks and coil DP where wiring is cost-prohibitive.',
    contentType: 'product',
    categories: ['wirelessIiot', 'pressure'],
    brands: ['dwyer'],
    searchBuckets: ['iiot', 'pressure'],
    matchTerms: ['wireless', 'pressure', 'transmitter', 'battery'],
    imageSrc: unsplash('photo-1504917595217-d002cbf56fc7'),
    breadcrumb: ['Products', 'Wireless'],
  }),
  p({
    id: 'iot-8',
    title: 'Featured article: IIoT and Wireless Systems — where to start in 2026',
    description:
      'Decision tree for pilot scope: sensors first vs network first vs historian first.',
    contentType: 'featuredArticle',
    categories: ['wirelessIiot', 'dataAcquisition'],
    brands: ['omega'],
    searchBuckets: ['iiot'],
    matchTerms: ['iiot', 'wireless', 'systems', 'pilot'],
    imageSrc: unsplash('photo-1489515217757-5fd1be406fef'),
    breadcrumb: ['Learn', 'Strategy'],
  }),
  p({
    id: 'iot-9',
    title: 'Product manual: Wireless receiver pairing & security keys',
    description:
      'Factory default rotation, pairing timeout behavior, and lost-device revocation.',
    contentType: 'productManual',
    categories: ['wirelessIiot'],
    brands: ['omega'],
    searchBuckets: ['iiot'],
    matchTerms: ['pairing', 'security', 'wireless', 'manual'],
    imageSrc: unsplash('photo-1589829545856-d10d557cf95f'),
    breadcrumb: ['Support', 'Manuals'],
  }),
  p({
    id: 'iot-10',
    sku: 'RL-DA10D',
    priceLabel: '$640',
    title: 'Data Acquisition Module — edge preprocessing',
    description:
      'Scale and linearize raw counts before MQTT publish — reduces cloud ingress costs.',
    contentType: 'product',
    categories: ['dataAcquisition', 'wirelessIiot'],
    brands: ['redLion'],
    searchBuckets: ['iiot', 'datalogger'],
    matchTerms: ['edge', 'mqtt', 'acquisition', 'preprocess'],
    imageSrc: unsplash('photo-1517694712202-3dd5170e001d'),
    breadcrumb: ['Products', 'IIoT'],
  }),
  p({
    id: 'iot-11',
    sku: 'OM-WG-MESH',
    priceLabel: '$348',
    title: 'Wireless mesh repeater — extend plant coverage',
    description:
      'Self-healing mesh for Omega W-series endpoints; DIN-rail mount with diagnostics LEDs.',
    contentType: 'product',
    categories: ['wirelessIiot'],
    brands: ['omega'],
    searchBuckets: ['iiot'],
    matchTerms: ['wireless', 'mesh', 'repeater', 'iiot'],
    imageSrc: unsplash('photo-1565514020163-395f34250af5'),
    breadcrumb: ['Products', 'Wireless'],
  }),
  p({
    id: 'iot-12',
    title: 'Technical resource: OT/IT demarcation for IIoT pilots',
    description:
      'RACI matrix for firewall changes, historian ownership, and backup responsibilities.',
    contentType: 'technicalResource',
    categories: ['wirelessIiot', 'dataAcquisition'],
    brands: ['redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['iiot', 'ot', 'it', 'firewall'],
    imageSrc: unsplash('photo-1451187580459-43490279c0fa'),
    breadcrumb: ['Resources', 'Security'],
  }),
  p({
    id: 'iot-13',
    sku: 'RL-CELL-5G',
    priceLabel: '$920',
    title: 'Industrial 5G cellular router with GPS',
    description:
      'Primary or failover uplink for remote assets — GPS for fleet maps in Omega Cloud dashboards.',
    contentType: 'product',
    categories: ['wirelessIiot'],
    brands: ['redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['cellular', '5g', 'router', 'wireless'],
    imageSrc: unsplash('photo-1489515217757-5fd1be406fef'),
    isNew: true,
    breadcrumb: ['Products', 'Connectivity'],
  }),
  p({
    id: 'iot-14',
    title: 'Featured article: Wireless Systems commissioning playbook',
    description:
      'End-to-end checklist from FAT through SAT for IIoT rollouts with Red Lion gateways.',
    contentType: 'featuredArticle',
    categories: ['wirelessIiot'],
    brands: ['redLion', 'omega'],
    searchBuckets: ['iiot'],
    matchTerms: ['wireless', 'systems', 'commissioning', 'iiot'],
    imageSrc: unsplash('photo-1504328345606-18bbc8c9d7d1'),
    breadcrumb: ['Learn', 'Deployment'],
  }),
  p({
    id: 'iot-15',
    title: 'Product manual: MQTT topic design for multi-site OEMs',
    description:
      'Versioned topic trees, birth certificates, and dead-band publishing guidance.',
    contentType: 'productManual',
    categories: ['wirelessIiot', 'dataAcquisition'],
    brands: ['redLion'],
    searchBuckets: ['iiot'],
    matchTerms: ['mqtt', 'topic', 'manual', 'oem'],
    imageSrc: unsplash('photo-1589829545856-d10d557cf95f'),
    breadcrumb: ['Support', 'Developers'],
  }),
];

export const contentTypes = Object.keys(searchFacetLabels.contentType) as SearchContentType[];
export const categories = Object.keys(searchFacetLabels.category) as SearchCategory[];
export const brands = Object.keys(searchFacetLabels.brand) as SearchBrand[];

export function getDefaultCardImage(): string {
  return defaultImg;
}

function insightKey(buckets: SearchBucket[], user: DemoUserTaxonomy | null): string {
  const b = [...buckets].sort().join('|') || 'browse';
  const u = user ?? 'any';
  return `${b}::${u}`;
}

/** Mock “AI” narrative that shifts with query buckets + demo persona */
export function selectAiSearchInsight(query: string, user: DemoUserTaxonomy | null): AiSearchInsight | null {
  const n = normalizeQuery(query);
  if (n.length < 2) return null;
  const buckets = detectSearchBuckets(n);
  const key = insightKey(buckets, user);

  const pool: Record<string, AiSearchInsight> = {
    'pressure::Maintenance Engineer': {
      id: 'ai-pr-me',
      headline: 'AI suggestion — keep regulators reliable between cal windows',
      body:
        'For your role, prioritize spare soft goods and creep checks on low-flow panels. Dwyer miniature regulators respond well to documented seat torque — add a PM line item after filter replacements.',
      bullets: [
        'Stock diaphragm kits for your top three regulator SKUs',
        'Log outlet drift after inlet swings > 20%',
        'Pair field gauges with a single reference transmitter for quick triage',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Pressure products on DwyerOmega.com',
    },
    'pressure::Engineering Consultant': {
      id: 'ai-pr-ec',
      headline: 'AI suggestion — specify authority before you pick a catalog model',
      body:
        'Consulting teams win fewer callbacks when turndown and lockup are modeled against worst-case inlet decay. Consider documenting parallel PRV staging for campus steam drops.',
      bullets: [
        'Ask for droop curves at minimum fire / maximum fire',
        'Specify sensing port location relative to flow disturbances',
        'Bundle Omega transmitters when clients want 4–20 mA loop evidence',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Application engineering hub',
    },
    'pressure::Plant Technician': {
      id: 'ai-pr-pt',
      headline: 'AI suggestion — fast isolation beats guessing on hunting regulators',
      body:
        'Technicians shorten mean-time-to-repair by proving downstream demand before adjusting springs. Use a downstream bleed to verify seat leakage in under five minutes.',
      bullets: [
        'Tag both upstream and downstream isolation before spring changes',
        'Photograph dial setpoints for shift handoff',
        'Escalate if hunting persists after element replacement',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Field service resources',
    },
    'datalogger::Maintenance Engineer': {
      id: 'ai-dl-me',
      headline: 'AI suggestion — logger fleets fail on batteries, not sensors',
      body:
        'Rotate coin cells on a calendar basis and keep a one-to-one spare for mission-critical ovens. Omega OM-CP families share battery trays — simplify storeroom SKUs.',
      bullets: [
        'Export trip PDFs before clearing memory',
        'Align logger IDs with asset tags in CMMS',
        'Batch-download after PM windows to avoid USB conflicts',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Data loggers overview',
    },
    'datalogger::Engineering Consultant': {
      id: 'ai-dl-ec',
      headline: 'AI suggestion — publish an uncertainty story with every validation study',
      body:
        'Auditors ask how logger resolution maps to process tolerance. Pre-build an uncertainty appendix using channel count, sensor class, and sampling interval.',
      bullets: [
        'Prefer loggers with locked firmware revisions per protocol',
        'Document cold-junction strategy for multi-channel TC studies',
        'Pair portable DAQ with loggers for high-speed anomalies',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Metrology & DAQ',
    },
    'datalogger::Plant Technician': {
      id: 'ai-dl-pt',
      headline: 'AI suggestion — chart recorder retirements need a physical walk-down',
      bullets: [
        'Confirm TC well depth matches new logger probes',
        'Label USB ports on shared PCs for logger-only use',
        'Run a 24h parallel before decommissioning circular charts',
      ],
      body:
        'Technicians reduce rework by photographing pen arm geometry and well orientation before digital swap. Keep one legacy chart on hand for dispute resolution.',
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Logger quick starts',
    },
    'iiot::Maintenance Engineer': {
      id: 'ai-iot-me',
      headline: 'AI suggestion — treat wireless like rotating equipment',
      body:
        'Antennas and coax fatigue before radios do. Add visual inspection to rounds and keep spare whips for MCC installs with tight cable bend radius.',
      bullets: [
        'Check RSSI quarterly on border nodes',
        'Verify ground planes are not painted over',
        'Log firmware versions next to asset IDs',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Wireless accessories',
    },
    'iiot::Engineering Consultant': {
      id: 'ai-iot-ec',
      headline: 'AI suggestion — name topics before you pick hardware',
      body:
        'Sparkplug topic namespaces pay dividends when OEMs duplicate lines. Edge gateways from Red Lion pair cleanly with Omega wireless sensors for brownfield pilots.',
      bullets: [
        'Define single source of truth for tag naming',
        'Segment OT VLANs before enabling cloud routes',
        'Prototype historian retention policies on pilot lines only',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'IIoT solutions',
    },
    'iiot::Plant Technician': {
      id: 'ai-iot-pt',
      headline: 'AI suggestion — cellular swaps need a comms dry run',
      body:
        'Run ping and MQTT publish tests from maintenance bench before truck roll. Keep SIM ICCIDs in the shift log for faster carrier support calls.',
      bullets: [
        'Photo existing antenna routing before disconnect',
        'Validate APN on a hotspot before installing in panel',
        'Coordinate OT window with IT firewall changes',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Gateway manuals',
    },
  };

  // Multi-bucket queries: merge first matching bucket priority pressure > datalogger > iiot
  const order: SearchBucket[] = ['pressure', 'datalogger', 'iiot'];
  for (const b of order) {
    if (buckets.includes(b)) {
      const singleKey = `${b}::${user ?? 'any'}`;
      if (pool[singleKey]) return pool[singleKey];
    }
  }

  // Generic fallback when keywords match but no persona-specific block
  if (buckets.includes('pressure')) {
    return (
      pool[`pressure::${user ?? 'any'}`] ?? {
        id: 'ai-pr-gen',
        headline: 'AI suggestion — narrow to application before comparing models',
        body:
          'Pressure regulation performance depends on media, droop tolerance, and sensing location. Use category filters for Pressure & valves, then compare diaphragm vs piston families.',
        bullets: [
          'Filter to regulators first, then add transmitters for closed-loop evidence',
          'Open manuals for torque and startup sequences',
          'Save articles to share with operations on hunting issues',
        ],
        learnMoreHref: DWYER_OMEGA_BASE,
        learnMoreLabel: 'Explore pressure',
      }
    );
  }
  if (buckets.includes('datalogger')) {
    return (
      pool[`datalogger::${user ?? 'any'}`] ?? {
        id: 'ai-dl-gen',
        headline: 'AI suggestion — match logger memory to trip length',
        body:
          'Sampling rate × channel count drives memory. For validation, prefer loggers with locked configurations and PDF trip reports for auditors.',
        bullets: ['Use Technical resources for software alarming', 'Download manuals for IT/driver installs'],
        learnMoreHref: DWYER_OMEGA_BASE,
        learnMoreLabel: 'Data acquisition',
      }
    );
  }
  if (buckets.includes('iiot')) {
    return (
      pool[`iiot::${user ?? 'any'}`] ?? {
        id: 'ai-iot-gen',
        headline: 'AI suggestion — prove the network before scaling sensors',
        body:
          'Pilot IIoT with one line, one gateway, and historian retention policy. Omega wireless layers plus Red Lion gateways are a common brownfield stack.',
        bullets: ['Survey RSSI early', 'Publish read-only PLC topics first', 'Document security key rotation'],
        learnMoreHref: DWYER_OMEGA_BASE,
        learnMoreLabel: 'Wireless & IIoT',
      }
    );
  }

  // Keyword search without bucket: lightweight assistant
  if (n.length >= 3) {
    const generic: AiSearchInsight = {
      id: `ai-gen-${key}`,
      headline: 'AI suggestion — refine with categories on the left',
      body:
        'Try popular terms like “Pressure regulators”, “Data loggers”, or “IIoT and Wireless Systems” to load curated mixes of products, articles, manuals, and technical PDFs.',
      bullets: [
        'Combine Content type filters with Product family for faster triage',
        'Demo user switcher changes personalized rows and AI tips',
      ],
      learnMoreHref: DWYER_OMEGA_BASE,
      learnMoreLabel: 'Visit DwyerOmega.com',
    };
    return generic;
  }

  return null;
}

export function itemMetadataLine(item: SearchResultItem): string {
  const type = searchFacetLabels.contentType[item.contentType];
  const when = item.dateLabel ?? (item.contentType === 'product' ? 'In stock' : 'Resource');
  const trail = item.breadcrumb?.length ? item.breadcrumb.join(' · ') : '';
  const sku = item.sku ? `SKU ${item.sku}` : '';
  const bits = [type, when, sku, trail].filter(Boolean);
  return bits.join(' · ');
}
