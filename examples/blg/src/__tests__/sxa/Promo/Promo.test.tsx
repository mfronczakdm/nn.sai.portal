/**
 * Unit tests for Promo component
 * Tests Default and CenteredCard variants with various field combinations
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Default as PromoDefault, CenteredCard, Left as PromoLeft, Right as PromoRight, Columns as PromoColumns } from 'components/sxa/Promo';
import {
  defaultPromoProps,
  centeredCardPromoProps,
  minimalPromoProps,
  emptyPromoProps,
  emptyTextFieldsProps,
  splitPromoProps,
  columnsPromoProps,
} from './Promo.mockProps';

// Mock the Sitecore Content SDK components and shadcn UI Button
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  NextImage: ({ field, className }: any) => {
    if (!field?.value?.src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={field.value.src}
        alt={field.value.alt || ''}
        width={field.value.width}
        height={field.value.height}
        className={className}
      />
    );
  },
  Link: ({ field, children, className }: any) => {
    if (!field?.value?.href) return null;
    return (
      <a href={field.value.href} className={className}>
        {children || field.value.text}
      </a>
    );
  },
  RichText: ({ field, tag: Tag = 'div', className }: any) => {
    if (!field || typeof field.value !== 'string' || field.value.trim() === '') return null;
    return React.createElement(Tag, {
      className,
      dangerouslySetInnerHTML: { __html: field.value },
    });
  },
}));

jest.mock('@/components/content-sdk/TrackedCtaLink', () => ({
  TrackedCtaLink: ({ field, className }: any) => {
    if (!field?.value?.href) return null;
    return (
      <a href={field.value.href} className={className}>
        {field.value.text}
      </a>
    );
  },
}));

// Mock the Button component
jest.mock('../../../components/ui/button', () => ({
  Button: ({ children }: any) => <button className="mocked-button">{children}</button>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('Promo Component - Default Variant', () => {
  describe('Basic Rendering', () => {
    it('should render promo with all fields', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toBeInTheDocument();
      expect(promo).toHaveClass('custom-promo-style');
      expect(promo?.id).toBe('promo-1');
    });

    it('should render promo icon image', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test Promo Image');
    });

    it('should render PromoText as heading', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.innerHTML).toContain('Featured Product');
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('font-bold');
    });

    it('should render PromoText2 as description', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      // PromoText2 is rendered as a div with text-base mb-4 classes (without the bg-[#ffb900])
      const descriptions = container.querySelectorAll('.text-base.mb-4');
      const description = Array.from(descriptions).find((el) =>
        el.innerHTML.includes('Discover our amazing product features')
      );
      expect(description).toBeInTheDocument();
    });

    it('should render PromoText3 as badge', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const badge = container.querySelector('.bg-\\[\\#ffb900\\]');
      expect(badge).toBeInTheDocument();
      expect(badge?.innerHTML).toContain('New Arrival');
    });

    it('should render link button', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const link = container.querySelector('a[href="/products/featured"]');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('Learn More');
    });
  });

  describe('Empty States', () => {
    it('should render default component when fields are null', () => {
      const { container } = render(<PromoDefault {...emptyPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toBeInTheDocument();
      expect(container.querySelector('.is-empty-hint')).toBeInTheDocument();
      expect(container).toHaveTextContent('Promo');
    });

    it('should handle empty text fields gracefully', () => {
      const { container } = render(<PromoDefault {...emptyTextFieldsProps} />);

      // Should still render the structure even with empty text fields
      const promo = container.querySelector('.component.promo');
      expect(promo).toBeInTheDocument();

      // Empty RichText components return null, so they won't be in DOM
      const heading = container.querySelector('h2');
      expect(heading).not.toBeInTheDocument();
    });

    it('should render with minimal fields', () => {
      const { container } = render(<PromoDefault {...minimalPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toBeInTheDocument();

      // Should have image and main text
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom styles from params', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toHaveClass('custom-promo-style');
    });

    it('should have flex layout classes', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toHaveClass('flex-1');
      expect(promo).toHaveClass('shadow-lg');
      expect(promo).toHaveClass('pointer');
    });

    it('should apply RenderingIdentifier as id', () => {
      const { container } = render(<PromoDefault {...defaultPromoProps} />);

      const promo = container.querySelector('#promo-1');
      expect(promo).toBeInTheDocument();
    });
  });
});

describe('Promo Component - CenteredCard Variant', () => {
  describe('Basic Rendering', () => {
    it('should render centered card promo', () => {
      const { container } = render(<CenteredCard {...centeredCardPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toBeInTheDocument();
      expect(promo).toHaveClass('centered-style');
      expect(promo?.id).toBe('promo-centered');
    });

    it('should render with centered text alignment', () => {
      const { container } = render(<CenteredCard {...centeredCardPromoProps} />);

      const contentDiv = container.querySelector('.text-center');
      expect(contentDiv).toBeInTheDocument();
      expect(contentDiv).toHaveClass('justify-center');
    });

    it('should render heading with larger font size', () => {
      const { container } = render(<CenteredCard {...centeredCardPromoProps} />);

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-4xl');
      expect(heading).toHaveClass('font-bold');
    });

    it('should render link button', () => {
      const { container } = render(<CenteredCard {...centeredCardPromoProps} />);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render default component when fields are null', () => {
      const { container } = render(<CenteredCard {...emptyPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toBeInTheDocument();
      expect(container.querySelector('.is-empty-hint')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have full width class', () => {
      const { container } = render(<CenteredCard {...centeredCardPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toHaveClass('w-full');
    });

    it('should have alignment stretch class', () => {
      const { container } = render(<CenteredCard {...centeredCardPromoProps} />);

      const promo = container.querySelector('.component.promo');
      expect(promo).toHaveClass('align-stretch');
    });
  });
});

describe('Promo Component - Accessibility', () => {
  it('should have proper semantic structure (Default)', () => {
    const { container } = render(<PromoDefault {...defaultPromoProps} />);

    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('a')).toBeInTheDocument();
  });

  it('should have alt text on images', () => {
    const { container } = render(<PromoDefault {...defaultPromoProps} />);

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('alt', 'Test Promo Image');
  });

  it('should have proper semantic structure (CenteredCard)', () => {
    const { container } = render(<CenteredCard {...centeredCardPromoProps} />);

    expect(container.querySelector('h2')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('a')).toBeInTheDocument();
  });
});

describe('Promo Component - Left Variant', () => {
  it('renders image before content in the layout', () => {
    const { container } = render(<PromoLeft {...splitPromoProps} />);

    const section = container.querySelector('section.component.promo');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('split-promo-style');

    const layout = section?.querySelector('.md\\:flex-row');
    expect(layout).toBeInTheDocument();
    expect(layout?.querySelector(':scope > div:first-child img')).toBeInTheDocument();
  });

  it('renders title, accent line, body copy, and both promo links', () => {
    const { container } = render(<PromoLeft {...splitPromoProps} />);

    expect(container).toHaveTextContent('Personal Banking');
    expect(container).toHaveTextContent('No minimum balance requirement or monthly maintenance fee');
    expect(container.querySelector('.bg-accent.h-1.w-16')).toBeInTheDocument();
    expect(container.querySelector('.content-sdk-rich-text ul')).toBeInTheDocument();

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/checking/open');
    expect(links[0]).toHaveTextContent('OPEN A FREE CHECKING ACCOUNT');
    expect(links[0]).toHaveClass('hover:bg-primary-hover');
    expect(links[1]).toHaveAttribute('href', '/savings');
    expect(links[1]).toHaveTextContent('View Our Savings Products');
  });

  it('renders default component when fields are null', () => {
    const { container } = render(<PromoLeft {...emptyPromoProps} />);
    expect(container.querySelector('.is-empty-hint')).toBeInTheDocument();
  });
});

describe('Promo Component - Right Variant', () => {
  it('renders mirrored layout with image after content on desktop', () => {
    const { container } = render(<PromoRight {...splitPromoProps} />);

    const layout = container.querySelector('.md\\:flex-row-reverse');
    expect(layout).toBeInTheDocument();
  });

  it('renders both CTA links with theme button styling', () => {
    const { container } = render(<PromoRight {...splitPromoProps} />);

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent('OPEN A FREE CHECKING ACCOUNT');
    expect(links[0]).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary-hover');
    expect(links[1]).toHaveTextContent('View Our Savings Products');
    expect(links[1]).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary-hover');
  });

  it('renders default component when fields are null', () => {
    const { container } = render(<PromoRight {...emptyPromoProps} />);
    expect(container.querySelector('.is-empty-hint')).toBeInTheDocument();
  });
});

describe('Promo Component - Columns Variant', () => {
  it('renders three-column featured rates layout', () => {
    const { container } = render(<PromoColumns {...columnsPromoProps} />);

    const section = container.querySelector('section.component.promo');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('columns-promo-style');
    expect(container.querySelector('.md\\:grid-cols-3')).toBeInTheDocument();
  });

  it('renders PromoText3 in the left column with accent line', () => {
    const { container } = render(<PromoColumns {...columnsPromoProps} />);

    expect(container).toHaveTextContent('Featured Rates');
    expect(container.querySelector('.bg-accent.h-1.w-16')).toBeInTheDocument();
  });

  it('renders PromoText and PromoLink in the middle column', () => {
    const { container } = render(<PromoColumns {...columnsPromoProps} />);

    expect(container).toHaveTextContent('Express Mortgage');
    expect(container).toHaveTextContent('6.874% APR');

    const links = container.querySelectorAll('a');
    expect(links[0]).toHaveAttribute('href', '/mortgages/express');
    expect(links[0]).toHaveTextContent('Learn More');
  });

  it('renders PromoText2 and PromoLink2 in the right column', () => {
    const { container } = render(<PromoColumns {...columnsPromoProps} />);

    expect(container).toHaveTextContent('Home Equity Line of Credit');
    expect(container).toHaveTextContent('6.240% APR');

    const links = container.querySelectorAll('a');
    expect(links[1]).toHaveAttribute('href', '/home-equity');
    expect(links[1]).toHaveTextContent('Learn More');
  });

  it('renders default component when fields are null', () => {
    const { container } = render(<PromoColumns {...emptyPromoProps} />);
    expect(container.querySelector('.is-empty-hint')).toBeInTheDocument();
  });

  it('uses light background by default for Rockland featured rates styling', () => {
    const { container } = render(<PromoColumns {...columnsPromoProps} />);

    const section = container.querySelector('section.component.promo');
    expect(section).toHaveClass('bg-muted');
  });

  it('applies dark background theme when Background param is set', () => {
    const { container } = render(
      <PromoColumns
        {...columnsPromoProps}
        params={{ ...columnsPromoProps.params, Background: 'dark' }}
      />
    );

    const section = container.querySelector('section.component.promo');
    expect(section).toHaveClass('bg-[#0a1a44]');
  });

  it('applies primary background theme when Background param is set', () => {
    const { container } = render(
      <PromoColumns
        {...columnsPromoProps}
        params={{ ...columnsPromoProps.params, Background: 'primary' }}
      />
    );

    const section = container.querySelector('section.component.promo');
    expect(section).toHaveClass('bg-primary');
  });
});
