import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { Default, RelatedDownloads } from '@/components/download-list/DownloadList';
import type { DownloadListProps } from '@/components/download-list/download-list.props';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('lucide-react', () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const link = (href: string, text: string): LinkField =>
  ({
    value: { href, text, linktype: 'external' },
  }) as LinkField;

const mockPage = { mode: { isEditing: false, isDesignLibrary: false } } as DownloadListProps['page'];

const relatedProps: DownloadListProps = {
  rendering: { componentName: 'DownloadList' } as DownloadListProps['rendering'],
  params: {},
  page: mockPage,
  fields: {
    Title: { value: 'View related downloads' },
    featuredContent: {
      results: [
        { field: { link: link('https://amkor.com/sip.pdf', 'System in Package (SiP) Data Sheet') } },
        { field: { link: link('https://amkor.com/scsp.pdf', 'Stacked CSP (SCSP) Data Sheet (DS573)') } },
      ],
    },
  },
};

describe('DownloadList RelatedDownloads', () => {
  it('renders the accordion trigger and download links', () => {
    render(<RelatedDownloads {...relatedProps} />);

    expect(screen.getByText('View related downloads')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'System in Package (SiP) Data Sheet' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Stacked CSP (SCSP) Data Sheet (DS573)' })).toBeInTheDocument();
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  it('collapses the list when the trigger is clicked', () => {
    render(<RelatedDownloads {...relatedProps} />);

    const trigger = screen.getByRole('button', { name: /view related downloads/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not change Default card layout', () => {
    render(<Default {...relatedProps} />);

    expect(screen.getAllByRole('link', { name: 'Download' }).length).toBeGreaterThan(0);
    expect(screen.getByText('System in Package (SiP) Data Sheet')).toBeInTheDocument();
  });

  it('centers the download rows by default', () => {
    const { container } = render(<RelatedDownloads {...relatedProps} />);
    const section = container.querySelector('[data-variant="RelatedDownloads"]');
    expect(section).toHaveAttribute('data-list-align', 'center');
    expect(container.querySelector('ul')).toHaveClass('mx-auto');
  });

  it('honors SXA Content alignment position-left / position-right', () => {
    const { container: left } = render(
      <RelatedDownloads {...relatedProps} params={{ styles: 'position-left' }} />
    );
    expect(left.querySelector('[data-variant="RelatedDownloads"]')).toHaveAttribute(
      'data-list-align',
      'left'
    );

    const { container: right } = render(
      <RelatedDownloads {...relatedProps} params={{ Styles: 'position-right' }} />
    );
    expect(right.querySelector('[data-variant="RelatedDownloads"]')).toHaveAttribute(
      'data-list-align',
      'right'
    );
  });
});
