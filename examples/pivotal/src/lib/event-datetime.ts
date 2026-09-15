const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export { WEEKDAYS, MONTH_NAMES };

/** Parse Sitecore Datetime (`yyyyMMddTHHmmss[Z]`) or ISO into a wall-clock Date. */
export function parseSitecoreDateTime(raw?: string | null): Date | null {
  if (!raw) return null;
  const value = String(raw).trim();
  if (!value) return null;

  const sitecore = value.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/
  );
  if (sitecore) {
    const [, y, mo, d, h, mi, s] = sitecore;
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  }

  const isoLocal = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (isoLocal) {
    const [, y, mo, d, h, mi, s] = isoLocal;
    return new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(s || '0')
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${minutes} ${suffix}`;
}

export function formatLongDate(date: Date): string {
  return `${WEEKDAY_LONG[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateHeader(date: Date, eventCount: number): string {
  const noun = eventCount === 1 ? 'Event' : 'Events';
  return `${formatLongDate(date)} | ${eventCount} ${noun}`;
}

export function formatTimeRange(start: Date, end: Date | null, timezone: string): string {
  const tz = timezone.trim() || 'EST';
  if (!end) return `${formatTime(start)} ${tz}`;
  return `${formatTime(start)} - ${formatTime(end)} ${tz}`;
}

export function formatListingDateTime(start: Date, end: Date | null, timezone: string): string {
  return `${formatLongDate(start)} | ${formatTimeRange(start, end, timezone)}`;
}

export function toIcsLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}T${h}${mi}${s}`;
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcsEvent(options: {
  title: string;
  start: Date;
  end?: Date | null;
  location?: string;
  description?: string;
}): string {
  const end = options.end ?? new Date(options.start.getTime() + 60 * 60 * 1000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atlanta Apparel//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${toIcsLocal(options.start)}`,
    `DTEND:${toIcsLocal(end)}`,
    `SUMMARY:${icsEscape(options.title)}`,
  ];
  if (options.location) lines.push(`LOCATION:${icsEscape(options.location)}`);
  if (options.description) lines.push(`DESCRIPTION:${icsEscape(options.description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcsFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export type CalendarCell = {
  date: Date;
  inMonth: boolean;
  key: string;
};

export function buildMonthGrid(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1);
  const startOffset = first.getDay();
  const start = new Date(year, monthIndex, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return {
      date,
      inMonth: date.getMonth() === monthIndex,
      key: dateKey(date),
    };
  });
}

export function parentPathFromItemPath(itemPath?: string | null): string {
  if (!itemPath) return '/Visit/Events';
  const trimmed = itemPath.replace(/\/+$/, '');
  const slash = trimmed.lastIndexOf('/');
  if (slash <= 0) return trimmed || '/Visit/Events';
  return trimmed.slice(0, slash) || '/Visit/Events';
}
