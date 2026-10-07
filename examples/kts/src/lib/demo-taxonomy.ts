export const DEMO_TAXONOMY_STORAGE_KEY = 'demo-user-taxonomy';
export const DEMO_TAXONOMY_CHANGE_EVENT = 'demo-taxonomy-change';

/**
 * Portal-style demo logins for Cooley — clients, firm colleagues, and candidates.
 * Used by HeaderST DemoUserSwitcher (and search/analytics when a persona is active).
 */
export const DEMO_USER_PERSONAS = [
  'Client Billing — Pay invoices',
  'Client GC — Matter portal',
  'Cooley Lawyer — Knowledge hub',
  'Cooley Staff — Operations',
  'Recruiting Candidate',
] as const;

export type DemoUserTaxonomy = (typeof DEMO_USER_PERSONAS)[number];

export const DEFAULT_DEMO_TAXONOMY: DemoUserTaxonomy = 'Client Billing — Pay invoices';

/** Sentinel value for the persona switcher logout action (not stored in localStorage). */
export const DEMO_TAXONOMY_LOGOUT_VALUE = '__demo_logout__';

/** Menu groupings for the HeaderST login dropdown. */
export const DEMO_PERSONA_GROUPS: ReadonlyArray<{
  label: string;
  personas: readonly DemoUserTaxonomy[];
}> = [
  {
    label: 'Client portals',
    personas: ['Client Billing — Pay invoices', 'Client GC — Matter portal'],
  },
  {
    label: 'Cooley team',
    personas: ['Cooley Lawyer — Knowledge hub', 'Cooley Staff — Operations'],
  },
  {
    label: 'Careers',
    personas: ['Recruiting Candidate'],
  },
];

export function parseDemoUserTaxonomy(raw: string | undefined | null): DemoUserTaxonomy | null {
  const value = raw?.trim();
  if (!value) return null;

  return (DEMO_USER_PERSONAS as readonly string[]).includes(value) ? (value as DemoUserTaxonomy) : null;
}

export function getPersonaCode(persona: DemoUserTaxonomy): string {
  const codes: Record<DemoUserTaxonomy, string> = {
    'Client Billing — Pay invoices': 'client-billing',
    'Client GC — Matter portal': 'client-gc',
    'Cooley Lawyer — Knowledge hub': 'cooley-lawyer',
    'Cooley Staff — Operations': 'cooley-staff',
    'Recruiting Candidate': 'recruiting',
  };

  return codes[persona];
}

/**
 * Optional state filter for KM/variant content.
 * Cooley portal personas are firm-wide (not state-licensed), so this returns null.
 */
export function getPersonaStateCode(_persona: DemoUserTaxonomy): string | null {
  return null;
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
