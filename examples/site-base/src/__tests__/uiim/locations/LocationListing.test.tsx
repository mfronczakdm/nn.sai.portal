/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Default,
  landingHref,
  matchesTypeFilter,
  type LocationListingChild,
} from '@/components/uiim/locations/LocationListing';

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
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
}));

const page = { mode: { isEditing: false } } as any;
const params = { styles: '', RenderingIdentifier: 'location-listing' };
const rendering = { componentName: 'LocationListing' } as any;
const assignedRendering = {
  componentName: 'LocationListing',
  dataSource: '{76041887-6E16-4844-AD13-366BC2E32265}',
} as any;

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ locations: [] }),
  }) as unknown as typeof fetch;
});

function makeLocation(
  index: number,
  overrides: Partial<LocationListingChild> = {}
): LocationListingChild {
  const n = index + 1;
  const isUrgent = n > 8;
  const name = isUrgent ? `Urgent Care ${n}` : `Hospital ${n}`;
  return {
    id: `loc-${n}`,
    name,
    locationTitle: { jsonValue: { value: name } },
    locationType: { jsonValue: { value: isUrgent ? 'Urgent Care' : 'Hospital' } },
    streetAddress: { jsonValue: { value: `${n} Main St` } },
    city: { jsonValue: { value: 'New Orleans' } },
    state: { jsonValue: { value: 'LA' } },
    postalCode: { jsonValue: { value: '70112' } },
    phoneNumber: { jsonValue: { value: `504-000-${String(n).padStart(4, '0')}` } },
    latitude: { jsonValue: { value: String(29.9 + n * 0.01) } },
    longitude: { jsonValue: { value: String(-90.1 - n * 0.01) } },
    landingPage: {
      jsonValue: { value: { href: `/Our-Locations/${name.replace(/\s+/g, '-')}` } },
    },
    ...overrides,
  };
}

function listingFields(results: LocationListingChild[]) {
  return {
    data: {
      datasource: {
        children: {
          results,
        },
      },
    },
  };
}

const eastJefferson: LocationListingChild = {
  id: 'loc-ejgh',
  name: 'East Jefferson General Hospital',
  locationTitle: { jsonValue: { value: 'East Jefferson General Hospital' } },
  locationType: { jsonValue: { value: 'Hospital' } },
  streetAddress: { jsonValue: { value: '4200 Houma Blvd.' } },
  city: { jsonValue: { value: 'Metairie' } },
  state: { jsonValue: { value: 'LA' } },
  postalCode: { jsonValue: { value: '70006' } },
  phoneNumber: { jsonValue: { value: '504-503-4000' } },
  latitude: { jsonValue: { value: '29.9967' } },
  longitude: { jsonValue: { value: '-90.1526' } },
  landingPage: {
    targetItem: { url: { path: '/Our-Locations/East-Jefferson-General-Hospital' } },
  },
};

const gretna: LocationListingChild = {
  id: 'loc-gretna',
  name: 'LCMC Health Gretna Urgent Care',
  locationTitle: { jsonValue: { value: 'LCMC Health Gretna Urgent Care' } },
  locationType: { jsonValue: { value: 'Urgent Care' } },
  streetAddress: { jsonValue: { value: '50 Westbank Expy' } },
  city: { jsonValue: { value: 'Gretna' } },
  state: { jsonValue: { value: 'LA' } },
  postalCode: { jsonValue: { value: '70053' } },
  phoneNumber: { jsonValue: { value: '504-391-5300' } },
  latitude: { jsonValue: { value: '29.9146' } },
  longitude: { jsonValue: { value: '-90.054' } },
  landingPage: {
    targetItem: { url: { path: '/Our-Locations/Urgent-Care-Locations/LCMC-Health-Gretna-Urgent-Care' } },
  },
};

describe('landingHref', () => {
  it('prefers LandingPage targetItem path', () => {
    expect(landingHref(eastJefferson)).toBe('/Our-Locations/East-Jefferson-General-Hospital');
  });

  it('falls back to /Our-Locations/{item-name}', () => {
    expect(landingHref({ name: 'Touro' })).toBe('/Our-Locations/Touro');
  });
});

describe('matchesTypeFilter', () => {
  it('filters hospitals vs urgent care', () => {
    expect(matchesTypeFilter(eastJefferson, '')).toBe(true);
    expect(matchesTypeFilter(eastJefferson, 'Hospital')).toBe(true);
    expect(matchesTypeFilter(eastJefferson, 'Urgent Care')).toBe(false);
    expect(matchesTypeFilter(gretna, 'Urgent Care')).toBe(true);
    expect(matchesTypeFilter(gretna, 'Hospital')).toBe(false);
  });
});

describe('LocationListing', () => {
  it('renders NoDataFallback when no datasource is assigned', () => {
    render(<Default fields={{}} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/LocationListing/i)).toBeInTheDocument();
  });

  it('renders all location cards and an OSM map', () => {
    const results = Array.from({ length: 16 }, (_, index) => makeLocation(index));
    render(
      <Default
        fields={listingFields(results)}
        params={params}
        page={page}
        rendering={assignedRendering}
      />
    );

    expect(screen.getByTestId('location-listing-count')).toHaveTextContent('16 locations');
    expect(screen.getByRole('link', { name: 'Hospital 1' })).toHaveAttribute(
      'href',
      '/Our-Locations/Hospital-1'
    );
    expect(screen.getByText('1 Main St, New Orleans, LA 70112')).toBeInTheDocument();
    expect(screen.getByTestId('location-listing-map')).toBeInTheDocument();
    expect(screen.getByText(/OpenStreetMap/)).toBeInTheDocument();
  });

  it('filters to urgent care only', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={listingFields([eastJefferson, gretna])}
        params={params}
        page={page}
        rendering={assignedRendering}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Urgent care' }));
    expect(screen.getByTestId('location-listing-count')).toHaveTextContent('1 location');
    expect(screen.getByRole('link', { name: 'LCMC Health Gretna Urgent Care' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'East Jefferson General Hospital' })).not.toBeInTheDocument();
  });

  it('opens a map popup when a pin is selected from a card', async () => {
    const user = userEvent.setup();
    render(
      <Default
        fields={listingFields([eastJefferson])}
        params={params}
        page={page}
        rendering={assignedRendering}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Show on map' }));
    expect(screen.getByTestId('location-listing-map-popup')).toHaveTextContent(
      'East Jefferson General Hospital'
    );
  });

  it('fetches from /api/location-listing when only rendering.dataSource is present', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ locations: [eastJefferson] }),
    });

    render(
      <Default
        fields={{ data: { datasource: { id: 'folder' } } }}
        params={params}
        page={page}
        rendering={assignedRendering}
      />
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/location-listing?datasource='),
      expect.any(Object)
    );
    expect(await screen.findByRole('link', { name: 'East Jefferson General Hospital' })).toBeInTheDocument();
  });
});
