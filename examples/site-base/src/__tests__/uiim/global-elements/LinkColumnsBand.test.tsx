/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default, TwoColumn } from '@/components/uiim/global-elements/LinkColumnsBand';

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
const params = { styles: '', RenderingIdentifier: 'link-columns' };
const rendering = { componentName: 'LinkColumnsBand' } as any;

const fields = {
  data: {
    datasource: {
      sectionTitle: { jsonValue: { value: 'Hospital network' } },
      primaryLink: { jsonValue: { value: { href: '/all', text: 'View all' } } },
      children: {
        results: [
          { id: '1', itemLink: { jsonValue: { value: { href: '/a', text: 'Hospital A' } } } },
          { id: '2', itemLink: { jsonValue: { value: { href: '/b', text: 'Hospital B' } } } },
        ],
      },
    },
  },
};

describe('LinkColumnsBand', () => {
  it('renders NoDataFallback when datasource is missing', () => {
    render(<Default fields={{ data: {} }} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders heading and links', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Hospital network')).toBeInTheDocument();
    expect(screen.getByText('Hospital A')).toBeInTheDocument();
    expect(screen.getByText('View all')).toBeInTheDocument();
  });

  it('shows empty fields in editing mode', () => {
    render(
      <TwoColumn
        fields={{ data: { datasource: { children: { results: [] } } } }}
        params={params}
        page={editingPage}
        rendering={rendering}
      />
    );
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
  });
});
