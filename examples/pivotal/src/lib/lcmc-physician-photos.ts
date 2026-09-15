/**
 * LCMC PhysicianDetail headshots. Named matches use public marketing photos
 * saved from lcmchealth.org; everyone else gets a professional physician
 * placeholder (not cartoons). Sitecore Image fields win when they have a src.
 */

import { extractImageSrc } from '@/lib/sitecore-image-field';

export const LCMC_PHYSICIAN_PHOTO_DIR = '/lcmc/physicians';

type NamedPhysicianPhoto = {
  src: string;
  alt: string;
  sourcePage: string;
};

const NAMED_PHOTOS: NamedPhysicianPhoto[] = [
  {
    src: `${LCMC_PHYSICIAN_PHOTO_DIR}/craig-j-conard-md.jpg`,
    alt: 'Craig J. Conard, MD',
    sourcePage: 'https://www.lcmchealth.org/find-a-provider/craig-j-conard-md/',
  },
  {
    src: `${LCMC_PHYSICIAN_PHOTO_DIR}/jose-m-wiley-md.jpg`,
    alt: 'Jose M. Wiley, MD',
    sourcePage: 'https://www.lcmchealth.org/find-a-provider/jose-m-wiley-md/',
  },
  {
    src: `${LCMC_PHYSICIAN_PHOTO_DIR}/aimee-m-aysenne-md.jpg`,
    alt: 'Aimee M. Aysenne, MD',
    sourcePage: 'https://www.lcmchealth.org/find-a-provider/aimee-m-aysenne-md/',
  },
];

const FEMALE_PLACEHOLDERS = [
  `${LCMC_PHYSICIAN_PHOTO_DIR}/placeholder-physician-01.jpg`,
  `${LCMC_PHYSICIAN_PHOTO_DIR}/placeholder-physician-03.jpg`,
  `${LCMC_PHYSICIAN_PHOTO_DIR}/placeholder-physician-05.jpg`,
] as const;

const MALE_PLACEHOLDERS = [
  `${LCMC_PHYSICIAN_PHOTO_DIR}/placeholder-physician-02.jpg`,
  `${LCMC_PHYSICIAN_PHOTO_DIR}/placeholder-physician-04.jpg`,
  `${LCMC_PHYSICIAN_PHOTO_DIR}/placeholder-physician-06.jpg`,
] as const;

/** First names in Data/Physicians plus common LCMC profile names. */
const LIKELY_FEMALE_FIRST_NAMES = new Set([
  'aimee',
  'alicia',
  'anita',
  'camille',
  'claire',
  'elise',
  'gabrielle',
  'hannah',
  'keisha',
  'leah',
  'maya',
  'nicole',
  'patrice',
  'priya',
  'renee',
  'sarah',
  'tanya',
]);

function foldPhysicianKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/,?\s*(md|do|np|pa|rn|phd|mph|facc|faap|facs|facog)\b/gi, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameKeys(value: string): string[] {
  const folded = foldPhysicianKey(value);
  if (!folded) return [];
  const tokens = folded.split(' ').filter((token) => token.length > 1 && token !== 'jr' && token !== 'sr');
  const keys = [folded];
  if (tokens.length >= 2) {
    keys.push(`${tokens[0]} ${tokens[tokens.length - 1]}`);
  }
  return keys;
}

const PHOTO_BY_KEY: Record<string, NamedPhysicianPhoto> = {};
NAMED_PHOTOS.forEach((photo) => {
  nameKeys(photo.alt).forEach((key) => {
    PHOTO_BY_KEY[key] = photo;
  });
});

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function firstName(folded: string): string {
  return folded.split(' ').filter(Boolean)[0] || '';
}

function placeholderSrc(fullName: string): string {
  const folded = foldPhysicianKey(fullName) || 'physician';
  const pool = LIKELY_FEMALE_FIRST_NAMES.has(firstName(folded)) ? FEMALE_PLACEHOLDERS : MALE_PLACEHOLDERS;
  return pool[hashString(folded) % pool.length];
}

export function findNamedLcmcPhysicianPhoto(fullName: string): NamedPhysicianPhoto | undefined {
  for (const key of nameKeys(fullName)) {
    const match = PHOTO_BY_KEY[key];
    if (match) return match;
  }
  return undefined;
}

export type LcmcPhysicianPhoto = {
  src: string;
  alt: string;
  isNamedMatch: boolean;
};

export function resolveLcmcPhysicianPhoto(options: {
  fullName?: string | null;
  imageField?: unknown;
}): LcmcPhysicianPhoto {
  const fullName = (options.fullName || '').trim();
  const fromSitecore = extractImageSrc(options.imageField);
  if (fromSitecore) {
    return { src: fromSitecore, alt: fullName || 'Physician', isNamedMatch: false };
  }

  const named = fullName ? findNamedLcmcPhysicianPhoto(fullName) : undefined;
  if (named) {
    return { src: named.src, alt: named.alt, isNamedMatch: true };
  }

  return {
    src: placeholderSrc(fullName || 'physician'),
    alt: fullName || 'Physician',
    isNamedMatch: false,
  };
}
