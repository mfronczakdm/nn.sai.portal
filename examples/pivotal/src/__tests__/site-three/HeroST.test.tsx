/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Default as HeroSTDefault,
  Right as HeroSTRight,
  Centered as HeroSTCentered,
  SplitScreen as HeroSTSplitScreen,
  Stacked as HeroSTStacked,
  Version1 as HeroSTVersion1,
} from '@/components/site-three/HeroST';

// Mock useContainerOffsets hook
jest.mock('@/hooks/useContainerOffsets', () => ({
  useContainerOffsets: () => ({
    containerRef: { current: null },
    rightOffset: 0,
    leftOffset: 0,
  }),
}));

// Mock Sitecore SDK
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, ...props }: any) => <span {...props}>{field?.value || ''}</span>,
  NextImage: ({ field, className }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={field?.value?.src || ''} alt={field?.value?.alt || ''} className={className} />
  ),
  Link: ({ field, children, className }: any) => (
    <a href={field?.value?.href || '#'} className={className}>
      {children || field?.value?.text || ''}
    </a>
  ),
  useSitecore: () => ({
    page: { mode: { isEditing: false, isPreview: false } },
  }),
}));

describe('HeroST', () => {
  const mockProps = {
    params: {
      styles: 'test-styles',
    },
    fields: {
      Eyebrow: {
        value: 'New Collection',
      },
      Title: {
        value: 'Premium Audio Experience',
      },
      Image1: {
        value: {
          src: '/images/hero-bg.jpg',
          alt: 'Hero background',
        },
      },
      Image2: {
        value: {
          src: '/images/hero-product.jpg',
          alt: 'Hero product',
        },
      },
      Link1: {
        value: {
          href: '/shop',
          text: 'Shop Now',
        },
      },
      Link2: {
        value: {
          href: '/learn-more',
          text: 'Learn More',
        },
      },
    },
  };

  describe('Default variant', () => {
    it('renders hero with eyebrow text', () => {
      render(<HeroSTDefault {...mockProps} />);
      expect(screen.getByText('New Collection')).toBeInTheDocument();
    });

    it('renders hero with title', () => {
      render(<HeroSTDefault {...mockProps} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('renders background image', () => {
      render(<HeroSTDefault {...mockProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('renders call-to-action links', () => {
      render(<HeroSTDefault {...mockProps} />);
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('applies light text on eyebrow and title when Dark Image param is enabled', () => {
      const { container } = render(
        <HeroSTDefault {...mockProps} params={{ ...mockProps.params, DarkImage: '1' }} />
      );
      const headings = container.querySelectorAll('h1');
      expect(headings[0]).toHaveClass('text-white');
      expect(headings[1]).toHaveClass('text-white');
      expect(container.querySelector('section')).toHaveAttribute('data-hero-st-dark-image', 'true');
    });

    it('recognizes Dark Image checkbox under alternate param key spellings', () => {
      const { container } = render(
        <HeroSTDefault {...mockProps} params={{ ...mockProps.params, 'Dark Image': 'true' }} />
      );
      const headings = container.querySelectorAll('h1');
      expect(headings[0]).toHaveClass('text-white');
      expect(headings[1]).toHaveClass('text-white');
    });

    it('does not force light text when Dark Image is off', () => {
      const { container } = render(
        <HeroSTDefault {...mockProps} params={{ ...mockProps.params, DarkImage: '0' }} />
      );
      const headings = container.querySelectorAll('h1');
      expect(headings[0]).not.toHaveClass('text-white');
      expect(headings[1]).not.toHaveClass('text-white');
    });
  });

  describe('Centered variant', () => {
    it('renders hero with title', () => {
      render(<HeroSTCentered {...mockProps} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('renders call-to-action links', () => {
      render(<HeroSTCentered {...mockProps} />);
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
    });

    it('renders eyebrow text in centered variant', () => {
      render(<HeroSTCentered {...mockProps} />);
      expect(screen.getByText('New Collection')).toBeInTheDocument();
    });

    it('applies custom styles in centered variant', () => {
      const { container } = render(<HeroSTCentered {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('test-styles');
    });

    it('applies white overlay text when Dark Image is selected', () => {
      const { container } = render(
        <HeroSTCentered {...mockProps} params={{ ...mockProps.params, DarkImage: '1' }} />
      );
      const headings = container.querySelectorAll('h1');
      expect(headings[0]).toHaveClass('text-white');
      expect(headings[1]).toHaveClass('text-white');
      expect(container.querySelector('section')).toHaveAttribute('data-hero-st-dark-image', 'true');
    });

    it('recognizes the Sitecore field name Dark Imge (typo) as Dark Image', () => {
      const { container } = render(
        <HeroSTCentered {...mockProps} params={{ ...mockProps.params, 'Dark Imge': '1' }} />
      );
      const headings = container.querySelectorAll('h1');
      expect(headings[0]).toHaveClass('text-white');
      expect(headings[1]).toHaveClass('text-white');
      expect(container.querySelector('section')).toHaveAttribute('data-hero-st-dark-image', 'true');
    });

    it('treats Dark Image in Advanced styling (params.styles) as a dark overlay', () => {
      const { container } = render(
        <HeroSTCentered
          {...mockProps}
          params={{ styles: 'test-styles dark-image' }}
        />
      );
      expect(container.querySelector('section')).toHaveAttribute('data-hero-st-dark-image', 'true');
      expect(container.querySelectorAll('h1')[1]).toHaveClass('text-white');
    });
  });

  describe('Right variant', () => {
    it('renders hero with title in right variant', () => {
      render(<HeroSTRight {...mockProps} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('renders eyebrow text in right variant', () => {
      render(<HeroSTRight {...mockProps} />);
      expect(screen.getByText('New Collection')).toBeInTheDocument();
    });

    it('renders call-to-action links in right variant', () => {
      render(<HeroSTRight {...mockProps} />);
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('renders background images in right variant', () => {
      render(<HeroSTRight {...mockProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('applies custom styles in right variant', () => {
      const { container } = render(<HeroSTRight {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('test-styles');
    });

    it('handles missing eyebrow in right variant', () => {
      const propsWithoutEyebrow: any = {
        ...mockProps,
        fields: {
          ...mockProps.fields,
          Eyebrow: undefined,
        },
      };
      render(<HeroSTRight {...propsWithoutEyebrow} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });
  });

  describe('SplitScreen variant', () => {
    it('renders hero with title in split screen variant', () => {
      render(<HeroSTSplitScreen {...mockProps} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('renders eyebrow text in split screen variant', () => {
      render(<HeroSTSplitScreen {...mockProps} />);
      expect(screen.getByText('New Collection')).toBeInTheDocument();
    });

    it('renders call-to-action links in split screen variant', () => {
      render(<HeroSTSplitScreen {...mockProps} />);
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('applies primary background in split screen variant', () => {
      const { container } = render(<HeroSTSplitScreen {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-primary');
    });

    it('renders images in split screen layout', () => {
      render(<HeroSTSplitScreen {...mockProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('handles missing title in split screen variant', () => {
      const propsWithoutTitle: any = {
        ...mockProps,
        fields: {
          ...mockProps.fields,
          Title: undefined,
        },
      };
      render(<HeroSTSplitScreen {...propsWithoutTitle} />);
      expect(screen.getByText('New Collection')).toBeInTheDocument();
    });
  });

  describe('Stacked variant', () => {
    it('renders hero with title in stacked variant', () => {
      render(<HeroSTStacked {...mockProps} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('renders eyebrow text in stacked variant', () => {
      render(<HeroSTStacked {...mockProps} />);
      expect(screen.getByText('New Collection')).toBeInTheDocument();
    });

    it('renders call-to-action links in stacked variant', () => {
      render(<HeroSTStacked {...mockProps} />);
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('applies primary background in stacked variant', () => {
      const { container } = render(<HeroSTStacked {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-primary');
    });

    it('renders both Image1 and Image2 in stacked layout', () => {
      render(<HeroSTStacked {...mockProps} />);
      const images = screen.getAllByRole('img');
      // Should render multiple images (Image1 and Image2 fields)
      expect(images.length).toBeGreaterThan(1);
    });

    it('handles missing Image2 in stacked variant', () => {
      const propsWithoutImage2: any = {
        ...mockProps,
        fields: {
          ...mockProps.fields,
          Image2: undefined,
        },
      };
      render(<HeroSTStacked {...propsWithoutImage2} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('applies custom styles in stacked variant', () => {
      const { container } = render(<HeroSTStacked {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('test-styles');
    });
  });

  describe('Version1 variant', () => {
    it('renders title as the terracotta headline', () => {
      render(<HeroSTVersion1 {...mockProps} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('renders eyebrow as the dates line below the title', () => {
      const { container } = render(<HeroSTVersion1 {...mockProps} />);
      expect(screen.getByText('New Collection')).toBeInTheDocument();
      const title = container.querySelector('h1');
      const dates = container.querySelector('p');
      expect(title).toHaveClass('text-[var(--color-hero-headline)]');
      expect(dates).toHaveTextContent('New Collection');
    });

    it('uses a collage-left copy-right split, not a full-bleed overlay', () => {
      const { container } = render(<HeroSTVersion1 {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-hero-st-variant', 'Version1');
      expect(section).toHaveAttribute('data-hero-st-image-layout', 'both');
      expect(section).toHaveClass('hero-st-version1');
      expect(section).toHaveClass('test-styles');
      expect(container.querySelector('[data-hero-st-collage-mosaic]')).toBeInTheDocument();
      expect(container.querySelector('.lg\\:grid-cols-2')).toBeInTheDocument();
    });

    it('keeps collage panels rectangular', () => {
      const { container } = render(<HeroSTVersion1 {...mockProps} />);
      const mosaic = container.querySelector('[data-hero-st-collage-mosaic]');
      expect(mosaic).toHaveClass('rounded-none');
      mosaic?.querySelectorAll(':scope > div').forEach((panel) => {
        expect(panel).toHaveClass('rounded-none');
      });
    });

    it('renders square primary and secondary CTAs', () => {
      const { container } = render(<HeroSTVersion1 {...mockProps} />);
      expect(screen.getByText('Shop Now')).toHaveClass('btn', 'btn-primary', 'rounded-none');
      expect(screen.getByText('Learn More')).toHaveClass('btn', 'btn-secondary', 'rounded-none');
      expect(container.querySelector('.btn.rounded-full')).not.toBeInTheDocument();
    });

    it('treats Image1 as a composite cover when Image2 is absent', () => {
      const propsWithoutImage2: any = {
        ...mockProps,
        fields: {
          ...mockProps.fields,
          Image2: undefined,
        },
      };
      const { container } = render(<HeroSTVersion1 {...propsWithoutImage2} />);
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveClass('object-cover');
      expect(container.querySelector('[data-hero-st-collage-mosaic]')).toBeInTheDocument();
    });

    it('overlays Image1 on the mosaic when Image2 is present', () => {
      render(<HeroSTVersion1 {...mockProps} />);
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(1);
      expect(images[0]).toHaveAttribute('src', '/images/hero-product.jpg');
      expect(images[1]).toHaveClass('object-contain');
    });

    it('uses Image1 only when Image Layout is Primary Image', () => {
      const { container } = render(
        <HeroSTVersion1
          {...mockProps}
          params={{ ...mockProps.params, ImageLayout: 'Primary Image' }}
        />
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-hero-st-image-layout', 'primary');
      expect(container.querySelector('[data-hero-st-collage-mosaic]')).not.toBeInTheDocument();
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', '/images/hero-bg.jpg');
      expect(images[0]).toHaveClass('object-cover');
    });

    it('keeps the collage when Image Layout is Both Images', () => {
      const { container } = render(
        <HeroSTVersion1
          {...mockProps}
          params={{ ...mockProps.params, ImageLayout: 'Both Images' }}
        />
      );
      expect(container.querySelector('section')).toHaveAttribute(
        'data-hero-st-image-layout',
        'both'
      );
      expect(container.querySelector('[data-hero-st-collage-mosaic]')).toBeInTheDocument();
      expect(screen.getAllByRole('img').length).toBeGreaterThan(1);
    });

    it('does not change Default layout classes', () => {
      const { container } = render(<HeroSTDefault {...mockProps} />);
      expect(container.querySelector('section')).not.toHaveAttribute(
        'data-hero-st-variant',
        'Version1'
      );
      expect(container.querySelector('[data-hero-st-collage-mosaic]')).not.toBeInTheDocument();
      expect(container.querySelector('section')).toHaveClass('border-8');
    });

    it('does not apply Image Layout to the Default variant', () => {
      const { container } = render(
        <HeroSTDefault
          {...mockProps}
          params={{ ...mockProps.params, ImageLayout: 'Primary Image' }}
        />
      );
      expect(container.querySelector('section')).not.toHaveAttribute('data-hero-st-image-layout');
      expect(container.querySelector('[data-hero-st-collage-mosaic]')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases and missing data', () => {
    it('handles completely missing fields in default variant', () => {
      const propsWithoutFields: any = {
        params: {},
        fields: {},
      };
      const { container } = render(<HeroSTDefault {...propsWithoutFields} />);
      // Component should still render without errors
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('handles missing links in default variant', () => {
      const propsWithoutLinks: any = {
        ...mockProps,
        fields: {
          ...mockProps.fields,
          Link1: undefined,
          Link2: undefined,
        },
      };
      render(<HeroSTDefault {...propsWithoutLinks} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('handles missing images in default variant', () => {
      const propsWithoutImages: any = {
        ...mockProps,
        fields: {
          ...mockProps.fields,
          Image1: undefined,
        },
      };
      render(<HeroSTDefault {...propsWithoutImages} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });

    it('renders without params styles', () => {
      const propsWithoutStyles = {
        ...mockProps,
        params: {},
      };
      render(<HeroSTDefault {...propsWithoutStyles} />);
      expect(screen.getByText('Premium Audio Experience')).toBeInTheDocument();
    });
  });
});
