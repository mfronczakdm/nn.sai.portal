import {
  addCalendarDays,
  buildLcmcAvailability,
  confirmationNumber,
  filterLcmcAvailability,
  findLcmcSlot,
  formatLongWeekdayDate,
  isLcmcVisitKey,
} from '@/lib/lcmc-appointment-pack';

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

  it('returns an LCMC confirmation number', () => {
    expect(confirmationNumber(now)).toMatch(/^LCMC-/);
  });
});
