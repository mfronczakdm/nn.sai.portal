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

/**
 * Pull a usable URL from Sitecore Image field shapes (layout, ComponentQuery jsonValue,
 * DAM, or raw external XML string). Edge often omits src for external-only Image XML.
 */
export function extractImageSrc(raw: unknown): string {
  if (!raw) return '';

  if (typeof raw === 'object' && raw !== null && 'value' in raw) {
    return extractImageSrc((raw as { value?: unknown }).value);
  }

  if (typeof raw === 'object' && raw !== null && 'jsonValue' in raw) {
    return extractImageSrc((raw as { jsonValue?: unknown }).jsonValue);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    const fromAttr = trimmed.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (fromAttr) return fromAttr.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return '';
  }

  if (typeof raw === 'object' && raw !== null) {
    const v = raw as { src?: string; href?: string; url?: string };
    return (v.src || v.href || v.url || '').trim();
  }

  return '';
}
