/**
 * Languages shown on LCMC PhysicianDetail. Sitecore LanguagesSpoken wins when
 * authored; otherwise every physician speaks English and most also speak Spanish.
 */

export const LCMC_LANGUAGE_ENGLISH = 'English';
export const LCMC_LANGUAGE_SPANISH = 'Spanish';

const ENGLISH_ONLY_NAMES = new Set([
  'hannah scott',
  'keisha williams',
  'michael tran',
  'omar hassan',
  'priya raman',
  'thomas nguyen',
]);

function normalizePhysicianName(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/,?\s*(md|do|np|pa|rn|phd|facc|faap|facs|facog)\b.*$/i, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseLanguagesSpoken(value?: string | null): string[] {
  if (!value?.trim()) return [];
  const seen = new Set<string>();
  const languages: string[] = [];
  for (const part of value.split(/\s*(?:,|;|\/|\|)\s*/)) {
    const label = part.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    languages.push(label);
  }
  return languages;
}

export function resolveLcmcPhysicianLanguages(
  fullName: string,
  fieldValue?: string | null
): string[] {
  const authored = parseLanguagesSpoken(fieldValue);
  if (authored.length > 0) return authored;

  const name = normalizePhysicianName(fullName);
  if (!name) return [LCMC_LANGUAGE_ENGLISH];
  if (name.includes('gabrielle moreau') || name === 'gabrielle moreau') {
    return [LCMC_LANGUAGE_ENGLISH, LCMC_LANGUAGE_SPANISH];
  }
  if (ENGLISH_ONLY_NAMES.has(name)) {
    return [LCMC_LANGUAGE_ENGLISH];
  }
  return [LCMC_LANGUAGE_ENGLISH, LCMC_LANGUAGE_SPANISH];
}
