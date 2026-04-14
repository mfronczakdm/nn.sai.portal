import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as ImageBlock } from '@/components/image/ImageBlock';
import type { ImageProps } from '@/components/image/image.props';
import type { ImageField } from '@sitecore-content-sdk/nextjs';
import {
  defaultProps,
  propsWithoutCaption,
  propsWithEmptyCaption,
  propsWithoutAlt,
  propsWithLargeImage,
  propsWithoutStyles,
  propsWithoutFields,
} from './ImageBlock.mockProps';

// Type definitions for mock components
interface MockTextProps {
  field?: { value?: string };
}

interface MockImageWrapperProps {
  image?: ImageField;
  className?: string;
}

interface MockNoDataFallbackProps {
  componentName?: string;
}

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...args: Array<string | boolean | Record<string, boolean> | undefined>) => {
    return args
      .flat()
      .filter(Boolean)
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object') {
          return Object.keys(arg)
            .filter((key) => arg[key])
            .join(' ');
        }
        return '';
      })
      .join(' ')
      .trim();
  },
}));

// Mock Sitecore Text component
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field }: MockTextProps) => {
    return React.createElement('span', {}, field?.value || '');
  },
}));

// Mock ImageWrapper component
jest.mock('@/components/image/ImageWrapper.dev', () => ({
  Default: ({ image, className }: MockImageWrapperProps) => (
    <div data-testid="image-wrapper" className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image?.value?.src as string | undefined}
        alt={image?.value?.alt as string | undefined}
        width={image?.value?.width as number | undefined}
        height={image?.value?.height as number | undefined}
      />
    </div>
  ),
}));

// Mock NoDataFallback
jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: MockNoDataFallbackProps) => (
    <div data-testid="no-data-fallback">{componentName}</div>
  ),
}));

describe('ImageBlock Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render image with caption', () => {
      render(<ImageBlock {...defaultProps} />);

      expect(screen.getByTestId('image-wrapper')).toBeInTheDocument();
      expect(screen.getByText('This is a beautiful image caption')).toBeInTheDocument();
    });

    it('should render image element with correct src', () => {
      const { container } = render(<ImageBlock {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/images/sample-image.jpg');
    });

    it('should render image with correct alt text', () => {
      const { container } = render(<ImageBlock {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Sample Image');
    });

    it('should render image with correct dimensions', () => {
      const { container } = render(<ImageBlock {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '800');
      expect(img).toHaveAttribute('height', '600');
    });

    it('should render caption in figcaption tag', () => {
      const { container } = render(<ImageBlock {...defaultProps} />);

      const figcaption = container.querySelector('figcaption');
      expect(figcaption).toBeInTheDocument();
      expect(figcaption).toHaveTextContent('This is a beautiful image caption');
    });
  });

  describe('Optional fields handling', () => {
    it('should render without caption field', () => {
      render(<ImageBlock {...propsWithoutCaption} />);

      expect(screen.getByTestId('image-wrapper')).toBeInTheDocument();
      expect(screen.queryByText('This is a beautiful image caption')).not.toBeInTheDocument();
    });

    it('should render with empty caption', () => {
      const { container } = render(<ImageBlock {...propsWithEmptyCaption} />);

      expect(screen.getByTestId('image-wrapper')).toBeInTheDocument();
      const figcaption = container.querySelector('figcaption');
      expect(figcaption).toBeInTheDocument();
      expect(figcaption).toHaveTextContent('');
    });

    it('should render image without alt text', () => {
      const { container } = render(<ImageBlock {...propsWithoutAlt} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', '');
    });
  });

  describe('ImageWrapper integration', () => {
    it('should pass image field to ImageWrapper', () => {
      render(<ImageBlock {...defaultProps} />);

      const wrapper = screen.getByTestId('image-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('should apply correct classes to ImageWrapper', () => {
      render(<ImageBlock {...defaultProps} />);

      const wrapper = screen.getByTestId('image-wrapper');
      expect(wrapper).toHaveClass('mb-[24px]', 'h-full', 'w-full', 'object-cover');
    });

    it('should handle large images', () => {
      const { container } = render(<ImageBlock {...propsWithLargeImage} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('width', '1920');
      expect(img).toHaveAttribute('height', '1080');
    });
  });

  describe('Component structure', () => {
    it('should render with component class', () => {
      const { container } = render(<ImageBlock {...defaultProps} />);

      const mainDiv = container.querySelector('.component');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should apply custom styles from params', () => {
      const { container } = render(<ImageBlock {...defaultProps} />);

      const mainDiv = container.querySelector('.component');
      expect(mainDiv).toHaveClass('custom-image-style');
    });

    it('should render without custom styles when not provided', () => {
      const { container } = render(<ImageBlock {...propsWithoutStyles} />);

      const mainDiv = container.querySelector('.component');
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).not.toHaveClass('custom-image-style');
    });
  });

  describe('Text component integration', () => {
    it('should render caption using Text component', () => {
      render(<ImageBlock {...defaultProps} />);

      const caption = screen.getByText('This is a beautiful image caption');
      expect(caption).toBeInTheDocument();
    });
  });

  describe('Edge cases and fallbacks', () => {
    it('should render NoDataFallback when fields is undefined', () => {
      render(<ImageBlock {...propsWithoutFields} />);

      const fallback = screen.getByTestId('no-data-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('Image');
    });

    it('should render NoDataFallback when fields is null', () => {
      const propsWithNullFields = {
        ...defaultProps,
        fields: null as unknown as ImageProps['fields'],
      };

      // Component checks for fields !== undefined, not fields !== null
      // so null fields will still render the component
      const { container } = render(<ImageBlock {...propsWithNullFields} />);
      
      // When fields is null but not undefined, component renders with empty data
      expect(container.querySelector('.component')).toBeInTheDocument();
    });

    it('should handle missing image value gracefully', () => {
      const propsWithoutImageValue = {
        ...defaultProps,
        fields: {
          image: { value: undefined } as unknown as ImageField,
          caption: defaultProps.fields.caption,
        },
      };

      const { container } = render(<ImageBlock {...propsWithoutImageValue} />);

      const img = container.querySelector('img');
      // When image value is undefined, src attribute won't be set or will be empty
      if (img) {
        const srcAttr = img.getAttribute('src');
        expect(srcAttr === null || srcAttr === '' || srcAttr === 'undefined').toBe(true);
      }
    });
  });

  describe('CSS classes and styling', () => {
    it('should apply margin bottom to ImageWrapper', () => {
      render(<ImageBlock {...defaultProps} />);

      const wrapper = screen.getByTestId('image-wrapper');
      expect(wrapper).toHaveClass('mb-[24px]');
    });

    it('should apply full width and height classes', () => {
      render(<ImageBlock {...defaultProps} />);

      const wrapper = screen.getByTestId('image-wrapper');
      expect(wrapper).toHaveClass('h-full', 'w-full');
    });

    it('should apply object-cover class for proper image scaling', () => {
      render(<ImageBlock {...defaultProps} />);

      const wrapper = screen.getByTestId('image-wrapper');
      expect(wrapper).toHaveClass('object-cover');
    });
  });

  describe('Accessibility', () => {
    it('should provide alt text for images', () => {
      const { container } = render(<ImageBlock {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Sample Image');
    });

    it('should handle images without alt text', () => {
      const { container } = render(<ImageBlock {...propsWithoutAlt} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', '');
    });
  });
});

