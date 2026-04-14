import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as Image, Banner as ImageBanner } from '@/components/sxa/Image';
import type { ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import {
  defaultProps,
  propsWithoutStyles,
  propsWithoutLink,
  propsWithEmptyImage,
  propsWithoutAlt,
  mockPageData,
  mockPageDataEditing,
} from './Image.mockProps';

// Type definitions for mock components
interface MockNextImageProps {
  field?: ImageField;
  [key: string]: unknown;
}

interface MockLinkProps {
  field?: LinkField;
  children?: React.ReactNode;
}

// Mock the useSitecore hook
const mockUseSitecore = jest.fn();
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => mockUseSitecore(),
  NextImage: ({ field, ...props }: MockNextImageProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={field?.value?.src as string | undefined || ''} 
      alt={field?.value?.alt as string | undefined || 'image'} 
      {...props}
      data-testid="next-image"
    />
  ),
  Link: ({ field, children }: MockLinkProps) => (
    <a href={field?.value?.href as string | undefined || '#'} data-testid="content-link">
      {children}
    </a>
  ),
}));

describe('Image Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSitecore.mockReturnValue(mockPageData);
  });

  describe('Default Image Component', () => {
    it('should render image with correct attributes', () => {
      render(<Image {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test Image');
    });

    it('should render with correct container structure', () => {
      render(<Image {...defaultProps} />);

      const container = screen.getByTestId('next-image').closest('.component.image');
      expect(container).toHaveClass('component', 'image', 'custom-image-style');
      
      const contentDiv = container?.querySelector('.component-content');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      render(<Image {...defaultProps} />);

      const container = screen.getByTestId('next-image').closest('.component.image');
      expect(container).toHaveClass('custom-image-style');
    });

    it('should render without custom styles when not provided', () => {
      render(<Image {...propsWithoutStyles} />);

      const container = screen.getByTestId('next-image').closest('.component.image');
      expect(container).toHaveClass('component', 'image');
      expect(container).not.toHaveClass('custom-image-style');
    });

    it('should provide default alt text when not provided', () => {
      render(<Image {...propsWithoutAlt} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'image');
    });

    it('should handle missing fields gracefully', () => {
      const propsWithoutFields = {
        ...defaultProps,
        fields: null as unknown as typeof defaultProps.fields,
      };

      render(<Image {...propsWithoutFields} />);

      const container = document.querySelector('.component.image');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Banner Image Component', () => {
    it('should render image without link when not in editing mode and no target URL', () => {
      render(<ImageBanner {...propsWithoutLink} />);

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(screen.queryByTestId('content-link')).not.toBeInTheDocument();
    });

    it('should render image with link when target URL is provided', () => {
      render(<ImageBanner {...defaultProps} />);

      const link = screen.getByTestId('content-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test-link');
      
      const image = link.querySelector('[data-testid="next-image"]');
      expect(image).toBeInTheDocument();
    });

    it('should render image without link when in editing mode', () => {
      mockUseSitecore.mockReturnValue(mockPageDataEditing);
      render(<ImageBanner {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(screen.queryByTestId('content-link')).not.toBeInTheDocument();
    });

    it('should render image without link when target URL is not provided', () => {
      render(<ImageBanner {...propsWithoutLink} />);

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(screen.queryByTestId('content-link')).not.toBeInTheDocument();
    });

    it('should handle empty image field', () => {
      render(<ImageBanner {...propsWithEmptyImage} />);

      const container = document.querySelector('.component.image');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('component', 'image', 'custom-image-style');
    });

    it('should apply correct styles', () => {
      render(<ImageBanner {...defaultProps} />);

      const container = screen.getByTestId('next-image').closest('.component.image');
      expect(container).toHaveClass('component', 'image', 'custom-image-style');
    });
  });

  describe('Image field modifications', () => {
    it('should modify image props with default alt text', () => {
      render(<Image {...propsWithoutAlt} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'image');
    });

    it('should preserve existing alt text when provided', () => {
      render(<Image {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'Test Image');
    });
  });

  describe('Component structure', () => {
    it('should render correct DOM structure for Default component', () => {
      render(<Image {...defaultProps} />);

      const container = screen.getByTestId('next-image').closest('.component.image');
      expect(container).toHaveClass('component', 'image', 'custom-image-style');
      
      const contentDiv = container?.querySelector('.component-content');
      expect(contentDiv).toBeInTheDocument();
      
      const image = contentDiv?.querySelector('[data-testid="next-image"]');
      expect(image).toBeInTheDocument();
    });

    it('should render correct DOM structure for Banner component', () => {
      render(<ImageBanner {...defaultProps} />);

      const container = screen.getByTestId('next-image').closest('.component.image');
      expect(container).toHaveClass('component', 'image', 'custom-image-style');
      
      const contentDiv = container?.querySelector('.component-content');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing params gracefully', () => {
      const propsWithoutParams = {
        params: {},
        fields: defaultProps.fields,
      };

      render(<Image {...propsWithoutParams} />);

      const container = screen.getByTestId('next-image').closest('.component.image');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('component', 'image');
    });

    it('should handle undefined field values', () => {
      const propsWithUndefinedFields = {
        ...defaultProps,
        fields: {
          Image: { value: undefined as unknown as ImageField['value'] },
          ImageCaption: { value: undefined as unknown as string },
          TargetUrl: { value: undefined as unknown as LinkField['value'] },
        },
      };

      render(<Image {...propsWithUndefinedFields} />);

      const container = document.querySelector('.component.image');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      render(<Image {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'Test Image');
    });

    it('should provide default alt text when not specified', () => {
      render(<Image {...propsWithoutAlt} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'image');
    });
  });
});
