/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default } from '@/components/uiim/locations/HospitalDetail';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('lucide-react', () => ({
  Car: () => <span data-testid="car" />,
  Clock: () => <span data-testid="clock" />,
  MapPin: () => <span data-testid="map-pin" />,
  Phone: () => <span data-testid="phone" />,
  Stethoscope: () => <span data-testid="stethoscope" />,
  Users: () => <span data-testid="users" />,
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
const params = { styles: '', RenderingIdentifier: 'hospital-detail' };
const rendering = { componentName: 'HospitalDetail' } as any;

const fields = {
  LocationTitle: { value: 'East Jefferson General Hospital' },
  LocationShortName: { value: 'East Jefferson' },
  LocationType: { value: 'Hospital' },
  LocationDescription: { value: '<p>Academic hospital in Metairie.</p>' },
  StreetAddress: { value: '4200 Houma Blvd.' },
  City: { value: 'Metairie' },
  State: { value: 'LA' },
  PostalCode: { value: '70006' },
  PhoneNumber: { value: '504-503-4000' },
  HoursText: { value: 'Hospital open 24 hours.' },
  ParkingInfo: { value: 'On-site visitor parking.' },
  VisitorInfo: { value: '<p>Check in at the main lobby.</p>' },
  HasEmergencyDepartment: { value: '1' },
  OfferedServices: [
    {
      id: 'svc-1',
      name: 'Emergency Care',
      fields: { ServiceTitle: { value: 'Emergency Care' } },
    },
  ],
  LocationPhysicians: [
    {
      id: 'phys-1',
      name: 'Camille Landry MD',
      fields: {
        PhysicianFullName: { value: 'Camille Landry' },
        Credentials: { value: 'MD, FACC' },
        Specialty: { value: 'Cardiology' },
      },
    },
  ],
};

describe('HospitalDetail', () => {
  it('renders NoDataFallback when fields are missing', () => {
    render(<Default params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders location title, address, hours, and ER badge', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('East Jefferson General Hospital')).toBeInTheDocument();
    expect(screen.getByText('4200 Houma Blvd.')).toBeInTheDocument();
    expect(screen.getByText('504-503-4000')).toBeInTheDocument();
    expect(screen.getByText('Hospital open 24 hours.')).toBeInTheDocument();
    expect(screen.getByTestId('hospital-detail-er-badge')).toHaveTextContent('Emergency department');
  });

  it('renders offered services and physician credentials', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Emergency Care')).toBeInTheDocument();
    expect(screen.getByText('Camille Landry')).toBeInTheDocument();
    expect(screen.getByText('MD, FACC')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it('renders empty fields while editing', () => {
    render(<Default fields={{}} params={params} page={editingPage} rendering={rendering} />);
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
    expect(screen.getByText(/field editor on this datasource to manage offered services/i)).toBeInTheDocument();
  });
});
