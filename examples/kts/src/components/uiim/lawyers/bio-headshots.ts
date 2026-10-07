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

function cooleyHeadshot(file: string): string {
  return `https://www.cooley.com/-/media/cooley/bio-images/${file}`;
}

/** Cooley People item names (Home/People). Edge omits src on external Image XML, same as Pillsbury. */
const COOLEY_HEADSHOT_BY_NAME: Record<string, { src: string; alt: string }> = {
  'Joe-Conroy': { src: cooleyHeadshot('headshots/conroy-joe-10217-bw.jpg'), alt: 'Joe Conroy' },
  'Shannon-Eagan': { src: cooleyHeadshot('headshots/eagan-shannon-13854-bw.jpg'), alt: 'Shannon Eagan' },
  'Amanda-Main': { src: cooleyHeadshot('headshots/main-amanda-16726-bw.jpg'), alt: 'Amanda A. Main' },
  'Erik-Edwards': { src: cooleyHeadshot('headshots/edwards-erik-10163-bw.jpg'), alt: 'Erik Edwards' },
  'Luke-Cadigan': { src: cooleyHeadshot('headshots/cadigan-luke-22612-bw.jpg'), alt: 'Luke Cadigan' },
  'Ian-Shapiro': { src: cooleyHeadshot('headshots/shapiro-ian-62128-bw.jpg'), alt: 'Ian Shapiro' },
  'Claire-Keast-Butler': {
    src: cooleyHeadshot('full-images/keastbutler-claire-24603-web.jpg'),
    alt: 'Claire Keast-Butler',
  },
  'Charlie-Kim': { src: cooleyHeadshot('headshots/kim-charlie-12603-bw.jpg'), alt: 'Charlie Kim' },
  'Sonia-Nath': { src: cooleyHeadshot('headshots/nath-sonia-26345-bw.jpg'), alt: 'Sonia Nath' },
  'Christopher-Kimball': {
    src: cooleyHeadshot('headshots/kimball-christopher-14083-bw.jpg'),
    alt: 'Christopher Kimball',
  },
  'Matt-Howsare': { src: cooleyHeadshot('headshots/howsare-matt-25460-bw.jpg'), alt: 'Matt Howsare' },
  'Christina-Roupas': {
    src: cooleyHeadshot('headshots/roupas-christina-26639-bw.jpg'),
    alt: 'Christina Roupas',
  },
  'Ken-Rollins': { src: cooleyHeadshot('headshots/rollins-ken-12029-bw.jpg'), alt: 'Ken Rollins' },
  'Michael-Yu': { src: cooleyHeadshot('headshots/yu-michael-24938-bw.jpg'), alt: 'Michael Yu' },
  'Joshua-Mates': { src: cooleyHeadshot('headshots/mates-joshua-12129-bw.jpg'), alt: 'Joshua Mates' },
  'Nick-Davis': { src: cooleyHeadshot('headshots/davis-nick-28073-bw.jpg'), alt: 'Nick Davis' },
  'James-Maton': { src: cooleyHeadshot('headshots/maton-james-21292-bw.jpg'), alt: 'James Maton' },
  'Andrew-Goldstein': {
    src: cooleyHeadshot('headshots/goldstein-andrew-24964-bw.jpg'),
    alt: 'Andrew Goldstein',
  },
  'David-Peinsipp': {
    src: cooleyHeadshot('headshots/peinsipp-david-12197-bw.jpg'),
    alt: 'David Peinsipp',
  },
  'Drew-Williamson': {
    src: cooleyHeadshot('headshots/williamson-drew-16447-bw.jpg'),
    alt: 'Drew Williamson',
  },
  'Elizabeth-Skey': {
    src: cooleyHeadshot('headshots/skey-elizabeth-23173-bw.jpg'),
    alt: 'Elizabeth Skey',
  },
  'Mark-Weinstein': {
    src: cooleyHeadshot('full-images/weinstein-mark-15132-web.jpg'),
    alt: 'Mark Weinstein',
  },
  'Kristin-VanderPas': {
    src: cooleyHeadshot('headshots/vanderpas-kristin-16394-bw.jpg'),
    alt: 'Kristin VanderPas',
  },
  'Mika-Reiner-Mayer': {
    src: cooleyHeadshot('headshots/mayer-mika-22509-bw.jpg'),
    alt: 'Mika Reiner Mayer',
  },
  'Tijana-Brien': { src: cooleyHeadshot('headshots/brien-tijana-16019-bw.jpg'), alt: 'Tijana Brien' },
};

/** Keyed by Bio item name (Pillsbury Home/Lawyers/Bios + Cooley Home/People). */
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
  ...COOLEY_HEADSHOT_BY_NAME,
};

function headshotLookupKey(name?: string | null): string {
  return (name ?? '').trim().replace(/\s+/g, '-');
}

function headshotLookupVariants(name?: string | null): string[] {
  const key = headshotLookupKey(name);
  if (!key) return [];
  const variants = [key];
  const parts = key.replace(/\./g, '').split('-').filter(Boolean);
  if (parts.length > 2) {
    variants.push(`${parts[0]}-${parts[parts.length - 1]}`);
  }
  return variants;
}

export function bioHeadshotFallback(
  itemName?: string | null,
  displayName?: string | null
): { src: string; alt: string } | undefined {
  const candidates = [...headshotLookupVariants(itemName), ...headshotLookupVariants(displayName)];

  for (const key of candidates) {
    const exact = BIO_HEADSHOT_BY_NAME[key];
    if (exact) return exact;
    const match = Object.entries(BIO_HEADSHOT_BY_NAME).find(
      ([mapped]) => mapped.toLowerCase() === key.toLowerCase()
    );
    if (match) return match[1];
  }
  return undefined;
}

export function resolveBioHeadshotSrc(options: {
  itemName?: string | null;
  displayName?: string | null;
  headshotField?: unknown;
}): { src: string; alt: string } {
  const fromSitecore = extractImageSrc(options.headshotField);
  const fallback = bioHeadshotFallback(options.itemName, options.displayName);
  const src = fromSitecore || fallback?.src || '';
  const altFromXml =
    typeof options.headshotField === 'string'
      ? options.headshotField.match(/\balt=["']([^"']+)["']/i)?.[1]
      : undefined;
  const alt = altFromXml || fallback?.alt || options.displayName || options.itemName || 'Attorney';
  return { src, alt };
}
