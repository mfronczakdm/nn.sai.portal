import client from '@/lib/sitecore-client';
import { extractImageAlt, extractImageSrc } from '@/lib/sitecore-image-field';
import { toEdgeItemPath } from '@/lib/location-footprint-from-edge';

/**
 * Experience Edge resolves an Image field to an empty layout `value` when the field holds
 * external-URL XML (`<image src="https://…" alt="…" />`) instead of a Sitecore media item —
 * the raw XML is not present in the layout response either, so nothing can be recovered from
 * it client-side. The Content API `field(name: …) { value }` resolver does return the raw
 * string, which is the same workaround `location-footprint-from-edge` and the NewsListing
 * ComponentQuery rely on.
 */
const ROUTE_IMAGE_QUERY = `
  query RouteImage($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      image: field(name: "image") { value }
    }
  }
`;

type RouteImageQueryResult = {
  item?: { image?: { value?: string } | null } | null;
};

type RouteFieldsBag = Record<string, unknown>;

type PageWithRoute = {
  layout?: {
    sitecore?: {
      route?: { itemId?: string; fields?: RouteFieldsBag } | null;
    };
  };
};

function isEmptyImageValue(field: unknown): boolean {
  if (!field || typeof field !== 'object') return false;
  if (!('value' in field)) return false;
  const value = (field as { value?: unknown }).value;
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value !== 'object') return false;
  return !extractImageSrc(value);
}

export async function fetchRouteImageXml(args: {
  itemId: string;
  language: string;
}): Promise<string> {
  const path = toEdgeItemPath(args.itemId);
  if (!path) return '';

  try {
    const result = await client.getData<RouteImageQueryResult>(ROUTE_IMAGE_QUERY, {
      path,
      language: args.language || 'en',
    });
    return result?.item?.image?.value?.trim() ?? '';
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchRouteImageXml] GraphQL request failed:',
      path,
      details ? JSON.stringify(details) : error
    );
    return '';
  }
}

/**
 * Fills in `route.fields.image` when Edge returned it empty. Purely additive: a populated
 * image field, a missing field, or a failed lookup all leave the layout untouched.
 */
export async function applyExternalRouteImage(page: unknown, language: string): Promise<void> {
  const route = (page as PageWithRoute)?.layout?.sitecore?.route;
  const fields = route?.fields;
  if (!route?.itemId || !fields) return;

  const image = fields.image;
  if (!isEmptyImageValue(image)) return;

  const xml = await fetchRouteImageXml({ itemId: route.itemId, language });
  const src = extractImageSrc(xml);
  if (!src) return;

  const alt = extractImageAlt(xml);
  fields.image = { ...(image as object), value: { src, ...(alt ? { alt } : {}) } };
}
