/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Default as MultiPromoDefault,
  Stacked as MultiPromoStacked,
  SingleColumn as MultiPromoSingleColumn,
  SideTabs as MultiPromoSideTabs,
  TopTabs as MultiPromoTopTabs,
  TopTabsNoImage as MultiPromoTopTabsNoImage,
} from '@/components/site-three/MultiPromo';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ChevronRight: ({ className, ...props }: any) => (
    <span data-testid="chevron-right" className={className} {...props}>
      →
    </span>
  ),
}));

// Mock Sitecore SDK
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, ...props }: any) => <span {...props}>{field?.value || ''}</span>,
  RichText: ({ field, ...props }: any) => (
    <div {...props} dangerouslySetInnerHTML={{ __html: field?.value || '' }} />
  ),
  NextImage: ({ field, className }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={field?.value?.src || ''} alt={field?.value?.alt || ''} className={className} />
  ),
  Image: ({ field, className }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={field?.value?.src || ''} alt={field?.value?.alt || ''} className={className} />
  ),
  Link: ({ field, children, className }: any) => (
    <a href={field?.value?.href || '#'} className={className}>
      {children || field?.value?.text || ''}
    </a>
  ),
  useSitecore: () => ({
    page: {
      mode: {
        isEditing: false,
        isPreview: false,
        isNormal: true,
      },
    },
  }),
}));

jest.mock('shadcd/components/ui/carousel', () => ({
  Carousel: ({ children, ...props }: any) => (
    <div data-testid="multi-promo-carousel" {...props}>
      {children}
    </div>
  ),
  CarouselContent: ({ children, ...props }: any) => (
    <div data-testid="carousel-content" {...props}>
      {children}
    </div>
  ),
  CarouselItem: ({ children, ...props }: any) => (
    <div data-testid="multi-promo-carousel-item" {...props}>
      {children}
    </div>
  ),
  CarouselNext: (props: any) => (
    <button type="button" data-testid="multi-promo-carousel-next" {...props}>
      Next
    </button>
  ),
  CarouselPrevious: (props: any) => (
    <button type="button" data-testid="multi-promo-carousel-prev" {...props}>
      Previous
    </button>
  ),
}));

// Mock NoDataFallback
jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: () => <div data-testid="no-data-fallback">No data available</div>,
}));

