import React from 'react';
import { render, screen } from '@testing-library/react';

import { createComponentProps } from '@/__tests__/test-utils/testHelpers';
import type { MainNavProps } from '@/components/main-nav/main-nav.props';

function navProps(partial: Partial<MainNavProps>): MainNavProps {
  return {
    ...createComponentProps({}),
    fields: {},
    ...partial,
  } as MainNavProps;
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ tree: null }),
  }) as unknown as typeof fetch;
});

const mockUseSitecore = jest.fn(() => ({
  page: {
    mode: {
      isEditing: false,
      isNormal: true,
      isPreview: false,
      name: 'normal',
    },
    layout: { sitecore: { context: {}, route: null } },
    locale: 'en',
  },
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => mockUseSitecore(),
  Text: ({ field }: { field?: { value?: string } }) =>
    field?.value ? React.createElement('span', null, field.value) : null,
  Link: ({
    field,
    children,
    className,
  }: {
    field?: { value?: { href?: string; text?: string } };
    children?: React.ReactNode;
    className?: string;
  }) =>
    React.createElement(
      'a',
      { href: field?.value?.href || '#', className },
      children || field?.value?.text || 'link'
    ),
  NextImage: ({ field }: { field?: { value?: { src?: string; alt?: string } } }) =>
    field?.value?.src
      ? React.createElement('img', { src: field.value.src, alt: field.value.alt || '' })
      : null,
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) =>
    React.createElement('div', { 'data-testid': 'no-data-fallback' }, componentName),
}));

jest.mock('lucide-react', () => ({
  Menu: () => React.createElement('svg', { 'data-testid': 'menu-icon' }),
  Search: () => React.createElement('svg', { 'data-testid': 'search-icon' }),
  ShoppingCart: () => React.createElement('svg', { 'data-testid': 'cart-icon' }),
  User: () => React.createElement('svg', { 'data-testid': 'user-icon' }),
  ChevronDown: () => React.createElement('svg'),
  X: () => React.createElement('svg'),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) =>
    React.createElement('button', props, children),
}));

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  SheetTrigger: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  SheetContent: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  SheetHeader: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  SheetTitle: ({ children }: { children?: React.ReactNode }) => React.createElement('h2', null, children),
}));

jest.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  AccordionItem: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
  AccordionTrigger: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('button', { type: 'button' }, children),
  AccordionContent: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
}));

import { extractNavigationRootId } from '@/lib/main-nav-utils';
import { MainNavView as MainNav } from '@/components/main-nav/MainNavView.client';

const tree = {
  targetItem: {
    id: 'home',
    name: 'Home',
    url: { path: '/' },
    children: {
      results: [
        {
          id: 'products',
          name: 'Products',
          url: { path: '/products' },
          pageTitle: { jsonValue: { value: 'Products' } },
          children: {
            results: [
              {
                id: 'windows',
                name: 'Windows',
                url: { path: '/products/windows' },
                pageTitle: { jsonValue: { value: 'Windows' } },
                children: {
                  results: [
                    {
                      id: 'casement',
                      name: 'Casement',
                      url: { path: '/products/windows/casement' },
                      pageTitle: { jsonValue: { value: 'Casement' } },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: 'about',
          name: 'About',
          url: { path: '/about' },
          pageTitle: { jsonValue: { value: 'About' } },
        },
      ],
    },
  },
};

describe('extractNavigationRootId', () => {
  it('reads Droptree jsonValue id', () => {
    expect(
      extractNavigationRootId({ jsonValue: { value: { id: '{E6276198-3FC7-4D8B-BD14-8669B1701536}' } } })
    ).toBe('{E6276198-3FC7-4D8B-BD14-8669B1701536}');
  });

  it('reads jsonValue.id when value wrapper is missing', () => {
    expect(extractNavigationRootId({ jsonValue: { id: 'e6276198-3fc7-4d8b-bd14-8669b1701536' } })).toBe(
      'e6276198-3fc7-4d8b-bd14-8669b1701536'
    );
  });
});

describe('MainNav', () => {
  it('shows NoDataFallback when datasource is missing', () => {
    render(<MainNav {...navProps({ fields: {} })} />);
    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent('MainNav');
  });

  it('hides search, user, and cart when they are not configured', () => {
    render(
      <MainNav
        {...navProps({
          fields: {
            data: {
              datasource: {
                navigationRoot: tree,
              },
            },
          },
        })}
      />
    );
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    expect(screen.queryByText('Account')).not.toBeInTheDocument();
    expect(screen.getAllByText('Products').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
  });

  it('renders search and user when links are present', () => {
    render(
      <MainNav
        {...navProps({
          fields: {
            data: {
              datasource: {
                searchPage: { jsonValue: { value: { href: '/search', text: 'Search' } } },
                searchLabel: { jsonValue: { value: 'Search' } },
                userLink: { jsonValue: { value: { href: '/account', text: 'Account' } } },
                userLabel: { jsonValue: { value: 'Account' } },
                navigationRoot: tree,
              },
            },
          },
        })}
      />
    );
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders header when navigationRoot and ComponentQuery fields are missing', () => {
    render(
      <MainNav
        {...navProps({
          fields: {
            data: {
              datasource: {
                logo: { jsonValue: {} },
                logoLink: { jsonValue: {} },
                searchPage: { jsonValue: {} },
              },
            },
          },
        })}
      />
    );
    expect(screen.queryByTestId('no-data-fallback')).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders header when children results are missing or not an array', () => {
    render(
      <MainNav
        {...navProps({
          fields: {
            data: {
              datasource: {
                navigationRoot: {
                  targetItem: {
                    id: 'home',
                    name: 'Home',
                    children: { results: undefined },
                  },
                },
                children: { results: undefined },
              },
            },
          },
        })}
      />
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('ignores null nodes in the nav tree', () => {
    render(
      <MainNav
        {...navProps({
          fields: {
            data: {
              datasource: {
                navigationRoot: {
                  targetItem: {
                    children: {
                      results: [null as unknown as never, tree.targetItem.children.results[0]],
                    },
                  },
                },
              },
            },
          },
        })}
      />
    );
    expect(screen.getAllByText('Products').length).toBeGreaterThan(0);
  });

  it('treats empty navigationRoot targetItem as no menu items', () => {
    render(
      <MainNav
        {...navProps({
          fields: {
            data: {
              datasource: {
                navigationRoot: {},
              },
            },
          },
        })}
      />
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.queryByText('Products')).not.toBeInTheDocument();
  });

  it('starts at L2 when StartLevel is 2', () => {
    render(
      <MainNav
        {...navProps({
          params: { StartLevel: '2', EndLevel: '3' },
          fields: {
            data: {
              datasource: {
                navigationRoot: tree,
              },
            },
          },
        })}
      />
    );
    expect(screen.queryByText('Products')).not.toBeInTheDocument();
    expect(screen.getAllByText('Windows').length).toBeGreaterThan(0);
  });
});
