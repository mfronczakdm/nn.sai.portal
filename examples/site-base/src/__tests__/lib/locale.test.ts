import {
  DEFAULT_LOCALE,
  JAPANESE_LOCALE,
  KOREAN_LOCALE,
  SIMPLIFIED_CHINESE_LOCALE,
  SUPPORTED_LOCALES,
  buildLanguageSwitchPathname,
  buildLocalePathname,
  getLocaleFromPathname,
  isSupportedLocale,
  stripLocaleFromPathname,
} from '@/lib/locale';

describe('locale helpers', () => {
  it('supports the default language plus the three Amkor languages', () => {
    expect(SUPPORTED_LOCALES).toEqual([
      DEFAULT_LOCALE,
      JAPANESE_LOCALE,
      KOREAN_LOCALE,
      SIMPLIFIED_CHINESE_LOCALE,
    ]);
  });

  it('uses the Sitecore language names as locale codes', () => {
    expect([JAPANESE_LOCALE, KOREAN_LOCALE, SIMPLIFIED_CHINESE_LOCALE]).toEqual([
      'ja-JP',
      'ko-KR',
      'zh-CN',
    ]);
  });

  describe('isSupportedLocale', () => {
    it.each([['ja-JP'], ['ko-KR'], ['zh-CN'], ['en']])('accepts %s', (locale) => {
      expect(isSupportedLocale(locale)).toBe(true);
    });

    it.each([['ja'], ['zh-Hans'], [''], [undefined], [null]])('rejects %s', (locale) => {
      expect(isSupportedLocale(locale as string | undefined)).toBe(false);
    });
  });

  describe('getLocaleFromPathname', () => {
    it('reads the locale from the first segment', () => {
      expect(getLocaleFromPathname('/ja-JP/quality')).toBe('ja-JP');
      expect(getLocaleFromPathname('/ja-JP')).toBe('ja-JP');
    });

    it('returns undefined for unprefixed and unsupported paths', () => {
      expect(getLocaleFromPathname('/quality')).toBeUndefined();
      expect(getLocaleFromPathname('/')).toBeUndefined();
      expect(getLocaleFromPathname('/fr-CA/quality')).toBeUndefined();
    });

    it('ignores a locale-looking segment that is not first', () => {
      expect(getLocaleFromPathname('/news/ja-JP/quality')).toBeUndefined();
    });
  });

  describe('stripLocaleFromPathname', () => {
    it('removes a leading locale segment', () => {
      expect(stripLocaleFromPathname('/ja-JP/about-us/careers')).toBe('/about-us/careers');
      expect(stripLocaleFromPathname('/ja-JP')).toBe('/');
    });

    it('leaves unprefixed paths untouched', () => {
      expect(stripLocaleFromPathname('/about-us/careers')).toBe('/about-us/careers');
      expect(stripLocaleFromPathname('/')).toBe('/');
    });
  });

  describe('buildLocalePathname', () => {
    it('prefixes non-default languages', () => {
      expect(buildLocalePathname('/quality', 'ja-JP')).toBe('/ja-JP/quality');
      expect(buildLocalePathname('/', 'ja-JP')).toBe('/ja-JP');
    });

    it('keeps clean URLs for the default language so other sites are unaffected', () => {
      expect(buildLocalePathname('/ja-JP/quality', DEFAULT_LOCALE)).toBe('/quality');
      expect(buildLocalePathname('/ja-JP', DEFAULT_LOCALE)).toBe('/');
    });

    it('replaces an existing locale rather than stacking segments', () => {
      expect(buildLocalePathname('/ja-JP/quality', 'ko-KR')).toBe('/ko-KR/quality');
    });
  });

  describe('buildLanguageSwitchPathname', () => {
    it('always prefixes so choosing English clears a remembered language', () => {
      expect(buildLanguageSwitchPathname('/ja-JP/quality', DEFAULT_LOCALE)).toBe('/en/quality');
      expect(buildLanguageSwitchPathname('/', DEFAULT_LOCALE)).toBe('/en');
    });

    it('stays on the current page', () => {
      expect(buildLanguageSwitchPathname('/about-us/careers', 'ja-JP')).toBe(
        '/ja-JP/about-us/careers'
      );
      expect(buildLanguageSwitchPathname('/ko-KR/about-us/careers', 'ja-JP')).toBe(
        '/ja-JP/about-us/careers'
      );
    });

    it('normalizes trailing slashes', () => {
      expect(buildLanguageSwitchPathname('/quality/', 'ja-JP')).toBe('/ja-JP/quality');
    });
  });
});
