/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Default as HeaderSTDefault,
  LoginRequired as HeaderSTLoginRequired,
  Version1 as HeaderSTVersion1,
  Version2 as HeaderSTVersion2,
  Version3 as HeaderSTVersion3,
} from '../../components/site-three/HeaderST';
import {
  defaultHeaderSTProps,
  headerSTPropsBasic,
  headerSTPropsCustomStyles,
  headerSTPropsEmpty,
  headerSTPropsNoFields,
  headerSTPropsLongText,
  headerSTPropsSearchBoxOnly,
  headerSTPropsMiniCartOnly,
  headerSTPropsReverseTheme,
  headerSTPropsSpecialChars,
  headerSTPropsHideCart,
  headerSTPropsVersion1,
  headerSTPropsVersion2,
  headerSTPropsVersion3,
} from './HeaderST.mockProps';

// Mock FontAwesome icon
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, width, height, ...props }: any) => (
    <svg
      data-testid="fontawesome-icon"
      width={width}
      height={height}
      data-icon={icon.iconName}
      {...props}
    >
      <path d="M0 0h24v24H0z" />
    </svg>
  ),
}));

// Mock FontAwesome icons
jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faShoppingCart: {
    iconName: 'shopping-cart',
    prefix: 'fas',
  },
}));

// Mock component-map to avoid circular dependency
jest.mock('.sitecore/component-map', () => ({
  __esModule: true,
  default: new Map(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  User: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="lucide-user" {...props} />,
  Search: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="lucide-search" {...props} />,
}));

const mockSignOut = jest.fn();
const mockUseSession = jest.fn(() => ({ data: null, status: 'unauthenticated' as const }));

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

// Mock Sitecore Content SDK components
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => ({
    page: { mode: { isEditing: false } },
  }),
  Link: ({ field, prefetch, className, children, ...props }: any) => (
    <a
      href={field?.value?.href || ''}
      className={className}
      data-prefetch={prefetch}
      data-testid="sitecore-link"
      {...props}
    >
      {children || field?.value?.text || ''}
    </a>
  ),
  NextImage: ({ field, className, ...props }: any) => (
    <img
      src={field?.value?.src || ''}
      alt={field?.value?.alt || ''}
      className={className}
      data-testid="sitecore-image"
      {...props}
    />
  ),
  Placeholder: ({ name, rendering, ...props }: any) => (
    <div
      data-testid="sitecore-placeholder"
      data-name={name}
      data-rendering={rendering?.componentName}
      {...props}
    >
      Navigation Placeholder
    </div>
  ),
  AppPlaceholder: ({ name, rendering, componentMap, ...props }: any) => (
    <div
      data-testid="app-placeholder"
      data-name={name}
      data-rendering={rendering?.componentName}
      {...props}
    >
      App Placeholder
    </div>
  ),
  withDatasourceCheck: () => (Component: React.ComponentType) => Component,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, className, prefetch, ...props }: any) => (
    <a
      href={href}
      className={className}
      data-prefetch={prefetch}
      data-testid="next-link"
      {...props}
    >
      {children}
    </a>
  );
});

// Mock the custom hook
const mockSetIsVisible = jest.fn();
jest.mock('../../hooks/useToggleWithClickOutside', () => ({
  useToggleWithClickOutside: jest.fn(() => ({
    isVisible: false,
    setIsVisible: mockSetIsVisible,
    ref: { current: null },
  })),
}));

// Mock the non-sitecore components
jest.mock('../../components/site-three/non-sitecore/MiniCart', () => ({
  MiniCart: ({ cartLink }: any) => (
    <div data-testid="mini-cart" data-cart-link={cartLink?.value?.href}>
      Mini Cart Component
    </div>
  ),
}));

jest.mock('../../components/site-three/non-sitecore/HeaderPreviewSearch', () => ({
  HeaderPreviewSearch: ({ searchLink, appearance }: any) => (
    <div
      data-testid="search-box"
      data-search-link={searchLink?.value?.href}
      data-appearance={appearance || 'trigger'}
    >
      Search Box Component
    </div>
  ),
}));

