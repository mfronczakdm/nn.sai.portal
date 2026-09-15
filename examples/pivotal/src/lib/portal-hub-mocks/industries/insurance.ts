import { mockImageField, mockLinkField, mockModule, mockTextField } from '@/lib/portal-hub-mocks/mock-field-helpers';
import type { PortalHubMockIndustry } from '@/lib/portal-hub-mocks/types';

export const insuranceMock: PortalHubMockIndustry = {
  industryKey: 'insurance',
  modules: [
    mockModule({
      title: mockTextField('File a claim'),
      description: mockTextField('Report an incident and track claim status in one place.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=C', 'Claims'),
      link: mockLinkField('/demo/claims', 'Claims'),
      ctaText: mockTextField('Start a claim'),
    }),
    mockModule({
      title: mockTextField('Policies'),
      description: mockTextField('Review coverage, beneficiaries, and renewal dates.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=P', 'Policies'),
      link: mockLinkField('/demo/policies', 'Policies'),
      ctaText: mockTextField('View policies'),
    }),
    mockModule({
      title: mockTextField('Update coverage'),
      description: mockTextField('Adjust limits or add riders with guided steps.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=U', 'Coverage'),
      link: mockLinkField('/demo/coverage', 'Coverage'),
      ctaText: mockTextField('Update coverage'),
    }),
  ],
};
