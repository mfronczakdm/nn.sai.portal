/**
 * LCMC-only demo scheduling data. Slot dates are relative to `now` so a demo
 * next week still shows upcoming days (Word spec: current date PLUS).
 * Provider names come from Data/Physicians (same folder as PhysicianListing).
 * Not used by Quanex, ERA, AmesburyTruth, Amkor, or other portal sites.
 */

export const LCMC_APPOINTMENT_TIME_ZONE = 'America/Chicago';

/** Same folder PhysicianListing uses — source of truth for scheduler names. */
export const LCMC_PHYSICIANS_FOLDER_PATH = '/sitecore/content/lcmc/lcmc/Data/Physicians';

/** Demo ENT at West Jefferson Medical Center (Find a Provider story). */
export const LCMC_DEMO_ENT_PHYSICIAN_ID = '24EB9BF3-BFD6-4D01-87A7-BAF6D3DA421C';
export const LCMC_DEMO_ENT_PHYSICIAN_NAME = 'Gabrielle Moreau, MD';
export const LCMC_ENT_SPECIALTY = 'ENT';
export const LCMC_WJMC_LOCATION_ID = '35C77454-5FB8-460D-BC12-299F7B31DE5A';
export const LCMC_WJMC_LOCATION_NAME = 'West Jefferson Medical Center';

export const LCMC_VISIT_KEYS = [
  'check-up',
  'sick-visit',
  'medicine-behavior',
  'flu-shot',
  'covid-vaccine',
  'flu-and-covid',
] as const;

export type LcmcVisitKey = (typeof LCMC_VISIT_KEYS)[number];

export type LcmcProvider = {
  id: string;
  name: string;
  credentials: string;
  initials: string;
  clinic: string;
  address: string;
  locationId: string;
  specialty: string;
  locations: string[];
  isDemoEntWjmc: boolean;
};

export type LcmcTimeSlot = {
  id: string;
  start: Date;
  label: string;
};

export type LcmcSlotRow = {
  id: string;
  provider: LcmcProvider;
  slots: LcmcTimeSlot[];
};

export type LcmcDayGroup = {
  dateKey: string;
  header: string;
  rows: LcmcSlotRow[];
};

export type LcmcSelectedSlot = {
  visitKey: string;
  visitLabel: string;
  provider: LcmcProvider;
  start: Date;
  slotLabel: string;
  dateHeader: string;
};

export type LcmcPhysicianSourceLocation = {
  id?: string;
  name?: string;
  displayName?: string;
  locationTitle?: { jsonValue?: { value?: string } };
};

export type LcmcPhysicianSource = {
  id?: string;
  name?: string;
  physicianFullName?: { jsonValue?: { value?: string } };
  credentials?: { jsonValue?: { value?: string } };
  specialty?: { jsonValue?: { value?: string } };
  servingLocations?: {
    jsonValue?: unknown;
    targetItems?: LcmcPhysicianSourceLocation[];
  };
};

function normalizeItemId(id?: string | null): string {
  return (id ?? '').replace(/[{}]/g, '').toUpperCase();
}

function sourceLocationName(item: LcmcPhysicianSourceLocation): string {
  const title = item.locationTitle?.jsonValue?.value;
  if (typeof title === 'string' && title.trim()) return title.trim();
  return item.displayName?.trim() || item.name?.trim() || '';
}

/** Offline / test fallback when Edge physicians have not loaded yet. */
export const LCMC_FALLBACK_PROVIDERS: LcmcProvider[] = [
  {
    id: 'boudreaux',
    name: 'Maya Boudreaux, MD',
    credentials: 'MD',
    initials: 'MB',
    clinic: "Manning Family Children's Primary Care",
    address: '200 Henry Clay Ave, New Orleans, LA 70118',
    locationId: 'manning-uptown',
    specialty: 'Pediatrics',
    locations: ["Manning Family Children's Primary Care"],
    isDemoEntWjmc: false,
  },
  {
    id: 'chen',
    name: 'James Chen, MD',
    credentials: 'MD',
    initials: 'JC',
    clinic: "Manning Family Children's — Main Campus",
    address: '200 Henry Clay Ave, New Orleans, LA 70118',
    locationId: 'manning-main',
    specialty: 'Pediatrics',
    locations: ["Manning Family Children's — Main Campus"],
    isDemoEntWjmc: false,
  },
  {
    id: 'shah',
    name: 'Priya Shah, NP',
    credentials: 'NP',
    initials: 'PS',
    clinic: 'East Jefferson Pediatrics',
    address: '4200 Houma Blvd, Metairie, LA 70006',
    locationId: 'east-jeff',
    specialty: 'Pediatrics',
    locations: ['East Jefferson Pediatrics'],
    isDemoEntWjmc: false,
  },
];

