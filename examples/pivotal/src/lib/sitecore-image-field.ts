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

/** Sitecore stores Image XML with escaped attributes, so `&` arrives as `&amp;` in query strings. */
function decodeXmlEntities(value: string): string {
  return value
    .replace(/&(?:amp;)+/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'");
}

function attributeValue(xml: string, attribute: string): string {
  const match = xml.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i'));
  return match ? decodeXmlEntities(match[1].trim()) : '';
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
    if (fromAttr) return decodeXmlEntities(fromAttr.trim());
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return '';
  }

  if (typeof raw === 'object' && raw !== null) {
    const v = raw as { src?: string; href?: string; url?: string };
    return (v.src || v.href || v.url || '').trim();
  }

  return '';
}

/** Companion to `extractImageSrc` for the `alt` attribute of external Image XML. */
export function extractImageAlt(raw: unknown): string {
  if (!raw) return '';

  if (typeof raw === 'string') return attributeValue(raw, 'alt');

  if (typeof raw === 'object' && 'jsonValue' in (raw as object)) {
    return extractImageAlt((raw as { jsonValue?: unknown }).jsonValue);
  }

  if (typeof raw === 'object' && 'value' in (raw as object)) {
    return extractImageAlt((raw as { value?: unknown }).value);
  }

  if (typeof raw === 'object') {
    const alt = (raw as { alt?: string }).alt;
    return typeof alt === 'string' ? alt.trim() : '';
  }

  return '';
}

/**
 * Sitecore Edge returns an empty `jsonValue` for Image fields that hold external-URL XML
 * (`<image src="https://…" alt="…" />`), so `value.src` is blank while the raw string still
 * carries the URL. Rebuild a usable `ImageField` from whichever shape is present.
 */
export function hydrateExternalImageField(
  field?: ImageField | string | null
): ImageField | undefined {
  if (!field) return undefined;

  if (typeof field === 'string') {
    const src = extractImageSrc(field);
    if (!src) return undefined;
    return { value: { src, alt: extractImageAlt(field) } } as ImageField;
  }

  const normalized = normalizeImageFieldSrc(field);
  const existingSrc = (normalized?.value as { src?: string } | undefined)?.src;
  if (existingSrc) return normalized;

  const src = extractImageSrc(field);
  if (!src) return normalized;

  const alt = extractImageAlt(field);
  const currentValue =
    normalized?.value && typeof normalized.value === 'object' ? normalized.value : {};

  return {
    ...normalized,
    value: { ...currentValue, src, ...(alt ? { alt } : {}) },
  } as ImageField;
}
