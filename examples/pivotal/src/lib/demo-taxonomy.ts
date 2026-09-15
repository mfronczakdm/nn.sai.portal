export const DEMO_TAXONOMY_STORAGE_KEY = 'demo-user-taxonomy';
export const DEMO_TAXONOMY_CHANGE_EVENT = 'demo-taxonomy-change';

export const DEMO_USER_PERSONAS = [
  'Internal Agent licensed in FL',
  'Claims Specialist licensed in NC',
] as const;

export type DemoUserTaxonomy = (typeof DEMO_USER_PERSONAS)[number];

export const DEFAULT_DEMO_TAXONOMY: DemoUserTaxonomy = 'Internal Agent licensed in FL';

/** Sentinel value for the persona switcher logout action (not stored in localStorage). */
export const DEMO_TAXONOMY_LOGOUT_VALUE = '__demo_logout__';

export function parseDemoUserTaxonomy(raw: string | undefined | null): DemoUserTaxonomy | null {
  const value = raw?.trim();
  if (!value) return null;

  return (DEMO_USER_PERSONAS as readonly string[]).includes(value) ? (value as DemoUserTaxonomy) : null;
}

export function getPersonaCode(persona: DemoUserTaxonomy): string {
  const codes: Record<DemoUserTaxonomy, string> = {
    'Internal Agent licensed in FL': 'ia-fl',
    'Claims Specialist licensed in NC': 'cs-nc',
  };

  return codes[persona];
}

/** US state code for licensed demo personas (used to filter state-specific shared content). */
export function getPersonaStateCode(persona: DemoUserTaxonomy): string {
  const states: Record<DemoUserTaxonomy, string> = {
    'Internal Agent licensed in FL': 'FL',
    'Claims Specialist licensed in NC': 'NC',
  };

  return states[persona];
}

export function clearStoredDemoTaxonomy(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_TAXONOMY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(DEMO_TAXONOMY_CHANGE_EVENT, { detail: { taxonomy: '' } }));
}

export function setStoredDemoTaxonomy(taxonomy: DemoUserTaxonomy): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_TAXONOMY_STORAGE_KEY, taxonomy);
  window.dispatchEvent(
    new CustomEvent(DEMO_TAXONOMY_CHANGE_EVENT, { detail: { taxonomy } })
  );
}

export function readStoredDemoTaxonomy(): DemoUserTaxonomy | null {
  if (typeof window === 'undefined') return null;
  return parseDemoUserTaxonomy(window.localStorage.getItem(DEMO_TAXONOMY_STORAGE_KEY));
}