function fieldText(field?: { jsonValue?: { value?: string } } | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function initialsFromName(name: string): string {
  const withoutCreds = name.replace(/,?\s*(MD|DO|NP|PA|RN|PhD|FACC|FAAP|FACS|FACOG)\b.*$/i, '');
  const parts = withoutCreds.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatPhysicianName(fullName: string, credentials: string): string {
  if (!fullName) return credentials;
  if (!credentials) return fullName;
  const credsPattern = new RegExp(`,?\\s*${credentials.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');
  if (credsPattern.test(fullName)) return fullName;
  return `${fullName}, ${credentials}`;
}

function locationNamesFromPhysician(physician: LcmcPhysicianSource): string[] {
  const fromTargets = (physician.servingLocations?.targetItems ?? [])
    .map((item) => {
      const titled = sourceLocationName(item);
      if (titled) return titled;
      const id = normalizeItemId(item.id);
      if (id === LCMC_WJMC_LOCATION_ID) return LCMC_WJMC_LOCATION_NAME;
      return '';
    })
    .filter(Boolean);

  if (fromTargets.length) return Array.from(new Set(fromTargets));

  const raw = physician.servingLocations?.jsonValue;
  const guidValue =
    typeof raw === 'string'
      ? raw
      : raw && typeof raw === 'object' && 'value' in raw
        ? String((raw as { value?: unknown }).value ?? '')
        : '';
  const ids = guidValue
    .split('|')
    .map((part) => normalizeItemId(part))
    .filter(Boolean);
  if (ids.includes(LCMC_WJMC_LOCATION_ID)) return [LCMC_WJMC_LOCATION_NAME];
  return [];
}

export function isLcmcDemoEntPhysician(
  physician: Pick<LcmcPhysicianSource, 'id' | 'name' | 'physicianFullName'> | LcmcProvider
): boolean {
  const id = normalizeItemId('id' in physician ? physician.id : undefined);
  if (id === LCMC_DEMO_ENT_PHYSICIAN_ID) return true;
  if ('isDemoEntWjmc' in physician && physician.isDemoEntWjmc) return true;
  const name =
    'physicianFullName' in physician
      ? fieldText(physician.physicianFullName) || physician.name || ''
      : physician.name;
  return /gabrielle\s+moreau/i.test(name);
}

export function toLcmcProvider(physician: LcmcPhysicianSource): LcmcProvider | null {
  const fullName = fieldText(physician.physicianFullName) || physician.name || '';
  if (!fullName) return null;

  const credentials = fieldText(physician.credentials);
  const name = formatPhysicianName(fullName.replace(/\s+MD$/i, '').trim() || fullName, credentials);
  const isDemo = isLcmcDemoEntPhysician(physician);
  const specialty = fieldText(physician.specialty) || (isDemo ? LCMC_ENT_SPECIALTY : '');
  const locations = locationNamesFromPhysician(physician);
  const withWjmc =
    isDemo && !locations.some((location) => location === LCMC_WJMC_LOCATION_NAME)
      ? [...locations, LCMC_WJMC_LOCATION_NAME]
      : locations;
  const clinic = withWjmc[0] || 'LCMC Health';

  return {
    id: physician.id || physician.name || name,
    name,
    credentials,
    initials: initialsFromName(name),
    clinic,
    address: clinic,
    locationId: normalizeItemId(physician.id) || physician.name || name,
    specialty: isDemo ? specialty || LCMC_ENT_SPECIALTY : specialty,
    locations: withWjmc,
    isDemoEntWjmc: isDemo,
  };
}

export function providersFromPhysicianListing(physicians: LcmcPhysicianSource[]): LcmcProvider[] {
  return physicians
    .map((physician) => toLcmcProvider(physician))
    .filter((provider): provider is LcmcProvider => Boolean(provider))
    .sort((left, right) => {
      if (left.isDemoEntWjmc !== right.isDemoEntWjmc) return left.isDemoEntWjmc ? -1 : 1;
      if ((left.specialty === LCMC_ENT_SPECIALTY) !== (right.specialty === LCMC_ENT_SPECIALTY)) {
        return left.specialty === LCMC_ENT_SPECIALTY ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });
}

export function listLcmcFilterOptions(providers: LcmcProvider[]): {
  clinics: string[];
  specialties: string[];
  names: string[];
} {
  const clinics = new Set<string>();
  const specialties = new Set<string>();
  providers.forEach((provider) => {
    provider.locations.forEach((location) => clinics.add(location));
    if (provider.clinic) clinics.add(provider.clinic);
    if (provider.specialty) specialties.add(provider.specialty);
  });
  return {
    clinics: Array.from(clinics).sort((a, b) => a.localeCompare(b)),
    specialties: Array.from(specialties).sort((a, b) => a.localeCompare(b)),
    names: providers.map((provider) => provider.name),
  };
}

const VISIT_LABELS: Record<LcmcVisitKey, string> = {
  'check-up': 'Well-child / physical',
  'sick-visit': 'Sick visit',
  'medicine-behavior': 'Medicine check or behavior concern',
  'flu-shot': 'Flu shot (seasonal)',
  'covid-vaccine': 'COVID-19 vaccine',
  'flu-and-covid': 'Flu and COVID-19',
};

const VISIT_DETAIL_PREFIX: Record<LcmcVisitKey, string> = {
  'check-up': 'Well-child visit with',
  'sick-visit': 'Primary Care Office Visit with',
  'medicine-behavior': 'Follow-up visit with',
  'flu-shot': 'Flu vaccine visit with',
  'covid-vaccine': 'COVID-19 vaccine visit with',
  'flu-and-covid': 'Flu and COVID-19 vaccine visit with',
};

export function isLcmcVisitKey(value: string | undefined | null): value is LcmcVisitKey {
  return Boolean(value && (LCMC_VISIT_KEYS as readonly string[]).includes(value));
}

export function lcmcVisitLabel(visitKey: string): string {
  return isLcmcVisitKey(visitKey) ? VISIT_LABELS[visitKey] : 'Primary care visit';
}

export function lcmcVisitDetailLine(visitKey: string, providerName: string): string {
  const prefix = isLcmcVisitKey(visitKey)
    ? VISIT_DETAIL_PREFIX[visitKey]
    : 'Primary Care Office Visit with';
  return `${prefix} ${providerName}`;
}

export function addCalendarDays(from: Date, days: number): Date {
  const next = new Date(from.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function formatLongWeekdayDate(
  date: Date,
  timeZone: string = LCMC_APPOINTMENT_TIME_ZONE
): string {
  const formatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(date);
  return formatted.replace(',', '');
}

export function formatSlotTime(
  date: Date,
  timeZone: string = LCMC_APPOINTMENT_TIME_ZONE
): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
    timeZoneName: 'short',
  }).format(date);
}

export function formatHoldUntil(
  date: Date,
  timeZone: string = LCMC_APPOINTMENT_TIME_ZONE
): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(date);
}

function dateKeyInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

function atHourOnDay(base: Date, dayOffset: number, hour: number, minute: number): Date {
  const day = addCalendarDays(base, dayOffset);
  const next = new Date(day.getTime());
  next.setHours(hour, minute, 0, 0);
  return next;
}

function slotId(providerId: string, start: Date): string {
  return `${providerId}-${start.getTime()}`;
}

function rowFor(
  provider: LcmcProvider,
  starts: Date[],
  timeZone: string
): LcmcSlotRow {
  return {
    id: `${provider.id}-${dateKeyInZone(starts[0], timeZone)}`,
    provider,
    slots: starts.map((start) => ({
      id: slotId(provider.id, start),
      start,
      label: formatSlotTime(start, timeZone),
    })),
  };
}

const DAY_OFFSETS = [1, 2, 4, 7] as const;
const SLOT_HOURS: [number, number][] = [
  [8, 30],
  [9, 15],
  [10, 0],
  [11, 30],
  [13, 15],
  [14, 0],
  [15, 45],
  [16, 30],
];

function slotStartsForProvider(day: Date, index: number): Date[] {
  const first = SLOT_HOURS[index % SLOT_HOURS.length];
  const second = SLOT_HOURS[(index + 3) % SLOT_HOURS.length];
  const third = SLOT_HOURS[(index + 5) % SLOT_HOURS.length];
  return [atHourOnDay(day, 0, first[0], first[1]), atHourOnDay(day, 0, second[0], second[1]), atHourOnDay(day, 0, third[0], third[1])];
}

/**
 * Upcoming availability grouped by day. Day offsets are +1 / +2 / +4 / +7 from `now`
 * so the first bookable day is always in the future. Every provider in `providers`
 * gets at least one row so Find a Provider names all appear in the scheduler.
 */
export function buildLcmcAvailability(options: {
  now: Date;
  visitKey?: string;
  timeZone?: string;
  providers?: LcmcProvider[];
}): LcmcDayGroup[] {
  const timeZone = options.timeZone ?? LCMC_APPOINTMENT_TIME_ZONE;
  const now = options.now;
  const providers =
    options.providers && options.providers.length > 0 ? options.providers : LCMC_FALLBACK_PROVIDERS;

  const buckets: LcmcProvider[][] = DAY_OFFSETS.map(() => []);
  providers.forEach((provider, index) => {
    buckets[index % DAY_OFFSETS.length].push(provider);
  });

  const demo = providers.find((provider) => provider.isDemoEntWjmc);
  if (demo && !buckets[0].some((provider) => provider.id === demo.id)) {
    buckets[0] = [demo, ...buckets[0]];
  }

  return DAY_OFFSETS.map((offset, dayIndex) => {
    const day = addCalendarDays(now, offset);
    return {
      dateKey: dateKeyInZone(day, timeZone),
      header: formatLongWeekdayDate(day, timeZone),
      rows: buckets[dayIndex].map((provider, rowIndex) =>
        rowFor(provider, slotStartsForProvider(day, rowIndex + dayIndex), timeZone)
      ),
    };
  });
}

export function listLcmcLocations(groups: LcmcDayGroup[]): string[] {
  const names = new Set<string>();
  groups.forEach((group) => {
    group.rows.forEach((row) => names.add(row.provider.clinic));
  });
  return Array.from(names);
}

export function listLcmcProviders(groups: LcmcDayGroup[]): string[] {
  const names = new Set<string>();
  groups.forEach((group) => {
    group.rows.forEach((row) => names.add(row.provider.name));
  });
  return Array.from(names);
}

export function providerMatchesClinic(provider: LcmcProvider, clinic: string): boolean {
  return provider.clinic === clinic || provider.locations.includes(clinic);
}

export function filterLcmcAvailability(
  groups: LcmcDayGroup[],
  filters: { clinics: string[]; providers: string[]; specialties?: string[] }
): LcmcDayGroup[] {
  const clinicSet = new Set(filters.clinics);
  const providerSet = new Set(filters.providers);
  const specialtySet = new Set(filters.specialties ?? []);
  const hasClinicFilter = clinicSet.size > 0;
  const hasProviderFilter = providerSet.size > 0;
  const hasSpecialtyFilter = specialtySet.size > 0;

  return groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => {
        const clinicOk =
          !hasClinicFilter ||
          Array.from(clinicSet).some((clinic) => providerMatchesClinic(row.provider, clinic));
        const providerOk = !hasProviderFilter || providerSet.has(row.provider.name);
        const specialtyOk = !hasSpecialtyFilter || specialtySet.has(row.provider.specialty);
        return clinicOk && providerOk && specialtyOk;
      }),
    }))
    .filter((group) => group.rows.length > 0);
}

export function findLcmcSlot(
  groups: LcmcDayGroup[],
  slotIdValue: string
): { group: LcmcDayGroup; row: LcmcSlotRow; slot: LcmcTimeSlot } | null {
  for (const group of groups) {
    for (const row of group.rows) {
      const slot = row.slots.find((item) => item.id === slotIdValue);
      if (slot) {
        return { group, row, slot };
      }
    }
  }
  return null;
}

export function confirmationNumber(now: Date): string {
  const stamp = now.getTime().toString(36).toUpperCase().slice(-6);
  return `LCMC-${stamp}`;
}
