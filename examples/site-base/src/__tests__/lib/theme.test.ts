import {
  APP_THEMES,
  DEFAULT_THEME,
  isAppTheme,
  resolveTheme,
  SITE_SKINS,
} from '@/lib/theme';

describe('resolveTheme', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_THEME;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_APP_THEME;
    } else {
      process.env.NEXT_PUBLIC_APP_THEME = originalEnv;
    }
  });

  it('uses explicit skin over site map', () => {
    expect(resolveTheme({ site: 'rockland', skin: 'pkm' })).toBe('pkm');
  });

  it('uses SITE_SKINS for known sites', () => {
    delete process.env.NEXT_PUBLIC_APP_THEME;
    expect(resolveTheme({ site: 'rockland' })).toBe('rockland');
    expect(resolveTheme({ site: 'pillsburylaw' })).toBe(SITE_SKINS.pillsburylaw);
    expect(resolveTheme({ site: 'quanex' })).toBe('quanex');
    expect(resolveTheme({ site: 'amesburytruth' })).toBe('amesburytruth');
    expect(resolveTheme({ site: 'era' })).toBe('era');
    expect(resolveTheme({ site: 'lcmc' })).toBe('lcmc');
    expect(resolveTheme({ site: 'dfs' })).toBe('dfsupply');
  });

  it('treats site name as theme when registered', () => {
    delete process.env.NEXT_PUBLIC_APP_THEME;
    expect(resolveTheme({ site: 'dwyeromega' })).toBe('dwyeromega');
  });

  it('falls back to NEXT_PUBLIC_APP_THEME when site has no skin', () => {
    process.env.NEXT_PUBLIC_APP_THEME = 'builderfs';
    expect(resolveTheme({ site: 'alaris' })).toBe('builderfs');
  });

  it('falls back to DEFAULT_THEME', () => {
    delete process.env.NEXT_PUBLIC_APP_THEME;
    expect(resolveTheme({ site: 'alaris' })).toBe(DEFAULT_THEME);
    expect(resolveTheme()).toBe(DEFAULT_THEME);
  });

  it('ignores unknown skin values', () => {
    delete process.env.NEXT_PUBLIC_APP_THEME;
    expect(resolveTheme({ skin: 'not-a-theme', site: 'rockland' })).toBe('rockland');
  });

  it('normalizes case and whitespace', () => {
    expect(resolveTheme({ skin: ' RockLand ' })).toBe('rockland');
    expect(resolveTheme({ site: 'PKM' })).toBe('pkm');
  });
});

describe('theme registry', () => {
  it('lists registered themes', () => {
    expect(APP_THEMES).toContain('bcbst');
    expect(APP_THEMES).toContain('rockland');
    expect(APP_THEMES).toContain('quanex');
    expect(APP_THEMES).toContain('amesburytruth');
    expect(APP_THEMES).toContain('era');
    expect(APP_THEMES).toContain('lcmc');
    expect(isAppTheme('rockland')).toBe(true);
    expect(isAppTheme('lcmc')).toBe(true);
    expect(isAppTheme('quanex')).toBe(true);
    expect(isAppTheme('amesburytruth')).toBe(true);
    expect(isAppTheme('era')).toBe(true);
    expect(isAppTheme('nope')).toBe(false);
  });
});
