import {
  LCMC_ENT_SPECIALTY,
  LCMC_PHYSICIANS_FOLDER_PATH,
  LCMC_WJMC_LOCATION_NAME,
  isLcmcDemoEntPhysician,
  providersFromPhysicianListing,
  type LcmcPhysicianSource,
  type LcmcProvider,
} from '@/lib/lcmc-appointment-pack';
import type { PulseAskResponse, PulseRetrieveOptions, PulseSource } from '@/lib/pulse-types';

import { detectLcmcPulseLanguage, type LcmcPulseLanguage } from './lcmc-language';
import { foldPulseText } from './match';

export const LCMC_FIND_PROVIDER_PATH = '/Find-a-Provider';
export const LCMC_APPOINTMENTS_PATH = '/For-Patients/Patient-Appointments';
export const LCMC_ENT_SERVICE_PATH = '/Our-Services/Ears-Nose-and-Throat-Care';
export const LCMC_WJMC_PAGE_PATH = '/Our-Locations/West-Jefferson-Medical-Center';

export const LCMC_FIND_PROVIDER_ID = '{BAE717F7-D99D-4722-8FAF-CED2581DF809}';
export const LCMC_APPOINTMENTS_ID = '{96B478C7-15AA-47E2-9457-722E6BCC9D92}';
export const LCMC_ENT_SERVICE_ID = '{87C759FA-EFED-4FAE-80EA-5CD10A4C0046}';
export const LCMC_WJMC_PAGE_ID = '{130578E9-32C7-474B-9C19-E452C5DD0215}';
export const LCMC_LIRETTE_PHYSICIAN_ID = '010E3311-06A7-4904-AFD0-202FD565A796';

type SpecialtyAlias = {
  specialty: string;
  tokens: string[];
};

/**
 * Everyday language → catalog Specialty strings. Generic across specialties;
 * ENT is one path, not the only path.
 */
const SPECIALTY_ALIASES: SpecialtyAlias[] = [
  {
    specialty: LCMC_ENT_SPECIALTY,
    tokens: [
      'ent',
      'ear',
      'ears',
      'sinus',
      'sinuses',
      'tonsil',
      'tonsils',
      'hearing',
      'throat',
      'otolaryngology',
      'otolaryngologist',
      'otolaryngolog',
      'nose',
      'nasal',
      'oido',
      'oidos',
      'senos',
      'amigdala',
      'amigdalas',
      'garganta',
      'audicion',
      'otorrino',
      'otorrinolaringologia',
      'nariz',
    ],
  },
  {
    specialty: 'Cardiology',
    tokens: [
      'heart',
      'cardiac',
      'cardio',
      'cardiology',
      'cardiologist',
      'vascular',
      'corazon',
      'cardiologo',
      'cardiologia',
    ],
  },
  {
    specialty: 'Orthopedics',
    tokens: [
      'ortho',
      'orthopedic',
      'orthopedics',
      'bone',
      'joint',
      'knee',
      'hip',
      'fracture',
      'ortopedia',
      'ortopedista',
      'rodilla',
      'hueso',
    ],
  },
  {
    specialty: 'Pediatrics',
    tokens: [
      'pediatric',
      'pediatrics',
      'pediatrician',
      'child',
      'children',
      'kid',
      'kids',
      'baby',
      'pediatra',
      'nino',
      'nina',
      'ninos',
    ],
  },
  {
    specialty: 'Dermatology',
    tokens: ['skin', 'rash', 'derm', 'dermatology', 'dermatologist', 'piel', 'dermatologo'],
  },
  {
    specialty: 'Oncology',
    tokens: ['cancer', 'oncology', 'oncologist', 'tumor', 'oncologia', 'oncologo'],
  },
  {
    specialty: 'Primary Care',
    tokens: ['primary', 'family', 'checkup', 'check-up', 'pcp', 'familiar'],
  },
];

