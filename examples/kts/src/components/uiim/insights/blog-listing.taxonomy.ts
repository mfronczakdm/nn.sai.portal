/**
 * Curated blog → specialty / related-lawyer facets for BlogListing filters.
 * Maps Insights/Blogs children (by item name) to discoverable topics and
 * attorney bios already in the content tree. Extend as new blogs are added.
 */

export type BlogSpecialty =
  | 'Insurance Recovery'
  | 'International Trade'
  | 'Funds & Private Equity'
  | 'Technology & Sourcing'
  | 'Energy & Infrastructure'
  | 'Environmental'
  | 'Communications & Media'
  | 'Consumer Protection'
  | 'Maritime'
  | 'Government Contracts'
  | 'Aviation & UAS'
  | 'Litigation';

export type RelatedLawyer = {
  name: string;
  href: string;
  practice: string;
};

export type BlogTopicMeta = {
  specialties: BlogSpecialty[];
  lawyers: RelatedLawyer[];
  keywords: string[];
  /** Unsplash (or other CDN) image used when Sitecore Image field has no resolvable src */
  imageUrl?: string;
  imageAlt?: string;
};

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=750&q=80`;
}

const LAWYERS = {
  asay: {
    name: 'Stephen S. Asay',
    href: '/Lawyers/Bios/Stephen-S-Asay',
    practice: 'Insurance Recovery',
  },
  altman: {
    name: 'Jennifer Altman',
    href: '/Lawyers/Bios/Jennifer-Altman',
    practice: 'Litigation',
  },
  akiner: {
    name: 'Ata A. Akiner',
    href: '/Lawyers/Bios/Ata-A-Akiner',
    practice: 'International Trade',
  },
  arzapalo: {
    name: 'Semma G. Arzapalo',
    href: '/Lawyers/Bios/Semma-G-Arzapalo',
    practice: 'Funds',
  },
  alberg: {
    name: 'James L. Alberg',
    href: '/Lawyers/Bios/James-L-Alberg',
    practice: 'Global Sourcing',
  },
  abate: {
    name: 'Mark Abate',
    href: '/Lawyers/Bios/Mark-Abate',
    practice: 'Intellectual Property',
  },
  acharya: {
    name: 'Ranjini Acharya',
    href: '/Lawyers/Bios/Ranjini-Acharya',
    practice: 'Intellectual Property',
  },
  acosta: {
    name: 'Rolando T. Acosta',
    href: '/Lawyers/Bios/Rolando-T-Acosta',
    practice: 'Litigation',
  },
} as const satisfies Record<string, RelatedLawyer>;

/** Keyed by Sitecore item name (hyphenated) under Insights/Blogs */
export const BLOG_TOPIC_BY_NAME: Record<string, BlogTopicMeta> = {
  'Policyholder-Pulse': {
    specialties: ['Insurance Recovery', 'Litigation'],
    lawyers: [LAWYERS.asay, LAWYERS.altman],
    keywords: ['insurance', 'coverage', 'policyholder', 'carrier', 'claims', 'pfas'],
    imageUrl: unsplash('photo-1450101499163-c8848c66ca85'),
    imageAlt: 'Business documents and insurance coverage paperwork',
  },
  'Global-Trade-and-Sanctions-Law': {
    specialties: ['International Trade'],
    lawyers: [LAWYERS.akiner],
    keywords: ['sanctions', 'export', 'trade', 'ofac', 'customs', 'compliance'],
    imageUrl: unsplash('photo-1586528116311-ad8dd3c8310d'),
    imageAlt: 'Shipping containers stacked for global trade',
  },
  'Investment-Fund-Law': {
    specialties: ['Funds & Private Equity'],
    lawyers: [LAWYERS.arzapalo],
    keywords: ['funds', 'private equity', 'lp', 'sponsor', 'fundraising', 'sec'],
    imageUrl: unsplash('photo-1611974789855-9c2a0a7236a3'),
    imageAlt: 'Financial markets charts and investment data',
  },
  'Sourcing-Speak': {
    specialties: ['Technology & Sourcing'],
    lawyers: [LAWYERS.alberg],
    keywords: ['outsourcing', 'sourcing', 'cloud', 'saas', 'it', 'technology'],
    imageUrl: unsplash('photo-1451187580459-43490279c0fa'),
    imageAlt: 'Digital earth and technology sourcing networks',
  },
  Gravel2Gavel: {
    specialties: ['Energy & Infrastructure'],
    lawyers: [],
    keywords: ['energy', 'infrastructure', 'oil', 'gas', 'renewables', 'power'],
    imageUrl: unsplash('photo-1466611653911-95081537e5b7'),
    imageAlt: 'Wind turbines and renewable energy infrastructure',
  },
  'PFAS-Observer': {
    specialties: ['Environmental', 'Litigation'],
    lawyers: [LAWYERS.asay],
    keywords: ['pfas', 'environmental', 'epa', 'cleanup', 'liability'],
    imageUrl: unsplash('photo-1433086966358-54859d0ed716'),
    imageAlt: 'Natural waterfall landscape for environmental law',
  },
  'Comm-Law-Center': {
    specialties: ['Communications & Media'],
    lawyers: [],
    keywords: ['fcc', 'communications', 'broadband', 'spectrum', 'broadcast', 'media'],
    imageUrl: unsplash('photo-1478737270239-2f02b77fc618'),
    imageAlt: 'Broadcast microphone and communications studio',
  },
  'Consumer-Protection-Dispatch': {
    specialties: ['Consumer Protection'],
    lawyers: [],
    keywords: ['ftc', 'cfpb', 'consumer', 'privacy', 'advertising'],
    imageUrl: unsplash('photo-1556742049-0cfed4f6a45d'),
    imageAlt: 'Retail checkout and consumer shopping experience',
  },
  'Internet-and-Social-Media-Law': {
    specialties: ['Communications & Media', 'Technology & Sourcing'],
    lawyers: [LAWYERS.acharya],
    keywords: ['social media', 'platform', 'content', 'privacy', 'ai', 'internet'],
    imageUrl: unsplash('photo-1611162617474-5b21e879e113'),
    imageAlt: 'Social media apps on a smartphone screen',
  },
  'SeeSalt-Blog': {
    specialties: ['Maritime'],
    lawyers: [],
    keywords: ['maritime', 'shipping', 'admiralty', 'vessel', 'cargo'],
    imageUrl: unsplash('photo-1494412574643-ff11b0a5c1c3'),
    imageAlt: 'Cargo ship at sea for maritime law',
  },
  'The-Bid-Protest-Debrief': {
    specialties: ['Government Contracts'],
    lawyers: [],
    keywords: ['bid protest', 'gao', 'government contracts', 'procurement', 'federal'],
    imageUrl: unsplash('photo-1529107386315-e1a2ed48a620'),
    imageAlt: 'US Capitol building for government contracts',
  },
  'Unmanned-Aircraft-Systems-LAW': {
    specialties: ['Aviation & UAS'],
    lawyers: [],
    keywords: ['drone', 'uas', 'faa', 'aviation', 'unmanned'],
    imageUrl: unsplash('photo-1473968512647-3e447244af8f'),
    imageAlt: 'Drone in flight for unmanned aircraft systems',
  },
};

const SPECIALTY_INFERENCE: Array<{ specialty: BlogSpecialty; tokens: string[] }> = [
  { specialty: 'Insurance Recovery', tokens: ['insurance', 'coverage', 'policyholder'] },
  { specialty: 'International Trade', tokens: ['sanction', 'export', 'trade', 'customs'] },
  { specialty: 'Funds & Private Equity', tokens: ['fund', 'private equity', 'investor'] },
  { specialty: 'Technology & Sourcing', tokens: ['technology', 'sourcing', 'outsourcing', 'saas', 'software'] },
  { specialty: 'Energy & Infrastructure', tokens: ['energy', 'infrastructure', 'renewable', 'oil', 'gas'] },
  { specialty: 'Environmental', tokens: ['environmental', 'pfas', 'epa', 'climate'] },
  { specialty: 'Communications & Media', tokens: ['fcc', 'communications', 'media', 'broadcast'] },
  { specialty: 'Consumer Protection', tokens: ['consumer', 'ftc', 'cfpb'] },
  { specialty: 'Maritime', tokens: ['maritime', 'shipping', 'admiralty'] },
  { specialty: 'Government Contracts', tokens: ['protest', 'gao', 'procurement', 'government contract'] },
  { specialty: 'Aviation & UAS', tokens: ['drone', 'uas', 'aviation', 'faa'] },
  { specialty: 'Litigation', tokens: ['litigation', 'dispute', 'trial'] },
];

export function normalizeBlogKey(name?: string): string {
  return (name || '').trim();
}

export function resolveBlogTopicMeta(name: string | undefined, haystack: string): BlogTopicMeta {
  const key = normalizeBlogKey(name);
  const known = key ? BLOG_TOPIC_BY_NAME[key] : undefined;
  if (known) return known;

  const lower = haystack.toLowerCase();
  const specialties = SPECIALTY_INFERENCE.filter(({ tokens }) =>
    tokens.some((token) => lower.includes(token))
  ).map(({ specialty }) => specialty);

  return {
    specialties: specialties.length ? [...new Set(specialties)] : [],
    lawyers: [],
    keywords: [],
  };
}

/** Sitecore page-data folders and other non-blog children under Blogs. */
export function isBlogListingChild(name?: string): boolean {
  const n = (name || '').trim().toLowerCase();
  if (!n) return false;
  if (n === 'data' || n === 'presentation' || n === 'settings') return false;
  return true;
}

export function blogImageFallback(name?: string): { src: string; alt: string } | null {
  const meta = name ? BLOG_TOPIC_BY_NAME[normalizeBlogKey(name)] : undefined;
  if (!meta?.imageUrl) return null;
  return { src: meta.imageUrl, alt: meta.imageAlt || name || 'Blog image' };
}
