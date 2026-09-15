import React from 'react';
import { render, screen } from '@testing-library/react';

import { createComponentProps } from '@/__tests__/test-utils/testHelpers';
import type {
  ProductDetailFields,
  ProductDetailProps,
} from '@/components/uiim/products/product-detail.props';

function productDetailProps(partial: Partial<ProductDetailProps>): ProductDetailProps {
  return {
    ...createComponentProps({}),
    fields: {},
    ...partial,
  } as ProductDetailProps;
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

jest.mock('lucide-react', () => ({
  FileText: (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { 'data-testid': 'file-text-icon', ...props }),
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
  NextImage: ({ field }: { field?: { value?: { src?: string; alt?: string } } }) => {
    if (!field?.value?.src) return null;
    return React.createElement('img', {
      src: field.value.src,
      alt: field.value.alt || '',
    });
  },
  Link: ({
    field,
    className,
    children,
  }: {
    field?: { value?: { href?: string; text?: string } };
    className?: string;
    children?: React.ReactNode;
  }) => {
    if (!field?.value?.href) return null;
    return React.createElement(
      'a',
      { href: field.value.href, className },
      children || field.value.text || 'Link'
    );
  },
}));

import { Default as ProductDetail } from '@/components/uiim/products/ProductDetail';

const baseFields: ProductDetailFields = {
  ProductName: { value: 'MIKRON 7200 SOUND CONTROL SYSTEM' },
  ProductID: { value: 'QNX-M7200' },
  ProductSKU: { value: 'QNX-M7200-STD' },
  pageHeaderTitle: { value: 'Should not win when ProductName is set' },
  CategoryLabel: { value: 'Commercial Window Profiles' },
  SpecSheetLink: {
    value: {
      href: 'https://www.quanex.com/product/extruded-solutions/',
      text: 'Print a Spec Sheet',
    },
  },
  image: {
    value: {
      src: 'https://www.quanex.com/example.jpg',
      alt: 'Mikron profile',
    },
  },
  Description: {
    value: '<p>Acoustic vinyl framing for commercial fenestration.</p>',
  },
  TechnicalData: {
    value: '<ul><li>Multi-chamber PVC profiles</li></ul>',
  },
  StylesAvailable: {
    value: '<ul><li>Fixed and operable styles</li></ul>',
  },
  Benefits: {
    value: '<ul><li>Helps reduce exterior noise</li></ul>',
  },
};

describe('ProductDetail', () => {
  beforeEach(() => {
    mockUseSitecore.mockReturnValue({
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
    });
  });

  it('renders title, category, spec sheet, and two-column sections', () => {
    render(<ProductDetail {...productDetailProps({ fields: baseFields })} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'MIKRON 7200 SOUND CONTROL SYSTEM'
    );
    expect(screen.getByText('QNX-M7200')).toBeInTheDocument();
    expect(screen.getByText('QNX-M7200-STD')).toBeInTheDocument();
    expect(screen.getByText('Commercial Window Profiles')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /print a spec sheet/i })).toHaveAttribute(
      'href',
      'https://www.quanex.com/product/extruded-solutions/'
    );
    expect(screen.getByText('Technical Data')).toBeInTheDocument();
    expect(screen.getByText('Styles Available')).toBeInTheDocument();
    expect(screen.getByText('Benefits')).toBeInTheDocument();
    expect(screen.getByAltText('Mikron profile')).toBeInTheDocument();
  });

  it('falls back to pageTitle and Detail when header/description are empty', () => {
    render(
      <ProductDetail
        {...productDetailProps({
          fields: {
            pageTitle: { value: 'Super Spacer' },
            Detail: { value: '<p>Warm-edge spacer intro.</p>' },
          },
        })}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Super Spacer');
    expect(screen.getByText('Warm-edge spacer intro.')).toBeInTheDocument();
  });

  it('renders images from ImageUrl fields when Image field src is empty', () => {
    render(
      <ProductDetail
        {...productDetailProps({
          fields: {
            pageHeaderTitle: { value: 'Commercial Vinyl Door Systems' },
            ImageUrl: {
              value:
                'https://www.quanex.com/wp-content/uploads/2022/07/Mikron-AW-Rated-Door-System-C3-11300_ProductImage_605x380.jpg',
            },
            ImageSecondaryUrl: {
              value:
                'https://www.quanex.com/wp-content/uploads/2022/07/Quanex-5400-Sliding-Patio-Door-System_ProductImage_605x380.jpg',
            },
          },
        })}
      />
    );

    expect(
      screen.getByAltText('Commercial Vinyl Door Systems')
    ).toHaveAttribute(
      'src',
      'https://www.quanex.com/wp-content/uploads/2022/07/Mikron-AW-Rated-Door-System-C3-11300_ProductImage_605x380.jpg'
    );
    expect(
      screen.getByAltText('Commercial Vinyl Door Systems alternate view')
    ).toHaveAttribute(
      'src',
      'https://www.quanex.com/wp-content/uploads/2022/07/Quanex-5400-Sliding-Patio-Door-System_ProductImage_605x380.jpg'
    );
  });

  it('shows NoDataFallback when empty and not editing', () => {
    render(<ProductDetail {...productDetailProps({ fields: {} })} />);
    expect(screen.getByText(/ProductDetail/i)).toBeInTheDocument();
  });

  it('reads route fields from Sitecore page context', () => {
    mockUseSitecore.mockReturnValue({
      page: {
        mode: {
          isEditing: false,
          isNormal: true,
          isPreview: false,
          name: 'normal',
          designLibrary: { isVariantGeneration: false },
          isDesignLibrary: false,
        },
        layout: {
          sitecore: {
            context: {},
            route: {
              fields: {
                ProductName: { value: 'Q-LON WEATHERSEALS' },
                ProductID: { value: 'QNX-QLON' },
                CategoryLabel: { value: 'Weatherseals and Fenestration Seals' },
              },
            },
          },
        },
        locale: 'en',
      },
    });

    render(<ProductDetail {...productDetailProps({ fields: undefined })} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Q-LON WEATHERSEALS');
    expect(screen.getByText('Weatherseals and Fenestration Seals')).toBeInTheDocument();
  });
});
