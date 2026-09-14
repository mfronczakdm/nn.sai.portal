import {
  addCalendarDays,
  applyLcmcAppointmentQuery,
  buildLcmcAppointmentSearch,
  buildLcmcPhysicianAppointmentHref,
  buildLcmcAvailability,
  confirmationNumber,
  filterLcmcAvailability,
  findLcmcSlot,
  formatLongWeekdayDate,
  isLcmcVisitKey,
  LCMC_DEMO_ENT_PHYSICIAN_ID,
  LCMC_ENT_SPECIALTY,
  LCMC_WJMC_LOCATION_ID,
  LCMC_WJMC_LOCATION_NAME,
  listLcmcFilterOptions,
  parseLcmcAppointmentSearch,
  providersFromPhysicianListing,
  resolveLcmcDeepLinkVisit,
  shouldSkipLcmcVisitTypes,
} from '@/lib/lcmc-appointment-pack';

function json(value: string) {
  return { jsonValue: { value } };
}

describe('lcmc-appointment-pack', () => {
  const now = new Date('2026-09-02T15:00:00-05:00');

  it('treats only known visit keys as valid', () => {
    expect(isLcmcVisitKey('sick-visit')).toBe(true);
    expect(isLcmcVisitKey('equipment-ordering')).toBe(false);
  });

  it('builds upcoming days relative to now, not a hardcoded calendar date', () => {
    const groups = buildLcmcAvailability({ now, visitKey: 'sick-visit' });
    expect(groups).toHaveLength(4);
    expect(groups[0].header).toBe(formatLongWeekdayDate(addCalendarDays(now, 1)));
    expect(groups[1].header).toBe(formatLongWeekdayDate(addCalendarDays(now, 2)));
    expect(groups[2].header).toBe(formatLongWeekdayDate(addCalendarDays(now, 4)));
    expect(groups[0].rows[0].provider.name).toContain('Boudreaux');
    expect(groups[0].rows[0].slots.length).toBeGreaterThan(0);
  });

  it('shifts all headers when the demo date moves forward a week', () => {
    const nextWeek = addCalendarDays(now, 7);
    const groups = buildLcmcAvailability({ now: nextWeek, visitKey: 'sick-visit' });
    expect(groups[0].header).toBe(formatLongWeekdayDate(addCalendarDays(nextWeek, 1)));
    expect(groups[0].header).not.toBe(formatLongWeekdayDate(addCalendarDays(now, 1)));
  });

  it('filters by clinic and finds a slot by id', () => {
    const groups = buildLcmcAvailability({ now, visitKey: 'sick-visit' });
    const clinic = groups[0].rows[0].provider.clinic;
    const filtered = filterLcmcAvailability(groups, { clinics: [clinic], providers: [] });
    expect(filtered.every((day) => day.rows.every((row) => row.provider.clinic === clinic))).toBe(
      true
    );
    const slotId = groups[0].rows[0].slots[0].id;
    expect(findLcmcSlot(groups, slotId)?.slot.id).toBe(slotId);
    expect(findLcmcSlot(groups, 'missing')).toBeNull();
  });

  it('maps Data/Physicians into scheduler providers and flags Gabrielle Moreau as ENT at WJMC', () => {
    const physicians = [
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
      {
        id: `{${LCMC_DEMO_ENT_PHYSICIAN_ID}}`,
        name: 'Gabrielle Moreau MD',
        physicianFullName: json('Gabrielle Moreau'),
        credentials: json('MD'),
        specialty: json(LCMC_ENT_SPECIALTY),
        servingLocations: {
          jsonValue: `{${LCMC_WJMC_LOCATION_ID}}`,
          targetItems: [
            {
              id: `{${LCMC_WJMC_LOCATION_ID}}`,
              name: 'West Jefferson Medical Center',
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
          targetItems: [
            {
              id: `{${LCMC_WJMC_LOCATION_ID}}`,
              displayName: LCMC_WJMC_LOCATION_NAME,
            },
          ],
        },
      },
    ];

    const providers = providersFromPhysicianListing(physicians);
    expect(providers).toHaveLength(3);
    expect(providers[0].name).toBe('Gabrielle Moreau, MD');
    expect(providers[0].isDemoEntWjmc).toBe(true);
    expect(providers[0].specialty).toBe(LCMC_ENT_SPECIALTY);
    expect(providers[0].locations).toContain(LCMC_WJMC_LOCATION_NAME);

    const options = listLcmcFilterOptions(providers);
    expect(options.names).toHaveLength(3);
    expect(options.specialties).toContain(LCMC_ENT_SPECIALTY);
    expect(options.clinics).toContain(LCMC_WJMC_LOCATION_NAME);

    const groups = buildLcmcAvailability({ now, providers });
    const byEnt = filterLcmcAvailability(groups, {
      clinics: [],
      providers: [],
      specialties: [LCMC_ENT_SPECIALTY],
    });
    const entNames = byEnt.flatMap((day) => day.rows.map((row) => row.provider.name));
    expect(entNames).toContain('Gabrielle Moreau, MD');
    expect(entNames).toContain('Dominic Lirette, MD');
    expect(entNames).not.toContain('Camille Landry, MD, FACC');

    const byWjmc = filterLcmcAvailability(groups, {
      clinics: [LCMC_WJMC_LOCATION_NAME],
      providers: [],
    });
    const wjmcNames = byWjmc.flatMap((day) => day.rows.map((row) => row.provider.name));
    expect(wjmcNames).toContain('Gabrielle Moreau, MD');
    expect(wjmcNames).toContain('Dominic Lirette, MD');
  });

  it('gives every listed physician at least one slot', () => {
    const physicians = Array.from({ length: 26 }, (_, index) => ({
      id: `{00000000-0000-0000-0000-${String(index).padStart(12, '0')}}`,
      name: `Physician ${index}`,
      physicianFullName: json(`Physician ${index}`),
      credentials: json('MD'),
      specialty: json(index === 0 ? LCMC_ENT_SPECIALTY : 'Cardiology'),
      servingLocations: {
        targetItems:
          index === 0
            ? [{ id: `{${LCMC_WJMC_LOCATION_ID}}`, name: LCMC_WJMC_LOCATION_NAME }]
            : [{ id: 'loc-ej', name: 'East Jefferson General Hospital' }],
      },
    }));
    physicians[0].id = `{${LCMC_DEMO_ENT_PHYSICIAN_ID}}`;
    physicians[0].physicianFullName = json('Gabrielle Moreau');
    physicians[0].name = 'Gabrielle Moreau MD';

    const providers = providersFromPhysicianListing(physicians);
    expect(providers).toHaveLength(26);
    const groups = buildLcmcAvailability({ now, providers });
    const slotted = new Set(groups.flatMap((day) => day.rows.map((row) => row.provider.name)));
    expect(slotted.size).toBe(26);
    expect(slotted.has('Gabrielle Moreau, MD')).toBe(true);
  });

  it('returns an LCMC confirmation number', () => {
    expect(confirmationNumber(now)).toMatch(/^LCMC-/);
  });

  it('parses Pulse deep-link query params and maps clinic nicknames to WJMC', () => {
    const query = parseLcmcAppointmentSearch(
      '?visit=sick-visit&specialty=ENT&location=West%20Jefferson%20Medical%20Clinic&provider=Gabrielle%20Moreau'
    );
    expect(query.specialty).toBe('ENT');
    expect(query.location).toBe('West Jefferson Medical Clinic');
    expect(query.provider).toBe('Gabrielle Moreau');
    expect(query.visit).toBe('sick-visit');

    const applied = applyLcmcAppointmentQuery(query, {
      specialties: [LCMC_ENT_SPECIALTY, 'Cardiology'],
      clinics: [LCMC_WJMC_LOCATION_NAME, 'East Jefferson General Hospital'],
      names: ['Gabrielle Moreau, MD', 'Dominic Lirette, MD'],
    });
    expect(applied.specialties).toEqual([LCMC_ENT_SPECIALTY]);
    expect(applied.clinics).toEqual([LCMC_WJMC_LOCATION_NAME]);
    expect(applied.providers).toEqual(['Gabrielle Moreau, MD']);
    const href = buildLcmcAppointmentSearch({
      visit: 'sick-visit',
      specialty: LCMC_ENT_SPECIALTY,
      location: LCMC_WJMC_LOCATION_NAME,
      provider: 'Gabrielle Moreau',
    });
    const params = new URLSearchParams(href.split('?')[1]);
    expect(href.startsWith('/For-Patients/Patient-Appointments?')).toBe(true);
    expect(params.get('visit')).toBe('sick-visit');
    expect(params.get('specialty')).toBe(LCMC_ENT_SPECIALTY);
    expect(params.get('location')).toBe(LCMC_WJMC_LOCATION_NAME);
    expect(params.get('provider')).toBe('Gabrielle Moreau');
  });

  it('builds a physician profile CTA that skips visit types for that provider', () => {
    const href = buildLcmcPhysicianAppointmentHref({
      fullName: 'Gabrielle Moreau, MD',
      credentials: 'MD',
      specialty: LCMC_ENT_SPECIALTY,
      location: LCMC_WJMC_LOCATION_NAME,
    });
    const params = new URLSearchParams(href.split('?')[1]);
    expect(href.startsWith('/For-Patients/Patient-Appointments?')).toBe(true);
    expect(params.get('visit')).toBe('sick-visit');
    expect(params.get('specialty')).toBe(LCMC_ENT_SPECIALTY);
    expect(params.get('location')).toBe(LCMC_WJMC_LOCATION_NAME);
    expect(params.get('provider')).toBe('Gabrielle Moreau');
  });

  it('skips visit types when visit or step=slots is on the query string', () => {
    expect(shouldSkipLcmcVisitTypes(parseLcmcAppointmentSearch('?step=slots'))).toBe(true);
    expect(resolveLcmcDeepLinkVisit(parseLcmcAppointmentSearch('?step=slots'))).toBe('sick-visit');
    expect(shouldSkipLcmcVisitTypes(parseLcmcAppointmentSearch('?visit=sick-visit'))).toBe(true);
    expect(shouldSkipLcmcVisitTypes(parseLcmcAppointmentSearch('?specialty=ENT'))).toBe(false);
  });
});
