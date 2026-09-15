import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import {
  Default as NewsListing,
  EventCards,
  NewsCards,
  PressReleaseList,
} from '@/components/uiim/news/NewsListing';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div>{componentName} requires a datasource item assigned.</div>
  ),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span' }: { field?: { value?: string }; tag?: string }) => (
    <Tag>{field?.value}</Tag>
  ),
  useSitecore: () => ({ page: { mode: { isEditing: false } } }),
}));

describe('NewsListing', () => {
  it('renders featured blog items from datasource treelist', () => {
    render(
      <NewsListing
        params={{}}
        fields={{
          data: {
            datasource: {
              eyebrow: { jsonValue: { value: 'Company News' } },
              title: { jsonValue: { value: 'Latest from Amkor' } },
              items: {
                targetItems: [
                  {
                    id: '09f401a4-fae0-42ce-b69a-a616d507e187',
                    name: 'Arizona Korea Semiconductor Delegation',
                    url: { path: '/About-Us/News/Blog/Arizona-Korea-Semiconductor-Delegation' },
                    pageTitle: { jsonValue: { value: 'Amkor Joins Arizona Economic Delegation' } },
                    pageSubtitle: { jsonValue: { value: 'August 13, 2026' } },
                    parent: { name: 'Blog' },
                  },
                ],
              },
            },
          },
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Latest from Amkor' })).toBeInTheDocument();
    expect(screen.getByText('Company News')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Amkor Joins Arizona Economic Delegation/i })
    ).toHaveAttribute('href', '/About-Us/News/Blog/Arizona-Korea-Semiconductor-Delegation');
    expect(screen.getByText(/Blog August 13, 2026/i)).toBeInTheDocument();
  });

  it('shows fallback when datasource is missing', () => {
    render(<NewsListing params={{}} fields={{ data: { datasource: null } }} />);
    expect(screen.getByText(/NewsListing requires a datasource/i)).toBeInTheDocument();
  });
});

const cardDatasource = {
  title: { jsonValue: { value: 'Latest Blog Posts' } },
  ctaLink: { jsonValue: { value: { href: '/blog', text: 'View All Posts' } } },
  items: {
    targetItems: [
      {
        id: '09f401a4-fae0-42ce-b69a-a616d507e187',
        name: 'Arizona Korea Semiconductor Delegation',
        url: { path: '/About-Us/News/Blog/Arizona-Korea-Semiconductor-Delegation' },
        pageTitle: { jsonValue: { value: 'Amkor Joins Arizona Economic Delegation' } },
        pageSubtitle: { jsonValue: { value: 'August 13, 2026' } },
        image: {
          value: '<image src="https://example.com/tile.jpg" alt="Delegation in Korea" />',
        },
        parent: { name: 'Blog' },
      },
    ],
  },
};

describe('NewsListing card variants', () => {
  it('renders NewsCards with the item image, date and news accent', () => {
    const { container } = render(
      <NewsCards params={{}} fields={{ data: { datasource: cardDatasource } }} />
    );

    expect(screen.getByRole('heading', { name: 'Latest Blog Posts' })).toBeInTheDocument();
    expect(screen.getByAltText('Delegation in Korea')).toHaveAttribute(
      'src',
      'https://example.com/tile.jpg'
    );
    expect(screen.getByText('August 13, 2026')).toBeInTheDocument();
    expect(container.querySelector('[data-news-accent="news"]')).toBeInTheDocument();
  });

  it('renders the CTA button from the datasource link', () => {
    render(<NewsCards params={{}} fields={{ data: { datasource: cardDatasource } }} />);

    expect(screen.getByRole('link', { name: 'View All Posts' })).toHaveAttribute('href', '/blog');
  });

  it('prefers CtaText over the link text', () => {
    render(
      <NewsCards
        params={{}}
        fields={{
          data: {
            datasource: { ...cardDatasource, ctaText: { jsonValue: { value: 'See every post' } } },
          },
        }}
      />
    );

    expect(screen.getByRole('link', { name: 'See every post' })).toBeInTheDocument();
  });

  it('renders EventCards with the events accent', () => {
    const { container } = render(
      <EventCards params={{}} fields={{ data: { datasource: cardDatasource } }} />
    );

    expect(container.querySelector('[data-news-accent="events"]')).toBeInTheDocument();
    expect(container.querySelector('[data-variant="EventCards"]')).toBeInTheDocument();
  });

  it('shows the category on blog cards but not on event cards', () => {
    const { unmount } = render(
      <NewsCards params={{}} fields={{ data: { datasource: cardDatasource } }} />
    );
    expect(screen.getByText('Blog')).toBeInTheDocument();
    unmount();

    render(<EventCards params={{}} fields={{ data: { datasource: cardDatasource } }} />);
    expect(screen.queryByText('Blog')).not.toBeInTheDocument();
    expect(screen.getByText('August 13, 2026')).toBeInTheDocument();
  });

  it('renders PressReleaseList as linked rows without card images', () => {
    const { container } = render(
      <PressReleaseList params={{}} fields={{ data: { datasource: cardDatasource } }} />
    );

    expect(
      screen.getByRole('link', { name: 'Amkor Joins Arizona Economic Delegation' })
    ).toHaveAttribute('href', '/About-Us/News/Blog/Arizona-Korea-Semiconductor-Delegation');
    expect(screen.queryByAltText('Delegation in Korea')).not.toBeInTheDocument();
    expect(container.querySelector('[data-news-accent]')).not.toBeInTheDocument();
  });

  it('shows the fallback for every variant when the datasource is missing', () => {
    for (const Variant of [NewsCards, EventCards, PressReleaseList]) {
      const { unmount } = render(<Variant params={{}} fields={{ data: { datasource: null } }} />);
      expect(screen.getByText(/NewsListing requires a datasource/i)).toBeInTheDocument();
      unmount();
    }
  });
});
