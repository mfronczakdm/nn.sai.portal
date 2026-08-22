/**
 * Curated blog → specialty / related-lawyer facets for BlogListing filters.
 * Maps Insights/Blogs children (by leftover Sitecore item name) to BLG
 * topics and remapped lawyer bios. Extend as new blogs are added.
 */

export type BlogSpecialty =
  | 'Tariffs & Trade'
  | 'Financial Services'
  | 'Technology'
  | 'Energy & Infrastructure'
  | 'ESG'
  | 'Labour & Employment'
  | 'Disputes'
  | 'Corporate Commercial'
  | 'Commercial Real Estate'
  | 'Indigenous Law'
  | 'Capital Markets'
  | 'Infrastructure'
  | 'Tax';

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
  abdelsayed: {
    name: 'Marc Abdelsayed',
    href: '/Lawyers/Bios/Ata-A-Akiner',
    practice: 'Corporate Commercial',
  },
  ault: {
    name: 'Duncan Ault',
    href: '/Lawyers/Bios/Shinya-Akiyama',
    practice: 'Disputes',
  },
  abudulai: {
    name: 'Suhuyini Abudulai',
    href: '/Lawyers/Bios/Jennifer-Altman',
    practice: 'Financial Services',
  },
  abdulla: {
    name: 'Ali Abdulla',
    href: '/Lawyers/Bios/James-L-Alberg',
    practice: 'Tax',
  },
  alberga: {
    name: 'Don J. Alberga',
    href: '/Lawyers/Bios/Mark-Abate',
    practice: 'Labour and Employment',
  },
  anstess: {
    name: 'Benjamin Anstess',
    href: '/Lawyers/Bios/Ranjini-Acharya',
    practice: 'Commercial Real Estate',
  },
  archer: {
    name: 'Jennifer Archer',
    href: '/Lawyers/Bios/Rolando-T-Acosta',
    practice: 'Corporate Commercial',
  },
  bird: {
    name: 'Sarah Bird',
    href: '/Lawyers/Bios/Stephen-C-Ashley',
    practice: 'Infrastructure',
  },
  bogle: {
    name: 'Julie Bogle',
    href: '/Lawyers/Bios/Stephen-S-Asay',
    practice: 'Capital Markets',
  },
  arnone: {
    name: 'Frank Arnone',
    href: '/Lawyers/Bios/Ryan-R-Adelsperger',
    practice: 'Commercial Real Estate',
  },
} as const satisfies Record<string, RelatedLawyer>;

