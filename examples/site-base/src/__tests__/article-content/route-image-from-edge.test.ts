import { extractImageAlt, extractImageSrc } from '@/lib/sitecore-image-field';
import { applyExternalRouteImage } from '@/lib/route-image-from-edge';

const getData = jest.fn();

jest.mock('@/lib/sitecore-client', () => ({
  __esModule: true,
  default: {
    getData: (...args: unknown[]) => getData(...args),
  },
}));

const EXTERNAL_XML =
  '<image src="https://images.unsplash.com/photo-1760842543713-108c3cadbba1?w=1200&amp;q=80" alt="Circuit package" />';

function pageWithImage(image: unknown) {
  return {
    layout: {
      sitecore: {
        route: {
          itemId: 'cff1b3a2-45c1-44f9-8411-32c55f316627',
          fields: { image },
        },
      },
    },
  };
}

beforeEach(() => {
  getData.mockReset();
});

describe('extractImageSrc / extractImageAlt entity decoding', () => {
  it('decodes escaped ampersands in external image XML', () => {
    expect(extractImageSrc(EXTERNAL_XML)).toBe(
      'https://images.unsplash.com/photo-1760842543713-108c3cadbba1?w=1200&q=80'
    );
    expect(extractImageAlt(EXTERNAL_XML)).toBe('Circuit package');
  });
});

describe('applyExternalRouteImage', () => {
  it('fills an empty route image from the Content API raw field value', async () => {
    getData.mockResolvedValue({ item: { image: { value: EXTERNAL_XML } } });
    const page = pageWithImage({ value: {} });

    await applyExternalRouteImage(page, 'en');

    expect(page.layout.sitecore.route.fields.image).toEqual({
      value: {
        src: 'https://images.unsplash.com/photo-1760842543713-108c3cadbba1?w=1200&q=80',
        alt: 'Circuit package',
      },
    });
  });

  it('leaves a populated image field untouched and issues no request', async () => {
    const image = { value: { src: 'https://example.test/dam.png' } };
    const page = pageWithImage(image);

    await applyExternalRouteImage(page, 'en');

    expect(getData).not.toHaveBeenCalled();
    expect(page.layout.sitecore.route.fields.image).toBe(image);
  });

  it('leaves the layout untouched when the lookup fails', async () => {
    getData.mockRejectedValue(new Error('edge down'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const page = pageWithImage({ value: {} });

    await applyExternalRouteImage(page, 'en');

    expect(page.layout.sitecore.route.fields.image).toEqual({ value: {} });
    consoleError.mockRestore();
  });

  it('ignores pages without a route item id', async () => {
    const page = { layout: { sitecore: { route: { fields: { image: { value: {} } } } } } };

    await applyExternalRouteImage(page, 'en');

    expect(getData).not.toHaveBeenCalled();
  });
});
