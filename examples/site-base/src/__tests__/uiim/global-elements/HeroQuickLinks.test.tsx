/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default } from '@/components/uiim/global-elements/HeroQuickLinks';

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
const params = { styles: '', RenderingIdentifier: 'hero-quick-links' };
const rendering = { componentName: 'HeroQuickLinks' } as any;

const fields = {
  data: {
    datasource: {
      headline: { jsonValue: { value: "You're never far from a trusted ER" } },
      backgroundImage: { jsonValue: { value: { src: '/hero.png', alt: 'Clinician' } } },
      zipLabel: { jsonValue: { value: 'Find a provider near you' } },
      zipPlaceholder: { jsonValue: { value: 'Enter your ZIP code' } },
      zipSearchLink: { jsonValue: { value: { href: '/find-a-provider', text: 'ZIP search' } } },
      specialtyLabel: { jsonValue: { value: 'Search by specialty' } },
      specialtyPlaceholder: { jsonValue: { value: 'Select a specialty' } },
      specialtyOptions: { jsonValue: { value: 'Cardiology\nEmergency Medicine' } },
      specialtySearchLink: {
        jsonValue: { value: { href: '/find-a-provider', text: 'Specialty search' } },
      },
      children: {
        results: [
          {
            id: '1',
            itemTitle: { jsonValue: { value: 'Pay My Bill Online' } },
            itemImage: { jsonValue: { value: { src: '/pay-bill.svg', alt: 'Bill' } } },
            itemLink: { jsonValue: { value: { href: '/pay', text: 'Pay now' } } },
          },
        ],
      },
    },
  },
};

describe('HeroQuickLinks', () => {
  it('renders NoDataFallback when datasource is missing', () => {
    render(<Default fields={{ data: {} }} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders headline, search labels, specialties, and quick links', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText("You're never far from a trusted ER")).toBeInTheDocument();
    expect(screen.getByText('Find a provider near you')).toBeInTheDocument();
    expect(screen.getByText('Search by specialty')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cardiology' })).toBeInTheDocument();
    expect(screen.getByText('Pay My Bill Online')).toBeInTheDocument();
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

  it('keeps an empty background image inside the hero frame while editing', () => {
    const { container } = render(
      <Default
        fields={{
          data: {
            datasource: {
              headline: { jsonValue: { value: "You're never far from a trusted ER" } },
              children: { results: [] },
            },
          },
        }}
        params={params}
        page={editingPage}
        rendering={rendering}
      />
    );

    expect(screen.getByText("You're never far from a trusted ER")).toBeInTheDocument();
    const background = container.querySelector('[data-hero-quick-links-bg]');
    expect(background).toBeInTheDocument();
    expect(background).toHaveClass('absolute', 'inset-0', 'overflow-hidden');
    expect(screen.getByText('Specialty options (one per line)')).toBeInTheDocument();
  });

  it('does not dump specialty options into the live hero', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.queryByText('Specialty options (one per line)')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cardiology' })).toBeInTheDocument();
  });
});
