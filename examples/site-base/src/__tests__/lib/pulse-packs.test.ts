import {
  getPulsePack,
  getPulseStarterPrompts,
  listPulsePackSiteNames,
  matchPulseIntentForSite,
  matchPulsePackIntent,
  normalizePulseSiteName,
} from '@/lib/pulse-packs';
import { composePulseAnswer } from '@/lib/pulse-answer';
import type { PulseSource } from '@/lib/pulse-types';

describe('pulse pack registry', () => {
  it('registers quanex, era, amesburytruth, pillsburylaw, and amkor', () => {
    expect(listPulsePackSiteNames().sort()).toEqual(
      ['amesburytruth', 'amkor', 'era', 'pillsburylaw', 'quanex'].sort()
    );
  });

  it('resolves packs by siteName (case-insensitive)', () => {
    expect(getPulsePack('Quanex').siteName).toBe('quanex');
    expect(getPulsePack('ERA').brandName).toBe('ERA');
    expect(getPulsePack('amesburytruth').homeRootId).toBe(
      '{A57ED898-AA1D-46E6-B7CF-7C7804688EC8}'
    );
    expect(getPulsePack('Amkor').homeRootId).toBe('{BB13BF5A-B102-4FE8-B410-63E3DA7AA448}');
    expect(getPulsePack('amkor').brandName).toBe('Amkor');
  });

  it('falls back safely when siteName is missing', () => {
    const pack = getPulsePack(null);
    expect(pack.siteName).toBeTruthy();
    expect(listPulsePackSiteNames()).toContain(pack.siteName);
  });

  it('normalizes site names', () => {
    expect(normalizePulseSiteName('  Quanex ')).toBe('quanex');
    expect(normalizePulseSiteName(undefined)).toBe('');
  });

  it('returns industry starter prompts (not law-firm copy) for Quanex family', () => {
    for (const site of ['quanex', 'era', 'amesburytruth'] as const) {
      const prompts = getPulseStarterPrompts(site);
      expect(prompts.length).toBeGreaterThanOrEqual(3);
      const joined = prompts.join(' ').toLowerCase();
      expect(joined).not.toMatch(/lawyer|saudi|export-control|portfolio company/);
    }
  });

  it('returns Amkor packaging and careers starters, not Quanex or law-firm copy', () => {
    const prompts = getPulseStarterPrompts('amkor');
    const joined = prompts.join(' ').toLowerCase();
    expect(joined).toMatch(/s-connect|swift|packaging/);
    expect(joined).toMatch(/career/);
    expect(joined).not.toMatch(/lawyer|super spacer|saudi/);
  });

  it('keeps Pillsbury Saudi / careers starters', () => {
    const prompts = getPulseStarterPrompts('pillsburylaw');
    expect(prompts.some((p) => /saudi/i.test(p))).toBe(true);
    expect(prompts.some((p) => /career/i.test(p))).toBe(true);
  });
});

