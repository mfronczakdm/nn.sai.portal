import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Default as HeroCarousel, FocusProduct, SplitPanel } from '../../components/uiim/banners/HeroCarousel';
import type { HeroCarouselProps } from '../../components/uiim/banners/HeroCarousel';

jest.mock('@sitecore-content-sdk/nextjs', () => {
  const mode = { isEditing: false };
  return {
    __esModule: true,
    sitecoreMode: mode,
    useSitecore: () => ({ page: { mode } }),
    Text: ({ field }: { field?: { value?: string } }) => (
      <span data-testid="hero-carousel-text">{field?.value}</span>
    ),
    NextImage: ({
      field,
      className,
    }: {
      field?: { value?: { src?: string; alt?: string } };
      className?: string;
    }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        data-testid="hero-carousel-image"
        data-src={field?.value?.src || ''}
        src={field?.value?.src || ''}
        alt={field?.value?.alt || ''}
        className={className}
      />
    ),
    Link: ({
      field,
      className,
      children,
    }: {
      field?: { value?: { href?: string; text?: string } };
      className?: string;
      children?: React.ReactNode;
    }) => (
      <a data-testid="hero-carousel-link" href={field?.value?.href || '#'} className={className}>
        {children || field?.value?.text}
      </a>
    ),
  };
});

const { sitecoreMode } = jest.requireMock('@sitecore-content-sdk/nextjs') as {
  sitecoreMode: { isEditing: boolean };
};

jest.mock('../../utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div data-testid="no-data-fallback">{componentName} requires a datasource</div>
  ),
}));

jest.mock('../../hooks/use-media-query', () => ({
  useMediaQuery: () => false,
}));

const baseParams = {
  styles: '',
  RenderingIdentifier: 'hero-carousel-test',
};

const mockPage = {} as HeroCarouselProps['page'];
const mockRendering = { componentName: 'HeroCarousel' } as HeroCarouselProps['rendering'];

