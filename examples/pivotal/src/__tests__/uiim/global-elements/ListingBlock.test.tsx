/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default, Split, TextList } from '@/components/uiim/global-elements/ListingBlock';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
  RichText: ({ field }: any) => <div>{field?.value || ''}</div>,
  NextImage: ({ field }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={field?.value?.src || ''} alt={field?.value?.alt || ''} />
  ),
  Link: ({ field }: any) => <a href={field?.value?.href || '#'}>{field?.value?.text}</a>,
}));

const page = { mode: { isEditing: false } } as any;
const editingPage = { mode: { isEditing: true } } as any;
const params = { styles: '', RenderingIdentifier: 'listing-block' };
const rendering = { componentName: 'ListingBlock' } as any;

const fields = {
  data: {
    datasource: {
      sectionTitle: { jsonValue: { value: 'Latest news' } },
      viewAllLink: { jsonValue: { value: { href: '/news', text: 'Read more' } } },
      children: {
        results: [
          {
            id: '1',
            itemTitle: { jsonValue: { value: 'Hospital update' } },
            itemDate: { jsonValue: { value: 'August 3' } },
            itemLink: { jsonValue: { value: { href: '/n1', text: 'Continue reading' } } },
          },
          {
            id: '2',
            itemTitle: { jsonValue: { value: 'Community event' } },
            itemDate: { jsonValue: { value: 'August 10' } },
            itemLink: { jsonValue: { value: { href: '/n2', text: 'Continue reading' } } },
          },
          {
            id: '3',
            itemTitle: { jsonValue: { value: 'Clinic hours' } },
            itemDate: { jsonValue: { value: 'August 12' } },
            itemLink: { jsonValue: { value: { href: '/n3', text: 'Continue reading' } } },
          },
          {
            id: '4',
            itemTitle: { jsonValue: { value: 'News card' } },
            itemDate: { jsonValue: { value: 'August 14' } },
            itemLink: { jsonValue: { value: { href: '/n4', text: 'Continue reading' } } },
          },
        ],
      },
    },
  },
};

describe('ListingBlock', () => {
  it('renders NoDataFallback when datasource is missing', () => {
    render(<Default fields={{ data: {} }} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders cards and view-all link', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Latest news')).toBeInTheDocument();
    expect(screen.getByText('Hospital update')).toBeInTheDocument();
    expect(screen.getByText('Read more')).toBeInTheDocument();
  });

  it('TextList and Split render from the same datasource', () => {
    const { rerender } = render(
      <TextList fields={fields} params={params} page={page} rendering={rendering} />
    );
    expect(screen.getByText('Community event')).toBeInTheDocument();

    rerender(<Split fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('News card')).toBeInTheDocument();
  });

  it('renders empty fields while editing', () => {
    render(
      <Default
        fields={{ data: { datasource: { children: { results: [] } } } }}
        params={params}
        page={editingPage}
        rendering={rendering}
      />
    );
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
  });
});
