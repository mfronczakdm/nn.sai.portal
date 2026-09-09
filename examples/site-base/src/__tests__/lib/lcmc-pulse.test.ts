import { composePulseAnswer } from '@/lib/pulse-answer';
import {
  LCMC_ENT_SPECIALTY,
  LCMC_WJMC_LOCATION_NAME,
  providersFromPhysicianListing,
} from '@/lib/lcmc-appointment-pack';
import { getPulsePack } from '@/lib/pulse-packs';
import {
  buildLcmcAppointmentHref,
  composeLcmcPulseAnswer,
  lcmcOfflinePhysicianCatalog,
  matchLcmcProviders,
  parseLcmcPulseNeed,
  retrieveLcmcPulseSources,
} from '@/lib/pulse-packs/lcmc-care';
import { detectLcmcPulseLanguage } from '@/lib/pulse-packs/lcmc-language';
import { fetchPhysicianListingPayload } from '@/lib/physician-listing-from-edge';

jest.mock('@/lib/physician-listing-from-edge', () => ({
  fetchPhysicianListingPayload: jest.fn(),
}));

function json(value: string) {
  return { jsonValue: { value } };
}

const catalogPhysicians = [
  {
    id: '{24EB9BF3-BFD6-4D01-87A7-BAF6D3DA421C}',
    name: 'Gabrielle Moreau MD',
    physicianFullName: json('Gabrielle Moreau'),
    credentials: json('MD'),
    specialty: json(LCMC_ENT_SPECIALTY),
    servingLocations: {
      targetItems: [
        {
          id: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}',
          name: LCMC_WJMC_LOCATION_NAME,
          locationTitle: json(LCMC_WJMC_LOCATION_NAME),
        },
      ],
    },
  },
  {
    id: '{010E3311-06A7-4904-AFD0-202FD565A796}',
    name: 'Dominic Lirette MD',
    physicianFullName: json('Dominic Lirette'),
    credentials: json('MD'),
    specialty: json(LCMC_ENT_SPECIALTY),
    servingLocations: {
      targetItems: [{ id: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}', displayName: LCMC_WJMC_LOCATION_NAME }],
    },
  },
  {
    id: '{12B533A6-8DF8-4D80-B466-111A5B26B8E4}',
    name: 'Camille Landry MD',
    physicianFullName: json('Camille Landry'),
    credentials: json('MD, FACC'),
    specialty: json('Cardiology'),
    servingLocations: {
      targetItems: [
        {
          id: '{EFEAC293-2BF4-4516-873D-4EAC1F998474}',
          name: 'East Jefferson General Hospital',
          locationTitle: json('East Jefferson General Hospital'),
        },
      ],
    },
  },
];

describe('LCMC Pulse language detection', () => {
  it('detects Spanish from distinctive words and accents', () => {
    expect(detectLcmcPulseLanguage('Necesito un especialista de oído, nariz y garganta en West Jefferson')).toBe(
      'es'
    );
    expect(detectLcmcPulseLanguage('dolor de oído cerca de West Jefferson')).toBe('es');
    expect(detectLcmcPulseLanguage('I need someone for sinus problems near West Jefferson')).toBe('en');
    expect(detectLcmcPulseLanguage('Find a heart doctor at East Jefferson')).toBe('en');
  });
});

describe('LCMC Pulse need + provider matching', () => {
  const providers = providersFromPhysicianListing(catalogPhysicians);

  it('maps everyday ENT language and West Jefferson clinic nickname', () => {
    const en = parseLcmcPulseNeed('I need someone for sinus problems near West Jefferson');
    expect(en.language).toBe('en');
    expect(en.specialty).toBe(LCMC_ENT_SPECIALTY);
    expect(en.location).toBe(LCMC_WJMC_LOCATION_NAME);

    const es = parseLcmcPulseNeed('Necesito un especialista de oído, nariz y garganta en West Jefferson');
    expect(es.language).toBe('es');
    expect(es.specialty).toBe(LCMC_ENT_SPECIALTY);
    expect(es.location).toBe(LCMC_WJMC_LOCATION_NAME);
  });

  it('maps other specialties without becoming ENT-only', () => {
    expect(parseLcmcPulseNeed('Find a heart doctor at East Jefferson').specialty).toBe('Cardiology');
    expect(parseLcmcPulseNeed('I need a pediatrician for my child').specialty).toBe('Pediatrics');
    expect(parseLcmcPulseNeed('How do I book an appointment?').specialty).toBeUndefined();
    expect(parseLcmcPulseNeed('Who is near Lakeside Hospital?').specialty).toBeUndefined();
  });

  it('surfaces Gabrielle Moreau and Dominic Lirette for ENT at WJMC', () => {
    const matched = matchLcmcProviders(providers, {
      language: 'en',
      specialty: LCMC_ENT_SPECIALTY,
      location: LCMC_WJMC_LOCATION_NAME,
      wantsAppointment: true,
      wantsProvider: true,
    });
    expect(matched.map((provider) => provider.name)).toEqual([
      'Gabrielle Moreau, MD',
      'Dominic Lirette, MD',
    ]);
    expect(matched[0].isDemoEntWjmc).toBe(true);
  });

  it('builds a Patient Appointments deep link with specialty and location', () => {
    expect(
      buildLcmcAppointmentHref({
        specialty: LCMC_ENT_SPECIALTY,
        location: LCMC_WJMC_LOCATION_NAME,
      })
    ).toContain('specialty=ENT');
    const href = buildLcmcAppointmentHref({
      specialty: LCMC_ENT_SPECIALTY,
      location: LCMC_WJMC_LOCATION_NAME,
    });
    expect(new URLSearchParams(href.split('?')[1]).get('location')).toBe(LCMC_WJMC_LOCATION_NAME);
  });
});

