import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import client from '@/lib/sitecore-client';

export type LocationListingJsonField<T = unknown> = {
  jsonValue?: { value?: T };
};

export type LocationListingChild = {
  id?: string;
  name?: string;
  url?: { path?: string };
  locationTitle?: LocationListingJsonField<string>;
  locationShortName?: LocationListingJsonField<string>;
  locationType?: LocationListingJsonField<string>;
  streetAddress?: LocationListingJsonField<string>;
  city?: LocationListingJsonField<string>;
  state?: LocationListingJsonField<string>;
  postalCode?: LocationListingJsonField<string>;
  phoneNumber?: LocationListingJsonField<string>;
  latitude?: LocationListingJsonField<string>;
  longitude?: LocationListingJsonField<string>;
  landingPage?: LocationListingJsonField<string | { href?: string; url?: string; path?: string }> & {
    targetItem?: { id?: string; name?: string; url?: { path?: string } };
  };
};

export type LocationListingEdgeMode = 'live' | 'preview';

/**
 * Layout ComponentQuery with children(first: 50) + Treelist expansion exceeds the
 * Edge layout complexity budget (same issue as PhysicianListing). Chrome stays on a
 * slim ComponentQuery; location cards load here through the Content API.
 */
const PAGE_SIZE = 10;
const MAX_PAGES = 5;

const LOCATION_FIELDS = `
  id
  name
  url { path }
  locationTitle: field(name: "LocationTitle") { value }
  locationShortName: field(name: "LocationShortName") { value }
  locationType: field(name: "LocationType") { value }
  streetAddress: field(name: "StreetAddress") { value }
  city: field(name: "City") { value }
  state: field(name: "State") { value }
  postalCode: field(name: "PostalCode") { value }
  phoneNumber: field(name: "PhoneNumber") { value }
  latitude: field(name: "Latitude") { value }
  longitude: field(name: "Longitude") { value }
  landingPage: field(name: "LandingPage") {
    value
    ... on LookupField {
      targetItem {
        id
        name
        url { path }
      }
    }
  }
`;

const CHILDREN_QUERY = `
  query LocationListingChildren($path: String!, $language: String!, $after: String) {
    item(path: $path, language: $language) {
      children(first: ${PAGE_SIZE}, after: $after) {
        results {
          ${LOCATION_FIELDS}
        }
        pageInfo {
          endCursor
          hasNext
        }
      }
    }
  }
`;

const CHILDREN_QUERY_NO_LOOKUP = `
  query LocationListingChildrenLite($path: String!, $language: String!, $after: String) {
    item(path: $path, language: $language) {
      children(first: ${PAGE_SIZE}, after: $after) {
        results {
          id
          name
          url { path }
          locationTitle: field(name: "LocationTitle") { value }
          locationShortName: field(name: "LocationShortName") { value }
          locationType: field(name: "LocationType") { value }
          streetAddress: field(name: "StreetAddress") { value }
          city: field(name: "City") { value }
          state: field(name: "State") { value }
          postalCode: field(name: "PostalCode") { value }
          phoneNumber: field(name: "PhoneNumber") { value }
          latitude: field(name: "Latitude") { value }
          longitude: field(name: "Longitude") { value }
          landingPage: field(name: "LandingPage") { value }
        }
        pageInfo {
          endCursor
          hasNext
        }
      }
    }
  }
`;

type EdgeFieldValue = { value?: unknown } | null;

type EdgeLocationResult = {
  id?: string;
  name?: string;
  url?: { path?: string };
  locationTitle?: EdgeFieldValue;
  locationShortName?: EdgeFieldValue;
  locationType?: EdgeFieldValue;
  streetAddress?: EdgeFieldValue;
  city?: EdgeFieldValue;
  state?: EdgeFieldValue;
  postalCode?: EdgeFieldValue;
  phoneNumber?: EdgeFieldValue;
  latitude?: EdgeFieldValue;
  longitude?: EdgeFieldValue;
  landingPage?: EdgeFieldValue & {
    targetItem?: { id?: string; name?: string; url?: { path?: string } };
  };
};

type ChildrenQueryResult = {
  item?: {
    children?: {
      results?: EdgeLocationResult[];
      pageInfo?: { endCursor?: string | null; hasNext?: boolean };
    };
  } | null;
};

function resolveLocationListingContextId(mode: LocationListingEdgeMode): string {
  const fallback =
    process.env.SITECORE_EDGE_CONTEXT_ID?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID?.trim() ||
    '';
  if (mode === 'preview') {
    return process.env.SITECORE_EDGE_CONTEXT_ID_PREVIEW?.trim() || fallback;
  }
  return process.env.SITECORE_EDGE_CONTEXT_ID_LIVE?.trim() || fallback;
}

