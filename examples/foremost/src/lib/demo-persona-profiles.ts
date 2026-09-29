import { DEMO_USER_PERSONAS, getPersonaCode, type DemoUserTaxonomy } from '@/lib/demo-taxonomy';

export const DEMO_PERSONA_IDENTIFIER_PROVIDER = 'rockland-demo';

export interface DemoPersonaProfile {
  persona: DemoUserTaxonomy;
  firstName: string;
  lastName: string;
  email: string;
  identifierId: string;
}

const DEMO_PERSONA_PROFILES: Record<DemoUserTaxonomy, Omit<DemoPersonaProfile, 'persona'>> = {
  'Young Professional': {
    firstName: 'Jordan',
    lastName: 'Mitchell',
    email: 'jordan.mitchell@demo.rocklandtrust.com',
    identifierId: 'rockland-demo-yp',
  },
  'First-Time Homebuyer': {
    firstName: 'Alexis',
    lastName: 'Chen',
    email: 'alexis.chen@demo.rocklandtrust.com',
    identifierId: 'rockland-demo-fth',
  },
  'Growing Family': {
    firstName: 'Jordan',
    lastName: 'Bennett',
    email: 'jordan.bennett@demo.rocklandtrust.com',
    identifierId: 'rockland-demo-gf',
  },
  'Small Business Owner': {
    firstName: 'Marcus',
    lastName: 'Rivera',
    email: 'marcus.rivera@demo.rocklandtrust.com',
    identifierId: 'rockland-demo-sbo',
  },
  'Digital-First Consumer': {
    firstName: 'Riley',
    lastName: 'Park',
    email: 'riley.park@demo.rocklandtrust.com',
    identifierId: 'rockland-demo-dfc',
  },
  'College Student': {
    firstName: 'Taylor',
    lastName: 'Brooks',
    email: 'taylor.brooks@demo.rocklandtrust.com',
    identifierId: 'rockland-demo-cs',
  },
};

export function getDemoPersonaProfile(persona: DemoUserTaxonomy): DemoPersonaProfile {
  const profile = DEMO_PERSONA_PROFILES[persona];

  return {
    persona,
    ...profile,
    identifierId: profile.identifierId || `rockland-demo-${getPersonaCode(persona)}`,
  };
}

export function listDemoPersonaProfiles(): DemoPersonaProfile[] {
  return DEMO_USER_PERSONAS.map((persona) => getDemoPersonaProfile(persona));
}
