import { DEMO_USER_PERSONAS, getPersonaCode, type DemoUserTaxonomy } from '@/lib/demo-taxonomy';

export const DEMO_PERSONA_IDENTIFIER_PROVIDER = 'cooley-demo';

export interface DemoPersonaProfile {
  persona: DemoUserTaxonomy;
  firstName: string;
  lastName: string;
  email: string;
  identifierId: string;
}

const DEMO_PERSONA_PROFILES: Record<DemoUserTaxonomy, Omit<DemoPersonaProfile, 'persona'>> = {
  'Client Billing — Pay invoices': {
    firstName: 'Avery',
    lastName: 'Chen',
    email: 'avery.chen@acme-finance.demo',
    identifierId: 'cooley-demo-client-billing',
  },
  'Client GC — Matter portal': {
    firstName: 'Jordan',
    lastName: 'Blake',
    email: 'jordan.blake@acme-legal.demo',
    identifierId: 'cooley-demo-client-gc',
  },
  'Cooley Lawyer — Knowledge hub': {
    firstName: 'Riley',
    lastName: 'Soto',
    email: 'rsoto@cooley.com',
    identifierId: 'cooley-demo-lawyer',
  },
  'Cooley Staff — Operations': {
    firstName: 'Sam',
    lastName: 'Okonkwo',
    email: 'sokonkwo@cooley.com',
    identifierId: 'cooley-demo-staff',
  },
  'Recruiting Candidate': {
    firstName: 'Taylor',
    lastName: 'Kim',
    email: 'taylor.kim@candidate.demo',
    identifierId: 'cooley-demo-recruiting',
  },
};

export function getDemoPersonaProfile(persona: DemoUserTaxonomy): DemoPersonaProfile {
  const profile = DEMO_PERSONA_PROFILES[persona];

  return {
    persona,
    ...profile,
    identifierId: profile.identifierId || `cooley-demo-${getPersonaCode(persona)}`,
  };
}

export function listDemoPersonaProfiles(): DemoPersonaProfile[] {
  return DEMO_USER_PERSONAS.map((persona) => getDemoPersonaProfile(persona));
}
