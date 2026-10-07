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

function decodeSrc(src: string): string {
  return src
    .trim()
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"');
}

function srcFromXmlOrUrl(text: string): string {
  const trimmed = text.trim();
  const fromAttr = trimmed.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  if (fromAttr) return decodeSrc(fromAttr);
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) return decodeSrc(trimmed);
  return '';
}

function pickObjectSrc(raw: Record<string, unknown>): string {
  for (const key of ['src', 'href', 'url']) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) {
      return srcFromXmlOrUrl(value) || decodeSrc(value);
    }
  }
  return '';
}

/**
 * Pull a usable URL from Sitecore Image field shapes (layout, ComponentQuery jsonValue,
 * DAM, or raw external XML string). Edge often omits src for external-only Image XML
 * and may leave the URL in `editable` / raw XML instead.
 */
export function extractImageSrc(raw: unknown, seen = new Set<unknown>()): string {
  if (!raw) return '';
  if (typeof raw === 'object' && seen.has(raw)) return '';
  if (typeof raw === 'object' && raw !== null) seen.add(raw);

  if (typeof raw === 'string') {
    return srcFromXmlOrUrl(raw);
  }

  if (typeof raw !== 'object' || raw === null) return '';

  const obj = raw as Record<string, unknown>;
  const direct = pickObjectSrc(obj);
  if (direct) return direct;

  for (const key of ['jsonValue', 'value', 'editable', 'xml', 'xmlValue', 'html', 'rendered']) {
    if (!(key in obj) || obj[key] == null) continue;
    const nested = extractImageSrc(obj[key], seen);
    if (nested) return nested;
  }

  return '';
}

/**
 * External Image XML (empty mediaid + Unsplash/CDN src) often arrives with src only
 * on `editable`. Copy that URL onto `value.src` so Image/NextImage can render in Pages.
 */
export function withResolvedImageSrc(
  raw?: ImageField | JsonWrappedImageField | null
): ImageField | undefined {
  if (!raw) return undefined;
  const field = normalizeImageFieldSrc(unwrapImageField(raw));
  const src = extractImageSrc(field) || extractImageSrc(raw);
  if (!field && !src) return undefined;
  const base = field ?? ({ value: {} } as ImageField);
  if (!src) return base;
  const current = (base.value as { src?: string } | undefined)?.src;
  if (current === src) return base;
  return {
    ...base,
    value: {
      ...(base.value as object),
      src,
    },
  } as ImageField;
}

/** Hosts that should skip `/_next/image` (hotlink / sandbox / CDN). */
export function shouldBypassNextImageOptimizer(src: string): boolean {
  try {
    const hostname = new URL(src, 'https://localhost').hostname.toLowerCase();
    return (
      hostname === 'www.cooley.com' ||
      hostname === 'cooley.com' ||
      hostname === 'images.unsplash.com' ||
      hostname.endsWith('.sitecoresandbox.cloud') ||
      hostname.endsWith('.sitecorecontenthub.cloud') ||
      hostname.includes('stylelabs.cloud')
    );
  } catch {
    return false;
  }
}