describe('pulse pack intent matching', () => {
  it('matches quanex IG spacer intent', () => {
    const intent = matchPulseIntentForSite(
      'Which insulating glass spacers do you offer for residential windows?',
      'quanex'
    );
    expect(intent?.id).toBe('ig-spacers-warm-edge');
    expect(intent?.citationItemIds.length).toBeGreaterThan(0);
  });

  it('matches era door components intent', () => {
    const intent = matchPulseIntentForSite(
      'I need multi-point door locks and cylinders for entrance doors',
      'era'
    );
    expect(intent?.id).toBe('door-components');
  });

  it('matches amesburytruth weatherseals intent', () => {
    const intent = matchPulseIntentForSite('Show me pile weatherseals and door sweeps', 'amesburytruth');
    expect(intent?.id).toBe('weatherseals');
  });

  it('preserves pillsbury saudi expansion intent', () => {
    const intent = matchPulseIntentForSite(
      "We're expanding into Saudi Arabia and have export-control questions. Who should we talk to?",
      'pillsburylaw'
    );
    expect(intent?.id).toBe('saudi-expansion-export-controls');
    expect(intent?.citationItemIds[0]).toBe('{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}');
  });

  it('preserves pillsbury careers intent', () => {
    const intent = matchPulseIntentForSite(
      "I'm looking for a career in international trade. What openings do you have?",
      'pillsburylaw'
    );
    expect(intent?.id).toBe('careers-find-opening');
  });

  it('matches amkor S-Connect / AI packaging intent', () => {
    const intent = matchPulseIntentForSite(
      'Which packaging should I use for an AI accelerator with HBM?',
      'amkor'
    );
    expect(intent?.id).toBe('ai-advanced-packaging');
    expect(intent?.citationItemIds[0]).toBe('{1F93ED97-C9E0-4A5E-9B79-ABA7BEFD2157}');
  });

  it('matches amkor careers intent', () => {
    const intent = matchPulseIntentForSite(
      'I am looking for engineering careers at Amkor in Arizona',
      'amkor'
    );
    expect(intent?.id).toBe('careers-talent');
    expect(intent?.citationItemIds).toContain('{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}');
  });

  it('ranks Memory first for Amkor memory packaging Pulse asks', () => {
    const intent = matchPulseIntentForSite('Tell me about Amkor memory packaging', 'amkor');
    expect(intent?.id).toBe('memory-packaging');
    expect(intent?.citationItemIds[0]).toBe('{0EBC33FF-8697-49B8-A276-19BD86E99074}');
    expect(intent?.answer?.intro).toMatch(/\*\*Memory\*\*/);
  });

  it('keeps Memory citation fallbacks when Experience Edge misses the item', () => {
    const pack = getPulsePack('amkor');
    expect(pack.citationFallbacks?.['{0EBC33FF-8697-49B8-A276-19BD86E99074}']?.url).toBe(
      '/Packaging/Memory'
    );
    expect(pack.citationFallbacks?.['{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}']?.url).toBe(
      '/About-Us/Careers'
    );
  });

  it('matches Amkor Pulse careers for “help me find a career”', () => {
    const intent = matchPulseIntentForSite('help me find a career', 'amkor');
    expect(intent?.id).toBe('careers-talent');
    expect(intent?.citationItemIds[0]).toBe('{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}');
    expect(intent?.answer?.intro).toMatch(/\*\*Careers\*\*/);
  });

  it('does not steal HBM AI asks into the Memory Pulse intent', () => {
    const intent = matchPulseIntentForSite(
      'Which packaging should I use for an AI accelerator with HBM?',
      'amkor'
    );
    expect(intent?.id).toBe('ai-advanced-packaging');
  });

  it('does not cross-match amkor prompts against pillsbury pack', () => {
    const pack = getPulsePack('pillsburylaw');
    const intent = matchPulsePackIntent(
      'Which packaging should I use for an AI accelerator with HBM?',
      pack
    );
    expect(intent).toBeNull();
  });

  it('does not cross-match quanex prompts against pillsbury pack', () => {
    const pack = getPulsePack('pillsburylaw');
    const intent = matchPulsePackIntent(
      'Which insulating glass spacers do you offer for residential windows?',
      pack
    );
    expect(intent).toBeNull();
  });
});

