import {
  DEMO_GUEST_EXTENSION_SCHEMA,
  DEMO_IDENTIFIED_CONTACT,
  DEMO_IDENTIFIED_EMAIL_PROVIDER,
  getDemoIdentifiedContactIdentityEvent,
  getDemoIdentifiedContactProfileImportRecord,
} from '@/lib/demo-identified-contact';

describe('demo-identified-contact', () => {
  it('uses a stable Salesforce contact key as the merge identifier', () => {
    expect(DEMO_IDENTIFIED_CONTACT.contactKey).toBe('0038Z0000228788A');
    expect(DEMO_IDENTIFIED_CONTACT.email).toBe('tom.samuels.rockland@example.com');
    expect(DEMO_IDENTIFIED_CONTACT.firstName).toBe('Tom');
    expect(DEMO_IDENTIFIED_CONTACT.lastName).toBe('Samuels');
  });

  it('sends identity without event customData extensions', () => {
    const event = getDemoIdentifiedContactIdentityEvent();

    expect(DEMO_GUEST_EXTENSION_SCHEMA).toBe('extensions');
    expect(event.firstName).toBe('Tom');
    expect(event.lastName).toBe('Samuels');
    expect(event.email).toBe('tom.samuels.rockland@example.com');
    expect(event.mobile).toBe('+16475315313');
    expect(event.language).toBe('EN');
    expect(event.country).toBe('CA');
    expect(event.identifiers).toEqual([
      { id: 'tom.samuels.rockland@example.com', provider: DEMO_IDENTIFIED_EMAIL_PROVIDER },
    ]);
    expect(event).not.toHaveProperty('extensions');
  });

  it('builds a Profile Import record with the four working Data Extension keys', () => {
    expect(getDemoIdentifiedContactProfileImportRecord()).toEqual({
      recordType: 'profile',
      identifiers: [{ provider: DEMO_IDENTIFIED_EMAIL_PROVIDER, id: 'tom.samuels.rockland@example.com' }],
      contact: {
        firstName: 'Tom',
        lastName: 'Samuels',
        email: 'tom.samuels.rockland@example.com',
        language: 'EN',
        phoneNumbers: {
          mobile: '+16475315313',
        },
        address: {
          city: 'Toronto',
          state: 'Ontario',
          country: 'CA',
        },
      },
      extensions: {
        RefinanceEligible: 'false',
        CreditTier: '1',
        AffinityModel: 'Financial Urgency - High Risk Propensity 2',
        AudienceSegment: 'Rate-Sensitive Homeowner 2',
        MortgageType: 'VA',
        customerStatus: null,
        crmCustomerStatus: null,
        crmAccountName: null,
        crmDataSource: null,
        crmScenario: null,
        ContactKey: null,
        SalesforceContactId: null,
        ARMFlag: null,
        EstimatedRate: null,
        HomeValueBand: null,
        CampaignId: null,
        SourceSystem: null,
        PredictedConversionProbability: null,
        extensions: null,
      },
    });
  });
});
