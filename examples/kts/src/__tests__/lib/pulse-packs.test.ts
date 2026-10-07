import {
  getPulsePack,
  getPulseStarterPrompts,
  listPulsePackSiteNames,
  matchPulseIntentForSite,
  normalizePulseSiteName,
} from '@/lib/pulse-packs';
import { composePulseAnswer } from '@/lib/pulse-answer';
import type { PulseSource } from '@/lib/pulse-types';

describe('pulse pack registry (cooley)', () => {
  it('registers cooley as the only pack', () => {
    expect(listPulsePackSiteNames()).toEqual(['cooley']);
  });

  it('resolves the cooley pack by siteName', () => {
    expect(getPulsePack('Cooley').siteName).toBe('cooley');
    expect(getPulsePack('cooley').homeRootId).toBe('{E17C24E2-6BC8-4415-8745-484D0DBBF8D0}');
    expect(getPulsePack('cooley').enableStatePersona).toBe(false);
  });

  it('falls back to cooley when siteName is missing', () => {
    expect(getPulsePack(null).siteName).toBe('cooley');
  });

  it('normalizes site names', () => {
    expect(normalizePulseSiteName('  Cooley ')).toBe('cooley');
  });

  it('returns Cooley starter prompts (not Pillsbury demo copy)', () => {
    const prompts = getPulseStarterPrompts('cooley');
    expect(prompts.length).toBeGreaterThanOrEqual(3);
    const joined = prompts.join(' ').toLowerCase();
    expect(joined).not.toMatch(/saudi|pillsbury|export-control|portfolio company/);
    expect(joined).toMatch(/practice|people|career|insight/);
  });
});

describe('pulse pack intent matching (cooley)', () => {
  it('matches people intent', () => {
    const intent = matchPulseIntentForSite('Who should I talk to at Cooley?', 'cooley');
    expect(intent?.id).toBe('people');
    expect(intent?.citationItemIds).toContain('{E94FC8B8-FAF1-47EF-8985-B2B39BD102D1}');
  });

  it('matches careers intent', () => {
    const intent = matchPulseIntentForSite('How do I explore careers at Cooley?', 'cooley');
    expect(intent?.id).toBe('careers');
  });
});

describe('composePulseAnswer (cooley pack)', () => {
  it('names Cooley and cites published sources', () => {
    const pack = getPulsePack('cooley');
    const sources: PulseSource[] = [
      {
        id: '{F93A9099-45BF-40DD-B1D0-1D4CD7CD2861}',
        title: 'Practices',
        url: '/Practices',
        path: '/sitecore/content/Cooley/cooley/Home/Practices',
        excerpt: 'Counsel across venture, IP, and litigation.',
        type: 'product',
        score: 20,
      },
    ];
    const payload = composePulseAnswer('Which practices can help with a venture financing?', sources, {
      pack,
    });
    expect(payload.answer).toMatch(/Cooley/);
    expect(payload.answer).not.toMatch(/Pillsbury/);
    expect(payload.sources[0].title).toBe('Practices');
  });
});
