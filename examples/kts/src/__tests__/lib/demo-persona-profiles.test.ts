import { DEMO_USER_PERSONAS } from '@/lib/demo-taxonomy';
import {
  DEMO_PERSONA_IDENTIFIER_PROVIDER,
  getDemoPersonaProfile,
  listDemoPersonaProfiles,
} from '@/lib/demo-persona-profiles';

describe('demo-persona-profiles', () => {
  it('defines a unique profile for every demo persona', () => {
    const profiles = listDemoPersonaProfiles();

    expect(profiles).toHaveLength(DEMO_USER_PERSONAS.length);

    const emails = profiles.map((profile) => profile.email);
    const identifierIds = profiles.map((profile) => profile.identifierId);

    expect(new Set(emails).size).toBe(emails.length);
    expect(new Set(identifierIds).size).toBe(identifierIds.length);
  });

  it('returns stable identity fields for Client Billing — Pay invoices', () => {
    const profile = getDemoPersonaProfile('Client Billing — Pay invoices');

    expect(profile).toEqual({
      persona: 'Client Billing — Pay invoices',
      firstName: 'Avery',
      lastName: 'Chen',
      email: 'avery.chen@acme-finance.demo',
      identifierId: 'cooley-demo-client-billing',
    });
  });

  it('uses the Cooley demo identifier provider', () => {
    expect(DEMO_PERSONA_IDENTIFIER_PROVIDER).toBe('cooley-demo');
  });
});