function createEdgeClient(mode: LocationListingEdgeMode): SitecoreClient {
  const contextId = resolveLocationListingContextId(mode);
  return new SitecoreClient({
    ...scConfig,
    api: {
      ...scConfig.api,
      edge: {
        ...scConfig.api.edge,
        contextId,
        clientContextId: contextId,
      },
    },
  });
}

async function edgeGetData<T>(
  mode: LocationListingEdgeMode,
  query: string,
  variables: Record<string, unknown>
): Promise<T | undefined> {
  if (mode === 'preview') {
    return createEdgeClient('preview').getData<T>(query, variables);
  }
  return client.getData<T>(query, variables);
}

function toJsonField(field?: EdgeFieldValue): LocationListingJsonField<string> | undefined {
  const raw = field?.value;
  if (raw === undefined || raw === null) return undefined;
  return { jsonValue: { value: typeof raw === 'string' ? raw : String(raw) } };
}

/** Experience Edge `item(path:)` expects `{GUID}` with braces, or a Sitecore path. */
export function toLocationListingItemPath(raw?: string | null): string {
  const value = raw?.trim() ?? '';
  if (!value || value.toLowerCase().startsWith('local:')) return '';
  if (value.startsWith('/sitecore/')) return value;
  const guid = value.replace(/[{}]/g, '');
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid)) {
    return `{${guid.toUpperCase()}}`;
  }
  return '';
}

function mapChild(item: EdgeLocationResult): LocationListingChild | null {
  if (!item.id && !item.name) return null;
  return {
    id: item.id,
    name: item.name,
    url: item.url,
    locationTitle: toJsonField(item.locationTitle),
    locationShortName: toJsonField(item.locationShortName),
    locationType: toJsonField(item.locationType),
    streetAddress: toJsonField(item.streetAddress),
    city: toJsonField(item.city),
    state: toJsonField(item.state),
    postalCode: toJsonField(item.postalCode),
    phoneNumber: toJsonField(item.phoneNumber),
    latitude: toJsonField(item.latitude),
    longitude: toJsonField(item.longitude),
    landingPage: {
      ...toJsonField(item.landingPage),
      targetItem: item.landingPage?.targetItem,
    },
  };
}

function mapResults(results: EdgeLocationResult[] | undefined): LocationListingChild[] {
  return (results ?? [])
    .map((child) => mapChild(child))
    .filter((child): child is LocationListingChild => Boolean(child));
}

async function fetchPage(
  path: string,
  language: string,
  mode: LocationListingEdgeMode,
  query: string,
  after?: string
): Promise<{ results: LocationListingChild[]; endCursor?: string; hasNext: boolean }> {
  const result = await edgeGetData<ChildrenQueryResult>(mode, query, {
    path,
    language,
    after,
  });
  const children = result?.item?.children;
  return {
    results: mapResults(children?.results),
    endCursor: children?.pageInfo?.endCursor ?? undefined,
    hasNext: Boolean(children?.pageInfo?.hasNext && children?.pageInfo?.endCursor),
  };
}

async function fetchAllPages(
  path: string,
  language: string,
  mode: LocationListingEdgeMode,
  query: string
): Promise<LocationListingChild[]> {
  const collected: LocationListingChild[] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const batch = await fetchPage(path, language, mode, query, after);
    collected.push(...batch.results);
    if (!batch.hasNext || !batch.endCursor) break;
    after = batch.endCursor;
  }

  return collected;
}

async function loadLocationsForMode(
  path: string,
  language: string,
  mode: LocationListingEdgeMode
): Promise<LocationListingChild[]> {
  try {
    return await fetchAllPages(path, language, mode, CHILDREN_QUERY);
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchLocationListingChildren] LookupField query failed, retrying without targetItem:',
      path,
      details ? JSON.stringify(details) : error
    );
    try {
      return await fetchAllPages(path, language, mode, CHILDREN_QUERY_NO_LOOKUP);
    } catch (liteError) {
      const liteDetails = (liteError as { response?: { errors?: unknown } })?.response?.errors;
      console.error(
        '[fetchLocationListingChildren] lite children query failed:',
        path,
        liteDetails ? JSON.stringify(liteDetails) : liteError
      );
      return [];
    }
  }
}

export async function fetchLocationListingChildren(args: {
  path?: string;
  language: string;
  edgeMode?: LocationListingEdgeMode;
}): Promise<LocationListingChild[]> {
  const language = args.language || 'en';
  const mode = args.edgeMode || 'live';
  const path = toLocationListingItemPath(args.path);
  if (!path) return [];

  const primary = await loadLocationsForMode(path, language, mode);
  if (primary.length > 0) return primary;
  if (mode === 'preview') {
    return loadLocationsForMode(path, language, 'live');
  }
  return [];
}