const LOCATION_ALIASES: { name: string; tokens: string[][] }[] = [
  {
    name: LCMC_WJMC_LOCATION_NAME,
    tokens: [
      ['west', 'jefferson'],
      ['wjmc'],
      ['jefferson', 'medical', 'clinic'],
      ['jefferson', 'medical', 'center'],
      ['west', 'jeff'],
    ],
  },
  {
    name: 'East Jefferson General Hospital',
    tokens: [['east', 'jefferson'], ['east', 'jeff'], ['ejgh']],
  },
  {
    name: 'University Medical Center New Orleans',
    tokens: [['university', 'medical'], ['umc']],
  },
  { name: 'Touro', tokens: [['touro']] },
  {
    name: "Manning Family Children's",
    tokens: [['manning'], ['childrens']],
  },
  {
    name: 'New Orleans East Hospital',
    tokens: [['new', 'orleans', 'east'], ['noeh']],
  },
  { name: 'Lakeside Hospital', tokens: [['lakeside']] },
  { name: 'Lakeview Hospital', tokens: [['lakeview']] },
];

const APPOINTMENT_TOKENS = [
  'book',
  'appointment',
  'schedule',
  'cita',
  'citas',
  'reservar',
  'reserva',
  'agendar',
  'turno',
];

const PROVIDER_TOKENS = [
  'doctor',
  'physician',
  'provider',
  'specialist',
  'medico',
  'medica',
  'especialista',
  'find',
  'someone',
  'who',
];

export type LcmcPulseNeed = {
  language: LcmcPulseLanguage;
  specialty?: string;
  location?: string;
  wantsAppointment: boolean;
  wantsProvider: boolean;
};