describe('MultiPromo', () => {
  const mockProps = {
    params: {
      styles: 'test-styles',
    },
    fields: {
      data: {
        datasource: {
          title: {
            jsonValue: {
              value: 'Featured Products',
            },
          },
          description: {
            jsonValue: {
              value: 'Explore our selection',
            },
          },
          children: {
            results: [
              {
                id: 'promo-1',
                heading: {
                  jsonValue: {
                    value: 'Product 1',
                  },
                },
                description: {
                  jsonValue: {
                    value: 'Description 1',
                  },
                },
                image: {
                  jsonValue: {
                    value: {
                      src: '/images/product1.jpg',
                      alt: 'Product 1',
                    },
                  },
                },
                link: {
                  jsonValue: {
                    value: {
                      href: '/product1',
                      text: 'View Product 1',
                    },
                  },
                },
                slug: {
                  jsonValue: {
                    value: 'Product One',
                  },
                },
                Slug: {
                  jsonValue: {
                    value: 'Product One',
                  },
                },
              },
              {
                id: 'promo-2',
                heading: {
                  jsonValue: {
                    value: 'Product 2',
                  },
                },
                description: {
                  jsonValue: {
                    value: 'Description 2',
                  },
                },
                image: {
                  jsonValue: {
                    value: {
                      src: '/images/product2.jpg',
                      alt: 'Product 2',
                    },
                  },
                },
                link: {
                  jsonValue: {
                    value: {
                      href: '/product2',
                      text: 'View Product 2',
                    },
                  },
                },
                slug: {
                  jsonValue: {
                    value: 'Product Two',
                  },
                },
                Slug: {
                  jsonValue: {
                    value: 'Product Two',
                  },
                },
              },
            ],
          },
        },
      },
    },
  };

  describe('Default variant', () => {
    it('renders multi promo with title', () => {
      render(<MultiPromoDefault {...mockProps} />);
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<MultiPromoDefault {...mockProps} />);
      expect(screen.getByText('Explore our selection')).toBeInTheDocument();
    });

    it('renders all promo items', () => {
      render(<MultiPromoDefault {...mockProps} />);
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('renders promo images', () => {
      render(<MultiPromoDefault {...mockProps} />);
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
    });

    it('renders promo links', () => {
      render(<MultiPromoDefault {...mockProps} />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', '/product1');
      expect(links[1]).toHaveAttribute('href', '/product2');
    });

    it('renders items in a single-row carousel', () => {
      render(<MultiPromoDefault {...mockProps} />);
      expect(screen.getByTestId('multi-promo-carousel')).toBeInTheDocument();
      expect(screen.getAllByTestId('multi-promo-carousel-item')).toHaveLength(2);
      expect(screen.getByTestId('multi-promo-carousel-prev')).toBeInTheDocument();
      expect(screen.getByTestId('multi-promo-carousel-next')).toBeInTheDocument();
    });

    it('applies white hover styles to promo cards', () => {
      render(<MultiPromoDefault {...mockProps} />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveClass('hover:bg-white');
        expect(link).toHaveClass('hover:text-neutral-950');
        expect(link).toHaveClass('group');
      });
    });

    it('applies custom styles from params', () => {
      const { container } = render(<MultiPromoDefault {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('test-styles');
    });

    it('renders without items when children array is empty', () => {
      const emptyProps = {
        params: {},
        fields: {
          data: {
            datasource: {
              children: {
                results: [],
              },
            },
          },
        },
      };
      const { container } = render(<MultiPromoDefault {...emptyProps} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.queryByTestId('multi-promo-carousel')).not.toBeInTheDocument();
    });

    it('renders NoDataFallback when fields are missing', () => {
      const emptyProps = { params: {}, fields: undefined } as any;
      render(<MultiPromoDefault {...emptyProps} />);
      expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    });
  });

  describe('Stacked variant', () => {
    it('renders stacked layout with title and description', () => {
      render(<MultiPromoStacked {...mockProps} />);
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
      expect(screen.getByText('Explore our selection')).toBeInTheDocument();
    });

    it('renders all promo items in stacked format', () => {
      render(<MultiPromoStacked {...mockProps} />);
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('applies stacked-specific styling classes', () => {
      const { container } = render(<MultiPromoStacked {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('overflow-hidden');
      const blurElement = container.querySelector('.blur-\\[400px\\]');
      expect(blurElement).toBeInTheDocument();
    });

    it('renders promo images and links', () => {
      render(<MultiPromoStacked {...mockProps} />);
      const images = screen.getAllByRole('img');
      const links = screen.getAllByRole('link');
      expect(images).toHaveLength(2);
      expect(links).toHaveLength(2);
    });

    it('handles missing fields gracefully', () => {
      const minimalProps = {
        params: { styles: 'stacked-styles' },
        fields: {
          data: {
            datasource: {
              children: {
                results: [
                  {
                    id: 'minimal-promo',
                    heading: { jsonValue: { value: 'Minimal Product' } },
                    description: { jsonValue: { value: 'Minimal Description' } },
                    image: { jsonValue: { value: { src: '/minimal.jpg', alt: 'Minimal' } } },
                    link: { jsonValue: { value: { href: '/minimal', text: 'View Minimal' } } },
                  },
                ],
              },
            },
          },
        },
      };
      render(<MultiPromoStacked {...minimalProps} />);
      expect(screen.getByText('Minimal Product')).toBeInTheDocument();
    });

    it('renders NoDataFallback when fields are missing', () => {
      const emptyProps = { params: {}, fields: undefined } as any;
      render(<MultiPromoStacked {...emptyProps} />);
      expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    });
  });

  describe('SingleColumn variant', () => {
    it('renders single column layout with title and description', () => {
      render(<MultiPromoSingleColumn {...mockProps} />);
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
      expect(screen.getByText('Explore our selection')).toBeInTheDocument();
    });

    it('renders all promo items in single column format', () => {
      render(<MultiPromoSingleColumn {...mockProps} />);
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('renders promo images and links in horizontal layout', () => {
      render(<MultiPromoSingleColumn {...mockProps} />);
      const images = screen.getAllByRole('img');
      const links = screen.getAllByRole('link');
      expect(images).toHaveLength(2);
      expect(links).toHaveLength(2);
    });

    it('applies single column specific styling', () => {
      const { container } = render(<MultiPromoSingleColumn {...mockProps} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Check for grid layout classes that indicate single column layout
      const gridContainer = container.querySelector('.grid.gap-14');
      expect(gridContainer).toBeInTheDocument();
    });

    it('handles empty children array', () => {
      const emptyChildrenProps = {
        params: { styles: 'single-column-styles' },
        fields: {
          data: {
            datasource: {
              title: { jsonValue: { value: 'Empty Title' } },
              description: { jsonValue: { value: 'Empty Description' } },
              children: {
                results: [],
              },
            },
          },
        },
      };
      render(<MultiPromoSingleColumn {...emptyChildrenProps} />);
      expect(screen.getByText('Empty Title')).toBeInTheDocument();
      expect(screen.getByText('Empty Description')).toBeInTheDocument();
    });

    it('renders NoDataFallback when fields are missing', () => {
      const emptyProps = { params: {}, fields: undefined } as any;
      render(<MultiPromoSingleColumn {...emptyProps} />);
      expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    });
  });

  describe('SideTabs variant', () => {
    it('renders slug labels in tab buttons', () => {
      render(<MultiPromoSideTabs {...mockProps} />);
      expect(screen.getByRole('tab', { name: 'Product One' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Product Two' })).toBeInTheDocument();
    });

    it('shows the first promo content by default', () => {
      render(<MultiPromoSideTabs {...mockProps} />);
      expect(screen.getByRole('heading', { level: 3, name: 'Product 1' })).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Product 1' })).toBeInTheDocument();
    });

    it('switches promo content when a tab is clicked', () => {
      render(<MultiPromoSideTabs {...mockProps} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Product Two' }));

      expect(screen.getByRole('heading', { level: 3, name: 'Product 2' })).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Product 2' })).toBeInTheDocument();
    });

    it('renders only the active promo image visibly', () => {
      const { container } = render(<MultiPromoSideTabs {...mockProps} />);
      const activePanel = container.querySelector('[data-promo-panel][data-active="true"]');
      expect(activePanel?.querySelector('img')).toHaveAttribute('src', '/images/product1.jpg');

      fireEvent.click(screen.getByRole('tab', { name: 'Product Two' }));
      const nextActivePanel = container.querySelector('[data-promo-panel][data-active="true"]');
      expect(nextActivePanel?.querySelector('img')).toHaveAttribute('src', '/images/product2.jpg');
    });

    it('keeps all promo panels mounted for Sitecore editing', () => {
      const { container } = render(<MultiPromoSideTabs {...mockProps} />);
      expect(container.querySelectorAll('[data-promo-panel]')).toHaveLength(2);
    });

    it('applies side tabs layout class', () => {
      const { container } = render(<MultiPromoSideTabs {...mockProps} />);
      expect(container.querySelector('.multi-promo-side-tabs')).toBeInTheDocument();
    });

    it('renders NoDataFallback when fields are missing', () => {
      const emptyProps = { params: {}, fields: undefined } as any;
      render(<MultiPromoSideTabs {...emptyProps} />);
      expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    });

    it('does not use heading text for tab labels when slug is missing', () => {
      const propsWithoutSlug = {
        ...mockProps,
        fields: {
          data: {
            datasource: {
              children: {
                results: [
                  {
                    id: 'promo-no-slug',
                    heading: {
                      jsonValue: {
                        value: 'Long Promo Heading Title',
                      },
                    },
                    description: {
                      jsonValue: {
                        value: 'Description text',
                      },
                    },
                    image: {
                      jsonValue: {
                        value: {
                          src: '/images/product1.jpg',
                          alt: 'Product 1',
                        },
                      },
                    },
                    link: {
                      jsonValue: {
                        value: {
                          href: '/product1',
                          text: 'Learn More',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      };

      render(<MultiPromoSideTabs {...propsWithoutSlug} />);
      expect(screen.getByRole('tab', { name: 'Promotion 1' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Long Promo Heading Title' })).not.toBeInTheDocument();
    });
  });

  describe('TopTabs variant', () => {
    it('renders slug labels in tab buttons', () => {
      render(<MultiPromoTopTabs {...mockProps} />);
      expect(screen.getByRole('tab', { name: 'Product One' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Product Two' })).toBeInTheDocument();
    });

    it('shows the first promo content by default', () => {
      render(<MultiPromoTopTabs {...mockProps} />);
      expect(screen.getByRole('heading', { level: 3, name: 'Product 1' })).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Product 1' })).toBeInTheDocument();
    });

    it('switches promo content when a tab is clicked', () => {
      render(<MultiPromoTopTabs {...mockProps} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Product Two' }));

      expect(screen.getByRole('heading', { level: 3, name: 'Product 2' })).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Product 2' })).toBeInTheDocument();
    });

    it('renders only the active promo image visibly', () => {
      const { container } = render(<MultiPromoTopTabs {...mockProps} />);
      const activePanel = container.querySelector('[data-promo-panel][data-active="true"]');
      expect(activePanel?.querySelector('img')).toHaveAttribute('src', '/images/product1.jpg');

      fireEvent.click(screen.getByRole('tab', { name: 'Product Two' }));
      const nextActivePanel = container.querySelector('[data-promo-panel][data-active="true"]');
      expect(nextActivePanel?.querySelector('img')).toHaveAttribute('src', '/images/product2.jpg');
    });

    it('keeps all promo panels mounted for Sitecore editing', () => {
      const { container } = render(<MultiPromoTopTabs {...mockProps} />);
      expect(container.querySelectorAll('[data-promo-panel]')).toHaveLength(2);
    });

    it('applies top tabs layout class', () => {
      const { container } = render(<MultiPromoTopTabs {...mockProps} />);
      expect(container.querySelector('.multi-promo-top-tabs')).toBeInTheDocument();
    });

    it('renders NoDataFallback when fields are missing', () => {
      const emptyProps = { params: {}, fields: undefined } as any;
      render(<MultiPromoTopTabs {...emptyProps} />);
      expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    });

    it('does not use heading text for tab labels when slug is missing', () => {
      const propsWithoutSlug = {
        ...mockProps,
        fields: {
          data: {
            datasource: {
              children: {
                results: [
                  {
                    id: 'promo-no-slug',
                    heading: {
                      jsonValue: {
                        value: 'Long Promo Heading Title',
                      },
                    },
                    description: {
                      jsonValue: {
                        value: 'Description text',
                      },
                    },
                    image: {
                      jsonValue: {
                        value: {
                          src: '/images/product1.jpg',
                          alt: 'Product 1',
                        },
                      },
                    },
                    link: {
                      jsonValue: {
                        value: {
                          href: '/product1',
                          text: 'Learn More',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      };

      render(<MultiPromoTopTabs {...propsWithoutSlug} />);
      expect(screen.getByRole('tab', { name: 'Promotion 1' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Long Promo Heading Title' })).not.toBeInTheDocument();
    });
  });

  describe('TopTabsNoImage variant', () => {
    it('renders slug labels in tab buttons', () => {
      render(<MultiPromoTopTabsNoImage {...mockProps} />);
      expect(screen.getByRole('tab', { name: 'Product One' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Product Two' })).toBeInTheDocument();
    });

    it('shows the first promo content by default without images', () => {
      render(<MultiPromoTopTabsNoImage {...mockProps} />);
      expect(screen.getByRole('heading', { level: 3, name: 'Product 1' })).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Product 1' })).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('switches promo content when a tab is clicked', () => {
      render(<MultiPromoTopTabsNoImage {...mockProps} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Product Two' }));

      expect(screen.getByRole('heading', { level: 3, name: 'Product 2' })).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Product 2' })).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('applies top tabs no image layout class', () => {
      const { container } = render(<MultiPromoTopTabsNoImage {...mockProps} />);
      expect(container.querySelector('.multi-promo-top-tabs-no-image')).toBeInTheDocument();
    });

    it('renders NoDataFallback when fields are missing', () => {
      const emptyProps = { params: {}, fields: undefined } as any;
      render(<MultiPromoTopTabsNoImage {...emptyProps} />);
      expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    });
  });
});
