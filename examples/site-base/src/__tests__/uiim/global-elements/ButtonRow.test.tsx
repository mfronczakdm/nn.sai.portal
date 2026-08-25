/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DarkGhost, Default } from '@/components/uiim/global-elements/ButtonRow';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
  Link: ({ field }: any) => <a href={field?.value?.href || '#'}>{field?.value?.text}</a>,
}));

const page = { mode: { isEditing: false } } as any;
const editingPage = { mode: { isEditing: true } } as any;
const params = { styles: '', RenderingIdentifier: 'button-row' };
const rendering = { componentName: 'ButtonRow' } as any;

const fields = {
  data: {
    datasource: {
      sectionTitle: { jsonValue: { value: 'Additional resources' } },
      children: {
        results: [
          { id: '1', itemLink: { jsonValue: { value: { href: '/guide', text: 'Buyer guide' } } } },
        ],
      },
    },
  },
};

describe('ButtonRow', () => {
  it('renders NoDataFallback when datasource is missing', () => {
    render(<Default fields={{ data: {} }} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders title and buttons', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Additional resources')).toBeInTheDocument();
    expect(screen.getByText('Buyer guide')).toBeInTheDocument();
  });

  it('renders empty fields while editing', () => {
    render(
      <DarkGhost
        fields={{ data: { datasource: { children: { results: [] } } } }}
        params={params}
        page={editingPage}
        rendering={rendering}
      />
    );
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
  });
});
