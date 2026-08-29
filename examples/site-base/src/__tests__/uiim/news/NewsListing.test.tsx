import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Default as NewsListing } from '@/components/uiim/news/NewsListing';

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