describe('composePulseAnswer (multi-site)', () => {
  const productSources: PulseSource[] = [
    {
      id: '{C8A3F7B0-E2C4-4D27-AA20-D4018E333B38}',
      title: 'Products',
      url: '/Products',
      path: '/sitecore/content/quanex/quanex/Home/Products',
      excerpt: 'Quanex component solutions for residential and commercial fenestration.',
      type: 'product',
      score: 1000,
    },
    {
      id: '{9726E4D1-8FCD-4DD6-B5E9-BB4467655176}',
      title: 'Insulating Glass Spacers',
      url: '/Products/Insulating-Glass-Spacers',
      path: '/sitecore/content/quanex/quanex/Home/Products/Insulating Glass Spacers',
      excerpt: 'Warm-edge and IG spacer systems.',
      type: 'product',
      score: 950,
    },
  ];

  it('injects brandName and avoids Pillsbury-only lawyer copy for Quanex', () => {
    const pack = getPulsePack('quanex');
    const result = composePulseAnswer('IG spacers', productSources, { pack });
    expect(result.answer).toMatch(/Quanex/);
    expect(result.answer).not.toMatch(/lawyer bios/i);
    expect(result.sources[0].url).toBe('/Products');
  });

  it('uses pack type labels in product answers', () => {
    const pack = getPulsePack('quanex');
    const result = composePulseAnswer('products', productSources, { pack });
    expect(result.answer).toMatch(/\(Product\)/);
  });

  it('returns Edge-aware no-match message with brand', () => {
    const pack = getPulsePack('era');
    const result = composePulseAnswer('xyzzy unknown topic', [], { pack });
    expect(result.answer).toMatch(/ERA/);
    expect(result.answer).toMatch(/Experience Edge/i);
    expect(result.sources).toEqual([]);
  });

  it('keeps Pillsbury career framing when career sources dominate', () => {
    const pack = getPulsePack('pillsburylaw');
    const careers: PulseSource[] = [
      {
        id: '1',
        title: 'Associate — International Trade (Washington, DC)',
        url: '/Lawyers/Careers/Associate-International-Trade-Washington-DC',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Associate',
        excerpt: 'Trade associate role.',
        type: 'other',
        score: 1000,
      },
      {
        id: '2',
        title: 'How to Apply',
        url: '/Lawyers/Careers/How-to-Apply',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/How-to-Apply',
        excerpt: 'Application steps.',
        type: 'knowledge-article',
        score: 900,
      },
    ];
    const result = composePulseAnswer('career in international trade', careers, { pack });
    expect(result.answer).toMatch(/Pillsbury/);
    expect(result.answer).toMatch(/openings/i);
    expect(result.stateCallout).toMatch(/career/i);
  });

  it('uses Amkor brand and career framing for Amkor career pages', () => {
    const pack = getPulsePack('amkor');
    const careers: PulseSource[] = [
      {
        id: '{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}',
        title: 'Careers',
        url: '/About-Us/Careers',
        path: '/sitecore/content/amkor/amkor/Home/About Us/Careers',
        excerpt: 'Engineering, operations, and corporate careers.',
        type: 'other',
        score: 1000,
      },
      {
        id: '{74297BC9-7EA0-496D-A956-882BEFEE3230}',
        title: 'Careers — United States',
        url: '/About-Us/Careers/United-States',
        path: '/sitecore/content/amkor/amkor/Home/About Us/Careers/United-States',
        excerpt: 'U.S. roles including Arizona.',
        type: 'other',
        score: 900,
      },
    ];
    const result = composePulseAnswer('engineering careers in Arizona', careers, { pack });
    expect(result.answer).toMatch(/Amkor/);
    expect(result.answer).not.toMatch(/Quanex|Pillsbury|lawyer/i);
    expect(result.answer).toMatch(/\*\*Careers\*\*/);
    expect(result.sources[0].url).toBe('/About-Us/Careers');
    expect(result.stateCallout).toBeNull();
  });

  it('leads Amkor Pulse with Memory and a Search-style narrative', () => {
    const pack = getPulsePack('amkor');
    const memorySources: PulseSource[] = [
      {
        id: '{0EBC33FF-8697-49B8-A276-19BD86E99074}',
        title: 'Memory',
        url: '/Packaging/Memory',
        path: '/sitecore/content/amkor/amkor/Home/Packaging/Memory',
        excerpt: 'Memory packaging platforms for stacked and high-bandwidth memory.',
        type: 'product',
        score: 1000,
      },
      {
        id: '{764CB846-8081-439C-BAB5-A0BA97F45BF7}',
        title: 'FlipStack CSP',
        url: '/Packaging/Laminate/FlipStack-CSP',
        path: '/sitecore/content/amkor/amkor/Home/Packaging/Laminate/FlipStack CSP',
        excerpt: 'Stacked CSP for memory-plus-logic.',
        type: 'product',
        score: 950,
      },
    ];
    const result = composePulseAnswer('Tell me about Amkor memory packaging', memorySources, {
      pack,
    });
    expect(result.sources[0].url).toBe('/Packaging/Memory');
    expect(result.answer).toMatch(/\*\*Memory\*\*/);
    expect(result.answer).toMatch(/NAND|DRAM/i);
    expect(result.answer).not.toMatch(/Also in this journey|Citation cards below|keep top and center/i);
    expect(result.answer).not.toMatch(/Quanex|Pillsbury|lawyer/i);
  });

  it('uses Amkor career insight copy for “help me find a career”', () => {
    const pack = getPulsePack('amkor');
    const careers: PulseSource[] = [
      {
        id: '{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}',
        title: 'Careers',
        url: '/About-Us/Careers',
        path: '/sitecore/content/amkor/amkor/Home/About Us/Careers',
        excerpt: 'Global engineering, operations, and corporate openings.',
        type: 'other',
        score: 1000,
      },
      {
        id: '{74297BC9-7EA0-496D-A956-882BEFEE3230}',
        title: 'Careers — United States',
        url: '/About-Us/Careers/United-States',
        path: '/sitecore/content/amkor/amkor/Home/About Us/Careers/United-States',
        excerpt: 'U.S. roles including Arizona.',
        type: 'other',
        score: 900,
      },
    ];
    const result = composePulseAnswer('help me find a career', careers, { pack });
    expect(result.sources[0].url).toBe('/About-Us/Careers');
    expect(result.answer).toMatch(/\*\*Careers\*\*/);
    expect(result.answer).toMatch(/United States/);
    expect(result.answer).not.toMatch(/Also in this journey|Citation cards below/i);
    expect(result.answer).not.toMatch(/lawyer bios/i);
  });
});
