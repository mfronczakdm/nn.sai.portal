/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default, ImageLeft } from '@/components/uiim/global-elements/SplitFeature';

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
const params = { styles: '', RenderingIdentifier: 'split-feature' };
const rendering = { componentName: 'SplitFeature' } as any;

const fields = {
  SectionTitle: { value: 'Why attend' },
  Description: { value: '<p>Join the market.</p>' },
  FeatureImage: { value: { src: '/feature.jpg', alt: 'Show floor' } },
  PrimaryLink: { value: { href: '/attend', text: 'See why' } },
};

describe('SplitFeature', () => {
  it('renders NoDataFallback when fields are missing', () => {
    render(<Default params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders title, copy, and CTA', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Why attend')).toBeInTheDocument();
    expect(screen.getByText('See why')).toBeInTheDocument();
  });

  it('renders empty fields while editing', () => {
    render(<ImageLeft fields={{}} params={params} page={editingPage} rendering={rendering} />);
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
  });
});
