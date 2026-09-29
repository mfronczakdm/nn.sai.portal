import type { ImageField } from '@sitecore-content-sdk/nextjs';

/** GraphQL / layout responses often wrap fields as `{ jsonValue: ImageField }`. */
export type JsonWrappedImageField = { jsonValue?: ImageField };

export function unwrapImageField(
  field?: ImageField | JsonWrappedImageField | null
): ImageField | undefined {
  if (!field) return undefined;
  const wrapped = field as JsonWrappedImageField;
  if (wrapped.jsonValue) return wrapped.jsonValue;
  return field as ImageField;
}

/** Some Sitecore payloads use `value.href` for the media URL instead of `value.src`. */
export function normalizeImageFieldSrc(image?: ImageField): ImageField | undefined {
  if (!image?.value) return image;
  const v = image.value as { src?: string; href?: string };
  const src = v.src != null ? String(v.src).trim() : '';
  const href = v.href != null ? String(v.href).trim() : '';
  if (!src && href) {
    return { ...image, value: { ...image.value, src: href } } as ImageField;
  }
  return image;
}
