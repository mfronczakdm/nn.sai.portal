export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeId(id: string | null | undefined): string {
  return (id ?? '').replace(/[{}]/g, '').toUpperCase();
}

export function parseGuidList(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split('|')
    .map((part) => normalizeId(part.trim()))
    .filter(Boolean);
}

export function fieldString(field: { value?: string | null } | null | undefined): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

export function isChecked(value: string): boolean {
  return value === '1' || value.toLowerCase() === 'true';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function physicianDisplayName(name: string, credentials: string): string {
  if (!credentials) return name;
  if (name.toLowerCase().endsWith(credentials.toLowerCase())) return name;
  return `${name}, ${credentials}`;
}

export function initialsFromName(name: string): string {
  const cleaned = name.replace(/,?\s*(md|do|np|pa|rn|phd|mph|facc|faap|facs|facog)\b/gi, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
