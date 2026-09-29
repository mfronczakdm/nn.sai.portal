/**
 * Demo-only identified CDP contact.
 * Identity events always use the email identifier so guests merge into a single
 * Sitecore CDP person (Tom Samuels). Salesforce IDs are sent as profile fields.
 */
export const DEMO_IDENTIFIED_EMAIL_PROVIDER = 'email';

export interface DemoIdentifiedContact {
  contactKey: string;
  salesforceContactId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  state: string;
  country: string;
  mortgageType: string;
  armFlag: boolean;
  refinanceEligible: boolean;
  estimatedRate: number;
  homeValueBand: number;
  creditTier: number;
  audienceSegment: string;
  affinityModel: string;
  campaignId: string;
  sourceSystem: string;
  predictedConversionProbability: number;
}

export const DEMO_IDENTIFIED_CONTACT: DemoIdentifiedContact = {
  contactKey: '0038Z0000228788A',
  salesforceContactId: '0038Z000024954',
  firstName: 'Tom',
  lastName: 'Samuels',
  email: 'tom.samuels.rockland@example.com',
  mobilePhone: '+16475315313',
  state: 'ON',
  country: 'CA',
  mortgageType: 'VA',
  armFlag: true,
  refinanceEligible: false,
  estimatedRate: 3.39,
  homeValueBand: 977607,
  creditTier: 1,
  audienceSegment: 'Rate-Sensitive Homeowner 2',
  affinityModel: 'Financial Urgency - High Risk Propensity 2',
  campaignId: 'ANB-MTG-NEW-Q4-2026-001',
  sourceSystem: 'Salesforce CRM',
  predictedConversionProbability: 40.8,
};

export const DEMO_GUEST_EXTENSION_SCHEMA = 'extensions';

export type DemoIdentifiedContactExtensionData = Record<string, string>;

export function getDemoIdentifiedContactExtensionData(): DemoIdentifiedContactExtensionData {
  const contact = DEMO_IDENTIFIED_CONTACT;

  return {
    ContactKey: contact.contactKey,
    SalesforceContactId: contact.salesforceContactId,
    MortgageType: contact.mortgageType,
    ARMFlag: String(contact.armFlag),
    RefinanceEligible: String(contact.refinanceEligible),
    EstimatedRate: String(contact.estimatedRate),
    HomeValueBand: String(contact.homeValueBand),
    CreditTier: String(contact.creditTier),
    AudienceSegment: contact.audienceSegment,
    AffinityModel: contact.affinityModel,
    CampaignId: contact.campaignId,
    SourceSystem: contact.sourceSystem,
    PredictedConversionProbability: String(contact.predictedConversionProbability),
  };
}

export type DemoIdentifiedContactProfileExtensionData = Record<string, string | null>;

/**
 * Known-good Profiles UI shape: four untyped crm* strings.
 * Published schema field names crash Overview even as strings.
 */
export function getDemoIdentifiedContactProfileExtensionData(): DemoIdentifiedContactProfileExtensionData {
  return {
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
    [DEMO_GUEST_EXTENSION_SCHEMA]: null,
  };
}

export function getDemoIdentifiedContactProfileImportRecord() {
  const contact = DEMO_IDENTIFIED_CONTACT;

  return {
    recordType: 'profile',
    identifiers: [
      {
        provider: DEMO_IDENTIFIED_EMAIL_PROVIDER,
        id: contact.email,
      },
    ],
    contact: {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      language: 'EN',
      phoneNumbers: {
        mobile: contact.mobilePhone,
      },
      address: {
        city: 'Toronto',
        state: 'Ontario',
        country: contact.country,
      },
    },
    extensions: getDemoIdentifiedContactProfileExtensionData(),
  };
}

export function getDemoIdentifiedContactIdentityEvent(page = 'home') {
  const contact = DEMO_IDENTIFIED_CONTACT;

  return {
    channel: 'WEB',
    currency: 'USD',
    language: 'EN',
    page,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    mobile: contact.mobilePhone,
    phone: contact.mobilePhone,
    country: contact.country,
    state: contact.state,
    identifiers: [
      {
        id: contact.email,
        provider: DEMO_IDENTIFIED_EMAIL_PROVIDER,
      },
    ],
  };
}