export function normalizeLcmcNeedle(value: string): string {
  return foldPulseText(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsLcmcToken(haystack: string, token: string): boolean {
  if (!token) return false;
  if (token.includes(' ')) return haystack.includes(token);
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\s)${escaped}(?:\\s|$)`).test(haystack);
}

export function parseLcmcPulseNeed(question: string): LcmcPulseNeed {
  const language = detectLcmcPulseLanguage(question);
  const normalized = normalizeLcmcNeedle(question);
  const specialty = matchSpecialty(normalized);
  const location = matchLocationAlias(normalized);

  return {
    language,
    specialty,
    location,
    wantsAppointment: APPOINTMENT_TOKENS.some((token) => containsLcmcToken(normalized, token)),
    wantsProvider:
      PROVIDER_TOKENS.some((token) => containsLcmcToken(normalized, token)) ||
      Boolean(specialty) ||
      Boolean(location),
  };
}

function matchSpecialty(normalized: string): string | undefined {
  let best: { specialty: string; score: number } | null = null;
  for (const alias of SPECIALTY_ALIASES) {
    for (const token of alias.tokens) {
      if (!containsLcmcToken(normalized, token)) continue;
      const score = token.length;
      if (!best || score > best.score) best = { specialty: alias.specialty, score };
    }
  }
  return best?.specialty;
}

function matchLocationAlias(normalized: string): string | undefined {
  for (const alias of LOCATION_ALIASES) {
    if (alias.tokens.some((group) => group.every((token) => containsLcmcToken(normalized, token)))) {
      return alias.name;
    }
  }
  return undefined;
}

export function resolveLcmcLocationFromCatalog(
  question: string,
  locationNames: string[]
): string | undefined {
  const fromAlias = matchLocationAlias(normalizeLcmcNeedle(question));
  if (fromAlias) {
    const catalogHit = locationNames.find(
      (name) => normalizeLcmcNeedle(name) === normalizeLcmcNeedle(fromAlias)
    );
    return catalogHit || fromAlias;
  }

  const normalized = normalizeLcmcNeedle(question);
  return locationNames.find((name) => {
    const folded = normalizeLcmcNeedle(name);
    return folded.length >= 5 && containsLcmcToken(normalized, folded);
  });
}

export function matchLcmcProvidersByName(question: string, providers: LcmcProvider[]): LcmcProvider[] {
  const normalized = normalizeLcmcNeedle(question);
  return providers.filter((provider) => {
      const parts = normalizeLcmcNeedle(provider.name)
      .split(' ')
      .filter((part) => part.length >= 4 && part !== 'md' && part !== 'facc' && part !== 'faap');
    return parts.some((part) => containsLcmcToken(normalized, part));
  });
}

export function matchLcmcProviders(providers: LcmcProvider[], need: LcmcPulseNeed): LcmcProvider[] {
  const specialtyNeedle = need.specialty ? normalizeLcmcNeedle(need.specialty) : '';
  const locationNeedle = need.location ? normalizeLcmcNeedle(need.location) : '';

  const filtered = providers.filter((provider) => {
    const specialtyOk =
      !specialtyNeedle ||
      normalizeLcmcNeedle(provider.specialty).includes(specialtyNeedle) ||
      specialtyNeedle.includes(normalizeLcmcNeedle(provider.specialty));
    const locationOk =
      !locationNeedle ||
      [provider.clinic, ...provider.locations].some((location) =>
        normalizeLcmcNeedle(location).includes(locationNeedle)
      );
    return specialtyOk && locationOk;
  });

  return [...filtered].sort((left, right) => {
    if (left.isDemoEntWjmc !== right.isDemoEntWjmc) return left.isDemoEntWjmc ? -1 : 1;
    const leftEntWjmc = isEntAtWjmc(left);
    const rightEntWjmc = isEntAtWjmc(right);
    if (leftEntWjmc !== rightEntWjmc) return leftEntWjmc ? -1 : 1;
    return left.name.localeCompare(right.name);
  });
}

function isEntAtWjmc(provider: LcmcProvider): boolean {
  return (
    provider.specialty === LCMC_ENT_SPECIALTY &&
    provider.locations.some((location) => location === LCMC_WJMC_LOCATION_NAME)
  );
}

export function isLcmcLirettePhysician(
  physician: Pick<LcmcPhysicianSource, 'id' | 'name' | 'physicianFullName'> | LcmcProvider
): boolean {
  const id = (('id' in physician ? physician.id : '') ?? '').replace(/[{}]/g, '').toUpperCase();
  if (id === LCMC_LIRETTE_PHYSICIAN_ID) return true;
  const name =
    'physicianFullName' in physician
      ? physician.physicianFullName?.jsonValue?.value || physician.name || ''
      : physician.name;
  return /dominic\s+lirette/i.test(name);
}

export function lcmcPhysicianDetailHref(
  physician: LcmcPhysicianSource,
  provider: LcmcProvider
): string {
  if (isLcmcDemoEntPhysician(physician) || /gabrielle\s+moreau/i.test(provider.name)) {
    return '/Find-a-Provider/Gabrielle-Moreau-MD';
  }
  if (isLcmcLirettePhysician(physician) || /dominic\s+lirette/i.test(provider.name)) {
    return '/Find-a-Provider/Dominic-Lirette-MD';
  }
  const segment = (physician.name || provider.name.replace(/,/g, '')).trim().replace(/\s+/g, '-');
  return segment ? `${LCMC_FIND_PROVIDER_PATH}/${segment}` : LCMC_FIND_PROVIDER_PATH;
}

export function buildLcmcAppointmentHref(need: Pick<LcmcPulseNeed, 'specialty' | 'location'>): string {
  const params = new URLSearchParams();
  if (need.specialty) params.set('specialty', need.specialty);
  if (need.location) params.set('location', need.location);
  const query = params.toString();
  return query ? `${LCMC_APPOINTMENTS_PATH}?${query}` : LCMC_APPOINTMENTS_PATH;
}

function pageSource(
  id: string,
  title: string,
  url: string,
  excerpt: string,
  type: PulseSource['type'],
  score: number
): PulseSource {
  return { id, title, url, excerpt, type, score };
}

function providerToSource(physician: LcmcPhysicianSource, provider: LcmcProvider, score: number): PulseSource {
  const locations = provider.locations.join(', ') || provider.clinic;
  const phone =
    'physicianPhone' in physician
      ? String(
          (physician as { physicianPhone?: { jsonValue?: { value?: string } } }).physicianPhone
            ?.jsonValue?.value || ''
        ).trim()
      : '';
  const bits = [provider.specialty, locations, phone].filter(Boolean);
  return {
    id: provider.id,
    title: provider.name,
    url: lcmcPhysicianDetailHref(physician, provider),
    excerpt: bits.join(' · '),
    type: 'people-and-teams',
    score,
  };
}

const OFFLINE_PHYSICIANS: LcmcPhysicianSource[] = [
  {
    id: '{24EB9BF3-BFD6-4D01-87A7-BAF6D3DA421C}',
    name: 'Gabrielle Moreau MD',
    physicianFullName: { jsonValue: { value: 'Gabrielle Moreau' } },
    credentials: { jsonValue: { value: 'MD' } },
    specialty: { jsonValue: { value: LCMC_ENT_SPECIALTY } },
    servingLocations: {
      targetItems: [
        {
          id: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}',
          name: LCMC_WJMC_LOCATION_NAME,
          locationTitle: { jsonValue: { value: LCMC_WJMC_LOCATION_NAME } },
        },
      ],
    },
  },
  {
    id: `{${LCMC_LIRETTE_PHYSICIAN_ID}}`,
    name: 'Dominic Lirette MD',
    physicianFullName: { jsonValue: { value: 'Dominic Lirette' } },
    credentials: { jsonValue: { value: 'MD' } },
    specialty: { jsonValue: { value: LCMC_ENT_SPECIALTY } },
    servingLocations: {
      targetItems: [
        {
          id: '{35C77454-5FB8-460D-BC12-299F7B31DE5A}',
          displayName: LCMC_WJMC_LOCATION_NAME,
        },
      ],
    },
  },
  {
    id: '{12B533A6-8DF8-4D80-B466-111A5B26B8E4}',
    name: 'Camille Landry MD',
    physicianFullName: { jsonValue: { value: 'Camille Landry' } },
    credentials: { jsonValue: { value: 'MD, FACC' } },
    specialty: { jsonValue: { value: 'Cardiology' } },
    servingLocations: {
      targetItems: [
        {
          id: '{EFEAC293-2BF4-4516-873D-4EAC1F998474}',
          name: 'East Jefferson General Hospital',
          locationTitle: { jsonValue: { value: 'East Jefferson General Hospital' } },
        },
      ],
    },
  },
];

export function lcmcOfflinePhysicianCatalog(): LcmcProvider[] {
  return providersFromPhysicianListing(OFFLINE_PHYSICIANS);
}

export async function loadLcmcPulseProviders(): Promise<{
  physicians: LcmcPhysicianSource[];
  providers: LcmcProvider[];
}> {
  try {
    const { fetchPhysicianListingPayload } = await import('@/lib/physician-listing-from-edge');
    const payload = await fetchPhysicianListingPayload({
      path: LCMC_PHYSICIANS_FOLDER_PATH,
      language: 'en',
      edgeMode: 'live',
    });
    if (payload.physicians.length > 0) {
      return {
        physicians: payload.physicians,
        providers: providersFromPhysicianListing(payload.physicians),
      };
    }
  } catch (error) {
    console.error('[lcmc-pulse] physician catalog fetch failed', error);
  }

  return {
    physicians: OFFLINE_PHYSICIANS,
    providers: lcmcOfflinePhysicianCatalog(),
  };
}

export async function retrieveLcmcPulseSources(
  question: string,
  _options?: PulseRetrieveOptions
): Promise<PulseSource[]> {
  const need = parseLcmcPulseNeed(question);
  const catalog = await loadLcmcPulseProviders();
  const locationNames = Array.from(
    new Set(catalog.providers.flatMap((provider) => [provider.clinic, ...provider.locations]))
  );
  const resolvedNeed: LcmcPulseNeed = {
    ...need,
    location: need.location || resolveLcmcLocationFromCatalog(question, locationNames),
  };

  const named = matchLcmcProvidersByName(question, catalog.providers);
  const filtered = matchLcmcProviders(catalog.providers, resolvedNeed);
  const matched = (
    named.length
      ? named.filter((provider) => filtered.some((item) => item.id === provider.id) || (!resolvedNeed.specialty && !resolvedNeed.location))
      : resolvedNeed.specialty || resolvedNeed.location
        ? filtered
        : []
  ).slice(0, 5);
  const byId = new Map(catalog.physicians.map((item) => [normalizeId(item.id), item]));

  const sources: PulseSource[] = [];

  matched.forEach((provider, index) => {
    const physician =
      byId.get(normalizeId(provider.id)) ||
      catalog.physicians.find((item) => isLcmcDemoEntPhysician(item) && provider.isDemoEntWjmc) ||
      { id: provider.id, name: provider.name };
    sources.push(providerToSource(physician, provider, 1000 - index * 20));
  });

  if (resolvedNeed.wantsAppointment || matched.length > 0 || resolvedNeed.wantsProvider) {
    sources.push(
      pageSource(
        LCMC_APPOINTMENTS_ID,
        resolvedNeed.language === 'es' ? 'Reservar una cita' : 'Book an appointment',
        buildLcmcAppointmentHref(resolvedNeed),
        resolvedNeed.language === 'es'
          ? 'Patient Appointments — elija un tipo de visita y un horario.'
          : 'Patient Appointments — pick a visit type and time.',
        'other',
        850
      )
    );
  }

  sources.push(
    pageSource(
      LCMC_FIND_PROVIDER_ID,
      'Find a Provider',
      LCMC_FIND_PROVIDER_PATH,
      resolvedNeed.language === 'es'
        ? 'Directorio publicado de médicos de LCMC Health.'
        : 'Published LCMC Health physician directory.',
      'people-and-teams',
      800
    )
  );

  if (resolvedNeed.specialty === LCMC_ENT_SPECIALTY) {
    sources.push(
      pageSource(
        LCMC_ENT_SERVICE_ID,
        'Ears, Nose and Throat Care',
        LCMC_ENT_SERVICE_PATH,
        'ENT / otolaryngology care at LCMC Health hospitals.',
        'other',
        780
      )
    );
  }

  if (resolvedNeed.location === LCMC_WJMC_LOCATION_NAME) {
    sources.push(
      pageSource(
        LCMC_WJMC_PAGE_ID,
        LCMC_WJMC_LOCATION_NAME,
        LCMC_WJMC_PAGE_PATH,
        'Hospital location in the LCMC Health system.',
        'other',
        760
      )
    );
  }

  return sources;
}

function normalizeId(id?: string): string {
  return (id ?? '').replace(/[{}]/g, '').toUpperCase();
}

export function composeLcmcPulseAnswer(question: string, sources: PulseSource[]): PulseAskResponse {
  const language = detectLcmcPulseLanguage(question);
  const need = parseLcmcPulseNeed(question);
  const providers = sources.filter((source) => source.type === 'people-and-teams' && source.url.includes('/Find-a-Provider/'));
  const book = sources.find((source) => source.url.startsWith(LCMC_APPOINTMENTS_PATH));
  const q = question.trim();

  if (!sources.length) {
    return {
      answer:
        language === 'es'
          ? `Busqué médicos publicados de LCMC Health para “${q}” y no encontré una coincidencia clara. Pruebe una especialidad, un hospital o reserve en Patient Appointments.`
          : `I searched published LCMC Health physicians for “${q}” and didn’t find a strong match. Try a specialty, a hospital name, or book from Patient Appointments.`,
      sources: [],
      stateCallout: null,
      personaState: null,
    };
  }

  const lines: string[] = [];
  if (providers.length) {
    lines.push(
      language === 'es'
        ? `Estas son las opciones que encontré para “${q}”, según los médicos publicados de LCMC Health.`
        : `Here’s who I’d start with for “${q}” — based on published LCMC Health physicians.`
    );
    for (const provider of providers.slice(0, 4)) {
      const bit = provider.excerpt ? ` ${provider.excerpt}.` : '';
      lines.push(`**${provider.title}**.${bit}`);
    }
  } else {
    lines.push(
      language === 'es'
        ? `Esto es lo que encontré en el sitio publicado de LCMC Health para “${q}”.`
        : `Here’s what I’d start with for “${q}” — based on published LCMC Health pages.`
    );
  }

  if (need.specialty || need.location) {
    const filters = [need.specialty, need.location].filter(Boolean).join(' · ');
    lines.push(
      language === 'es'
        ? `Filtro sugerido: ${filters}. Los nombres propios de médicos y hospitales no se traducen.`
        : `Suggested filter: ${filters}.`
    );
  }

  if (book) {
    lines.push(
      language === 'es'
        ? `Para reservar, abra **${book.title}**. El enlace aplica los filtros de la búsqueda cuando el programador los admite.`
        : `To book, open **${book.title}**. That link carries matching specialty and location filters when the scheduler supports them.`
    );
  } else {
    lines.push(
      language === 'es'
        ? 'Abra una ficha abajo para ver la página publicada.'
        : 'Open a card below to view the published page.'
    );
  }

  const ordered = [
    ...providers,
    ...sources.filter((source) => !providers.some((provider) => provider.id === source.id)),
  ];

  return {
    answer: lines.join('\n\n'),
    sources: ordered,
    stateCallout: null,
    personaState: null,
  };
}
