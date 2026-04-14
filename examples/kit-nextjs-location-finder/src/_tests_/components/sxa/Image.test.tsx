import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Default as Image, Banner } from '@/components/sxa/Image';
import { Page } from '@sitecore-content-sdk/nextjs';

// Mock Sitecore SDK
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: jest.fn(() => ({
    page: {
      mode: {
        isEditing: false,
        isPreview: false,
        isNormal: true,
      },
    },
  })),
  NextImage: jest.fn(({ field }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="sxa-image" src={field?.value?.src} alt={field?.value?.alt} />
  )),
  Link: jest.fn(({ field, children }) => (
    <a href={field?.value?.href} data-testid="image-link">
      {children}
    </a>
  )),
  Text: jest.fn(({ field, className }) => (
    <span className={className} data-testid="image-caption">
      {field?.value}
    </span>
  )),
}));

describe('SXA Image', () => {
  const mockPage = {
    mode: {
      isEditing: false,
      isPreview: false,
      isNormal: true,
      name: 'normal' as const,
      designLibrary: { isVariantGeneration: false },
      isDesignLibrary: false,
    },
    layout: {
      sitecore: {
        context: {},
        route: null,
      },
    },
    locale: 'en',
  } as Page;

  const mockFields = {
    Image: {
      value: {
        src: '/images/alaris-type-3-ambulance.jpg',
        alt: 'Alaris Type III Ambulance Front View',
      },
    },
    ImageCaption: {
      value: 'Type III Ambulance - Extended Storage Configuration',
    },
    TargetUrl: {
      value: {
        href: '/vehicles/ambulances/type-3/details',
      },
    },
  };

  it('renders image with caption and link', () => {
    render(<Image params={{ styles: '', RenderingIdentifier: 'img-1' }} fields={mockFields} page={mockPage} />);

    expect(screen.getByTestId('sxa-image')).toHaveAttribute(
      'src',
      '/images/alaris-type-3-ambulance.jpg'
    );
    expect(screen.getByTestId('image-caption')).toHaveTextContent(
      'Type III Ambulance - Extended Storage Configuration'
    );
    expect(screen.getByTestId('image-link')).toHaveAttribute(
      'href',
      '/vehicles/ambulances/type-3/details'
    );
  });

  it('renders image without link when not provided', () => {
    const fieldsWithoutLink = {
      ...mockFields,
      TargetUrl: { value: { href: '' } },
    };

    render(
      <Image params={{ styles: '', RenderingIdentifier: 'img-2' }} fields={fieldsWithoutLink} page={mockPage} />
    );

    expect(screen.getByTestId('sxa-image')).toBeInTheDocument();
    expect(screen.queryByTestId('image-link')).not.toBeInTheDocument();
  });

  it('renders Banner variant with background image', () => {
    const { container } = render(
      <Banner
        params={{ styles: 'hero-section', RenderingIdentifier: 'banner-1' }}
        fields={mockFields}
        page={mockPage}
      />
    );

    const bannerDiv = container.querySelector('.hero-banner');
    expect(bannerDiv).toBeInTheDocument();
    expect(bannerDiv).toHaveClass('hero-section');
  });
});
