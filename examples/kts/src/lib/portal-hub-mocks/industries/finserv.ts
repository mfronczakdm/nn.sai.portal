import { mockImageField, mockLinkField, mockModule, mockTextField } from '@/lib/portal-hub-mocks/mock-field-helpers';
import type { PortalHubMockIndustry } from '@/lib/portal-hub-mocks/types';

export const finservMock: PortalHubMockIndustry = {
  industryKey: 'finserv',
  modules: [
    mockModule({
      title: mockTextField('Accounts'),
      description: mockTextField('View balances and recent activity across your accounts.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=A', 'Accounts'),
      link: mockLinkField('/demo/accounts', 'Accounts'),
      ctaText: mockTextField('Open accounts'),
    }),
    mockModule({
      title: mockTextField('Transfers'),
      description: mockTextField('Move money between accounts or set up recurring transfers.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=T', 'Transfers'),
      link: mockLinkField('/demo/transfers', 'Transfers'),
      ctaText: mockTextField('Start a transfer'),
    }),
    mockModule({
      title: mockTextField('Statements'),
      description: mockTextField('Download tax documents and monthly statements.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=S', 'Statements'),
      link: mockLinkField('/demo/statements', 'Statements'),
      ctaText: mockTextField('View statements'),
    }),
  ],
};