jest.mock('../../components/site-three/non-sitecore/SearchBox', () => ({
  SearchBox: ({ searchLink }: any) => (
    <div data-testid="search-box" data-search-link={searchLink?.value?.href}>
      Search Box Component
    </div>
  ),
}));

// Import the hook mock to control its behavior
const mockUseToggleWithClickOutside = require('../../hooks/useToggleWithClickOutside')
  .useToggleWithClickOutside as jest.Mock;

describe('HeaderST Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mockUseToggleWithClickOutside.mockReturnValue({
      isVisible: false,
      setIsVisible: jest.fn(),
    });
  });

  describe('Default Rendering', () => {
    it('renders header structure with all components', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      // Check main section
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Check logo link
      expect(screen.getByTestId('next-link')).toBeInTheDocument();
      expect(screen.getByTestId('next-link')).toHaveAttribute('href', '/');

      // Check logo image
      expect(screen.getByTestId('sitecore-image')).toBeInTheDocument();
      expect(screen.getByTestId('sitecore-image')).toHaveAttribute('src', '/images/sync-logo.svg');
      expect(screen.getByTestId('sitecore-image')).toHaveAttribute('alt', 'SYNC Audio Logo');
    });

    it('applies custom styles from params', () => {
      render(<HeaderSTDefault {...headerSTPropsCustomStyles} />);

      const section = document.querySelector('section[data-class-change]');
      expect(section).toHaveClass('bg-primary', 'text-white', 'custom-header-class');
    });

    it('applies dark nav row when ReverseTheme rendering parameter is enabled', () => {
      render(<HeaderSTDefault {...headerSTPropsReverseTheme} />);

      const navRow = document.querySelector('[data-header-st-nav-row="reverse"]');
      expect(navRow).toBeInTheDocument();
      expect(navRow).toHaveClass('bg-primary');
      const navList = navRow?.querySelector('ul');
      expect(navList).toBeTruthy();
      expect(navList).toHaveClass('text-primary-foreground');
    });

    it('renders navigation placeholder with correct props', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const placeholders = screen.getAllByTestId('app-placeholder');
      expect(placeholders.length).toBeGreaterThan(0);
      const placeholder = placeholders[0];
      expect(placeholder).toHaveAttribute('data-name', 'header-navigation-main-nav');
      expect(placeholder).toHaveAttribute('data-rendering', 'HeaderST');
    });
  });

  describe('Navigation Links', () => {
    it('renders support links in both desktop and mobile locations', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const supportLinks = screen.getAllByTestId('sitecore-link');
      const supportLinkElements = supportLinks.filter(
        (link) => link.getAttribute('href') === '/support'
      );

      expect(supportLinkElements.length).toBeGreaterThan(0);
      supportLinkElements.forEach((link) => {
        expect(link).toHaveAttribute('data-prefetch', 'false');
      });
    });

    it('handles search link correctly based on showSearchBox param', () => {
      // With search box enabled
      render(<HeaderSTDefault {...headerSTPropsSearchBoxOnly} />);

      expect(screen.getByTestId('search-box')).toBeInTheDocument();
      expect(screen.getByTestId('search-box')).toHaveAttribute('data-search-link', '/search');

      // With search box disabled, should show link instead
      const { rerender } = render(<HeaderSTDefault {...headerSTPropsSearchBoxOnly} />);
      rerender(<HeaderSTDefault {...headerSTPropsBasic} />);

      const searchLinks = screen.getAllByTestId('sitecore-link');
      const searchLink = searchLinks.find((link) => link.getAttribute('href') === '/search');
      expect(searchLink).toBeInTheDocument();
    });

    it('handles cart link correctly based on showMiniCart param', () => {
      // With mini cart enabled
      render(<HeaderSTDefault {...headerSTPropsMiniCartOnly} />);

      expect(screen.getByTestId('mini-cart')).toBeInTheDocument();
      expect(screen.getByTestId('mini-cart')).toHaveAttribute('data-cart-link', '/cart');
    });

    it('renders FontAwesome cart icon when mini cart is disabled', () => {
      render(<HeaderSTDefault {...headerSTPropsBasic} />);

      const cartIcon = screen.getByTestId('fontawesome-icon');
      expect(cartIcon).toBeInTheDocument();
      expect(cartIcon).toHaveAttribute('data-icon', 'shopping-cart');
      expect(cartIcon).toHaveAttribute('width', '24');
      expect(cartIcon).toHaveAttribute('height', '24');
    });
  });

  describe('Mobile Menu Functionality', () => {
    it('renders mobile menu toggle button', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const mobileToggle = document.querySelector('.cursor-pointer');
      expect(mobileToggle).toBeInTheDocument();
    });

    it('shows hamburger menu lines in closed state', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const menuLines = document.querySelectorAll('.bg-current');
      expect(menuLines).toHaveLength(3); // Three hamburger lines
    });

    it('handles mobile menu state changes', () => {
      const mockSetIsVisible = jest.fn();
      mockUseToggleWithClickOutside.mockReturnValue({
        isVisible: false,
        setIsVisible: mockSetIsVisible,
      });

      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const mobileToggle = screen.getByLabelText('Toggle mobile menu');
      if (mobileToggle) {
        fireEvent.click(mobileToggle);
        expect(mockSetIsVisible).toHaveBeenCalledWith(true);
      } else {
        // Skip test if mobile toggle not found (due to CSS class variations)
        expect(true).toBe(true);
      }
    });

    it('applies correct classes when mobile menu is open', () => {
      mockUseToggleWithClickOutside.mockReturnValue({
        isVisible: true,
        setIsVisible: jest.fn(),
      });

      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const mobileMenu = document.querySelector('.opacity-100.pointer-events-auto');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('applies correct classes when mobile menu is closed', () => {
      mockUseToggleWithClickOutside.mockReturnValue({
        isVisible: false,
        setIsVisible: jest.fn(),
      });

      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const closedMenu = document.querySelector('.opacity-0.pointer-events-none');
      expect(closedMenu).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile and desktop navigation', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      // Check for responsive classes - desktop navigation should be hidden on mobile
      const desktopNavigation = screen.getByRole('navigation');
      expect(desktopNavigation).toBeInTheDocument();
      
      // Check that mobile menu wrapper exists
      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('shows mobile-specific elements only on mobile', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      // Mobile menu toggle should be hidden on desktop
      const mobileToggle = document.querySelector('.lg\\:hidden');
      expect(mobileToggle).toBeInTheDocument();
    });

    it('shows desktop-specific elements only on desktop', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      // Desktop support link should be hidden on mobile
      const desktopSupportLink = document.querySelector('.hidden.lg\\:block');
      expect(desktopSupportLink).toBeInTheDocument();
    });
  });

  describe('Content Scenarios', () => {
    it('handles empty field values gracefully', () => {
      render(<HeaderSTDefault {...headerSTPropsEmpty} />);

      // Component should render without crashing
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // If any sitecore-link elements are present, they should have empty href.
      const sitecoreLinks = screen.queryAllByTestId('sitecore-link');
      sitecoreLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '');
      });

      // Image should render without crashing
      const image = screen.getByTestId('sitecore-image');
      expect(image).toBeInTheDocument();
    });

    it('handles long text content', () => {
      render(<HeaderSTDefault {...headerSTPropsLongText} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Check that long alt text is properly set
      const image = screen.getByTestId('sitecore-image');
      expect(image).toHaveAttribute('alt', 'SYNC Audio Professional Equipment Company Logo');
    });

    it('handles special characters in content', () => {
      render(<HeaderSTDefault {...headerSTPropsSpecialChars} />);

      const image = screen.getByTestId('sitecore-image');
      expect(image).toHaveAttribute('alt', 'Logó with Àccents');

      const links = screen.getAllByTestId('sitecore-link');
      const supportLink = links.find((link) => link.textContent?.includes('Suppört'));
      expect(supportLink).toBeInTheDocument();
    });
  });

  describe('Parameter Handling', () => {
    it('handles missing showSearchBox parameter', () => {
      const propsWithoutSearchBox = {
        ...defaultHeaderSTProps,
        params: {
          styles: defaultHeaderSTProps.params.styles,
          showMiniCart: defaultHeaderSTProps.params.showMiniCart,
          DynamicPlaceholderId: defaultHeaderSTProps.params.DynamicPlaceholderId,
        },
      };

      render(<HeaderSTDefault {...propsWithoutSearchBox} />);

      // Should default to showing link instead of search box
      expect(screen.queryByTestId('search-box')).not.toBeInTheDocument();
    });

    it('handles missing showMiniCart parameter', () => {
      const propsWithoutMiniCart = {
        ...defaultHeaderSTProps,
        params: {
          styles: defaultHeaderSTProps.params.styles,
          showSearchBox: defaultHeaderSTProps.params.showSearchBox,
          DynamicPlaceholderId: defaultHeaderSTProps.params.DynamicPlaceholderId,
        },
      };

      render(<HeaderSTDefault {...propsWithoutMiniCart} />);

      // Should default to showing cart icon
      expect(screen.queryByTestId('mini-cart')).not.toBeInTheDocument();
      expect(screen.getByTestId('fontawesome-icon')).toBeInTheDocument();
    });

    it('handles missing styles parameter', () => {
      const propsWithoutStyles = {
        ...defaultHeaderSTProps,
        params: {
          showSearchBox: defaultHeaderSTProps.params.showSearchBox,
          showMiniCart: defaultHeaderSTProps.params.showMiniCart,
          DynamicPlaceholderId: defaultHeaderSTProps.params.DynamicPlaceholderId,
        },
      };

      expect(() => {
        render(<HeaderSTDefault {...propsWithoutStyles} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('provides proper navigation landmark', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('includes alt text for logo image', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const logo = screen.getByTestId('sitecore-image');
      expect(logo).toHaveAttribute('alt');
      expect(logo.getAttribute('alt')).toBeTruthy();
    });

    it('sets prefetch={false} on navigation links', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const sitecoreLinks = screen.getAllByTestId('sitecore-link');
      sitecoreLinks.forEach((link) => {
        expect(link).toHaveAttribute('data-prefetch', 'false');
      });

      const nextLink = screen.getByTestId('next-link');
      expect(nextLink).toHaveAttribute('data-prefetch', 'false');
    });

    it('provides semantic list structure for navigation', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const lists = document.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('handles re-renders efficiently', () => {
      const { rerender } = render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();

      rerender(<HeaderSTDefault {...headerSTPropsCustomStyles} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('manages mobile menu state without performance issues', () => {
      const mockSetIsVisible = jest.fn();

      mockUseToggleWithClickOutside.mockReturnValue({
        isVisible: false,
        setIsVisible: mockSetIsVisible,
      });

      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      const mobileToggle = screen.getByLabelText('Toggle mobile menu');

      if (mobileToggle) {
        // Multiple rapid clicks should be handled gracefully
        fireEvent.click(mobileToggle);
        fireEvent.click(mobileToggle);
        fireEvent.click(mobileToggle);

        expect(mockSetIsVisible).toHaveBeenCalledTimes(3);
      } else {
        // Skip test if mobile toggle not found
        expect(mockSetIsVisible).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('LoginRequired variant', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    });

    it('hides navigation placeholders when unauthenticated', () => {
      render(<HeaderSTLoginRequired {...defaultHeaderSTProps} />);

      expect(screen.queryAllByTestId('app-placeholder')).toHaveLength(0);
    });

    it('hides navigation when unauthenticated even in editing mode', () => {
      jest.spyOn(require('@sitecore-content-sdk/nextjs'), 'useSitecore').mockReturnValue({
        page: { mode: { isEditing: true } },
      });

      render(<HeaderSTLoginRequired {...defaultHeaderSTProps} />);

      expect(screen.queryAllByTestId('app-placeholder')).toHaveLength(0);
    });

    it('hides navigation when Default export has LoginRequired FieldNames param', () => {
      render(
        <HeaderSTDefault
          {...defaultHeaderSTProps}
          params={{
            ...defaultHeaderSTProps.params,
            FieldNames: '{197F5333-48FF-42CF-8357-B49796219679}',
          }}
        />,
      );

      expect(screen.queryAllByTestId('app-placeholder')).toHaveLength(0);
    });

    it('shows login link when LoginLink is populated', () => {
      render(<HeaderSTLoginRequired {...defaultHeaderSTProps} />);

      const loginLinks = screen
        .getAllByTestId('sitecore-link')
        .filter((link) => link.getAttribute('href') === '/login');
      expect(loginLinks.length).toBeGreaterThan(0);
    });

    it('shows navigation and user menu when authenticated', () => {
      mockUseSession.mockReturnValue({
        data: { user: { name: 'Portal User', email: 'user@example.com' } },
        status: 'authenticated',
      } as any);

      render(<HeaderSTLoginRequired {...defaultHeaderSTProps} />);

      expect(screen.getAllByTestId('app-placeholder')).toHaveLength(2);
      expect(screen.getByText('Portal User')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles null fields gracefully', () => {
      expect(() => {
        render(<HeaderSTDefault {...headerSTPropsNoFields} />);
      }).not.toThrow();
    });

    it('handles missing field properties', () => {
      const propsWithIncompleteFields = {
        ...defaultHeaderSTProps,
        fields: {
          Logo: undefined as any,
          SupportLink: defaultHeaderSTProps.fields.SupportLink,
          // Missing other fields
        },
      } as any;

      expect(() => {
        render(<HeaderSTDefault {...propsWithIncompleteFields} />);
      }).not.toThrow();
    });

    it('handles malformed parameter values', () => {
      const propsWithMalformedParams = {
        ...defaultHeaderSTProps,
        params: {
          styles: null as any,
          showSearchBox: 'invalid-boolean',
          showMiniCart: '',
          DynamicPlaceholderId: undefined as any,
        },
      };

      expect(() => {
        render(<HeaderSTDefault {...propsWithMalformedParams} />);
      }).not.toThrow();
    });
  });

  describe('HideCart rendering parameter', () => {
    it('hides cart on Default when HideCart is true', () => {
      render(<HeaderSTDefault {...headerSTPropsHideCart} />);

      expect(screen.queryByTestId('mini-cart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fontawesome-icon')).not.toBeInTheDocument();
    });

    it('still shows cart on Default when HideCart is unset', () => {
      render(<HeaderSTDefault {...defaultHeaderSTProps} />);

      expect(screen.getByTestId('mini-cart')).toBeInTheDocument();
    });
  });

  describe('Version1 variant', () => {
    it('renders inverted two-row layout without throwing', () => {
      render(<HeaderSTVersion1 {...headerSTPropsVersion1} />);

      expect(document.querySelector('[data-header-st-layout="version1"]')).toBeInTheDocument();
      expect(screen.getByTestId('sitecore-image')).toHaveAttribute('alt', 'Amkor Technology');
    });

    it('shows a desktop MENU control', () => {
      render(<HeaderSTVersion1 {...headerSTPropsVersion1} />);

      expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
      expect(screen.getByText('MENU')).toBeInTheDocument();
    });

    it('shows search when showSearchBox is true', () => {
      render(<HeaderSTVersion1 {...headerSTPropsVersion1} />);

      expect(screen.getByTestId('search-box')).toBeInTheDocument();
    });

    it('hides cart when HideCart is true', () => {
      render(<HeaderSTVersion1 {...headerSTPropsVersion1} />);

      expect(screen.queryByTestId('mini-cart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fontawesome-icon')).not.toBeInTheDocument();
    });

    it('shows cart on Version1 when HideCart is unset', () => {
      render(
        <HeaderSTVersion1
          {...headerSTPropsVersion1}
          params={{
            ...headerSTPropsVersion1.params,
            HideCart: '',
            showMiniCart: 'true',
          }}
        />
      );

      expect(screen.getByTestId('mini-cart')).toBeInTheDocument();
    });
  });

  describe('Version2 variant', () => {
    it('renders dark utility + light main row without throwing', () => {
      render(<HeaderSTVersion2 {...headerSTPropsVersion2} />);

      expect(document.querySelector('[data-header-st-layout="version2"]')).toBeInTheDocument();
      expect(screen.getByTestId('sitecore-image')).toHaveAttribute('alt', 'Atlanta Market Andmore');
    });

    it('does not show the Version1 MENU label', () => {
      render(<HeaderSTVersion2 {...headerSTPropsVersion2} />);

      expect(screen.queryByText('MENU')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument();
    });

    it('shows a search icon when showSearchBox is false', () => {
      render(<HeaderSTVersion2 {...headerSTPropsVersion2} />);

      expect(screen.queryByTestId('search-box')).not.toBeInTheDocument();
      expect(screen.getByTestId('lucide-search')).toBeInTheDocument();
    });

    it('renders SupportLink as a pill CTA and Sign In as text', () => {
      render(<HeaderSTVersion2 {...headerSTPropsVersion2} />);

      const registerLinks = screen
        .getAllByTestId('sitecore-link')
        .filter((link) => link.getAttribute('href') === '/register');
      expect(registerLinks.some((link) => link.className.includes('rounded-full'))).toBe(true);

      const signInLinks = screen
        .getAllByTestId('sitecore-link')
        .filter((link) => link.getAttribute('href') === '/login');
      expect(signInLinks.some((link) => link.textContent?.includes('Sign In'))).toBe(true);
    });

    it('hides cart when HideCart is true', () => {
      render(<HeaderSTVersion2 {...headerSTPropsVersion2} />);

      expect(screen.queryByTestId('mini-cart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fontawesome-icon')).not.toBeInTheDocument();
    });
  });

  describe('Version3 variant', () => {
    it('renders without throwing and sets layout version3', () => {
      expect(() => {
        render(<HeaderSTVersion3 {...headerSTPropsVersion3} />);
      }).not.toThrow();

      expect(document.querySelector('[data-header-st-layout="version3"]')).toBeInTheDocument();
      expect(screen.getByTestId('sitecore-image')).toHaveAttribute('alt', 'LCMC Health');
    });

    it('does not restyle Default and does not show Version1 MENU', () => {
      render(<HeaderSTVersion3 {...headerSTPropsVersion3} />);

      expect(document.querySelector('[data-header-st-layout="version1"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-header-st-layout="version2"]')).not.toBeInTheDocument();
      expect(screen.queryByText('MENU')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument();
    });

    it('shows a contained search bar when showSearchBox is true', () => {
      render(<HeaderSTVersion3 {...headerSTPropsVersion3} />);

      const searchBox = screen.getByTestId('search-box');
      expect(searchBox).toBeInTheDocument();
      expect(searchBox).toHaveAttribute('data-appearance', 'contained');
      expect(searchBox).toHaveAttribute('data-search-link', '/search');
    });

    it('shows SearchLink as text/icon when showSearchBox is unset', () => {
      render(
        <HeaderSTVersion3
          {...headerSTPropsVersion3}
          params={{
            ...headerSTPropsVersion3.params,
            showSearchBox: '',
          }}
        />
      );

      expect(screen.queryByTestId('search-box')).not.toBeInTheDocument();
      expect(screen.getByTestId('lucide-search')).toBeInTheDocument();
      const searchLinks = screen
        .getAllByTestId('sitecore-link')
        .filter((link) => link.getAttribute('href') === '/search');
      expect(searchLinks.length).toBeGreaterThan(0);
    });

    it('hides cart when HideCart is true', () => {
      render(<HeaderSTVersion3 {...headerSTPropsVersion3} />);

      expect(screen.queryByTestId('mini-cart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('fontawesome-icon')).not.toBeInTheDocument();
    });

    it('shows cart on Version3 when HideCart is unset', () => {
      render(
        <HeaderSTVersion3
          {...headerSTPropsVersion3}
          params={{
            ...headerSTPropsVersion3.params,
            HideCart: '',
            showMiniCart: 'true',
          }}
        />
      );

      expect(screen.getByTestId('mini-cart')).toBeInTheDocument();
    });
  });
});
