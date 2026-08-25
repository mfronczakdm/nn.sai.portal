/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CircleGrid, DarkBand, Default } from '@/components/uiim/global-elements/IconLinkBar';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
  NextImage: ({ field }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={field?.value?.src || ''} alt={field?.value?.alt || ''} />
  ),
  Link: ({ field }: any) => <a href={field?.value?.href || '#'}>{field?.value?.text}</a>,
}));

const page = { mode: { isEditing: false } } as any;
const editingPage = { mode: { isEditing: true } } as any;
const params = { styles: '', RenderingIdentifier: 'icon-link-bar' };
const rendering = { componentName: 'IconLinkBar' } as any;

const fields = {
  data: {
    datasource: {
      sectionTitle: { jsonValue: { value: 'Quick links' } },
      sectionDescription: { jsonValue: { value: 'Helpful shortcuts' } },
      searchLink: { jsonValue: { value: { href: '/search', text: 'Search resources' } } },
      children: {
        results: [
          {
            id: '1',
            itemTitle: { jsonValue: { value: 'Pay bill' } },
            itemImage: { jsonValue: { value: { src: '/icon.png', alt: 'bill' } } },
            itemLink: { jsonValue: { value: { href: '/pay', text: 'Pay now' } } },
          },
        ],
      },
    },
  },
};

describe('IconLinkBar', () => {
  it('renders NoDataFallback when datasource is missing', () => {
    render(<Default fields={{ data: {} }} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders title, items, and search link', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Quick links')).toBeInTheDocument();
    expect(screen.getByText('Pay bill')).toBeInTheDocument();
    expect(screen.getByText('Search resources')).toBeInTheDocument();
  });

  it('renders empty fields while editing', () => {
    render(
      <DarkBand
        fields={{ data: { datasource: { children: { results: [] } } } }}
        params={params}
        page={editingPage}
        rendering={rendering}
      />
    );
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
  });

  it('CircleGrid uses the same datasource', () => {
    render(<CircleGrid fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Pay bill')).toBeInTheDocument();
  });
});
