/**
 * Mock search catalog for Rockland Trust demo search.
 * Data only - UI lives in SearchResults.tsx.
 */

import {
  type DemoUserTaxonomy,
  getPersonaCode,
  parseDemoUserTaxonomy,
} from '@/lib/demo-taxonomy';

export type { DemoUserTaxonomy };
export { parseDemoUserTaxonomy };

export type SearchContentType = 'product' | 'blog' | 'service' | 'content';

/** Left-rail facet: Builder FirstSource area of need */
export type SearchCategory =
  | 'buildingMaterials'
  | 'windowsDoorsMillwork'
  | 'manufacturedComponents'
  | 'digitalTools'
  | 'builderServices'
  | 'resources';

/** Brand / solution family facet */
export type SearchBrand = 'buildersFirstSource' | 'mybldr' | 'readyFrame' | 'designUltra';

/** Keyword buckets for curated searches */
export type SearchBucket =
  | 'products'
  | 'services'
  | 'mybldr'
  | 'windows'
  | 'readyFrame'
  | 'advancedManufacturing';

export type SearchResultItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  contentType: SearchContentType;
  categories: SearchCategory[];
  brands: SearchBrand[];
  searchBuckets: SearchBucket[];
  dateLabel?: string;
  breadcrumb?: string[];
  matchTerms?: string[];
  imageSrc?: string;
  isNew?: boolean;
  demoUserTaxonomy?: DemoUserTaxonomy;
  visibleForDemoUsers?: DemoUserTaxonomy[];
  sku?: string;
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

export const BLDR_BASE = 'https://www.bldr.com/';

export const RESULTS_PAGE_SIZE = 9;

export const searchFacetLabels = {
  contentType: {
    product: 'Products',
    blog: 'Blogs',
    service: 'Services',
    content: 'Content',
  },
  category: {
    buildingMaterials: 'Building materials',
    windowsDoorsMillwork: 'Windows, doors & millwork',
    manufacturedComponents: 'Manufactured components',
    digitalTools: 'Digital tools',
    builderServices: 'Builder services',
    resources: 'Resources & insights',
  },
  brand: {
    buildersFirstSource: 'Builders FirstSource',
    mybldr: 'myBLDR',
    readyFrame: 'READY-FRAME',
    designUltra: 'Design Ultra',
  },
} as const;

export const popularSearches = [
  'myBLDR',
  'READY-FRAME',
  'Premium Windows',
  'Advanced Manufacturing',
  'Custom Builder Services',
];

export const QUERY_BUCKET_SYNONYMS: Record<SearchBucket, readonly string[]> = {
  products: [
    'product',
    'products',
    'materials',
    'lumber',
    'roofing',
    'siding',
    'decking',
    'doors',
    'trusses',
    'cabinets',
    'drywall',
    'hardware',
    'insulation',
    'tools',
  ],
  services: [
    'service',
    'services',
    'delivery',
    'pickup',
    'support',
    'installed',
    'credit',
    'drafting',
    'remodel',
    'multifamily',
    'multi-family',
    'showroom',
  ],
  mybldr: ['mybldr', 'portal', 'digital', 'platform', 'project', 'projects', 'schedule', 'budget', 'materials'],
  windows: ['window', 'windows', 'door', 'doors', 'millwork', 'moulding', 'premium'],
  readyFrame: ['ready-frame', 'readyframe', 'frame', 'framing', 'pre-cut', 'smart-bundled', 'labeled'],
  advancedManufacturing: [
    'advanced',
    'manufacturing',
    'components',
    'truss',
    'trusses',
    'ewp',
    'robotic',
    'automation',
    'modular',
  ],
};

const QUERY_STOP_WORDS = new Set(['and', 'or', 'the', 'for', 'with', 'from', 'your', 'our', 'are', 'you']);

const CONSTRUCTION_PHOTO_IDS: readonly string[] = [
  '1503387762-592deb58ef4e',
  '1504307651254-35680f356dfd',
  '1486406146926-c627a92ad1ab',
  '1600585154340-be6161a56a0c',
  '1581094794329-c8112a89af12',
  '1517581177682-a085bb7ffb38',
  '1504917595217-d4dc5ebe6122',
  '1500530855697-b586d89ba3ee',
  '1570129477492-45c003edd2be',
  '1560518883-ce09059eeffa',
  '1518005020951-eccb494ad742',
  '1583608205776-bfd35f0d9f83',
];

function buildCatalogImageUrl(id: string): string {
  return `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`;
}

