import { mockImageField, mockLinkField, mockModule, mockTextField } from '@/lib/portal-hub-mocks/mock-field-helpers';
import type { PortalHubMockIndustry } from '@/lib/portal-hub-mocks/types';

export const manufacturingMock: PortalHubMockIndustry = {
  industryKey: 'manufacturing',
  modules: [
    mockModule({
      title: mockTextField('Orders'),
      description: mockTextField('Track open orders, shipments, and fulfillment milestones.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=O', 'Orders'),
      link: mockLinkField('/demo/orders', 'Orders'),
      ctaText: mockTextField('View orders'),
    }),
    mockModule({
      title: mockTextField('Tools & assets'),
      description: mockTextField('Access manuals, calibration records, and equipment history.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=T', 'Tools'),
      link: mockLinkField('/demo/tools', 'Tools'),
      ctaText: mockTextField('Open library'),
    }),
    mockModule({
      title: mockTextField('Support'),
      description: mockTextField('Open tickets, chat with support, or request on-site service.'),
      icon: mockImageField('https://placehold.co/64x64/png?text=S', 'Support'),
      link: mockLinkField('/demo/support', 'Support'),
      ctaText: mockTextField('Contact support'),
    }),
  ],
};
