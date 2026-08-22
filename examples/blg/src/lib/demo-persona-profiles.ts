import { DEMO_USER_PERSONAS, getPersonaCode, type DemoUserTaxonomy } from '@/lib/demo-taxonomy';

export const DEMO_PERSONA_IDENTIFIER_PROVIDER = 'progressive-demo';

export interface DemoPersonaProfile {
  persona: DemoUserTaxonomy;
  firstName: string;
  lastName: string;
  email: string;
  identifierId: string;
}

const DEMO_PERSONA_PROFILES: Record<DemoUserTaxonomy, Omit<DemoPersonaProfile, 'persona'>> = {
  'Internal Agent licensed in FL': {
    firstName: 'Morgan',
    lastName: 'Ellis',
    email: 'morgan.ellis@demo.progressive.com',
    identifierId: 'progressive-demo-ia-fl',
  },
  'Claims Specialist licensed in NC': {
    firstName: 'Casey',
    lastName: 'Nguyen',
    email: 'casey.nguyen@demo.progressive.com',
    identifierId: 'progressive-demo-cs-nc',
  },
};

export function getDemoPersonaProfile(persona: DemoUserTaxonomy): DemoPersonaProfile {
  const profile = DEMO_PERSONA_PROFILES[persona];

  return {
    persona,
    ...profile,
    identifierId: profile.identifierId || `progressive-demo-${getPersonaCode(persona)}`,
  };
}

export function listDemoPersonaProfiles(): DemoPersonaProfile[] {
  return DEMO_USER_PERSONAS.map((persona) => getDemoPersonaProfile(persona));
}
