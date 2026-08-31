import {
  hasFacetConfig,
  matchFacets,
  parseFacetConfig,
} from '@/components/uiim/insights/blog-listing.facets';
import { resolveBlogTopicMeta } from '@/components/uiim/insights/blog-listing.taxonomy';

const AMKOR_FACETS = [
  'Advanced Packaging | advanced packaging, packaging, ectc, next-gen',
  'Test & Assembly | assembly, test services, test',
  'Memory | memory, kioxia',
  'Sustainability | cdp, environmental, climate, water, renewable, emissions',
  'Workforce & Education | workforce, educator, bootcamp, cte, west-mec, student, talent, learning',
].join('\n');

describe('parseFacetConfig', () => {
  it('parses site-configured label / keyword pairs', () => {
    const rules = parseFacetConfig(AMKOR_FACETS);

    expect(rules.map((rule) => rule.label)).toEqual([
      'Advanced Packaging',
      'Test & Assembly',
      'Memory',
      'Sustainability',
      'Workforce & Education',
    ]);
    expect(rules[2].keywords).toEqual(['memory', 'kioxia']);
  });

  it('falls back to the label itself when a line has no keywords', () => {
    expect(parseFacetConfig('Automotive')).toEqual([
      { label: 'Automotive', keywords: ['automotive'] },
    ]);
  });

  it('ignores blank lines and merges duplicate labels', () => {
    const rules = parseFacetConfig('Memory | memory\n\n   \nMemory | kioxia');

    expect(rules).toEqual([{ label: 'Memory', keywords: ['memory', 'kioxia'] }]);
  });

  it('treats missing or empty configuration as unconfigured', () => {
    expect(parseFacetConfig(undefined)).toEqual([]);
    expect(parseFacetConfig(null)).toEqual([]);
    expect(parseFacetConfig('   \n  ')).toEqual([]);
    expect(hasFacetConfig('')).toBe(false);
    expect(hasFacetConfig(AMKOR_FACETS)).toBe(true);
  });
});

describe('matchFacets', () => {
  const rules = parseFacetConfig(AMKOR_FACETS);

  it('matches amkor blog copy to semiconductor topics, not legal taxonomy', () => {
    const haystack =
      'Amkor Showcases Next-Gen Packaging and U.S. Expansion at ECTC 2026 driving innovation in AI, HPC, and semiconductor manufacturing.';

    expect(matchFacets(rules, haystack)).toEqual(['Advanced Packaging']);
  });

  it('can match a blog to several configured topics', () => {
    const haystack =
      'Amkor Technology Launches Semiconductor Educator Bootcamp to Strengthen Future Workforce Pipeline';

    expect(matchFacets(rules, haystack)).toEqual(['Workforce & Education']);
  });

  it('returns nothing when a blog matches no configured keyword', () => {
    expect(matchFacets(rules, 'Quarterly dividend declared')).toEqual([]);
  });

  it('returns nothing when the site has configured no facets', () => {
    expect(matchFacets([], 'anything at all')).toEqual([]);
  });
});

describe('legacy legal taxonomy fallback', () => {
  it('still resolves curated specialties and lawyers for the law-firm blogs', () => {
    const meta = resolveBlogTopicMeta('Policyholder-Pulse', 'Policyholder Pulse');

    expect(meta.specialties).toContain('Insurance Recovery');
    expect(meta.lawyers.map((lawyer) => lawyer.name)).toContain('Stephen S. Asay');
  });

  it('still infers specialties from copy for unmapped legal blogs', () => {
    const meta = resolveBlogTopicMeta('Some-New-Blog', 'Export controls and sanctions compliance');

    expect(meta.specialties).toContain('International Trade');
  });
});