function catalogDemoImage(slot: number): string {
  const len = CONSTRUCTION_PHOTO_IDS.length;
  const id = CONSTRUCTION_PHOTO_IDS[((slot % len) + len) % len]!;
  return buildCatalogImageUrl(id);
}

export function getDefaultCardImage(): string {
  return catalogDemoImage(0);
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
  if (buckets.length && !itemMatchesBuckets(item, buckets)) return false;
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
  if (buckets.length) return words.some((w) => hay.includes(w));
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
  if (activeDemoUserTaxonomy && item.demoUserTaxonomy === activeDemoUserTaxonomy) score += 25;
  for (const b of detectSearchBuckets(n)) {
    if (item.searchBuckets.includes(b)) score += 8;
  }
  return score;
}

export function supplementalResultsForDemoUserTaxonomy(persona: DemoUserTaxonomy): SearchResultItem[] {
  const code = getPersonaCode(persona);
  const rocklandBase = 'https://www.rocklandtrust.com/';

  const rowsByPersona: Record<
    DemoUserTaxonomy,
    Omit<SearchResultItem, 'id' | 'demoUserTaxonomy'>[]
  > = {
    'Young Professional': [
      {
        title: 'Advantage Checking for early-career banking',
        description:
          'A checking option for professionals balancing direct deposit, digital tools, and everyday spending with fewer fees.',
        href: `${rocklandBase}personal/banking/checking-products/advantage-checking`,
        contentType: 'service',
        categories: ['builderServices', 'digitalTools'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services', 'mybldr'],
        dateLabel: 'Personalized checking',
        breadcrumb: ['Personal', 'Checking', 'Advantage Checking'],
        matchTerms: ['young professional', 'checking', 'direct deposit', 'everyday banking'],
        imageSrc: catalogDemoImage(0),
        isNew: true,
      },
      {
        title: 'Online & Mobile Banking for on-the-go account control',
        description:
          'Manage balances, transfers, and alerts from your phone — built for customers who bank between meetings and commutes.',
        href: `${rocklandBase}personal/services/online-and-mobile-banking`,
        contentType: 'content',
        categories: ['digitalTools'],
        brands: ['mybldr'],
        searchBuckets: ['mybldr', 'services'],
        dateLabel: 'Digital banking',
        breadcrumb: ['Personal', 'Services', 'Online & Mobile Banking'],
        matchTerms: ['mobile banking', 'online banking', 'alerts', 'transfers'],
        imageSrc: catalogDemoImage(1),
      },
    ],
    'First-Time Homebuyer': [
      {
        title: 'First-time homebuyer guidance and mortgage programs',
        description:
          'Resources for buyers navigating pre-approval, down payment planning, and choosing the right mortgage product.',
        href: `${rocklandBase}personal/loans/mortgage-products/first-time-homebuyers`,
        contentType: 'content',
        categories: ['resources', 'builderServices'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services', 'products'],
        dateLabel: 'Homebuyer guide',
        breadcrumb: ['Personal', 'Loans', 'First-Time Homebuyers'],
        matchTerms: ['first-time homebuyer', 'mortgage', 'pre-approval', 'down payment'],
        imageSrc: catalogDemoImage(2),
        isNew: true,
      },
      {
        title: 'Home loan pre-approval to shop with confidence',
        description:
          'Understand borrowing power before you tour homes and make offers in competitive Massachusetts and Rhode Island markets.',
        href: `${rocklandBase}personal/loans/mortgage-products/home-loan-pre-approval`,
        contentType: 'service',
        categories: ['builderServices'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services'],
        dateLabel: 'Mortgage service',
        breadcrumb: ['Personal', 'Loans', 'Pre-Approval'],
        matchTerms: ['pre-approval', 'home loan', 'first home', 'mortgage rates'],
        imageSrc: catalogDemoImage(3),
      },
    ],
    'Growing Family': [
      {
        title: 'Savings and money market options for family goals',
        description:
          'Compare savings, CDs, and money market accounts for emergency funds, education, and long-term family planning.',
        href: `${rocklandBase}personal/banking/savings-products`,
        contentType: 'service',
        categories: ['buildingMaterials', 'resources'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['products', 'services'],
        dateLabel: 'Family savings',
        breadcrumb: ['Personal', 'Banking', 'Savings Products'],
        matchTerms: ['growing family', 'savings', 'money market', 'cds', 'education'],
        imageSrc: catalogDemoImage(4),
        isNew: true,
      },
      {
        title: 'Home equity lines and loans for renovation or tuition',
        description:
          'Tap home equity for kitchen upgrades, room additions, or tuition with guidance from Rockland Trust lending specialists.',
        href: `${rocklandBase}personal/loans/home-equity-products`,
        contentType: 'service',
        categories: ['builderServices'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services', 'products'],
        dateLabel: 'Home equity',
        breadcrumb: ['Personal', 'Loans', 'Home Equity'],
        matchTerms: ['home equity', 'heloc', 'renovation', 'family', 'tuition'],
        imageSrc: catalogDemoImage(5),
      },
    ],
    'Small Business Owner': [
      {
        title: 'Business checking built for owner-operators',
        description:
          'Business banking accounts with tools for deposits, payments, and cash flow visibility for small and mid-sized companies.',
        href: `${rocklandBase}business/banking/business-checking`,
        contentType: 'service',
        categories: ['builderServices'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services'],
        dateLabel: 'Business banking',
        breadcrumb: ['Business', 'Banking', 'Business Checking'],
        matchTerms: ['small business', 'business checking', 'cash flow', 'owner'],
        imageSrc: catalogDemoImage(6),
        isNew: true,
      },
      {
        title: 'Business credit cards and treasury support',
        description:
          'Separate business spending, manage payables, and explore treasury services as your company scales.',
        href: `${rocklandBase}business/banking/business-credit-cards`,
        contentType: 'service',
        categories: ['builderServices', 'digitalTools'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services', 'mybldr'],
        dateLabel: 'Business credit',
        breadcrumb: ['Business', 'Banking', 'Credit Cards'],
        matchTerms: ['business credit card', 'treasury', 'payables', 'small business owner'],
        imageSrc: catalogDemoImage(7),
      },
    ],
    'Digital-First Consumer': [
      {
        title: 'Rockland Trust mobile app: banking in your pocket',
        description:
          'Deposit checks, pay bills, and monitor accounts with biometric login and real-time alerts — no branch visit required.',
        href: `${rocklandBase}personal/services/online-and-mobile-banking`,
        contentType: 'content',
        categories: ['digitalTools'],
        brands: ['mybldr'],
        searchBuckets: ['mybldr', 'services'],
        dateLabel: 'Mobile app',
        breadcrumb: ['Personal', 'Services', 'Mobile Banking'],
        matchTerms: ['digital-first', 'mobile app', 'biometric', 'alerts', 'remote deposit'],
        imageSrc: catalogDemoImage(8),
        isNew: true,
      },
      {
        title: 'Rockland Complete Checking with digital perks',
        description:
          'A checking package for customers who prefer self-service tools, fee rebates, and integrated money management.',
        href: `${rocklandBase}personal/banking/checking-products/rockland-complete-checking`,
        contentType: 'service',
        categories: ['digitalTools', 'builderServices'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['mybldr', 'services'],
        dateLabel: 'Digital checking',
        breadcrumb: ['Personal', 'Checking', 'Rockland Complete'],
        matchTerms: ['digital consumer', 'complete checking', 'self-service', 'online'],
        imageSrc: catalogDemoImage(9),
      },
    ],
    'College Student': [
      {
        title: 'Free Student Checking with no monthly maintenance fee',
        description:
          'Student-friendly checking with mobile tools, debit card access, and budgeting features while you are in school.',
        href: `${rocklandBase}personal/banking/checking-products/free-student-checking`,
        contentType: 'service',
        categories: ['builderServices', 'digitalTools'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services', 'mybldr'],
        dateLabel: 'Student checking',
        breadcrumb: ['Personal', 'Checking', 'Free Student Checking'],
        matchTerms: ['college student', 'student checking', 'no fee', 'campus banking'],
        imageSrc: catalogDemoImage(10),
        isNew: true,
      },
      {
        title: 'NH Student Loans and education financing resources',
        description:
          'Explore student loan options, repayment guidance, and tools to compare borrowing before the semester starts.',
        href: `${rocklandBase}personal/services/nh-student-loans`,
        contentType: 'content',
        categories: ['resources'],
        brands: ['buildersFirstSource'],
        searchBuckets: ['services', 'products'],
        dateLabel: 'Student loans',
        breadcrumb: ['Personal', 'Services', 'NH Student Loans'],
        matchTerms: ['student loans', 'college', 'education financing', 'repayment'],
        imageSrc: catalogDemoImage(11),
      },
    ],
  };

  return rowsByPersona[persona].map((row, i) => ({
    ...row,
    id: `demo-sup-${code}-${i + 1}`,
    demoUserTaxonomy: persona,
  }));
}

function result(partial: Omit<SearchResultItem, 'href'> & { href?: string }): SearchResultItem {
  return {
    href: partial.href ?? BLDR_BASE,
    imageSrc: partial.imageSrc ?? catalogDemoImage(6),
    ...partial,
  };
}

export const searchCatalog: SearchResultItem[] = [
  result({
    id: 'content-home-local-expertise',
    title: 'Local expertise. Available nationwide.',
    description:
      'Builders FirstSource is the nation’s largest supplier of structural building products, value-added components, and services for professional construction markets.',
    contentType: 'content',
    categories: ['resources', 'builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'products'],
    dateLabel: 'Company overview',
    breadcrumb: ['Home', 'Who BFS serves'],
    matchTerms: ['locations', 'states', 'team members', 'local expertise', 'nationwide'],
    imageSrc: catalogDemoImage(7),
  }),
  result({
    id: 'content-mybldr-home',
    title: 'Say hello to myBLDR',
    description:
      'myBLDR connects front-end design and sales processes with material procurement all the way through build completion.',
    href: `${BLDR_BASE}digital-tools/mybldr`,
    contentType: 'content',
    categories: ['digitalTools'],
    brands: ['mybldr'],
    searchBuckets: ['mybldr', 'services'],
    dateLabel: 'Digital solution',
    breadcrumb: ['Digital Solutions', 'myBLDR'],
    matchTerms: ['myBLDR', 'homebuilders', 'project management', 'materials', 'procurement'],
    imageSrc: catalogDemoImage(8),
    isNew: true,
  }),
  result({
    id: 'content-mybldr-projects',
    title: 'myBLDR Projects: plans, selections, schedules, and budgets',
    description:
      'A central repository for managing multiple projects with document storage, homebuyer selections, schedules, budgets, and access control.',
    href: `${BLDR_BASE}digital-tools/mybldr`,
    contentType: 'content',
    categories: ['digitalTools'],
    brands: ['mybldr'],
    searchBuckets: ['mybldr'],
    dateLabel: 'Portal feature',
    breadcrumb: ['myBLDR', 'Projects'],
    matchTerms: ['projects', 'plans', 'selections', 'schedules', 'budgets', 'access control'],
    imageSrc: catalogDemoImage(9),
  }),
  result({
    id: 'content-mybldr-materials',
    title: 'myBLDR Materials: quotes, orders, and delivery tracking',
    description:
      'Receive quote quantities and prices, submit purchase orders, request delivery dates, and view delivered product photos.',
    href: `${BLDR_BASE}digital-tools/mybldr`,
    contentType: 'content',
    categories: ['digitalTools', 'buildingMaterials'],
    brands: ['mybldr', 'buildersFirstSource'],
    searchBuckets: ['mybldr', 'products'],
    dateLabel: 'Portal feature',
    breadcrumb: ['myBLDR', 'Materials'],
    matchTerms: ['materials', 'quotes', 'orders', 'purchase orders', 'delivery', 'photos'],
    imageSrc: catalogDemoImage(10),
  }),
  result({
    id: 'content-mybldr-3d',
    title: 'myBLDR advanced 3D technology',
    description:
      'Turn 2D plans into accurate 3D visualizations to improve design, planning, collaboration, and change-order control.',
    href: `${BLDR_BASE}digital-tools/mybldr`,
    contentType: 'content',
    categories: ['digitalTools', 'resources'],
    brands: ['mybldr'],
    searchBuckets: ['mybldr'],
    dateLabel: 'Digital feature',
    breadcrumb: ['myBLDR', '3D Technology'],
    matchTerms: ['3D', 'visualization', '2D plans', 'design', 'planning', 'change orders'],
    imageSrc: catalogDemoImage(11),
  }),

  result({
    id: 'product-windows',
    title: 'Windows',
    description:
      'Premium windows backed by product expertise and support to help builders enhance their projects.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['windowsDoorsMillwork'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products', 'windows'],
    priceLabel: 'Local availability',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Windows'],
    matchTerms: ['windows', 'premium windows', 'fenestration'],
    imageSrc: catalogDemoImage(0),
  }),
  result({
    id: 'product-millwork',
    title: 'Moulding & Millwork',
    description:
      'Millwork experts support straightforward and complex projects, bringing builder and homeowner vision to life.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['windowsDoorsMillwork'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products', 'windows'],
    priceLabel: 'Contact local store',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Moulding & Millwork'],
    matchTerms: ['moulding', 'millwork', 'trim', 'custom millwork'],
    imageSrc: catalogDemoImage(1),
  }),
  result({
    id: 'product-doors',
    title: 'Doors',
    description:
      'Interior and exterior door solutions supported by window and door specialists and local product availability.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['windowsDoorsMillwork'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products', 'windows'],
    priceLabel: 'Local availability',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Doors'],
    matchTerms: ['doors', 'exterior doors', 'interior doors', 'door specialists'],
    imageSrc: catalogDemoImage(2),
  }),
  result({
    id: 'product-lumber',
    title: 'Lumber',
    description:
      'Core structural building materials for professional builders, contractors, repair, and remodeling projects.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products'],
    priceLabel: 'Request quote',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Lumber'],
    matchTerms: ['lumber', 'framing lumber', 'structural materials'],
    imageSrc: catalogDemoImage(3),
  }),
  result({
    id: 'product-ready-frame',
    title: 'READY-FRAME pre-cut framing packages',
    description:
      'Computerized pre-cut framing lumber packages arrive Smart-Bundled and labeled to increase speed, decrease labor, and reduce waste.',
    href: BLDR_BASE,
    contentType: 'product',
    categories: ['manufacturedComponents', 'buildingMaterials'],
    brands: ['readyFrame', 'buildersFirstSource'],
    searchBuckets: ['products', 'readyFrame', 'advancedManufacturing'],
    priceLabel: 'Request quote',
    dateLabel: 'Featured product',
    breadcrumb: ['Products', 'READY-FRAME'],
    matchTerms: ['READY-FRAME', 'pre-cut', 'framing', 'smart-bundled', 'labeled', 'waste'],
    imageSrc: catalogDemoImage(4),
    isNew: true,
  }),
  result({
    id: 'product-manufactured-components',
    title: 'Manufactured Components',
    description:
      'Components from innovative manufacturing facilities help boost jobsite efficiency and consistency.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['manufacturedComponents'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products', 'advancedManufacturing'],
    priceLabel: 'Request quote',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Manufactured Components'],
    matchTerms: ['manufactured components', 'components', 'jobsite efficiency'],
    imageSrc: catalogDemoImage(5),
  }),
  result({
    id: 'product-trusses',
    title: 'Trusses',
    description:
      'Roof and floor truss solutions that pair with design services and advanced component manufacturing.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['manufacturedComponents'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products', 'advancedManufacturing'],
    priceLabel: 'Local availability',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Trusses'],
    matchTerms: ['trusses', 'roof trusses', 'floor trusses', 'components'],
    imageSrc: catalogDemoImage(6),
  }),
  result({
    id: 'product-siding-exterior',
    title: 'Siding & Exterior Building Materials',
    description:
      'Exterior material categories for builders coordinating envelope, curb appeal, and durability decisions.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products'],
    priceLabel: 'Local availability',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Siding & Exterior Building Materials'],
    matchTerms: ['siding', 'exterior', 'building materials'],
    imageSrc: catalogDemoImage(7),
  }),
  result({
    id: 'product-cabinets-countertops',
    title: 'Cabinets & Countertops',
    description:
      'Interior finish products for builders and remodelers coordinating selections and homeowner expectations.',
    href: `${BLDR_BASE}products`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['buildersFirstSource', 'designUltra'],
    searchBuckets: ['products'],
    priceLabel: 'Local availability',
    dateLabel: 'Product category',
    breadcrumb: ['Products', 'Cabinets & Countertops'],
    matchTerms: ['cabinets', 'countertops', 'selections', 'interior'],
    imageSrc: catalogDemoImage(8),
  }),

  result({
    id: 'service-mybldr-customer-portal',
    title: 'myBLDR Customer Portal',
    description:
      'Digital portal services for homebuilders to manage projects, documents, materials, schedules, budgets, and crews.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['digitalTools', 'builderServices'],
    brands: ['mybldr'],
    searchBuckets: ['services', 'mybldr'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'myBLDR Customer Portal'],
    matchTerms: ['customer portal', 'myBLDR', 'projects', 'documents', 'schedule', 'budget'],
    imageSrc: catalogDemoImage(9),
  }),
  result({
    id: 'service-custom-builder',
    title: 'Custom Builder Services',
    description:
      'Quality products, expertise, and custom solutions for builders whose projects demand a higher level of coordination.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['builderServices', 'windowsDoorsMillwork'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'windows'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Custom Builder Services'],
    matchTerms: ['custom builder', 'quality products', 'expertise', 'custom solutions'],
    imageSrc: catalogDemoImage(10),
  }),
  result({
    id: 'service-truss-ewp-design',
    title: 'Truss and EWP Design',
    description:
      'Design support for structural systems that helps builders coordinate engineered wood products and component packages.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['manufacturedComponents', 'builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'advancedManufacturing'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Truss and EWP Design'],
    matchTerms: ['truss', 'EWP', 'design', 'engineered wood'],
    imageSrc: catalogDemoImage(11),
  }),
  result({
    id: 'service-installed-services',
    title: 'Installed Services',
    description:
      'Construction services that help busy builders and contractors save time and resources in daily operations.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Installed Services'],
    matchTerms: ['installed services', 'contractors', 'save time', 'operations'],
    imageSrc: catalogDemoImage(0),
  }),
  result({
    id: 'service-delivery-pickup',
    title: 'Delivery and Pick-Up',
    description:
      'Local service support for coordinating jobsite material movement and helping projects finish on time.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['builderServices', 'buildingMaterials'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'products'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Delivery and Pick-Up'],
    matchTerms: ['delivery', 'pickup', 'jobsite', 'materials'],
    imageSrc: catalogDemoImage(1),
  }),
  result({
    id: 'service-advanced-manufacturing',
    title: 'Advanced Manufacturing',
    description:
      'Advanced design, manufacturing, and operations solutions combine with a nationwide distribution network.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['manufacturedComponents', 'builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'advancedManufacturing'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Advanced Manufacturing'],
    matchTerms: ['advanced manufacturing', 'design', 'operations', 'distribution'],
    imageSrc: catalogDemoImage(2),
    isNew: true,
  }),
  result({
    id: 'service-dedicated-support',
    title: 'Dedicated Support',
    description:
      'Builders FirstSource support connects customers with sales representatives to keep jobs on time and within budget.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Dedicated Support'],
    matchTerms: ['dedicated support', 'sales representative', 'on time', 'budget'],
    imageSrc: catalogDemoImage(3),
  }),
  result({
    id: 'service-modular-construction',
    title: 'Modular Construction',
    description:
      'Service category for builders exploring more repeatable construction approaches and coordinated material programs.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['builderServices', 'manufacturedComponents'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'advancedManufacturing'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Modular Construction'],
    matchTerms: ['modular construction', 'repeatable', 'enterprise builder'],
    imageSrc: catalogDemoImage(4),
  }),
  result({
    id: 'service-credit',
    title: 'Credit',
    description:
      'Credit services listed by Builders FirstSource to support builder purchasing and project material needs.',
    href: `${BLDR_BASE}services`,
    contentType: 'service',
    categories: ['builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Service',
    breadcrumb: ['Services', 'Credit'],
    matchTerms: ['credit', 'purchasing', 'builder purchasing'],
    imageSrc: catalogDemoImage(5),
  }),

  result({
    id: 'blog-premium-windows',
    title: 'Premium windows. Trusted expertise.',
    description:
      'Partner with the pros in premium windows to enhance builds with the service and support builders expect.',
    href: BLDR_BASE,
    contentType: 'blog',
    categories: ['windowsDoorsMillwork', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['windows', 'products'],
    dateLabel: 'Featured story',
    breadcrumb: ['Home', 'Premium Windows'],
    matchTerms: ['premium windows', 'expertise', 'window specialists'],
    imageSrc: catalogDemoImage(6),
  }),
  result({
    id: 'blog-challenge-accepted',
    title: 'Challenge accepted. Solution delivered.',
    description:
      'Innovative manufacturing facilities create components to boost jobsite efficiency for professional builders.',
    href: BLDR_BASE,
    contentType: 'blog',
    categories: ['manufacturedComponents', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['advancedManufacturing'],
    dateLabel: 'Featured story',
    breadcrumb: ['Home', 'Advanced Manufacturing'],
    matchTerms: ['challenge accepted', 'solution delivered', 'jobsite efficiency', 'components'],
    imageSrc: catalogDemoImage(7),
  }),
  result({
    id: 'blog-cutting-edge-technology',
    title: 'Cutting-edge technology and robotic automation',
    description:
      'Builders FirstSource uses robotic automation to stay ahead of the curve in component manufacturing.',
    href: BLDR_BASE,
    contentType: 'blog',
    categories: ['manufacturedComponents', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['advancedManufacturing'],
    dateLabel: 'Video story',
    breadcrumb: ['Home', 'Cutting-Edge Technology'],
    matchTerms: ['robotic automation', 'technology', 'component manufacturing', 'video'],
    imageSrc: catalogDemoImage(8),
  }),
  result({
    id: 'blog-build-greener',
    title: 'Build greener with manufactured framing components',
    description:
      'BFS manufactured framing components and READY-FRAME packages help reduce lumber waste compared with traditional stick framing.',
    href: BLDR_BASE,
    contentType: 'blog',
    categories: ['manufacturedComponents', 'resources'],
    brands: ['readyFrame', 'buildersFirstSource'],
    searchBuckets: ['readyFrame', 'advancedManufacturing'],
    dateLabel: 'Sustainability content',
    breadcrumb: ['Home', 'Build Greener With Us'],
    matchTerms: ['sustainability', 'trees saved', 'framing components', 'lumber reduction', 'READY-FRAME'],
    imageSrc: catalogDemoImage(9),
  }),
  result({
    id: 'blog-composite-decking',
    title: 'Why composite decking is getting better and more popular',
    description:
      'Outdoor living trends and composite decking options that support remodeling and exterior design decisions.',
    href: `${BLDR_BASE}products`,
    contentType: 'blog',
    categories: ['buildingMaterials', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products'],
    dateLabel: 'Related article',
    breadcrumb: ['Products', 'Related Articles'],
    matchTerms: ['composite decking', 'decking', 'outdoor spaces', 'remodeling'],
    imageSrc: catalogDemoImage(10),
  }),
  result({
    id: 'blog-sustainable-materials',
    title: 'Why sustainable building materials are growing in popularity',
    description:
      'Construction demand is increasing for eco-friendly materials that minimize impact while maintaining performance and durability.',
    href: `${BLDR_BASE}products`,
    contentType: 'blog',
    categories: ['buildingMaterials', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products'],
    dateLabel: 'Related article',
    breadcrumb: ['Products', 'Related Articles'],
    matchTerms: ['sustainable building materials', 'eco-friendly', 'durability', 'performance'],
    imageSrc: catalogDemoImage(11),
  }),
  result({
    id: 'content-driven-transform',
    title: 'Driven to transform homebuilding',
    description:
      'Innovative solutions, extensive resources, and industry-leading service combine to help builders operate more efficiently.',
    href: BLDR_BASE,
    contentType: 'content',
    categories: ['resources', 'builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'advancedManufacturing'],
    dateLabel: 'Homepage content',
    breadcrumb: ['Home', 'Driven to Transform Homebuilding'],
    matchTerms: ['innovative solutions', 'resources', 'industry-leading service', 'homebuilding'],
    imageSrc: catalogDemoImage(0),
  }),
  result({
    id: 'content-products-overview',
    title: 'Our products: add a level to your expectations',
    description:
      'BFS offers thousands of products from leading brands with expert sales staff to guide selection; availability varies by location.',
    href: `${BLDR_BASE}products`,
    contentType: 'content',
    categories: ['buildingMaterials'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products'],
    dateLabel: 'Product overview',
    breadcrumb: ['Products', 'Overview'],
    matchTerms: ['thousands of products', 'leading brands', 'expert sales staff', 'availability'],
    imageSrc: catalogDemoImage(1),
  }),
  result({
    id: 'content-services-overview',
    title: 'Our services: service you can count on',
    description:
      'BFS construction services help busy builders and contractors save valuable time and resources with technology and innovation.',
    href: `${BLDR_BASE}services`,
    contentType: 'content',
    categories: ['builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Service overview',
    breadcrumb: ['Services', 'Overview'],
    matchTerms: ['service you can count on', 'construction services', 'save time', 'technology', 'innovation'],
    imageSrc: catalogDemoImage(2),
  }),
];

export const contentTypes = Object.keys(searchFacetLabels.contentType) as SearchContentType[];
export const categories = Object.keys(searchFacetLabels.category) as SearchCategory[];
export const brands = Object.keys(searchFacetLabels.brand) as SearchBrand[];

function insightKey(buckets: SearchBucket[], user: DemoUserTaxonomy | null): string {
  const b = [...buckets].sort().join('|') || 'browse';
  const u = user ?? 'any';
  return `${b}::${u}`;
}

export function selectAiSearchInsight(query: string, user: DemoUserTaxonomy | null): AiSearchInsight | null {
  const n = normalizeQuery(query);
  if (n.length < 2) return null;
  const buckets = detectSearchBuckets(n);
  const key = insightKey(buckets, user);

  const personaHint: Record<DemoUserTaxonomy, string> = {
    'Young Professional':
      'Prioritize checking, direct deposit, and mobile tools that fit an early-career schedule.',
    'First-Time Homebuyer':
      'Start with pre-approval, first-time buyer programs, and mortgage education before you shop.',
    'Growing Family':
      'Compare savings, CDs, and home equity options that support household and education goals.',
    'Small Business Owner':
      'Look for business checking, credit, and treasury services that scale with your company.',
    'Digital-First Consumer':
      'Favor mobile banking, alerts, and self-service account tools over branch-only workflows.',
    'College Student':
      'Focus on no-fee student checking, debit access, and education loan resources.',
  };

  const personaGuidance = user ? personaHint[user] : 'Use facets to compare products, services, blogs, and content by need.';

  if (buckets.includes('mybldr')) {
    return {
      id: `ai-mybldr-${key}`,
      headline: 'AI suggestion - start with myBLDR project coordination',
      body:
        'myBLDR is positioned as a digital homebuilding platform that connects design, sales, material procurement, and build completion.',
      bullets: [
        personaGuidance,
        'Review Projects for plans, selections, schedules, budgets, and access control',
        'Open Materials when the goal is quotes, purchase orders, delivery dates, and fulfillment photos',
      ],
      learnMoreHref: `${BLDR_BASE}digital-tools/mybldr`,
      learnMoreLabel: 'Explore myBLDR',
    };
  }

  if (buckets.includes('readyFrame') || buckets.includes('advancedManufacturing')) {
    return {
      id: `ai-manufacturing-${key}`,
      headline: 'AI suggestion - compare componentized building options',
      body:
        'READY-FRAME and advanced manufacturing content are strong matches when the search goal is jobsite efficiency, reduced labor, and repeatable production.',
      bullets: [
        personaGuidance,
        'Filter to Manufactured components for READY-FRAME, trusses, and design services',
        'Pair product results with service results like Truss and EWP Design or Advanced Manufacturing',
      ],
      learnMoreHref: BLDR_BASE,
      learnMoreLabel: 'View advanced manufacturing content',
    };
  }

  if (buckets.includes('windows')) {
    return {
      id: `ai-windows-${key}`,
      headline: 'AI suggestion - combine products with specialist services',
      body:
        'Window, door, and millwork searches should include both product categories and service support from specialists or custom millwork teams.',
      bullets: [
        personaGuidance,
        'Use Windows, Doors, and Moulding & Millwork product results for category discovery',
        'Add Custom Builder Services or Window and Door Specialists for project support',
      ],
      learnMoreHref: `${BLDR_BASE}products`,
      learnMoreLabel: 'Browse products',
    };
  }

  if (buckets.includes('services')) {
    return {
      id: `ai-services-${key}`,
      headline: 'AI suggestion - map the service to the build stage',
      body:
        'BFS services span delivery, support, design, installed services, multi-family, modular construction, credit, and digital portal workflows.',
      bullets: [
        personaGuidance,
        'Use Builder services for operations and support needs',
        'Use Digital tools when the need includes project, schedule, budget, or procurement coordination',
      ],
      learnMoreHref: `${BLDR_BASE}services`,
      learnMoreLabel: 'View services',
    };
  }

  if (buckets.includes('products')) {
    return {
      id: `ai-products-${key}`,
      headline: 'AI suggestion - confirm local availability early',
      body:
        'BFS product availability can vary by location, so product discovery should be followed by local store or quote validation.',
      bullets: [
        personaGuidance,
        'Filter by Building materials for lumber, roofing, siding, drywall, tools, and exterior products',
        'Filter by Windows, doors & millwork for premium window and finish categories',
      ],
      learnMoreHref: `${BLDR_BASE}products`,
      learnMoreLabel: 'View products',
    };
  }

  return {
    id: `ai-gen-${key}`,
    headline: 'AI suggestion - refine by products, services, blogs, or content',
    body:
      'This Rockland Trust mock catalog combines personal and business banking products, services, learning content, and persona-tailored recommendations.',
    bullets: [
      'Try popular searches such as myBLDR, READY-FRAME, Premium Windows, or Advanced Manufacturing',
      'Switch the demo persona to personalize result ordering and supplemental rows',
    ],
    learnMoreHref: BLDR_BASE,
    learnMoreLabel: 'Visit bldr.com',
  };
}

export function itemMetadataLine(item: SearchResultItem): string {
  const type = searchFacetLabels.contentType[item.contentType];
  const when = item.dateLabel ?? (item.contentType === 'product' ? 'Product category' : 'Resource');
  const trail = item.breadcrumb?.length ? item.breadcrumb.join(' · ') : '';
  const sku = item.sku ? `SKU ${item.sku}` : '';
  const bits = [type, when, sku, trail].filter(Boolean);
  return bits.join(' · ');
}
