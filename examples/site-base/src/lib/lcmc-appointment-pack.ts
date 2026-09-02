/**
 * LCMC-only demo scheduling data. Slot dates are relative to `now` so a demo
 * next week still shows upcoming days (Word spec: current date PLUS).
 * Not used by Quanex, ERA, AmesburyTruth, Amkor, or other portal sites.
 */

export const LCMC_APPOINTMENT_TIME_ZONE = 'America/Chicago';

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

const PROVIDERS: LcmcProvider[] = [
  {
    id: 'boudreaux',
    name: 'Maya Boudreaux, MD',
    credentials: 'MD',
    initials: 'MB',
    clinic: "Manning Family Children's Primary Care",
    address: '200 Henry Clay Ave, New Orleans, LA 70118',
    locationId: 'manning-uptown',
  },
  {
    id: 'chen',
    name: 'James Chen, MD',
    credentials: 'MD',
    initials: 'JC',
    clinic: "Manning Family Children's — Main Campus",
    address: '200 Henry Clay Ave, New Orleans, LA 70118',
    locationId: 'manning-main',
  },
  {
    id: 'shah',
    name: 'Priya Shah, NP',
    credentials: 'NP',
    initials: 'PS',
    clinic: 'East Jefferson Pediatrics',
    address: '4200 Houma Blvd, Metairie, LA 70006',
    locationId: 'east-jeff',
  },
];

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

/**
 * Upcoming availability grouped by day. Day offsets are +1 / +2 / +4 / +7 from `now`
 * so the first bookable day is always in the future.
 */
export function buildLcmcAvailability(options: {
  now: Date;
  visitKey?: string;
  timeZone?: string;
}): LcmcDayGroup[] {
  const timeZone = options.timeZone ?? LCMC_APPOINTMENT_TIME_ZONE;
  const now = options.now;
  const [boudreaux, chen, shah] = PROVIDERS;

  const daySpecs: { offset: number; rows: (day: Date) => LcmcSlotRow[] }[] = [
    {
      offset: 1,
      rows: (day) => [
        rowFor(
          boudreaux,
          [atHourOnDay(day, 0, 9, 15), atHourOnDay(day, 0, 11, 30), atHourOnDay(day, 0, 14, 0)],
          timeZone
        ),
        rowFor(chen, [atHourOnDay(day, 0, 10, 0), atHourOnDay(day, 0, 15, 45)], timeZone),
      ],
    },
    {
      offset: 2,
      rows: (day) => [
        rowFor(
          shah,
          [atHourOnDay(day, 0, 8, 30), atHourOnDay(day, 0, 11, 45), atHourOnDay(day, 0, 13, 15)],
          timeZone
        ),
      ],
    },
    {
      offset: 4,
      rows: (day) => [
        rowFor(boudreaux, [atHourOnDay(day, 0, 9, 0), atHourOnDay(day, 0, 16, 30)], timeZone),
        rowFor(chen, [atHourOnDay(day, 0, 11, 0)], timeZone),
      ],
    },
    {
      offset: 7,
      rows: (day) => [
        rowFor(
          shah,
          [atHourOnDay(day, 0, 10, 15), atHourOnDay(day, 0, 12, 0), atHourOnDay(day, 0, 14, 45)],
          timeZone
        ),
      ],
    },
  ];

  const vaccineOnly = options.visitKey === 'flu-shot' || options.visitKey === 'covid-vaccine' || options.visitKey === 'flu-and-covid';

  return daySpecs.map((spec) => {
    const day = addCalendarDays(now, spec.offset);
    const rows = spec.rows(day).filter((row) => (vaccineOnly ? row.provider.id !== 'chen' : true));
    return {
      dateKey: dateKeyInZone(day, timeZone),
      header: formatLongWeekdayDate(day, timeZone),
      rows,
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

export function filterLcmcAvailability(
  groups: LcmcDayGroup[],
  filters: { clinics: string[]; providers: string[] }
): LcmcDayGroup[] {
  const clinicSet = new Set(filters.clinics);
  const providerSet = new Set(filters.providers);
  const hasClinicFilter = clinicSet.size > 0;
  const hasProviderFilter = providerSet.size > 0;

  return groups
    .map((group) => ({
      ...group,
      rows: group.rows.filter((row) => {
        const clinicOk = !hasClinicFilter || clinicSet.has(row.provider.clinic);
        const providerOk = !hasProviderFilter || providerSet.has(row.provider.name);
        return clinicOk && providerOk;
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