/** Keyed by Sitecore item name (hyphenated) under Insights/Blogs */
export const BLOG_TOPIC_BY_NAME: Record<string, BlogTopicMeta> = {
  'Policyholder-Pulse': {
    specialties: ['Disputes', 'Commercial Real Estate'],
    lawyers: [LAWYERS.arnone, LAWYERS.ault],
    keywords: ['insurance', 'coverage', 'construction', 'holdback', 'claims'],
    imageUrl: unsplash('photo-1450101499163-c8848c66ca85'),
    imageAlt: 'Business documents and coverage paperwork',
  },
  'Global-Trade-and-Sanctions-Law': {
    specialties: ['Tariffs & Trade', 'Corporate Commercial'],
    lawyers: [LAWYERS.abdelsayed, LAWYERS.ault],
    keywords: ['tariff', 'tariffs', 'trade', 'customs', 'canada', 'supply chain'],
    imageUrl: unsplash('photo-1586528116311-ad8dd3c8310d'),
    imageAlt: 'Shipping containers stacked for global trade',
  },
  'Investment-Fund-Law': {
    specialties: ['Financial Services', 'Capital Markets'],
    lawyers: [LAWYERS.abudulai, LAWYERS.bogle],
    keywords: ['financial services', 'funds', 'banking', 'capital markets'],
    imageUrl: unsplash('photo-1611974789855-9c2a0a7236a3'),
    imageAlt: 'Financial markets charts and investment data',
  },
  'Sourcing-Speak': {
    specialties: ['Technology', 'Capital Markets'],
    lawyers: [LAWYERS.bogle, LAWYERS.abdulla],
    keywords: ['technology', 'genai', 'digital', 'saas', 'outsourcing'],
    imageUrl: unsplash('photo-1451187580459-43490279c0fa'),
    imageAlt: 'Digital earth and technology sourcing networks',
  },
  Gravel2Gavel: {
    specialties: ['Energy & Infrastructure', 'Indigenous Law', 'ESG'],
    lawyers: [LAWYERS.bird],
    keywords: ['energy', 'infrastructure', 'esg', 'indigenous', 'renewables'],
    imageUrl: unsplash('photo-1466611653911-95081537e5b7'),
    imageAlt: 'Wind turbines and renewable energy infrastructure',
  },
  'PFAS-Observer': {
    specialties: ['ESG', 'Disputes'],
    lawyers: [LAWYERS.bird, LAWYERS.ault],
    keywords: ['pfas', 'environmental', 'esg', 'cleanup', 'liability'],
    imageUrl: unsplash('photo-1433086966358-54859d0ed716'),
    imageAlt: 'Natural waterfall landscape for environmental law',
  },
  'Comm-Law-Center': {
    specialties: ['Technology'],
    lawyers: [LAWYERS.bogle],
    keywords: ['communications', 'broadband', 'spectrum', 'broadcast', 'media', 'crtc'],
    imageUrl: unsplash('photo-1478737270239-2f02b77fc618'),
    imageAlt: 'Broadcast microphone and communications studio',
  },
  'Consumer-Protection-Dispatch': {
    specialties: ['Disputes', 'Financial Services'],
    lawyers: [LAWYERS.abudulai],
    keywords: ['consumer', 'privacy', 'advertising', 'competition'],
    imageUrl: unsplash('photo-1556742049-0cfed4f6a45d'),
    imageAlt: 'Retail checkout and consumer shopping experience',
  },
  'Internet-and-Social-Media-Law': {
    specialties: ['Technology', 'Corporate Commercial'],
    lawyers: [LAWYERS.archer],
    keywords: ['social media', 'platform', 'content', 'privacy', 'ai', 'internet'],
    imageUrl: unsplash('photo-1611162617474-5b21e879e113'),
    imageAlt: 'Social media apps on a smartphone screen',
  },
  'SeeSalt-Blog': {
    specialties: ['Energy & Infrastructure'],
    lawyers: [LAWYERS.bird],
    keywords: ['maritime', 'shipping', 'ports', 'cargo'],
    imageUrl: unsplash('photo-1494412574643-ff11b0a5c1c3'),
    imageAlt: 'Cargo ship at sea for maritime law',
  },
  'The-Bid-Protest-Debrief': {
    specialties: ['Disputes', 'Infrastructure'],
    lawyers: [LAWYERS.ault],
    keywords: ['procurement', 'public law', 'government contracts', 'ottawa'],
    imageUrl: unsplash('photo-1529107386315-e1a2ed48a620'),
    imageAlt: 'Parliament buildings for public-law procurement',
  },
  'Unmanned-Aircraft-Systems-LAW': {
    specialties: ['Technology'],
    lawyers: [LAWYERS.alberga],
    keywords: ['drone', 'aviation', 'transport canada', 'unmanned'],
    imageUrl: unsplash('photo-1473968512647-3e447244af8f'),
    imageAlt: 'Drone in flight for unmanned aircraft systems',
  },
};

const SPECIALTY_INFERENCE: Array<{ specialty: BlogSpecialty; tokens: string[] }> = [
  { specialty: 'Tariffs & Trade', tokens: ['tariff', 'trade', 'customs'] },
  { specialty: 'Financial Services', tokens: ['fund', 'banking', 'financial'] },
  { specialty: 'Technology', tokens: ['technology', 'genai', 'software', 'digital'] },
  { specialty: 'Energy & Infrastructure', tokens: ['energy', 'infrastructure', 'renewable'] },
  { specialty: 'ESG', tokens: ['esg', 'environmental', 'climate', 'sustainability'] },
  { specialty: 'Labour & Employment', tokens: ['labour', 'employment', 'workplace'] },
  { specialty: 'Disputes', tokens: ['litigation', 'dispute', 'trial'] },
  { specialty: 'Corporate Commercial', tokens: ['corporate', 'm&a', 'governance'] },
  { specialty: 'Commercial Real Estate', tokens: ['real estate', 'construction', 'holdback'] },
  { specialty: 'Indigenous Law', tokens: ['indigenous', 'first nations'] },
  { specialty: 'Capital Markets', tokens: ['capital markets', 'securities', 'issuer'] },
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