describe('LCMC Pulse retrieve + answer', () => {
  beforeEach(() => {
    (fetchPhysicianListingPayload as jest.Mock).mockResolvedValue({
      physicians: catalogPhysicians,
      locations: [],
    });
  });

  it('retrieves ENT + WJMC physicians from the same catalog as Find a Provider', async () => {
    const sources = await retrieveLcmcPulseSources(
      'I need someone for sinus problems near West Jefferson'
    );
    const titles = sources.map((source) => source.title);
    expect(titles[0]).toBe('Gabrielle Moreau, MD');
    expect(titles).toContain('Dominic Lirette, MD');
    expect(titles).not.toContain('Camille Landry, MD, FACC');
    expect(sources.some((source) => source.url.startsWith('/For-Patients/Patient-Appointments?'))).toBe(true);
    expect(sources.some((source) => source.url === '/Find-a-Provider/Gabrielle-Moreau-MD')).toBe(true);
  });

  it('answers Spanish ENT asks in Spanish without translating physician names', async () => {
    const question = 'Necesito un especialista de oído, nariz y garganta en West Jefferson';
    const sources = await retrieveLcmcPulseSources(question);
    const result = composeLcmcPulseAnswer(question, sources);
    expect(result.answer).toMatch(/Estas son las opciones|encontré/);
    expect(result.answer).toContain('Gabrielle Moreau, MD');
    expect(result.answer).toContain('Dominic Lirette, MD');
    expect(result.answer).toContain(LCMC_WJMC_LOCATION_NAME);
    expect(result.answer).not.toMatch(/Here’s who I’d start with/);
  });

  it('uses the LCMC pack composer through shared composePulseAnswer', () => {
    const pack = getPulsePack('lcmc');
    const sources = [
      {
        id: '{24EB9BF3-BFD6-4D01-87A7-BAF6D3DA421C}',
        title: 'Gabrielle Moreau, MD',
        url: '/Find-a-Provider/Gabrielle-Moreau-MD',
        excerpt: 'ENT · West Jefferson Medical Center',
        type: 'people-and-teams' as const,
        score: 1000,
      },
    ];
    const result = composePulseAnswer('sinus problems near West Jefferson', sources, { pack });
    expect(result.answer).toContain('Gabrielle Moreau, MD');
    expect(result.answer).toMatch(/LCMC Health/);
    expect(result.answer).not.toMatch(/Quanex|Pillsbury|lawyer|product and category/i);
  });

  it('does not dump the full catalog for a generic book-appointment ask', async () => {
    const sources = await retrieveLcmcPulseSources('How do I book an appointment?');
    expect(sources.some((source) => source.url.startsWith('/For-Patients/Patient-Appointments'))).toBe(true);
    expect(sources.filter((source) => source.url.includes('/Find-a-Provider/')).length).toBe(0);
  });

  it('falls back to the offline ENT catalog when Edge returns no physicians', async () => {
    (fetchPhysicianListingPayload as jest.Mock).mockResolvedValue({ physicians: [], locations: [] });
    const offline = lcmcOfflinePhysicianCatalog();
    expect(offline.some((provider) => provider.name === 'Gabrielle Moreau, MD')).toBe(true);
    const sources = await retrieveLcmcPulseSources('ear pain at West Jefferson');
    expect(sources[0].title).toBe('Gabrielle Moreau, MD');
  });
});
