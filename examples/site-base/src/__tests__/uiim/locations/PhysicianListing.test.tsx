/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default } from '@/components/uiim/locations/PhysicianListing';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

jest.mock('lucide-react', () => ({
  MapPin: () => <span data-testid="map-pin" />,
  Phone: () => <span data-testid="phone" />,
  Stethoscope: () => <span data-testid="stethoscope" />,
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
}));

const page = { mode: { isEditing: false } } as any;
const editingPage = { mode: { isEditing: true } } as any;
const params = { styles: '', RenderingIdentifier: 'physician-listing' };
const rendering = { componentName: 'PhysicianListing' } as any;

const fields = {
  data: {
    datasource: {
      children: {
        results: [
          {
            id: 'phys-1',
            name: 'Camille Landry MD',
            physicianFullName: { jsonValue: { value: 'Camille Landry' } },
            credentials: { jsonValue: { value: 'MD, FACC' } },
            specialty: { jsonValue: { value: 'Cardiology' } },
            physicianPhone: { jsonValue: { value: '504-503-4100' } },
            physicianDetailPage: { jsonValue: { value: { href: '/Find-a-Provider/Camille-Landry-MD' } } },
            servingLocations: {
              targetItems: [
                {
                  id: 'loc-1',
                  name: 'East Jefferson General Hospital',
                  locationTitle: { jsonValue: { value: 'East Jefferson General Hospital' } },
                },
              ],
            },
          },
        ],
      },
    },
  },
};

describe('PhysicianListing', () => {
  it('renders NoDataFallback when datasource is missing', () => {
    render(<Default params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders physician cards with name, credentials, specialty, phone, and locations', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Camille Landry')).toBeInTheDocument();
    expect(screen.getByText('MD, FACC')).toBeInTheDocument();
    expect(screen.getAllByText('Cardiology').length).toBeGreaterThan(0);
    expect(screen.getByText('504-503-4100')).toBeInTheDocument();
    expect(screen.getByText('East Jefferson General Hospital')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Camille Landry' })).toHaveAttribute(
      'href',
      '/Find-a-Provider/Camille-Landry-MD'
    );
  });

  it('shows an editing hint when the list is empty', () => {
    render(
      <Default
        fields={{ data: { datasource: { children: { results: [] } } } }}
        params={params}
        page={editingPage}
        rendering={rendering}
      />
    );
    expect(screen.getByText(/assign the physicians folder/i)).toBeInTheDocument();
  });
});