describe('HeroCarousel', () => {
  beforeEach(() => {
    sitecoreMode.isEditing = false;
  });

  it('renders NoDataFallback when datasource is missing', () => {
    render(
      <HeroCarousel
        fields={{ data: {} }}
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );

    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent(
      'HeroCarousel requires a datasource'
    );
  });

  it('renders NoDataFallback when fields are undefined', () => {
    render(<HeroCarousel params={baseParams} page={mockPage} rendering={mockRendering} />);
    expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
  });

  it('renders intro slide content and contact rail', () => {
    render(
      <HeroCarousel
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
        fields={{
          data: {
            datasource: {
              contactLink: {
                jsonValue: { value: { href: '/contact-us', text: 'CONTACT US' } },
              },
              children: {
                results: [
                  {
                    id: 'slide-1',
                    slideName: { jsonValue: { value: 'Quanex®' } },
                    description: { jsonValue: { value: 'A Part of Something Bigger®' } },
                    summary: {
                      jsonValue: {
                        value: 'EXTRUDED SOLUTIONS | HARDWARE SOLUTIONS | CUSTOM SOLUTIONS',
                      },
                    },
                    isIntroSlide: { jsonValue: { value: '1' } },
                  },
                  {
                    id: 'slide-2',
                    slideName: { jsonValue: { value: 'QUANEX EXTRUDED SOLUTIONS' } },
                    description: {
                      jsonValue: {
                        value: 'Innovative extruded solutions.',
                      },
                    },
                    link: {
                      jsonValue: {
                        value: { href: '/products/extruded', text: 'EXPLORE EXTRUDED SOLUTIONS' },
                      },
                    },
                    image: {
                      jsonValue: {
                        value: {
                          src: 'https://example.com/extruded.jpg',
                          alt: 'Extruded',
                        },
                      },
                    },
                    isIntroSlide: { jsonValue: { value: '' } },
                  },
                ],
              },
            },
          },
        }}
      />
    );

    expect(screen.getByLabelText('Hero carousel')).toBeInTheDocument();
    expect(screen.getByText('Quanex®')).toBeInTheDocument();
    expect(screen.getByText('CONTACT US')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to slide 1')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('Go to slide 2')).toHaveAttribute('aria-selected', 'false');
  });

  it('keeps empty Image chrome mounted in editing mode for non-intro slides', () => {
    sitecoreMode.isEditing = true;

    render(
      <HeroCarousel
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
        fields={{
          data: {
            datasource: {
              contactLink: {
                jsonValue: { value: { href: '/contact-us', text: 'CONTACT US' } },
              },
              children: {
                results: [
                  {
                    id: 'slide-1',
                    slideName: { jsonValue: { value: 'Quanex®' } },
                    isIntroSlide: { jsonValue: { value: '1' } },
                  },
                  {
                    id: 'slide-2',
                    slideName: { jsonValue: { value: 'QUANEX EXTRUDED SOLUTIONS' } },
                    description: { jsonValue: { value: 'Innovative extruded solutions.' } },
                    image: { jsonValue: { value: { src: '', alt: '' } } },
                    isIntroSlide: { jsonValue: { value: '' } },
                  },
                ],
              },
            },
          },
        }}
      />
    );

    fireEvent.click(screen.getByLabelText('Go to slide 2'));
    expect(screen.getByTestId('hero-carousel-image')).toBeInTheDocument();
  });

  it('FocusProduct renders background and product images with horizontal dots', () => {
    render(
      <FocusProduct
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
        fields={{
          data: {
            datasource: {
              children: {
                results: [
                  {
                    id: 'fp-1',
                    slideName: { jsonValue: { value: 'Attraction Handle' } },
                    description: { jsonValue: { value: 'Modern design for casement windows.' } },
                    backgroundImage: {
                      jsonValue: {
                        value: { src: 'https://example.com/bg.jpg', alt: 'Factory' },
                      },
                    },
                    image: {
                      jsonValue: {
                        value: { src: 'https://example.com/product.png', alt: 'Handle' },
                      },
                    },
                    link: {
                      jsonValue: { value: { href: '/products/attraction', text: 'Learn More' } },
                    },
                  },
                ],
              },
            },
          },
        }}
      />
    );

    expect(screen.getByText('Attraction Handle')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
    const images = screen.getAllByTestId('hero-carousel-image');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('data-src', 'https://example.com/bg.jpg');
    expect(images[1]).toHaveAttribute('data-src', 'https://example.com/product.png');
    expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
    expect(screen.queryByText('CONTACT US')).not.toBeInTheDocument();
  });

  it('SplitPanel renders content left and image right by default', () => {
    const { container } = render(
      <SplitPanel
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
        fields={{
          data: {
            datasource: {
              children: {
                results: [
                  {
                    id: 'sp-1',
                    slideName: { jsonValue: { value: 'Open a Trade Account' } },
                    description: {
                      jsonValue: { value: 'Access exclusive trade pricing and support.' },
                    },
                    summary: { jsonValue: { value: 'Spoilt for choice...' } },
                    image: {
                      jsonValue: {
                        value: { src: 'https://example.com/trade.jpg', alt: 'Trade' },
                      },
                    },
                    link: {
                      jsonValue: { value: { href: '/trade-account', text: 'Apply Now' } },
                    },
                    imageOnLeft: { jsonValue: { value: '' } },
                  },
                ],
              },
            },
          },
        }}
      />
    );

    expect(screen.getByText('Open a Trade Account')).toBeInTheDocument();
    expect(screen.getByText('Apply Now')).toBeInTheDocument();
    expect(screen.getByText('Spoilt for choice...')).toBeInTheDocument();
    expect(screen.getByTestId('hero-carousel-image')).toHaveAttribute(
      'data-src',
      'https://example.com/trade.jpg'
    );
    expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
    expect(screen.queryByText('CONTACT US')).not.toBeInTheDocument();
    expect(container.querySelector('.hero-carousel--split-panel')).toBeInTheDocument();
    const grid = container.querySelector('[role="group"] > div');
    expect(grid?.className).toContain('md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]');
  });

  it('SplitPanel places image on left when ImageOnLeft is checked', () => {
    const { container } = render(
      <SplitPanel
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
        fields={{
          data: {
            datasource: {
              children: {
                results: [
                  {
                    id: 'sp-2',
                    slideName: { jsonValue: { value: 'Fab&Fix Collection' } },
                    summary: { jsonValue: { value: 'FROM Fab&Fix' } },
                    image: {
                      jsonValue: {
                        value: { src: 'https://example.com/fabfix.jpg', alt: 'Fab&Fix' },
                      },
                    },
                    link: {
                      jsonValue: { value: { href: '/fabfix', text: 'Shop Now' } },
                    },
                    imageOnLeft: { jsonValue: { value: '1' } },
                  },
                ],
              },
            },
          },
        }}
      />
    );

    expect(screen.getByText('Fab&Fix Collection')).toBeInTheDocument();
    expect(screen.getByText('FROM Fab&Fix')).toBeInTheDocument();
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
    const grid = container.querySelector('[role="group"] > div');
    expect(grid?.className).toContain('md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]');
  });
});
