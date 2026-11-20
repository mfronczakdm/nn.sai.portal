import {
  collectServices,
  extractServicesRootId,
  filterServices,
  serviceTypeOptions,
  toServiceListingItemPath,
} from '@/components/uiim/services/service-listing.model';
import type { ServiceListingPageNode } from '@/components/uiim/services/service-listing.props';

const tree: ServiceListingPageNode[] = [
  {
    id: 'cancer',
    name: 'Cancer Care',
    url: { path: '/Our-Services/Cancer-Care' },
    pageTitle: { jsonValue: { value: 'Cancer Care' } },
    pageShortTitle: { jsonValue: { value: 'Cancer Care' } },
    pageSummary: { jsonValue: { value: 'Diagnostics, treatment, and survivorship.' } },
    children: {
      results: [
        {
          id: 'trials',
          name: 'Clinical Trials',
          url: { path: '/Our-Services/Cancer-Care/Clinical-Trials' },
          pageTitle: { jsonValue: { value: 'Clinical Trials' } },
          pageShortTitle: { jsonValue: { value: 'Trials' } },
          pageSummary: { jsonValue: { value: 'Studies open to eligible patients.' } },
        },
      ],
    },
  },
  {
    id: 'peds-hub',
    name: 'Pediatrics and Child Health',
    children: {
      results: [
        {
          id: 'fever',
          name: 'Fever When to Call the Doctor',
          url: { path: '/Our-Services/Pediatrics-and-Child-Health/Fever' },
          pageTitle: { jsonValue: { value: 'Fever: When to Call the Doctor' } },
          pageShortTitle: { jsonValue: { value: 'Fever' } },
          pageSummary: { jsonValue: { value: 'How to judge a fever at home.' } },
        },
      ],
    },
  },
];

describe('service listing model', () => {
  it('flattens service lines and nested pages, using the parent as the type', () => {
    const services = collectServices(tree);
    expect(services.map((service) => service.title)).toEqual([
      'Cancer Care',
      'Clinical Trials',
      'Fever: When to Call the Doctor',
    ]);
    expect(services.find((service) => service.key === 'trials')?.serviceType).toBe('Cancer Care');
    expect(services.find((service) => service.key === 'fever')?.serviceType).toBe(
      'Pediatrics and Child Health'
    );
    expect(services.find((service) => service.key === 'peds-hub')).toBeUndefined();
  });

  it('filters by keyword and selected service types', () => {
    const services = collectServices(tree);
    expect(filterServices(services, 'fever', []).map((service) => service.key)).toEqual(['fever']);
    expect(filterServices(services, '', ['Cancer Care']).map((service) => service.key)).toEqual([
      'cancer',
      'trials',
    ]);
    expect(serviceTypeOptions(services).map((option) => option.type)).toEqual([
      'Cancer Care',
      'Pediatrics and Child Health',
    ]);
  });

  it('reads a services root id from a droptree value', () => {
    expect(
      extractServicesRootId({
        jsonValue: { value: '{D2B6D0EF-1F6B-471C-851D-545F232F562D}' },
      })
    ).toBe('{D2B6D0EF-1F6B-471C-851D-545F232F562D}');
    expect(toServiceListingItemPath('d2b6d0ef-1f6b-471c-851d-545f232f562d')).toBe(
      '{D2B6D0EF-1F6B-471C-851D-545F232F562D}'
    );
  });
});
