/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default } from '@/components/uiim/locations/PhysicianDetail';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('lucide-react', () => ({
  MapPin: () => <span data-testid="map-pin" />,
  Phone: () => <span data-testid="phone" />,
  Stethoscope: () => <span data-testid="stethoscope" />,
  UserRound: () => <span data-testid="user-round" />,
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
  RichText: ({ field }: any) => <div>{field?.value || ''}</div>,
}));

const page = { mode: { isEditing: false } } as any;
const editingPage = { mode: { isEditing: true } } as any;
const params = { styles: '', RenderingIdentifier: 'physician-detail' };
const rendering = { componentName: 'PhysicianDetail' } as any;

const fields = {
  PhysicianFullName: { value: 'Camille Landry' },
  Credentials: { value: 'MD, FACC' },
  Specialty: { value: 'Cardiology' },
  PhysicianPhone: { value: '504-503-4100' },
  PhysicianBio: { value: '<p>Board-certified cardiologist at East Jefferson.</p>' },
  ServingLocations: [
    {
      id: 'loc-1',
      name: 'East Jefferson General Hospital',
      fields: {
        LocationTitle: { value: 'East Jefferson General Hospital' },
        LocationShortName: { value: 'East Jefferson' },
        LocationType: { value: 'Hospital' },
      },
    },
  ],
};

describe('PhysicianDetail', () => {
  it('renders NoDataFallback when fields are missing', () => {
    render(<Default params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders name, credentials, specialty, phone, and bio', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Camille Landry')).toBeInTheDocument();
    expect(screen.getByText('MD, FACC')).toBeInTheDocument();
    expect(screen.getAllByText('Cardiology').length).toBeGreaterThan(0);
    expect(screen.getByText('504-503-4100')).toBeInTheDocument();
    expect(screen.getByText(/Board-certified cardiologist at East Jefferson/)).toBeInTheDocument();
  });

  it('renders serving location names from the Treelist', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('East Jefferson General Hospital')).toBeInTheDocument();
    expect(screen.getByText('East Jefferson')).toBeInTheDocument();
    expect(screen.getByText('Hospital')).toBeInTheDocument();
  });

  it('renders empty fields while editing', () => {
    render(<Default fields={{}} params={params} page={editingPage} rendering={rendering} />);
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/field editor on this datasource to manage hospitals and clinics/i)
    ).toBeInTheDocument();
  });
});
