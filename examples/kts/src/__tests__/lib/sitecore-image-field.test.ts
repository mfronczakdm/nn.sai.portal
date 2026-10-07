import { extractImageSrc, withResolvedImageSrc } from '@/lib/sitecore-image-field';

const unsplash =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80';

describe('withResolvedImageSrc', () => {
  it('copies Unsplash src from Image XML editable when value.src is empty', () => {
    const field = {
      jsonValue: {
        value: { mediaid: '', alt: 'Modern law office conference room' },
        editable: `<image mediaid="" src="${unsplash}" alt="Modern law office conference room" />`,
      },
    };

    expect(extractImageSrc(field)).toBe(unsplash);
    expect(withResolvedImageSrc(field)?.value?.src).toBe(unsplash);
  });

  it('keeps an existing value.src', () => {
    const field = {
      jsonValue: {
        value: { src: '/media/local.jpg', alt: 'Local' },
      },
    };

    expect(withResolvedImageSrc(field)?.value?.src).toBe('/media/local.jpg');
  });

  it('reads src from DAM-style <Image src> XML', () => {
    const xml = `<Image src="${unsplash}" width="1600" height="900" dam-content-type="Image" />`;
    expect(extractImageSrc(xml)).toBe(unsplash);
    expect(
      withResolvedImageSrc({ jsonValue: { value: {}, editable: xml } })?.value?.src
    ).toBe(unsplash);
  });
});
