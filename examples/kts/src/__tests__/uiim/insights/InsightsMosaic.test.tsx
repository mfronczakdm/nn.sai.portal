/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as InsightsMosaic, LatestInsights } from '@/components/uiim/insights/InsightsMosaic';
import { mockPage, mockPageEditing } from '../../test-utils/mockPage';

const mockUseSitecore = jest.fn();

jest.mock('lucide-react', () => ({
  FileText: () => <svg data-testid="file-text-icon" />,
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span', className }: any) => (
    <Tag className={className}>{field?.value || ''}</Tag>
  ),
  Link: ({ field, children, className }: any) => (
    <a href={field?.value?.href || ''} className={className}>
      {children || field?.value?.text || field?.value?.href || ''}
    </a>
  ),
  NextImage: ({ field, className }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-testid="next-image"
      src={field?.value?.src || ''}
      alt={field?.value?.alt || ''}
      className={className}
    />
  ),
  Image: ({ field, className }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-testid="sitecore-image"
      src={field?.value?.src || undefined}
      alt={field?.value?.alt || ''}
      className={className}
    />
  ),
  useSitecore: () => mockUseSitecore(),
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div data-testid="no-data-fallback">{componentName}</div>
  ),
}));

const tile = (overrides: Record<string, unknown> = {}) => ({
  id: 'tile-1',
  tileTitle: { jsonValue: { value: 'AI Governance for Boards' } },
  tileImage: {
    jsonValue: {
      value: { src: '/media/ai.jpg', alt: 'AI visualization' },
    },
  },
  tileLink: { jsonValue: { value: { href: '/insights/ai-governance', text: 'AI Governance' } } },
  tileTag: { jsonValue: { value: 'ARTICLE' } },
  tileNumber: { jsonValue: { value: '02' } },
  accentColor: { jsonValue: { value: 'navy' } },
  imagePlacement: { jsonValue: { value: 'left' } },
  tileSpan: { jsonValue: { value: 'wide' } },
  ...overrides,
});

const fields = {
  data: {
    datasource: {
      sectionTitle: { jsonValue: { value: 'Latest Insights' } },
      viewAllLink: {
        jsonValue: { value: { href: '/Media-and-Insight/Insights', text: 'View All Insights' } },
      },
      children: { results: [tile()] },
    },
  },
};

describe('InsightsMosaic', () => {
  beforeEach(() => {
    mockUseSitecore.mockReturnValue({ page: mockPage });
  });

  it('falls back when datasource is missing', () => {
    render(<InsightsMosaic params={{}} fields={{ data: {} }} />);
    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent('InsightsMosaic');
  });

  it('renders the section title, tile, and view-all link', () => {
    render(<InsightsMosaic params={{}} fields={fields} />);
    expect(screen.getByRole('heading', { name: 'Latest Insights' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI Governance for Boards' })).toBeInTheDocument();
    expect(screen.getByText('ARTICLE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AI Governance for Boards/i })).toHaveAttribute(
      'href',
      '/insights/ai-governance'
    );
    expect(screen.getByRole('link', { name: 'View All Insights' })).toHaveAttribute(
      'href',
      '/Media-and-Insight/Insights'
    );
  });

  it('uses NextImage on the live site and Sitecore Image in editing', () => {
    const { rerender } = render(<InsightsMosaic params={{}} fields={fields} />);
    expect(screen.getByTestId('next-image')).toHaveAttribute('src', '/media/ai.jpg');
    expect(screen.queryByTestId('sitecore-image')).not.toBeInTheDocument();

    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    rerender(<InsightsMosaic params={{}} fields={fields} />);
    const editorImage = screen.getByTestId('sitecore-image');
    expect(editorImage).toHaveAttribute('src', '/media/ai.jpg');
    expect(editorImage.className).toMatch(/pointer-events-auto/);
    expect(editorImage.closest('article')).toHaveAttribute('data-item-id', 'tile-1');
  });

  it('still renders Sitecore Image when tile src is empty in editing', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    const emptyImageFields = {
      data: {
        datasource: {
          ...fields.data.datasource,
          children: {
            results: [
              tile({
                tileImage: { jsonValue: { value: {} } },
              }),
            ],
          },
        },
      },
    };

    render(<InsightsMosaic params={{}} fields={emptyImageFields} />);
    expect(screen.getByTestId('sitecore-image')).toBeInTheDocument();
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });

  it('does not wrap tiles in links while editing', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    render(<InsightsMosaic params={{}} fields={fields} />);

    expect(screen.queryByRole('link', { name: /AI Governance for Boards/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('sitecore-image').closest('a')).toBeNull();
    expect(screen.getByRole('link', { name: 'View All Insights' })).toBeInTheDocument();
  });

  it('exposes LatestInsights as an alias of Default', () => {
    render(<LatestInsights params={{}} fields={fields} />);
    expect(screen.getByRole('heading', { name: 'Latest Insights' })).toBeInTheDocument();
  });
});
