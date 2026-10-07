/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  CompactRows,
  Default as DocumentCards,
  Spotlight,
  formatSitecoreDate,
} from '@/components/uiim/cards/DocumentCards';
import { mockPage, mockPageEditing } from '../../test-utils/mockPage';

const mockUseSitecore = jest.fn();

jest.mock('lucide-react', () => ({
  Download: () => <svg data-testid="download-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

jest.mock('@/components/content-sdk/TrackedCtaLink', () => ({
  TrackedCtaLink: ({ field, children, className }: any) => (
    <a href={field?.value?.href || ''} className={className}>
      {children || field?.value?.text || field?.value?.href || ''}
    </a>
  ),
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

const pdfHref = 'https://example.com/docs/venture.pdf';

const card = (overrides: Record<string, unknown> = {}) => ({
  id: 'card-1',
  cardTitle: { jsonValue: { value: 'Venture Financing Trends' } },
  cardSummary: { jsonValue: { value: 'Term-sheet trends for emerging companies.' } },
  previewImage: {
    jsonValue: {
      value: { src: '/media/preview.jpg', alt: 'Venture preview' },
    },
  },
  documentLink: { jsonValue: { value: { href: pdfHref, text: 'Venture Financing Trends' } } },
  fileType: { jsonValue: { value: 'PDF' } },
  fileSize: { jsonValue: { value: '1.8 MB' } },
  publishedDate: { jsonValue: { value: '20260312T000000Z' } },
  practiceArea: { jsonValue: { value: 'Venture Capital' } },
  downloadLabel: { jsonValue: { value: 'Download PDF' } },
  ...overrides,
});

const fields = {
  data: {
    datasource: {
      sectionTitle: { jsonValue: { value: 'Insights library' } },
      sectionIntro: { jsonValue: { value: 'Preview and download client alerts.' } },
      children: {
        results: [
          card(),
          card({
            id: 'card-2',
            cardTitle: { jsonValue: { value: 'AI Governance for Boards' } },
            practiceArea: { jsonValue: { value: 'Artificial Intelligence' } },
          }),
        ],
      },
    },
  },
};

describe('DocumentCards', () => {
  beforeEach(() => {
    mockUseSitecore.mockReturnValue({ page: mockPage });
  });

  it('formats Sitecore compact dates', () => {
    expect(formatSitecoreDate('20260312T000000Z')).toBe('Mar 12, 2026');
  });

  it('falls back only when fields are missing', () => {
    render(<DocumentCards params={{}} fields={undefined} />);
    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent('DocumentCards');
  });

  it('renders the shell when fields exist even if datasource is empty', () => {
    render(<DocumentCards params={{}} fields={{ data: {} }} />);
    expect(screen.queryByTestId('no-data-fallback')).not.toBeInTheDocument();
    expect(screen.getByText(/Add Document Card items under this datasource/i)).toBeInTheDocument();
  });

  it('renders the default preview grid with metadata and download', () => {
    render(<DocumentCards params={{}} fields={fields} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Insights library' })).toBeInTheDocument();
    expect(screen.getByText('Preview and download client alerts.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Venture Financing Trends' })).toBeInTheDocument();
    expect(screen.getAllByText('Term-sheet trends for emerging companies.').length).toBeGreaterThan(0);
    expect(screen.getByText('Venture Capital')).toBeInTheDocument();
    expect(screen.getAllByText('Mar 12, 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Download PDF').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Download PDF/i })[0]).toHaveAttribute('href', pdfHref);
    expect(screen.getAllByTestId('next-image')[0]).toHaveAttribute('src', '/media/preview.jpg');
    expect(screen.getAllByRole('button', { name: /Preview/i }).length).toBeGreaterThan(0);
  });

  it('renders a PDF frame when no preview image is set', () => {
    const noImageFields = {
      data: {
        datasource: {
          ...fields.data.datasource,
          children: {
            results: [
              card({
                previewImage: { jsonValue: { value: {} } },
              }),
            ],
          },
        },
      },
    };

    render(<DocumentCards params={{}} fields={noImageFields} />);
    expect(screen.getByTitle('Venture Financing Trends')).toHaveAttribute(
      'src',
      `${pdfHref}#toolbar=0&navpanes=0&view=FitH`
    );
  });

  it('renders Spotlight with a featured document and supporting list', () => {
    render(<Spotlight params={{}} fields={fields} />);
    expect(document.querySelector('[data-variant="spotlight"]')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Venture Financing Trends' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'AI Governance for Boards' })).toBeInTheDocument();
  });

  it('renders CompactRows as a dense document list', () => {
    render(<CompactRows params={{}} fields={fields} />);
    expect(document.querySelector('[data-variant="compact-rows"]')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Venture Financing Trends' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'AI Governance for Boards' })).toBeInTheDocument();
    expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
  });

  it('wraps the CompactRows file icon with DocumentLink', () => {
    render(<CompactRows params={{}} fields={fields} />);

    const fileIcons = screen.getAllByTestId('file-text-icon');
    expect(fileIcons.length).toBeGreaterThan(0);
    expect(fileIcons[0].closest('a')).toHaveAttribute('href', pdfHref);
  });

  it('uses compact grid child editors in Default editing mode', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    render(<DocumentCards params={{}} fields={fields} />);

    const editors = screen.getAllByTestId('document-card-child-editor');
    expect(editors).toHaveLength(2);
    expect(editors[0]).toHaveAttribute('data-editor-layout', 'grid');
    expect(screen.getAllByTestId('sitecore-image')).toHaveLength(2);
    expect(screen.getAllByText('Document link')).toHaveLength(2);
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Preview/i })).not.toBeInTheDocument();
  });

  it('uses variant-specific compact editors for Spotlight and CompactRows in editing', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });

    render(<Spotlight params={{}} fields={fields} />);
    expect(document.querySelector('[data-variant="spotlight"]')).toBeInTheDocument();
    const spotlightEditors = screen.getAllByTestId('document-card-child-editor');
    expect(spotlightEditors).toHaveLength(2);
    expect(spotlightEditors[0]).toHaveAttribute('data-editor-layout', 'featured');
    expect(spotlightEditors[1]).toHaveAttribute('data-editor-layout', 'row');
    expect(screen.getByRole('heading', { level: 4, name: 'AI Governance for Boards' })).toBeInTheDocument();

    render(<CompactRows params={{}} fields={fields} />);
    expect(document.querySelector('[data-variant="compact-rows"]')).toBeInTheDocument();
    const compactRoot = document.querySelector('[data-variant="compact-rows"]') as HTMLElement;
    const rowEditors = compactRoot.querySelectorAll('[data-testid="document-card-child-editor"]');
    expect(rowEditors.length).toBeGreaterThanOrEqual(2);
    expect(rowEditors[0]).toHaveAttribute('data-editor-layout', 'row-dense');
    expect(compactRoot.querySelector('[data-testid="file-text-icon"]')).toBeNull();
  });

  it('renders Sitecore Image in editing even when preview src is empty', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    const emptyImageFields = {
      data: {
        datasource: {
          ...fields.data.datasource,
          children: {
            results: [
              card({
                previewImage: { jsonValue: { value: {} } },
              }),
            ],
          },
        },
      },
    };

    render(<DocumentCards params={{}} fields={emptyImageFields} />);
    expect(screen.getAllByTestId('sitecore-image').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Venture Financing Trends')).not.toBeInTheDocument();
  });

  it('renders DocumentLink chrome in editing when href is empty', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    const emptyLinkFields = {
      data: {
        datasource: {
          ...fields.data.datasource,
          children: {
            results: [
              card({
                documentLink: { jsonValue: { value: { href: '' } } },
              }),
            ],
          },
        },
      },
    };

    render(<DocumentCards params={{}} fields={emptyLinkFields} />);
    const childEditor = screen.getByTestId('document-card-child-editor');
    const documentLink = childEditor.querySelector('a');
    expect(documentLink).toBeInTheDocument();
    expect(documentLink).toHaveAttribute('href', '');
    expect(documentLink?.closest('button')).toBeNull();
  });

  it('keeps NextImage on the live site when preview src exists', () => {
    render(<Spotlight params={{}} fields={fields} />);
    expect(screen.getAllByTestId('next-image')[0]).toHaveAttribute('src', '/media/preview.jpg');
    expect(screen.queryByTestId('sitecore-image')).not.toBeInTheDocument();
  });
});
