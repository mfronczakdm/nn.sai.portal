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

  it('returns stable identity fields for Internal Agent licensed in FL', () => {
    const profile = getDemoPersonaProfile('Internal Agent licensed in FL');

    expect(profile).toEqual({
      persona: 'Internal Agent licensed in FL',
      firstName: 'Morgan',
      lastName: 'Ellis',
      email: 'morgan.ellis@demo.progressive.com',
      identifierId: 'progressive-demo-ia-fl',
    });
  });

  it('uses the progressive demo identifier provider', () => {
    expect(DEMO_PERSONA_IDENTIFIER_PROVIDER).toBe('progressive-demo');
  });
});
