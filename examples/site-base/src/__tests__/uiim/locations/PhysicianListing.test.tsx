/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Default,
  DEFAULT_PAGE_SIZE,
  type PhysicianListingChild,
} from '@/components/uiim/locations/PhysicianListing';

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
  Search: () => <span data-testid="search" />,
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
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
const assignedRendering = {
  componentName: 'PhysicianListing',
  dataSource: '{13C422FB-8991-4468-B996-BE73A904C23E}',
} as any;

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ physicians: [] }),
  }) as unknown as typeof fetch;
});

function makePhysician(
  index: number,
  overrides: Partial<PhysicianListingChild> = {}
): PhysicianListingChild {
  const n = index + 1;
  const isEven = n % 2 === 0;
  const locationName = n % 3 === 0 ? 'LCMC Health Gretna Urgent Care' : 'East Jefferson General Hospital';
  return {
    id: `phys-${n}`,
    name: `Physician ${n} MD`,
    physicianFullName: { jsonValue: { value: `Physician ${n}` } },
    credentials: { jsonValue: { value: 'MD' } },
    specialty: { jsonValue: { value: isEven ? 'Cardiology' : 'Family Medicine' } },
    physicianPhone: { jsonValue: { value: `504-000-${String(n).padStart(4, '0')}` } },
    physicianDetailPage: { jsonValue: { value: { href: `/Find-a-Provider/Physician-${n}-MD` } } },
    servingLocations: {
      targetItems: [
        {
          id: n % 3 === 0 ? 'loc-gretna' : 'loc-ejgh',
          name: locationName,
          locationTitle: { jsonValue: { value: locationName } },
        },
      ],
    },
    ...overrides,
  };
}

function listingFields(results: PhysicianListingChild[], total = results.length, hasNext = false) {
  return {
    data: {
      datasource: {
        children: {
          total,
          pageInfo: { hasNext, endCursor: hasNext ? 'cursor' : null },
          results,
        },
      },
    },
  };
}

const camille: PhysicianListingChild = {
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
};

