import { mockImageField, mockLinkField, mockModule, mockTextField } from '@/lib/portal-hub-mocks/mock-field-helpers';
import type { PortalHubMockIndustry } from '@/lib/portal-hub-mocks/types';

export const healthcareMock: PortalHubMockIndustry = {
  industryKey: 'healthcare',
  modules: [
    mockModule({
      title: mockTextField('Appointments'),
      description: mockTextField('Schedule, reschedule, or cancel visits with your care team.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=Ap', 'Appointments'),
      link: mockLinkField('/demo/appointments', 'Appointments'),
      ctaText: mockTextField('Manage appointments'),
    }),
    mockModule({
      title: mockTextField('Prescriptions'),
      description: mockTextField('Refill medications and see pickup or delivery options.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=Rx', 'Prescriptions'),
      link: mockLinkField('/demo/prescriptions', 'Prescriptions'),
      ctaText: mockTextField('View prescriptions'),
    }),
    mockModule({
      title: mockTextField('Claims'),
      description: mockTextField('Track medical claims and explanation of benefits.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=Cl', 'Claims'),
      link: mockLinkField('/demo/medical-claims', 'Claims'),
      ctaText: mockTextField('View claims'),
    }),
  ],
};
