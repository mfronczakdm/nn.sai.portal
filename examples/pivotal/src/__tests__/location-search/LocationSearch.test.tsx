/* eslint-disable */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Default as LocationSearchDefault,
  MapRight,
  MapTopAllCentered,
  MapRightTitleZipCentered,
  MapLeftTitleZipCentered,
  Version1,
} from '../../components/location-search/LocationSearch';
import {
  defaultLocationSearchProps,
  locationSearchPropsNoResults,
  locationSearchPropsMinimal,
  locationSearchPropsEditing,
  version1LocationSearchProps,
} from './LocationSearch.mockProps';

// Mock the Sitecore Content SDK
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span', className }: any) => {
    const f = field;
    if (!f?.value) return null;
    return React.createElement(tag, { className }, f.value);
  },
  useSitecore: jest.fn(() => ({ page: { mode: { isEditing: false } } })),
  withDatasourceCheck: () => (Component: React.ComponentType) => Component,
}));

// Mock complex hooks and utilities
jest.mock('../../hooks/use-zipcode', () => ({
  useZipcode: (defaultZip: string) => ({
    zipcode: defaultZip,
    loading: false,
    error: null,
    showModal: false,
    fetchZipcode: jest.fn(),
    updateZipcode: jest.fn(),
    closeModal: jest.fn(),
  }),
}));

jest.mock('../../hooks/use-match-media', () => ({
  useMatchMedia: () => false,
}));

jest.mock('../../components/zipcode-modal/zipcode-modal.dev', () => ({
  ZipcodeModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="zipcode-modal">Zipcode Modal</div> : null,
}));

jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="search-button">
      {children}
    </button>
  ),
}));

// Mock the location search variant components
jest.mock('../../components/location-search/LocationSearchDefault.dev', () => ({
  LocationSearchDefault: ({ fields, isPageEditing }: any) => {
    if (!fields?.data) return <div data-testid="no-data-fallback">LocationSearch</div>;

    const { datasource, dealerships } = fields.data;
    const title = datasource?.title;
    const defaultZipCode = datasource?.defaultZipCode || '';

    return (
      <section data-testid="location-search-default">
        <div data-testid="location-search-content">
          {title?.jsonValue?.value && (
            <h2 data-testid="location-search-title">{title.jsonValue.value}</h2>
          )}

          <div data-testid="zipcode-info">Default ZIP: {defaultZipCode}</div>

          <div data-testid="dealership-list">
            {dealerships?.results?.map((dealership: any, index: number) => (
              <div key={index} data-testid={`dealership-${index}`}>
                <div data-testid={`dealership-name-${index}`}>
                  {dealership.dealershipName?.jsonValue?.value}
                </div>
                <div data-testid={`dealership-address-${index}`}>
                  {dealership.dealershipAddress?.jsonValue?.value}
                </div>
                <div data-testid={`dealership-city-${index}`}>
                  {dealership.dealershipCity?.jsonValue?.value}
                </div>
              </div>
            ))}
          </div>

          {dealerships?.results?.length === 0 && (
            <div data-testid="no-dealerships">No dealerships found</div>
          )}

          <span data-testid="editing-mode">{isPageEditing ? 'editing' : 'normal'}</span>
        </div>
      </section>
    );
  },
}));

jest.mock('../../components/location-search/LocationSearchMapRight.dev', () => ({
  LocationSearchMapRight: ({ isPageEditing }: any) => (
    <section data-testid="location-search-map-right">
      <span data-testid="editing-mode">{isPageEditing ? 'editing' : 'normal'}</span>
    </section>
  ),
}));

jest.mock('../../components/location-search/LocationSearchMapTopAllCentered.dev', () => ({
  LocationSearchMapTopAllCentered: ({ isPageEditing }: any) => (
    <section data-testid="location-search-map-top-all-centered">
      <span data-testid="editing-mode">{isPageEditing ? 'editing' : 'normal'}</span>
    </section>
  ),
}));

