/**
 * Curated attorney headshot URLs keyed by Sitecore Bio item name.
 * Used when Edge GraphQL / layout Image jsonValue has no resolvable src
 * (common for external Image field XML without mediaid).
 *
 * BLG bios still use leftover Pillsbury URL slugs as item names; keys match those slugs.
 * Image URLs are the live portraits from https://www.blg.com/en/people.
 */

import { extractImageSrc } from '@/lib/sitecore-image-field';

export { extractImageSrc };

function blgMedia(path: string): string {
  return `https://www.blg.com/-/media/${path}`;
}

const SILHOUETTE_FEMALE = blgMedia('legacy-images/legacy-people-images/silhouette-female.png');
const SILHOUETTE_MALE = blgMedia('legacy-images/legacy-people-images/silhouette-male.png');

/** Keyed by Bio item name under Home/Lawyers/Bios */
export const BIO_HEADSHOT_BY_NAME: Record<string, { src: string; alt: string }> = {
  'Andrew-V-Alfano': {
    src: SILHOUETTE_FEMALE,
    alt: 'Line Abecassis',
  },
  'Ata-A-Akiner': {
    src: blgMedia('bios/img_montreal/marc_abdelsayld.png'),
    alt: 'Marc Abdelsayed',
  },
  'James-L-Alberg': {
    src: blgMedia('bios/img_calgary/ali_abdulla.png'),
    alt: 'Ali Abdulla',
  },
  'Jennifer-Altman': {
    src: blgMedia('bios/img_toronto/suhuyini_abudulai.png'),
    alt: 'Suhuyini Abudulai',
  },
  'Khalid-A-AlArfaj': {
    src: blgMedia('bios/img_montreal/amanda_afeich.png'),
    alt: 'Amanda Afeich',
  },
  'Lee-Alexander': {
    src: blgMedia('bios/img_ottawa/kate_agyeman_2.png'),
    alt: 'Kate L. Agyemang',
  },
  'Leonie-Arendt-Cassetta': {
    src: blgMedia('bios/img_ottawa/wiam_akil.png'),
    alt: 'Wiam Akil',
  },
  'Mark Bio': {
    src: blgMedia('bios/img_calgary/michael_akins.png'),
    alt: 'Michael Akins',
  },
  'Mark-Abate': {
    src: blgMedia('bios/img_montreal/don_alberga.png'),
    alt: 'Don J. Alberga',
  },
  'Mediha-M-Ali': {
    src: blgMedia('bios/img_toronto/john-paul_alexandrowicz.png'),
    alt: 'John-Paul Alexandrowicz',
  },
  'Natalie-Alexander': {
    src: blgMedia('bios/img_vancouver/ken_anderson.png'),
    alt: 'Kendall Andersen',
  },
  'Osama-Abu-Dehays': {
    src: blgMedia('bios/img_vancouver/anderson_makena.png'),
    alt: 'Makena Anderson',
  },
  'Ranjini-Acharya': {
    src: blgMedia('bios/img_ottawa/ben_anstess.png'),
    alt: 'Benjamin Anstess',
  },
  'Rolando-T-Acosta': {
    src: blgMedia('bios/img_vancouver/jennifer_archer.png'),
    alt: 'Jennifer Archer',
  },
  'Ryan-R-Adelsperger': {
    src: blgMedia('bios/img_toronto/frank_arnone.png'),
    alt: 'Frank Arnone',
  },
  'Semma-G-Arzapalo': {
    src: SILHOUETTE_MALE,
    alt: 'Camden Amos',
  },
  'Shinya-Akiyama': {
    src: blgMedia('bios/img_ottawa/duncan_ault.png'),
    alt: 'Duncan Ault',
  },
  'Stephanie-Amaru': {
    src: blgMedia('bios/img_ottawa/mira_azzi.png'),
    alt: 'Mira Azzi',
  },
  'Stephanie-Angkadjaja': {
    src: blgMedia('bios/img_calgary/shane_barnes.png'),
    alt: 'Shane Barnes',
  },
  'Stephen-C-Ashley': {
    src: blgMedia('bios/img_vancouver/sarah_bird.png'),
    alt: 'Sarah Bird',
  },
  'Stephen-S-Asay': {
    src: blgMedia('bios/img_vancouver/julie_bogle.png'),
    alt: 'Julie Bogle',
  },
};

export function bioHeadshotFallback(itemName?: string | null): { src: string; alt: string } | undefined {
  if (!itemName) return undefined;
  return BIO_HEADSHOT_BY_NAME[itemName];
}

export function isBlgHeadshotHost(src: string): boolean {
  try {
    return new URL(src, 'https://localhost').hostname.toLowerCase() === 'www.blg.com';
  } catch {
    return src.includes('www.blg.com');
  }
}

export function shouldBypassHeadshotOptimizer(src: string): boolean {
  if (!src) return false;
  return (
    src.includes('images.unsplash.com') ||
    src.includes('sitecoresandbox.cloud') ||
    isBlgHeadshotHost(src)
  );
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
