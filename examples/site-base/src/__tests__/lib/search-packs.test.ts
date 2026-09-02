import {
  getSearchPack,
  itemMatchesQuery,
  listSearchPackSiteNames,
  resolveSearchSiteName,
  selectAiSearchInsight,
  toSiteAwareHref,
} from '@/lib/search-packs';

jest.mock('lucide-react', () => {
  const Icon = () => null;
  return new Proxy(
    {},
    {
      get: () => Icon,
    }
  );
});

const KNOWN = listSearchPackSiteNames();

describe('search pack registry', () => {
  it('registers quanex, era, amesburytruth, pillsburylaw, and amkor', () => {
    expect(KNOWN.sort()).toEqual(
      ['amesburytruth', 'amkor', 'era', 'pillsburylaw', 'quanex'].sort()
    );
  });

  it('resolves packs by siteName (case-insensitive)', () => {
    expect(getSearchPack('Quanex').siteName).toBe('quanex');
    expect(getSearchPack('ERA').brandName).toBe('ERA');
    expect(getSearchPack('pillsburylaw').brandName).toBe('Pillsbury');
  });

  it('does not silently reuse Pillsbury when siteName is missing', () => {
    const pack = getSearchPack(null);
    expect(pack.siteName).not.toBe('pillsburylaw');
    expect(KNOWN).toContain(pack.siteName);
  });
});

describe('resolveSearchSiteName (shared editing host)', () => {
  it('prefers a known URL site over a mismatched Sitecore siteName', () => {
    expect(
      resolveSearchSiteName({
        sitecoreSite: 'pillsburylaw',
        pathname: '/quanex/en/Search-Results',
        knownSites: KNOWN,
      })
    ).toBe('quanex');
  });

  it('uses Sitecore siteName on custom-domain content paths', () => {
    expect(
      resolveSearchSiteName({
        sitecoreSite: 'quanex',
        pathname: '/Products/Insulating-Glass-Spacers/Super-Spacer',
        knownSites: KNOWN,
      })
    ).toBe('quanex');
  });

  it('honors an explicit override', () => {
    expect(
      resolveSearchSiteName({
        override: 'era',
        sitecoreSite: 'quanex',
        pathname: '/quanex/en/search',
        knownSites: KNOWN,
      })
    ).toBe('era');
  });
});

describe('toSiteAwareHref', () => {
  it('prefixes catalog hrefs on a shared-host /site/locale URL and hyphenates spaces', () => {
    expect(
      toSiteAwareHref(
        '/Products/Insulating Glass Spacers/Super Spacer',
        '/quanex/en/Search-Results',
        KNOWN
      )
    ).toBe('/quanex/en/Products/Insulating-Glass-Spacers/Super-Spacer');
  });

  it('leaves content-root hrefs unchanged on custom domains', () => {
    expect(
      toSiteAwareHref('/Products/Insulating Glass Spacers/Super Spacer', '/Search-Results', KNOWN)
    ).toBe('/Products/Insulating-Glass-Spacers/Super-Spacer');
  });
});

describe('Quanex catalog matching', () => {
  const pack = getSearchPack('quanex');

  it('returns Super Spacer for warm-edge IG queries and never Pillsbury lawyers', () => {
    const hits = pack.catalog.filter((item) =>
      itemMatchesQuery(item, 'warm-edge spacer for residential IG', pack.bucketSynonyms)
    );
    expect(hits.some((item) => /super spacer/i.test(item.title))).toBe(true);
    expect(
      hits.every((item) => !/lawyer|abate|pillsbury/i.test(`${item.title} ${item.href}`))
    ).toBe(true);
  });

  it('selects application-aware IG insight copy', () => {
    const insight = selectAiSearchInsight('Super Spacer vs Duralite', pack.insightRules);
    expect(insight?.id).toBe('ai-ig-spacers');
    expect(insight?.headline.toLowerCase()).toMatch(/ig spacer|plant/);
  });

  it('does not leak Pillsbury popular searches', () => {
    const joined = pack.popularSearches.join(' ').toLowerCase();
    expect(joined).not.toMatch(/lawyer|saudi|export-control|mark abate/);
  });
});

describe('Amkor catalog matching', () => {
  const pack = getSearchPack('amkor');

  it('returns S-Connect and FCBGA for AI packaging queries, not Quanex spacers', () => {
    const hits = pack.catalog.filter((item) =>
      itemMatchesQuery(item, 'S-Connect for AI accelerators', pack.bucketSynonyms)
    );
    expect(hits.some((item) => /s-connect/i.test(item.title))).toBe(true);
    expect(
      hits.every((item) => !/super spacer|duralite|quanex/i.test(`${item.title} ${item.href}`))
    ).toBe(true);
  });

  it('selects AI interconnect insight copy', () => {
    const insight = selectAiSearchInsight('S-Connect for AI accelerators', pack.insightRules);
    expect(insight?.id).toBe('ai-amkor-ai');
    expect(insight?.headline.toLowerCase()).toMatch(/interconnect|package/);
  });

  it('selects careers insight for talent queries', () => {
    const insight = selectAiSearchInsight('engineering careers in Arizona', pack.insightRules);
    expect(insight?.id).toBe('ai-amkor-careers');
  });

  it('selects Memory insight and catalog for memory packaging queries', () => {
    const insight = selectAiSearchInsight('Tell me about Amkor memory packaging', pack.insightRules);
    expect(insight?.id).toBe('ai-amkor-memory');
    expect(insight?.citations[0]?.href).toBe('/Packaging/Memory');
    const hits = pack.catalog.filter((item) =>
      itemMatchesQuery(item, 'Tell me about Amkor memory packaging', pack.bucketSynonyms)
    );
    expect(hits.some((item) => item.href === '/Packaging/Memory')).toBe(true);
  });

  it('selects careers insight for “help me find a career”', () => {
    const insight = selectAiSearchInsight('help me find a career', pack.insightRules);
    expect(insight?.id).toBe('ai-amkor-careers');
  });

  it('returns Careers pages for talent queries, not Quanex products', () => {
    const hits = pack.catalog.filter((item) =>
      itemMatchesQuery(item, 'engineering careers in Arizona', pack.bucketSynonyms)
    );
    expect(hits.some((item) => /careers/i.test(item.title))).toBe(true);
    expect(
      hits.every((item) => !/super spacer|duralite|quanex/i.test(`${item.title} ${item.href}`))
    ).toBe(true);
  });

  it('does not leak Quanex or Pillsbury popular searches', () => {
    const joined = pack.popularSearches.join(' ').toLowerCase();
    expect(joined).not.toMatch(/super spacer|lawyer|mark abate/);
  });
});

describe('Pillsbury catalog isolation', () => {
  it('still matches lawyer bios on pillsburylaw', () => {
    const pack = getSearchPack('pillsburylaw');
    const hits = pack.catalog.filter((item) =>
      itemMatchesQuery(item, 'Mark Abate intellectual property', pack.bucketSynonyms)
    );
    expect(hits.some((item) => /mark abate/i.test(item.title))).toBe(true);
  });
});