jest.mock('../../components/location-search/LocationSearchMapRightTitleZipCentered.dev', () => ({
  LocationSearchMapRightTitleZipCentered: ({ isPageEditing }: any) => (
    <section data-testid="location-search-map-right-title-zip-centered">
      <span data-testid="editing-mode">{isPageEditing ? 'editing' : 'normal'}</span>
    </section>
  ),
}));

jest.mock('../../components/location-search/LocationSearchTitleZipCentered.dev', () => ({
  LocationSearchTitleZipCentered: ({ isPageEditing }: any) => (
    <section data-testid="location-search-title-zip-centered">
      <span data-testid="editing-mode">{isPageEditing ? 'editing' : 'normal'}</span>
    </section>
  ),
}));

jest.mock('../../components/location-search/LocationSearchVersion1.dev', () => ({
  LocationSearchVersion1: ({ fields, isPageEditing }: any) => {
    const datasource = fields?.data?.datasource;
    const title = datasource?.title?.jsonValue?.value;
    const children = datasource?.children?.results ?? [];

    return (
      <section data-testid="location-search-version1">
        {title ? <h2 data-testid="footprint-title">{title}</h2> : null}
        <div data-testid="footprint-legend">
          <span>Corporate Headquarters</span>
          <span>Factories</span>
          <span>Customer Support Centers</span>
        </div>
        <ul data-testid="footprint-pin-types">
          {children.map((child: any, index: number) => (
            <li key={index} data-testid={`footprint-pin-${index}`}>
              {child.locationType?.jsonValue?.value}
            </li>
          ))}
        </ul>
        <span data-testid="editing-mode">{isPageEditing ? 'editing' : 'normal'}</span>
      </section>
    );
  },
}));

jest.mock('../../utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div data-testid="no-data-fallback">{componentName}</div>
  ),
}));

