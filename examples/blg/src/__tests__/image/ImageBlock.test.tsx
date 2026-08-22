/* eslint-disable */
import { render, screen } from '@testing-library/react';
import { Default as ImageBlock } from '@/components/image/ImageBlock';
import { ImageProps } from '@/components/image/image.props';
import { mockPage } from '../test-utils/mockPage';

// Mock dependencies
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field }: any) => <span>{field?.value || ''}</span>,
}));

jest.mock('@/components/image/ImageWrapper.dev', () => ({
  Default: ({ image, className }: any) => (
    <img
      data-testid="image-wrapper"
      src={image?.value?.src || ''}
      alt={image?.value?.alt || ''}
      className={className}
    />
  ),
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: any) => (
    <div data-testid="no-data-fallback">{componentName} - No data available</div>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('ImageBlock Component', () => {
  const mockImageProps: ImageProps = {
    rendering: {
      uid: 'test-uid',
      componentName: 'ImageBlock',
      dataSource: '',
      fields: {
        image: {
          value: {
            src: '/test-image.jpg',
            alt: 'Test image',
            width: 800,
            height: 600,
          },
        },
        caption: {
          value: 'This is a test caption',
        },
      },
    },
    fields: {
      image: {
        value: {
          src: '/test-image.jpg',
          alt: 'Test image',
          width: 800,
          height: 600,
        },
      },
      caption: {
        value: 'This is a test caption',
      },
    },
    params: {
      styles: 'custom-style',
    },
    page: mockPage,
  };

  it('renders image and caption when fields are provided', () => {
    render(<ImageBlock {...mockImageProps} />);

    const image = screen.getByTestId('image-wrapper');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');

    expect(screen.getByText('This is a test caption')).toBeInTheDocument();
  });

  it('applies styles from params', () => {
    const { container } = render(<ImageBlock {...mockImageProps} />);
    const wrapper = container.querySelector('.component');
    expect(wrapper).toHaveClass('component', 'custom-style');
  });

  it('renders image with correct className', () => {
    render(<ImageBlock {...mockImageProps} />);
    const image = screen.getByTestId('image-wrapper');
    expect(image).toHaveClass('mb-[24px]', 'h-full', 'w-full', 'object-cover');
  });

  it('renders NoDataFallback when fields are undefined', () => {
    const propsWithoutFields = {
      rendering: {
        uid: 'test-uid',
        componentName: 'ImageBlock',
        dataSource: '',
      },
      params: {},
    };

    render(<ImageBlock {...(propsWithoutFields as any)} />);
    expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    expect(screen.getByText('Image - No data available')).toBeInTheDocument();
  });

  it('renders caption as empty when caption field is not provided', () => {
    const propsWithoutCaption = {
      ...mockImageProps,
      rendering: {
        ...mockImageProps.rendering,
        fields: {
          image: mockImageProps.fields.image,
        },
      },
      fields: {
        image: mockImageProps.fields.image,
      },
    };

    render(<ImageBlock {...(propsWithoutCaption as any)} />);
    const image = screen.getByTestId('image-wrapper');
    expect(image).toBeInTheDocument();
  });
});
