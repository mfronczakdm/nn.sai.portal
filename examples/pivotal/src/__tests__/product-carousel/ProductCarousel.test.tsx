import React from 'react';
import { render, screen } from '@testing-library/react';

import { createComponentProps } from '@/__tests__/test-utils/testHelpers';
import type { ProductCarouselProps } from '@/components/uiim/products/product-carousel.props';

function carouselProps(partial: Partial<ProductCarouselProps>): ProductCarouselProps {
  return {
    ...createComponentProps({}),
    fields: {},
    ...partial,
  } as ProductCarouselProps;
}

const mockUseSitecore = jest.fn(() => ({
  page: {
    mode: {
      isEditing: false,
      isNormal: true,
      isPreview: false,
      name: 'normal',
      designLibrary: { isVariantGeneration: false },
      isDesignLibrary: false,
    },
    layout: { sitecore: { context: {}, route: null } },
    locale: 'en',
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => React.createElement('img', { src, alt, className }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children?: React.ReactNode;
  }) => React.createElement('a', { href, className }, children),
}));

jest.mock('@/components/ui/carousel', () => {
  const PassThrough = ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => React.createElement('div', { className }, children);
  return {
    Carousel: ({
      children,
      className,
    }: {
      children?: React.ReactNode;
      className?: string;
      setApi?: (api: unknown) => void;
    }) => React.createElement('div', { className }, children),
    CarouselContent: PassThrough,
    CarouselItem: PassThrough,
  };
});

jest.mock('lucide-react', () => ({
  ChevronLeft: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { 'data-testid': 'chevron-left', ...props }),
  ChevronRight: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { 'data-testid': 'chevron-right', ...props }),
  Info: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { 'data-testid': 'info-icon', ...props }),
  ArrowLeft: () => null,
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { 'data-testid': 'arrow-right', ...props }),
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) =>
    React.createElement('div', { 'data-testid': 'no-data-fallback' }, componentName),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => mockUseSitecore(),
  Text: ({
    field,
    tag: Tag = 'span',
    className,
  }: {
    field?: { value?: string };
    tag?: React.ElementType;
    className?: string;
  }) => {
    if (!field?.value?.trim()) return null;
    return React.createElement(Tag, { className }, field.value);
  },
  RichText: ({ field, className }: { field?: { value?: string }; className?: string }) => {
    if (!field?.value?.trim()) return null;
    return React.createElement('div', {
      className,
      dangerouslySetInnerHTML: { __html: field.value },
    });
  },
}));

import {
  Default as ProductCarouselDefault,
  ProductStrip,
  Spotlight as ProductCarouselSpotlight,
} from '@/components/uiim/products/ProductCarousel';

const sampleProducts = [
  {
    id: 'p1',
    name: 'Maxim HP Hinge',
    path: '/sitecore/content/quanex/quanex/Home/Products/Weatherseals/Q-LON Weatherseals',
    url: { path: '/Products/Weatherseals/Q-LON Weatherseals' },
    productName: { jsonValue: { value: 'Maxim HP Hinge' } },
    productId: { jsonValue: { value: 'AT-MHP' } },
    productSku: { jsonValue: { value: 'AT-HINGE-MHP' } },
    pageTitle: { jsonValue: { value: 'Should not win when ProductName is set' } },
    categoryLabel: { jsonValue: { value: 'HINGES' } },
    description: {
      jsonValue: { value: '<p>High-performance hinge for casement windows.</p>' },
    },
    imageUrl: {
      jsonValue: {
        value: 'https://www.quanex.com/wp-content/uploads/2026/04/U71_Frame000002.jpg',
      },
    },
  },
  {
    id: 'p2',
    name: 'P3000',
    path: '/sitecore/content/quanex/quanex/Home/Products/Extruded Solutions/Mikron 7200 Sound Control System',
    url: { path: '/Products/Extruded Solutions/Mikron 7200 Sound Control System' },
    pageHeaderTitle: { jsonValue: { value: 'P3000' } },
    categoryLabel: { jsonValue: { value: 'LOCKS' } },
    description: { jsonValue: { value: '<p>Multipoint lock system.</p>' } },
    imageUrl: {
      jsonValue: {
        value:
          'https://www.quanex.com/wp-content/uploads/2022/07/Mikron-7200-Sound-Control-System_ProductImage_605x380.jpg',
      },
    },
  },
];

const datasourceFields = {
  data: {
    datasource: {
      title: { jsonValue: { value: 'AmesburyTruth Highlights' } },
      ctaLabel: { jsonValue: { value: 'Learn More' } },
      backgroundImageUrl: {
        jsonValue: {
          value: 'https://www.quanex.com/wp-content/uploads/2022/07/window-hardware-hero.jpg',
        },
      },
      showOptionsHint: { jsonValue: { value: '' } },
      products: { targetItems: sampleProducts },
    },
  },
};

describe('ProductCarousel', () => {
  beforeEach(() => {
    mockUseSitecore.mockClear();
  });

  it('renders Default highlights cards with title and CTA', () => {
    render(
      <ProductCarouselDefault
        {...carouselProps({
          fields: datasourceFields,
        })}
      />
    );

    expect(screen.getByText('AmesburyTruth Highlights')).toBeInTheDocument();
    expect(screen.getByText('Maxim HP Hinge')).toBeInTheDocument();
    expect(screen.getByText('HINGES')).toBeInTheDocument();
    expect(screen.getAllByText('Learn More').length).toBeGreaterThan(0);
    const links = screen.getAllByRole('link', { name: 'Learn More' });
    expect(links[0]).toHaveAttribute(
      'href',
      '/Products/Weatherseals/Q-LON Weatherseals'
    );
  });

  it('renders ProductStrip with options hint and dark CTA', () => {
    render(
      <ProductStrip
        {...carouselProps({
          fields: {
            data: {
              datasource: {
                title: { jsonValue: { value: 'Shop Our Most Popular Products' } },
                ctaLabel: { jsonValue: { value: 'More Information' } },
                showOptionsHint: { jsonValue: { value: '1' } },
                products: { targetItems: sampleProducts },
              },
            },
          },
        })}
      />
    );

    expect(screen.getByText('Shop Our Most Popular Products')).toBeInTheDocument();
    expect(screen.getAllByText('More options available').length).toBeGreaterThan(0);
    expect(screen.getAllByText('More Information').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('info-icon').length).toBeGreaterThan(0);
  });

  it('returns NoDataFallback when datasource is missing', () => {
    render(<ProductCarouselDefault {...carouselProps({ fields: {} })} />);
    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent('ProductCarousel');
  });

  it('shows empty state when products list is empty', () => {
    render(
      <ProductCarouselDefault
        {...carouselProps({
          fields: {
            data: {
              datasource: {
                title: { jsonValue: { value: 'Empty' } },
                products: { targetItems: [] },
              },
            },
          },
        })}
      />
    );
    expect(screen.getByText(/select products/i)).toBeInTheDocument();
  });

  it('renders Spotlight with editorial cards and progress', () => {
    const { container } = render(
      <ProductCarouselSpotlight
        {...carouselProps({
          fields: datasourceFields,
        })}
      />
    );

    expect(screen.getByText('AmesburyTruth Highlights')).toBeInTheDocument();
    expect(screen.getByText('Maxim HP Hinge')).toBeInTheDocument();
    expect(screen.getByText('HINGES')).toBeInTheDocument();
    expect(container.querySelector('[data-variant="spotlight"]')).toBeInTheDocument();
    expect(screen.getAllByTestId('arrow-right').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /learn more/i }).length).toBeGreaterThan(0);
  });
});
