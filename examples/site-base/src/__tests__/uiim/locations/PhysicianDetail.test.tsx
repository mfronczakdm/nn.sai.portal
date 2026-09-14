/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default } from '@/components/uiim/locations/PhysicianDetail';
import { buildLcmcPhysicianAppointmentHref } from '@/lib/lcmc-appointment-pack';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar" />,
  MapPin: () => <span data-testid="map-pin" />,
  Phone: () => <span data-testid="phone" />,
  Globe: () => <span data-testid="globe" />,
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

const moreauFields = {
  PhysicianFullName: { value: 'Gabrielle Moreau' },
  Credentials: { value: 'MD' },
  Specialty: { value: 'ENT' },
  PhysicianPhone: { value: '504-349-2273' },
  PhysicianBio: { value: '<p>ENT physician at West Jefferson Medical Center.</p>' },
  ServingLocations: [
    {
      id: 'loc-wjmc',
      name: 'West Jefferson Medical Center',
      fields: {
        LocationTitle: { value: 'West Jefferson Medical Center' },
        LocationShortName: { value: 'WJMC' },
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
    expect(screen.getAllByText('East Jefferson General Hospital').length).toBeGreaterThan(0);
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

  it('renders a Book an appointment now CTA that skips visit types for the mocked physician', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    const cta = screen.getByTestId('physician-detail-book-cta');
    const expected = buildLcmcPhysicianAppointmentHref({
      fullName: 'Camille Landry',
      credentials: 'MD, FACC',
      specialty: 'Cardiology',
      location: 'East Jefferson General Hospital',
    });
    expect(cta).toHaveTextContent('Book an appointment now');
    expect(cta).toHaveAttribute('href', expected);
    expect(expected).toBe(
      '/For-Patients/Patient-Appointments?visit=sick-visit&specialty=Cardiology&location=East+Jefferson+General+Hospital&provider=Camille+Landry'
    );
    expect(cta).toHaveClass('physician-detail__book-cta', 'bg-white', 'text-primary');
    expect(cta).toHaveClass('hover:bg-muted', 'hover:text-primary');
    expect(cta).toHaveClass('focus:bg-muted', 'focus:text-primary');
    expect(cta).toHaveClass('focus-visible:bg-muted', 'focus-visible:text-primary');
    expect(cta).not.toHaveClass('hover:bg-primary', 'hover:bg-primary-hover', 'focus:bg-primary');
  });

  it('shows English and Spanish for Gabrielle Moreau in the header', () => {
    render(<Default fields={moreauFields} params={params} page={page} rendering={rendering} />);
    const languages = screen.getByTestId('physician-detail-languages');
    expect(languages).toHaveTextContent('English');
    expect(languages).toHaveTextContent('Spanish');
    expect(screen.getByTestId('physician-detail-languages-contact')).toHaveTextContent(
      'Speaks English and Spanish'
    );
  });

  it('shows authored languages when LanguagesSpoken is set', () => {
    render(
      <Default
        fields={{ ...fields, LanguagesSpoken: { value: 'English' } }}
        params={params}
        page={page}
        rendering={rendering}
      />
    );
    const languages = screen.getByTestId('physician-detail-languages');
    expect(languages).toHaveTextContent('English');
    expect(languages).not.toHaveTextContent('Spanish');
  });

  it('deep-links Gabrielle Moreau ENT at West Jefferson onto slot selection', () => {
    render(<Default fields={moreauFields} params={params} page={page} rendering={rendering} />);
    const cta = screen.getByRole('link', { name: /book an appointment now/i });
    expect(cta).toHaveAttribute(
      'href',
      '/For-Patients/Patient-Appointments?visit=sick-visit&specialty=ENT&location=West+Jefferson+Medical+Center&provider=Gabrielle+Moreau'
    );
  });

  it('uses a professional placeholder photo when the physician is not on lcmchealth.org', () => {
    render(<Default fields={fields} params={params} page={page} rendering={rendering} />);
    const photo = screen.getByTestId('physician-detail-photo');
    expect(photo.getAttribute('src')).toMatch(/^\/lcmc\/physicians\/placeholder-physician-\d{2}\.jpg$/);
    expect(photo).toHaveAttribute('alt', 'Camille Landry');
  });

  it('hydrates Craig Conard from the saved LCMC Health marketing photo', () => {
    render(
      <Default
        fields={{
          PhysicianFullName: { value: 'Craig J. Conard' },
          Credentials: { value: 'MD' },
          Specialty: { value: 'Pediatrics / Hospital Medicine' },
        }}
        params={params}
        page={page}
        rendering={rendering}
      />
    );
    expect(screen.getByTestId('physician-detail-photo')).toHaveAttribute(
      'src',
      '/lcmc/physicians/craig-j-conard-md.jpg'
    );
    expect(screen.getByText('Pediatrics')).toBeInTheDocument();
    expect(screen.getByText('Hospital Medicine')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /book an appointment now/i })).toHaveAttribute(
      'href',
      '/For-Patients/Patient-Appointments?visit=sick-visit&specialty=Pediatrics&provider=Craig+J.+Conard'
    );
  });
});
