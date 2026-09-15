import client from '@/lib/sitecore-client';
import type { FootprintLocationFields } from '@/components/location-search/location-search.props';

/**
 * Experience Edge rejects the rendering ComponentQuery for this datasource: pulling
 * child fields across all locations exceeds the layout query complexity budget, so the
 * ComponentQuery only returns the first page of children. The full list is loaded here
 * through the Content API instead.
 *
 * `value` is requested rather than `jsonValue` because the generic field resolver is what
 * drives the complexity cost, and plain values are cheap enough to fetch for every child.
 */
const PAGE_SIZE = 10;
const MAX_PAGES = 10;

const LOCATIONS_QUERY = `
  query LocationFootprint($path: String!, $language: String!, $after: String) {
    item(path: $path, language: $language) {
      children(first: ${PAGE_SIZE}, after: $after) {
        results {
          id
          name: field(name: "Name") { value }
          locationType: field(name: "Type") { value }
          GEO: field(name: "GEO") { value }
        }
        pageInfo {
          endCursor
          hasNext
        }
      }
    }
  }
`;

type EdgeFieldValue = { value?: string } | null;

type EdgeLocationResult = {
  id?: string;
  name?: EdgeFieldValue;
  locationType?: EdgeFieldValue;
  GEO?: EdgeFieldValue;
};

type LocationsQueryResult = {
  item?: {
    children?: {
      results?: EdgeLocationResult[];
      pageInfo?: { endCursor?: string | null; hasNext?: boolean };
    };
  } | null;
};

const toJsonValueField = (field?: EdgeFieldValue) => ({ jsonValue: { value: field?.value ?? '' } });

/** Normalises an item id or path into the form Edge expects. */
export function toEdgeItemPath(rawPath: string): string {
  const value = rawPath?.trim() ?? '';
  if (!value) return '';
  if (value.startsWith('/')) return value;

  const guid = value.replace(/[{}]/g, '');
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid)
    ? guid
    : '';
}

export async function fetchFootprintLocations(args: {
  path: string;
  language: string;
}): Promise<FootprintLocationFields[]> {
  const path = toEdgeItemPath(args.path);
  if (!path) return [];

  const language = args.language || 'en';

  try {
    const collected: EdgeLocationResult[] = [];
    let after: string | undefined;

    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await client.getData<LocationsQueryResult>(LOCATIONS_QUERY, {
        path,
        language,
        after,
      });

      const children = result?.item?.children;
      collected.push(...(children?.results ?? []));

      const endCursor = children?.pageInfo?.endCursor ?? undefined;
      if (!children?.pageInfo?.hasNext || !endCursor) break;
      after = endCursor;
    }

    return collected.map((location) => ({
      id: location.id,
      name: toJsonValueField(location.name),
      locationType: toJsonValueField(location.locationType),
      GEO: toJsonValueField(location.GEO),
    })) as FootprintLocationFields[];
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchFootprintLocations] GraphQL request failed:',
      path,
      details ? JSON.stringify(details) : error
    );
    return [];
  }
}
