/**
 * Curated attorney headshot URLs keyed by Sitecore Bio item name.
 * Used when Edge GraphQL / layout Image jsonValue has no resolvable src
 * (common for external Unsplash Image field XML without mediaid).
 */

import { extractImageSrc } from '@/lib/sitecore-image-field';

export { extractImageSrc };

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=800&q=80`;
}

/** Content Hub DAM public links already on Alfano / Akiner. */
const DAM = {
  alfano:
    'https://mrfbasech.sitecoresandbox.cloud/api/public/content/ab4e0dd92bc84d1c9aaaa61cd088c437?v=5ec46409',
  akiner:
    'https://mrfbasech.sitecoresandbox.cloud/api/public/content/797478a50055453badec97d4a71bd48a?v=625e4c59',
} as const;

/** Keyed by Bio item name under Home/Lawyers/Bios */
export const BIO_HEADSHOT_BY_NAME: Record<string, { src: string; alt: string }> = {
  'Mark-Abate': {
    src: unsplash('photo-1472099645785-5658abf4ff4e'),
    alt: 'Mark Abate',
  },
  'Osama-Abu-Dehays': {
    src: unsplash('photo-1600486913747-55e5470d6f40'),
    alt: 'Osama Abu-Dehays',
  },
  'Ranjini-Acharya': {
    src: unsplash('photo-1598550874175-4d0ef436c909'),
    alt: 'Ranjini Acharya',
  },
  'Rolando-T-Acosta': {
    src: unsplash('photo-1492562080023-ab3db95bfbce'),
    alt: 'Rolando T. Acosta',
  },
  'Ryan-R-Adelsperger': {
    src: unsplash('photo-1507003211169-0a1dd7228f2d'),
    alt: 'Ryan R. Adelsperger',
  },
  'Ata-A-Akiner': {
    src: DAM.akiner,
    alt: 'Ata A. Akiner',
  },
  'Shinya-Akiyama': {
    src: unsplash('photo-1527980965255-d3b416303d12'),
    alt: 'Shinya Akiyama',
  },
  'Khalid-A-AlArfaj': {
    src: unsplash('photo-1568602471122-7832951cc4c5'),
    alt: 'Khalid A. AlArfaj',
  },
  'James-L-Alberg': {
    src: unsplash('photo-1519085360753-af0119f7cbe7'),
    alt: 'James L. Alberg',
  },
  'Lee-Alexander': {
    src: unsplash('photo-1539571696357-5a69c17a67c6'),
    alt: 'Lee Alexander',
  },
  'Natalie-Alexander': {
    src: unsplash('photo-1494790108377-be9c29b29330'),
    alt: 'Natalie Alexander',
  },
  'Andrew-V-Alfano': {
    src: DAM.alfano,
    alt: 'Andrew V. Alfano',
  },
  'Mediha-M-Ali': {
    src: unsplash('photo-1544005313-94ddf0286df2'),
    alt: 'Mediha M. Ali',
  },
  'Jennifer-Altman': {
    src: unsplash('photo-1573496358961-3c82861ab8f4'),
    alt: 'Jennifer Altman',
  },
  'Stephanie-Amaru': {
    src: unsplash('photo-1627161683077-e34782c24d81'),
    alt: 'Stephanie Amaru',
  },
  'Stephanie-Angkadjaja': {
    src: unsplash('photo-1614283233556-f35b0c801ef1'),
    alt: 'Stephanie Angkadjaja',
  },
  'Leonie-Arendt-Cassetta': {
    src: unsplash('photo-1611432579699-484f7990b127'),
    alt: 'Leonie Arendt-Cassetta',
  },
  'Semma-G-Arzapalo': {
    src: unsplash('photo-1487412720507-e7ab37603c6f'),
    alt: 'Semma G. Arzapalo',
  },
  'Stephen-S-Asay': {
    src: unsplash('photo-1560250097-0b93528c311a'),
    alt: 'Stephen S. Asay',
  },
  'Stephen-C-Ashley': {
    src: unsplash('photo-1500648767791-00dcc994a43e'),
    alt: 'Stephen C. Ashley',
  },
};

export function bioHeadshotFallback(itemName?: string | null): { src: string; alt: string } | undefined {
  if (!itemName) return undefined;
  return BIO_HEADSHOT_BY_NAME[itemName];
}

export function resolveBioHeadshotSrc(options: {
  itemName?: string | null;
  displayName?: string | null;
  headshotField?: unknown;
}): { src: string; alt: string } {
  const fromSitecore = extractImageSrc(options.headshotField);
  const fallback = bioHeadshotFallback(options.itemName);
  const src = fromSitecore || fallback?.src || '';
  const alt = fallback?.alt || options.displayName || options.itemName || 'Attorney';
  return { src, alt };
}
