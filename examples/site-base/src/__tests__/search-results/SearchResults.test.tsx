import React from 'react';
import { render, screen } from '@testing-library/react';

import { SearchResults } from '@/components/search-results/SearchResults';

jest.mock('lucide-react', () => {
  const Icon = () => null;
  return new Proxy(
    {},
    {
      get: () => Icon,
    }
  );
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => '/quanex/en/Search-Results',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ site: 'quanex', locale: 'en' }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => ({
    page: {
      siteName: 'quanex',
      mode: { isEditing: false, isDesignLibrary: false },
    },
  }),
}));

describe('SearchResults site packs', () => {
  it('shows Quanex product results, not Pillsbury lawyers', () => {
    render(<SearchResults siteName="quanex" disableUrlSync initialQuery="super spacer" />);

    expect(screen.getByText('Quanex search')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Super Spacer' })).toBeInTheDocument();
    expect(screen.queryByText(/Pillsbury search/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Mark Abate/i })).not.toBeInTheDocument();
  });

  it('shows Amkor packaging results, not Quanex products', () => {
    render(<SearchResults siteName="amkor" disableUrlSync initialQuery="S-Connect" />);

    expect(screen.getByText('Amkor search')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'S-Connect' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Super Spacer' })).not.toBeInTheDocument();
  });

  it('shows Amkor career results for talent queries', () => {
    render(<SearchResults siteName="amkor" disableUrlSync initialQuery="engineering careers Arizona" />);

    expect(screen.getByText('Amkor search')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Careers' })).toBeInTheDocument();
  });

  it('keeps Pillsbury lawyer results on pillsburylaw', () => {
    render(<SearchResults siteName="pillsburylaw" disableUrlSync initialQuery="Mark Abate" />);

    expect(screen.getByText('Pillsbury search')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Mark Abate/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Super Spacer' })
    ).not.toBeInTheDocument();
  });

  it('Atlanta directory variant shows exhibitor cards and a register CTA', () => {
    render(
      <SearchResults
        siteName="atlanta-apparel"
        layout="directory"
        disableUrlSync
        initialQuery="september"
      />
    );

    expect(screen.getByText('Anna Ober & Co., LLC')).toBeInTheDocument();
    expect(screen.getAllByText(/Register for market/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Events & Seminars/i).length).toBeGreaterThan(0);
    const productImages = screen.getAllByRole('img');
    expect(productImages.length).toBeGreaterThan(0);
    expect(productImages[0]).toHaveAttribute('src', expect.stringMatching(/^https:\/\/images\.unsplash\.com\//));
    expect(screen.queryByRole('heading', { name: 'Super Spacer' })).not.toBeInTheDocument();
  });
});