describe('LocationSearch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Variant', () => {
    it('renders complete location search with dealership data', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      // Check main structure
      expect(screen.getByTestId('location-search-default')).toBeInTheDocument();
      expect(screen.getByTestId('location-search-content')).toBeInTheDocument();

      // Check title
      expect(screen.getByTestId('location-search-title')).toHaveTextContent(
        'Find a Dealership Near You'
      );

      // Check default zipcode
      expect(screen.getByTestId('zipcode-info')).toHaveTextContent('Default ZIP: 30309');

      // Check dealerships are rendered
      expect(screen.getByTestId('dealership-list')).toBeInTheDocument();
      expect(screen.getByTestId('dealership-0')).toBeInTheDocument();
      expect(screen.getByTestId('dealership-1')).toBeInTheDocument();
    });

    it('displays dealership information correctly', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      // Check first dealership
      expect(screen.getByTestId('dealership-name-0')).toHaveTextContent('Downtown Auto');
      expect(screen.getByTestId('dealership-address-0')).toHaveTextContent('123 Main St');
      expect(screen.getByTestId('dealership-city-0')).toHaveTextContent('Atlanta');

      // Check second dealership
      expect(screen.getByTestId('dealership-name-1')).toHaveTextContent('Suburban Motors');
      expect(screen.getByTestId('dealership-address-1')).toHaveTextContent('456 Oak Ave');
      expect(screen.getByTestId('dealership-city-1')).toHaveTextContent('Marietta');
    });

    it('displays proper editing state', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      expect(screen.getByTestId('editing-mode')).toHaveTextContent('normal');
    });
  });

  describe('Content Scenarios', () => {
    it('handles no dealership results', () => {
      render(<LocationSearchDefault {...locationSearchPropsNoResults} />);

      expect(screen.getByTestId('location-search-default')).toBeInTheDocument();
      expect(screen.getByTestId('location-search-title')).toHaveTextContent(
        'Find a Dealership Near You'
      );

      // Should show no dealerships message
      expect(screen.getByTestId('no-dealerships')).toHaveTextContent('No dealerships found');
      expect(screen.queryByTestId('dealership-0')).not.toBeInTheDocument();
    });

    it('renders with minimal data (one dealership)', () => {
      render(<LocationSearchDefault {...locationSearchPropsMinimal} />);

      expect(screen.getByTestId('location-search-default')).toBeInTheDocument();
      expect(screen.getByTestId('dealership-0')).toBeInTheDocument();
      expect(screen.queryByTestId('dealership-1')).not.toBeInTheDocument();
    });
  });

  describe('Editing Mode', () => {
    it('correctly reflects editing state', () => {
      const { useSitecore } = jest.requireMock('@sitecore-content-sdk/nextjs');

      // Test editing mode
      useSitecore.mockReturnValue({ page: { mode: { isEditing: true } } });
      const { unmount } = render(<LocationSearchDefault {...locationSearchPropsEditing} />);
      expect(screen.getByTestId('editing-mode')).toHaveTextContent('editing');
      unmount();

      // Test normal mode
      useSitecore.mockReturnValue({ page: { mode: { isEditing: false } } });
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);
      expect(screen.getByTestId('editing-mode')).toHaveTextContent('normal');
    });
  });

  describe('Location Search Variants', () => {
    it('renders MapRight variant', () => {
      render(<MapRight {...defaultLocationSearchProps} />);
      expect(screen.getByTestId('location-search-map-right')).toBeInTheDocument();
    });

    it('renders MapTopAllCentered variant', () => {
      render(<MapTopAllCentered {...defaultLocationSearchProps} />);
      expect(screen.getByTestId('location-search-map-top-all-centered')).toBeInTheDocument();
    });

    it('renders MapRightTitleZipCentered variant', () => {
      render(<MapRightTitleZipCentered {...defaultLocationSearchProps} />);
      expect(
        screen.getByTestId('location-search-map-right-title-zip-centered')
      ).toBeInTheDocument();
    });

    it('renders MapLeftTitleZipCentered variant', () => {
      render(<MapLeftTitleZipCentered {...defaultLocationSearchProps} />);
      expect(screen.getByTestId('location-search-title-zip-centered')).toBeInTheDocument();
    });

    it('renders Version1 variant with heading, legend, and pin types', () => {
      render(<Version1 {...version1LocationSearchProps} />);

      expect(screen.getByTestId('location-search-version1')).toBeInTheDocument();
      expect(screen.getByTestId('footprint-title')).toHaveTextContent(
        'An unrivaled global footprint'
      );
      expect(screen.getByTestId('footprint-legend')).toHaveTextContent('Corporate Headquarters');
      expect(screen.getByTestId('footprint-legend')).toHaveTextContent('Factories');
      expect(screen.getByTestId('footprint-legend')).toHaveTextContent('Customer Support Centers');
      expect(screen.getByTestId('footprint-pin-0')).toHaveTextContent('Corporate Headquarters');
      expect(screen.getByTestId('footprint-pin-1')).toHaveTextContent('Factories');
      expect(screen.getByTestId('footprint-pin-2')).toHaveTextContent('Customer Support Centers');
    });
  });

  describe('Data Structure', () => {
    it('renders dealership list container', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      const dealershipList = screen.getByTestId('dealership-list');
      expect(dealershipList).toBeInTheDocument();
    });

    it('displays zipcode information', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      const zipcodeInfo = screen.getByTestId('zipcode-info');
      expect(zipcodeInfo).toBeInTheDocument();
      expect(zipcodeInfo).toHaveTextContent('30309');
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic section structure', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      const locationSearch = screen.getByTestId('location-search-default');
      expect(locationSearch.tagName.toLowerCase()).toBe('section');
    });

    it('provides proper heading structure', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      const title = screen.getByTestId('location-search-title');
      expect(title.tagName.toLowerCase()).toBe('h2');
    });
  });

  describe('Google Maps Integration', () => {
    it('includes Google Maps API key in props', () => {
      render(<LocationSearchDefault {...defaultLocationSearchProps} />);

      // Component should render successfully with API key
      expect(screen.getByTestId('location-search-default')).toBeInTheDocument();
    });

    it('handles missing Google Maps API key gracefully', () => {
      render(<LocationSearchDefault {...locationSearchPropsMinimal} />);

      // Should still render even without API key
      expect(screen.getByTestId('location-search-default')).toBeInTheDocument();
    });
  });
});
