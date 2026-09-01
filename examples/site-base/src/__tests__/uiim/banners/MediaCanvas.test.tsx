/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';

import { Default, OvalCollage } from '@/components/uiim/banners/MediaCanvas';
import {
  collageSlotClass,
  planCollageShapes,
  stableShuffle,
} from '@/lib/media-canvas-layout';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => String(s).replace(/(^|\s)\S/g, (t: string) => t.toUpperCase()),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag = 'span' }: any) => {
    const Tag = tag;
    return <Tag>{field?.value || ''}</Tag>;
  },
  NextImage: ({ field }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={field?.value?.src || ''} alt={field?.value?.alt || ''} />
  ),
  Link: ({ field }: any) => <a href={field?.value?.href || '#'}>{field?.value?.text}</a>,
}));

const page = { mode: { isEditing: false } } as any;
const params = { styles: '', RenderingIdentifier: 'media-canvas' };
const rendering = { componentName: 'MediaCanvas' } as any;

function imageItem(id: string, src: string) {
  return {
    id,
    itemImage: { jsonValue: { value: { src, alt: id } } },
  };
}

const fields = {
  data: {
    datasource: {
      canvasTitle: { jsonValue: { value: 'THE WHOLESALE MARKETPLACE' } },
      canvasSubtitle: { jsonValue: { value: 'for gift, decor, lifestyle and apparel industries.' } },
      primaryLink: { jsonValue: { value: { href: '/markets', text: 'ATTEND A MARKET' } } },
      children: {
        results: [
          imageItem('a', '/a.jpg'),
          imageItem('b', '/b.jpg'),
          imageItem('c', '/c.jpg'),
          imageItem('d', '/d.jpg'),
          imageItem('e', '/e.jpg'),
        ],
      },
    },
  },
};

describe('media-canvas.layout', () => {
  it('plans oval and circle shapes from child count', () => {
    expect(planCollageShapes(1)).toEqual(['pill-v']);
    expect(planCollageShapes(5)).toEqual(['pill-h', 'circle-sm', 'circle', 'circle', 'pill-v']);
    expect(planCollageShapes(7)).toHaveLength(7);
  });

  it('shuffles stably by item id', () => {
    const once = stableShuffle([{ id: 'z' }, { id: 'a' }, { id: 'm' }]);
    const twice = stableShuffle([{ id: 'z' }, { id: 'a' }, { id: 'm' }]);
    expect(once.map((item) => item.id)).toEqual(twice.map((item) => item.id));
  });

  it('places the tall pill on the right for five images', () => {
    expect(collageSlotClass(5, 4)).toMatch(/col-start-5/);
  });
});

describe('MediaCanvas', () => {
  it('renders NoDataFallback when datasource is missing', () => {
    render(<Default params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('keeps Default as a rectangular grid, not ovals', () => {
    const { container } = render(
      <Default fields={fields} params={params} page={page} rendering={rendering} />
    );
    expect(screen.getByText('THE WHOLESALE MARKETPLACE')).toBeInTheDocument();
    expect(container.querySelector('[data-media-layout="grid"]')).toBeInTheDocument();
    expect(container.querySelector('[data-media-layout="oval-collage"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-variant="Default"]')).toBeInTheDocument();
  });

  it('renders OvalCollage with circle and pill slots from child count', () => {
    const { container } = render(
      <OvalCollage fields={fields} params={params} page={page} rendering={rendering} />
    );
    expect(container.querySelector('[data-media-layout="oval-collage"]')).toHaveAttribute(
      'data-image-count',
      '5'
    );
    expect(container.querySelectorAll('[data-shape="circle"]').length).toBeGreaterThan(0);
    expect(container.querySelector('[data-shape="pill-v"]')).toBeInTheDocument();
    expect(container.querySelector('[data-shape="pill-h"]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ATTEND A MARKET' })).toBeInTheDocument();
  });
});