const fields = listingFields([camille]);

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
    expect(screen.getAllByText('East Jefferson General Hospital').length).toBeGreaterThan(0);
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
    expect(screen.getByText(/no physicians found under this datasource/i)).toBeInTheDocument();
  });

  it('does not show NoDataFallback when Pages has a datasource GUID but GraphQL is empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        physicians: [camille],
      }),
    });

    render(
      <Default params={params} page={editingPage} rendering={assignedRendering} />
    );

    expect(screen.queryByText(/requires a datasource item assigned/i)).not.toBeInTheDocument();
    expect(await screen.findByText('Camille Landry')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalled();
    const url = String((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(url).toContain('/api/physician-listing?');
    expect(url).toContain('preview=1');
    expect(url).toContain(encodeURIComponent('{13C422FB-8991-4468-B996-BE73A904C23E}'));
  });

  it('renders more than 10 physicians when the query returns them, paged at 9 per page', async () => {
    const user = userEvent.setup();
    const results = Array.from({ length: 12 }, (_, index) => makePhysician(index));
    render(
      <Default fields={listingFields(results)} params={params} page={page} rendering={rendering} />
    );

    expect(screen.getByTestId('physician-listing-count')).toHaveTextContent('Showing 1–9 of 12');
    expect(screen.getByText('Physician 1')).toBeInTheDocument();
    expect(screen.getByText('Physician 9')).toBeInTheDocument();
    expect(screen.queryByText('Physician 10')).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^next$/i }));

    expect(screen.getByTestId('physician-listing-count')).toHaveTextContent('Showing 10–12 of 12');
    expect(screen.getByText('Physician 10')).toBeInTheDocument();
    expect(screen.getByText('Physician 11')).toBeInTheDocument();
    expect(screen.getByText('Physician 12')).toBeInTheDocument();
    expect(screen.queryByText('Physician 1')).not.toBeInTheDocument();
    expect(DEFAULT_PAGE_SIZE).toBe(9);
  });

  it('filters by specialty and name', async () => {
    const user = userEvent.setup();
    const results = [
      camille,
      makePhysician(1, {
        physicianFullName: { jsonValue: { value: 'Anita Chauvin' } },
        specialty: { jsonValue: { value: 'Family Medicine' } },
      }),
      makePhysician(2, {
        physicianFullName: { jsonValue: { value: 'Daniel Hebert' } },
        specialty: { jsonValue: { value: 'Cardiology' } },
      }),
    ];
    render(
      <Default fields={listingFields(results)} params={params} page={page} rendering={rendering} />
    );

    await user.selectOptions(screen.getByLabelText('Specialty'), 'Cardiology');
    expect(screen.getByText('Camille Landry')).toBeInTheDocument();
    expect(screen.getByText('Daniel Hebert')).toBeInTheDocument();
    expect(screen.queryByText('Anita Chauvin')).not.toBeInTheDocument();
    expect(screen.getByTestId('physician-listing-count')).toHaveTextContent('Showing 1–2 of 2');

    await user.type(screen.getByLabelText('Search by name'), 'Camille');
    expect(screen.getByText('Camille Landry')).toBeInTheDocument();
    expect(screen.queryByText('Daniel Hebert')).not.toBeInTheDocument();
    expect(screen.getByTestId('physician-listing-count')).toHaveTextContent('Showing 1–1 of 1');
  });

  it('filters by location and shows an empty filter message', async () => {
    const user = userEvent.setup();
    const results = [
      camille,
      makePhysician(8, {
        physicianFullName: { jsonValue: { value: 'Priya Raman' } },
        specialty: { jsonValue: { value: 'Urgent Care' } },
        servingLocations: {
          targetItems: [
            {
              id: 'loc-gretna',
              name: 'LCMC Health Gretna Urgent Care',
              locationTitle: { jsonValue: { value: 'LCMC Health Gretna Urgent Care' } },
            },
          ],
        },
      }),
    ];
    render(
      <Default fields={listingFields(results)} params={params} page={page} rendering={rendering} />
    );

    await user.selectOptions(screen.getByLabelText('Location'), 'LCMC Health Gretna Urgent Care');
    expect(screen.getByText('Priya Raman')).toBeInTheDocument();
    expect(screen.queryByText('Camille Landry')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Search by name'), 'zzzz');
    expect(screen.getByText(/no physicians match your search/i)).toBeInTheDocument();
    expect(screen.getByTestId('physician-listing-count')).toHaveTextContent('No matching physicians');
  });

  it('includes ENT in the specialty dropdown when a physician has that specialty', () => {
    const entDoc: PhysicianListingChild = {
      ...camille,
      id: 'phys-ent',
      name: 'Gabrielle Moreau MD',
      physicianFullName: { jsonValue: { value: 'Gabrielle Moreau' } },
      specialty: { jsonValue: { value: 'ENT' } },
      servingLocations: {
        targetItems: [
          {
            id: 'loc-wjmc',
            name: 'West Jefferson Medical Center',
            locationTitle: { jsonValue: { value: 'West Jefferson Medical Center' } },
          },
        ],
      },
    };
    render(
      <Default fields={listingFields([camille, entDoc])} params={params} page={page} rendering={rendering} />
    );

    const specialtySelect = screen.getByLabelText('Specialty');
    expect(specialtySelect).toHaveTextContent('ENT');
    expect(specialtySelect).toHaveTextContent('Cardiology');
  });

  it('populates the location dropdown from the Data/Locations catalog', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        physicians: [camille],
        locations: [
          {
            id: 'loc-1',
            name: 'East Jefferson General Hospital',
            displayName: 'East Jefferson General Hospital',
          },
          {
            id: 'loc-wjmc',
            name: 'West Jefferson Medical Center',
            displayName: 'West Jefferson Medical Center',
          },
          { id: 'loc-touro', name: 'Touro', displayName: 'Touro' },
        ],
      }),
    });

    render(<Default params={params} page={page} rendering={assignedRendering} />);

    expect(await screen.findByText('Camille Landry')).toBeInTheDocument();
    const locationSelect = screen.getByLabelText('Location');
    expect(locationSelect).toHaveTextContent('West Jefferson Medical Center');
    expect(locationSelect).toHaveTextContent('Touro');
    expect(locationSelect).toHaveTextContent('East Jefferson General Hospital');
  });

  it('paginates with previous, next, and page numbers', async () => {
    const user = userEvent.setup();
    const results = Array.from({ length: 24 }, (_, index) => makePhysician(index));
    render(
      <Default fields={listingFields(results)} params={params} page={page} rendering={rendering} />
    );

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^previous$/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByTestId('physician-listing-count')).toHaveTextContent('Showing 10–18 of 24');
    expect(screen.getByText('Physician 10')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^next$/i }));
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    expect(screen.getByTestId('physician-listing-count')).toHaveTextContent('Showing 19–24 of 24');
    expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /^previous$/i }));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });
});
