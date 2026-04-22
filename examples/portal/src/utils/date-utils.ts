export function formatDateInUTC(dateString: string, options: Intl.DateTimeFormatOptions = {}) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  });
}
