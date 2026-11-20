/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Default } from '@/components/uiim/services/ServiceListing';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <span aria-hidden="true" />,
  Search: () => <span aria-hidden="true" />,
  Stethoscope: () => <span aria-hidden="true" />,
  X: () => <span aria-hidden="true" />,
}));

jest.mock('change-case', () => ({
  kebabCase: (value: string) => String(value).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (value: string) => String(value).replace(/(^|\s)\S/g, (token: string) => token.toUpperCase()),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
  RichText: ({ field }: any) => <div>{field?.value || ''}</div>,
  useSitecore: () => ({ page: { mode: { isEditing: false }, layout: { sitecore: { context: { language: 'en' } } } } }),
}));

const page = { mode: { isEditing: false }, layout: { sitecore: { context: { language: 'en' } } } } as any;
const params = { styles: '', RenderingIdentifier: 'service-listing' };
const rendering = { componentName: 'ServiceListing', dataSource: '' } as any;

const fields = {
  data: {
    datasource: {
      title: { jsonValue: { value: 'Our services' } },
      intro: { jsonValue: { value: 'Find a service by type or keyword.' } },
      showFilters: { jsonValue: { value: '1' } },
      filterFacetLabel: { jsonValue: { value: 'Service type' } },
      searchPlaceholder: { jsonValue: { value: 'Search services' } },
      emptyResultsText: { jsonValue: { value: 'No services match your search.' } },
      servicesRoot: {
        targetItem: {
          id: '{ROOT}',
          children: {
            results: [
              {
                id: 'cancer',
                name: 'Cancer Care',
                url: { path: '/Our-Services/Cancer-Care' },
                pageTitle: { jsonValue: { value: 'Cancer Care' } },
                pageShortTitle: { jsonValue: { value: 'Oncology' } },
                pageSummary: { jsonValue: { value: 'Cancer diagnostics and treatment.' } },
              },
              {
                id: 'heart',
                name: 'Heart and Vascular Care',
                url: { path: '/Our-Services/Heart' },
                pageTitle: { jsonValue: { value: 'Heart and Vascular Care' } },
                pageShortTitle: { jsonValue: { value: 'Heart Care' } },
                pageSummary: { jsonValue: { value: 'Cardiovascular visits and testing.' } },
              },
            ],
          },
        },
      },
    },
  },
};

describe('ServiceListing', () => {
  it('asks for a datasource when none is assigned', () => {
    render(<Default fields={{ data: {} }} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders service title, short title, and summary, then filters by type', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);

    expect(screen.getByRole('heading', { name: 'Our services' })).toBeInTheDocument();
    expect(screen.getByText('Cancer diagnostics and treatment.')).toBeInTheDocument();
    expect(screen.getAllByText('Oncology').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Heart Care').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /^Cancer Care\s+1$/ }));

    expect(screen.getByText('Cancer diagnostics and treatment.')).toBeInTheDocument();
    expect(screen.queryByText('Cardiovascular visits and testing.')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1 of 2 services/)).toBeInTheDocument();
  });
});
