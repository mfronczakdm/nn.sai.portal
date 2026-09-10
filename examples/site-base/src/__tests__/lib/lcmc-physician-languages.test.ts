import {
  LCMC_LANGUAGE_ENGLISH,
  LCMC_LANGUAGE_SPANISH,
  parseLanguagesSpoken,
  resolveLcmcPhysicianLanguages,
} from '@/lib/lcmc-physician-languages';

describe('resolveLcmcPhysicianLanguages', () => {
  it('prefers the authored Sitecore field', () => {
    expect(resolveLcmcPhysicianLanguages('Gabrielle Moreau', 'English')).toEqual([
      LCMC_LANGUAGE_ENGLISH,
    ]);
  });

  it('always includes Spanish for Gabrielle Moreau when the field is empty', () => {
    expect(resolveLcmcPhysicianLanguages('Gabrielle Moreau, MD')).toEqual([
      LCMC_LANGUAGE_ENGLISH,
      LCMC_LANGUAGE_SPANISH,
    ]);
  });

  it('uses English only for a subset of the catalog', () => {
    expect(resolveLcmcPhysicianLanguages('Thomas Nguyen, MD')).toEqual([LCMC_LANGUAGE_ENGLISH]);
  });

  it('defaults most physicians to English and Spanish', () => {
    expect(resolveLcmcPhysicianLanguages('Camille Landry, MD, FACC')).toEqual([
      LCMC_LANGUAGE_ENGLISH,
      LCMC_LANGUAGE_SPANISH,
    ]);
  });
});

describe('parseLanguagesSpoken', () => {
  it('splits comma-separated labels', () => {
    expect(parseLanguagesSpoken('English, Spanish')).toEqual(['English', 'Spanish']);
  });
});
