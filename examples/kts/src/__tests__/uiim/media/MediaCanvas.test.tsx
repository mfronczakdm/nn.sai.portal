/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as MediaCanvas, uniqueCollageSlot } from '@/components/uiim/media/MediaCanvas';
import { mockPage, mockPageEditing } from '../../test-utils/mockPage';

const mockUseSitecore = jest.fn();

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span', className }: any) => (
    <Tag className={className}>{field?.value || ''}</Tag>
  ),
  Link: ({ field, className }: any) => (
    <a href={field?.value?.href || ''} className={className}>
      {field?.value?.text || field?.value?.href || ''}
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

const tile = {
  id: 'tile-1',
  image: {
    jsonValue: {
      value: { src: '/media/tile.jpg', alt: 'Office collage' },
    },
  },
  video: { jsonValue: { value: { href: '' } } },
  tagline: { jsonValue: { value: 'Boston' } },
};

const fields = {
  data: {
    datasource: {
      title: { jsonValue: { value: 'Cooley' } },
      subtitle: { jsonValue: { value: 'Law' } },
      cta: { jsonValue: { value: { href: '/about', text: 'About' } } },
      pauseVideoLabel: { jsonValue: { value: 'Pause video' } },
      playVideoLabel: { jsonValue: { value: 'Play video' } },
      children: { results: [tile] },
    },
  },
};

describe('MediaCanvas', () => {
  beforeEach(() => {
    mockUseSitecore.mockReturnValue({ page: mockPage });
  });

  it('falls back when datasource is missing', () => {
    render(<MediaCanvas params={{}} fields={{ data: {} }} />);
    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent('MediaCanvas');
  });

  it('renders collage NextImage on the live site', () => {
    render(<MediaCanvas params={{}} fields={fields} />);
    const liveImages = screen.getAllByTestId('next-image');
    expect(liveImages.length).toBeGreaterThan(0);
    expect(liveImages[0]).toHaveAttribute('src', '/media/tile.jpg');
    expect(screen.queryByTestId('sitecore-image')).not.toBeInTheDocument();
    expect(screen.getAllByText('Boston').length).toBeGreaterThan(0);
  });

  it('renders the live collage layout in Pages with Sitecore Image chrome', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    render(<MediaCanvas params={{}} fields={fields} isPageEditing />);

    const editorImages = screen.getAllByTestId('sitecore-image');
    expect(editorImages.length).toBeGreaterThan(0);
    expect(editorImages[0]).toHaveAttribute('src', '/media/tile.jpg');
    expect(editorImages[0]).toHaveAttribute('alt', 'Office collage');
    expect(editorImages[0].className).toMatch(/pointer-events-auto/);
    expect(editorImages[0].closest('article')).toHaveAttribute('data-item-id', 'tile-1');
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    expect(screen.queryByText('Tagline')).not.toBeInTheDocument();
    expect(screen.getAllByText('Boston').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 1, name: 'Cooley' })).toBeInTheDocument();
  });

  it('still renders Sitecore Image when child image src is empty in editing', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    const emptyImageFields = {
      data: {
        datasource: {
          ...fields.data.datasource,
          children: {
            results: [
              {
                ...tile,
                image: { jsonValue: { value: {} } },
              },
            ],
          },
        },
      },
    };

    render(<MediaCanvas params={{}} fields={emptyImageFields} isPageEditing />);
    expect(screen.getAllByTestId('sitecore-image').length).toBeGreaterThan(0);
  });

  it('shows poster image instead of video in Pages so image chrome is selectable', () => {
    mockUseSitecore.mockReturnValue({ page: mockPageEditing });
    const videoTileFields = {
      data: {
        datasource: {
          ...fields.data.datasource,
          children: {
            results: [
              {
                ...tile,
                video: { jsonValue: { value: { href: 'https://example.com/loop.mp4', text: 'Sample loop' } } },
              },
            ],
          },
        },
      },
    };

    const { container } = render(<MediaCanvas params={{}} fields={videoTileFields} isPageEditing />);
    expect(screen.getAllByTestId('sitecore-image').length).toBeGreaterThan(0);
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('assigns a distinct collage slot for each of the first five tiles', () => {
    const slots = [0, 1, 2, 3, 4].map((index) => uniqueCollageSlot(index));
    const positions = slots.map((slot) => `${slot.top}-${slot.left}`);
    expect(new Set(positions).size).toBe(5);
  });

  it('keeps the first five collage slots from overlapping on a typical desktop canvas', () => {
    // aspect-square tiles: height ≈ width% of canvas width; assume ~1.6 aspect canvas
    const canvasAspect = 1.6;
    const rects = [0, 1, 2, 3, 4].map((index) => {
      const slot = uniqueCollageSlot(index);
      const left = parseFloat(slot.left);
      const top = parseFloat(slot.top);
      const width = parseFloat(slot.width);
      const height = (width / 100) * canvasAspect * 100;
      return { left, top, right: left + width, bottom: top + height };
    });

    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        const overlaps =
          a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        expect(overlaps).toBe(false);
      }
    }
  });

  it('renders five live collage tiles when five children are provided', () => {
    const fiveTiles = {
      data: {
        datasource: {
          ...fields.data.datasource,
          children: {
            results: [1, 2, 3, 4, 5].map((n) => ({
              ...tile,
              id: `tile-${n}`,
              tagline: { jsonValue: { value: `Tile ${n}` } },
            })),
          },
        },
      },
    };

    render(<MediaCanvas params={{}} fields={fiveTiles} />);
    expect(screen.getAllByTestId('next-image')).toHaveLength(10);
  });
});
