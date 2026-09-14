import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import client from '@/lib/sitecore-client';
import {
  isLcmcDataLocationsRef,
  looksLikeHospitalLocation,
  resolveLocationListingFolderRef,
  LCMC_DATA_LOCATIONS_ID,
} from '@/lib/location-listing.utils';

export { locationListingPublishHint } from '@/lib/location-listing.utils';

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
export type LocationListingContextKey = 'preview' | 'live' | 'default';

export type LocationListingPayload = {
  locations: LocationListingChild[];
  itemFound: boolean;
  childCount: number;
  hospitalCount: number;
  contextsTried: LocationListingContextKey[];
  contextUsed?: LocationListingContextKey;
  error?: string;
};

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

function defaultContextId(): string {
  return (
    process.env.SITECORE_EDGE_CONTEXT_ID?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID?.trim() ||
    ''
  );
}

function resolveLocationListingContextId(mode: LocationListingContextKey): string {
  const fallback = defaultContextId();
  if (mode === 'preview') {
    return process.env.SITECORE_EDGE_CONTEXT_ID_PREVIEW?.trim() || fallback;
  }
  if (mode === 'live') {
    return process.env.SITECORE_EDGE_CONTEXT_ID_LIVE?.trim() || fallback;
  }
  return fallback;
}

function createEdgeClient(mode: LocationListingContextKey): SitecoreClient {
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
  mode: LocationListingContextKey,
  query: string,
  variables: Record<string, unknown>
): Promise<T | undefined> {
  if (mode === 'default') {
    return client.getData<T>(query, variables);
  }
  return createEdgeClient(mode).getData<T>(query, variables);
}

function uniqueContextKeys(preferred: LocationListingEdgeMode): LocationListingContextKey[] {
  const ordered: LocationListingContextKey[] =
    preferred === 'preview' ? ['preview', 'default', 'live'] : ['default', 'live', 'preview'];
  const seen = new Set<string>();
  const keys: LocationListingContextKey[] = [];
  for (const key of ordered) {
    const id = resolveLocationListingContextId(key);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    keys.push(key);
  }
  return keys;
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
  mode: LocationListingContextKey,
  query: string,
  after?: string
): Promise<{
  itemFound: boolean;
  results: LocationListingChild[];
  endCursor?: string;
  hasNext: boolean;
}> {
  const result = await edgeGetData<ChildrenQueryResult>(mode, query, {
    path,
    language,
    after,
  });
  const item = result?.item;
  const children = item?.children;
  return {
    itemFound: Boolean(item),
    results: mapResults(children?.results),
    endCursor: children?.pageInfo?.endCursor ?? undefined,
    hasNext: Boolean(children?.pageInfo?.hasNext && children?.pageInfo?.endCursor),
  };
}

async function fetchAllPages(
  path: string,
  language: string,
  mode: LocationListingContextKey,
  query: string
): Promise<{ itemFound: boolean; results: LocationListingChild[] }> {
  const collected: LocationListingChild[] = [];
  let after: string | undefined;
  let itemFound = false;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const batch = await fetchPage(path, language, mode, query, after);
    itemFound = itemFound || batch.itemFound;
    collected.push(...batch.results);
    if (!batch.hasNext || !batch.endCursor) break;
    after = batch.endCursor;
  }

  return { itemFound, results: collected };
}

async function loadLocationsForMode(
  path: string,
  language: string,
  mode: LocationListingContextKey
): Promise<{ itemFound: boolean; results: LocationListingChild[]; error?: string }> {
  try {
    return await fetchAllPages(path, language, mode, CHILDREN_QUERY);
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchLocationListingChildren] LookupField query failed, retrying without targetItem:',
      path,
      mode,
      details ? JSON.stringify(details) : error
    );
    try {
      return await fetchAllPages(path, language, mode, CHILDREN_QUERY_NO_LOOKUP);
    } catch (liteError) {
      const liteDetails = (liteError as { response?: { errors?: unknown } })?.response?.errors;
      const message = liteDetails
        ? JSON.stringify(liteDetails)
        : liteError instanceof Error
          ? liteError.message
          : 'Edge children query failed';
      console.error('[fetchLocationListingChildren] lite children query failed:', path, mode, message);
      return { itemFound: false, results: [], error: message };
    }
  }
}

async function loadHospitalLocationsForMode(
  path: string,
  language: string,
  mode: LocationListingContextKey
): Promise<{ itemFound: boolean; results: LocationListingChild[]; error?: string }> {
  const loaded = await loadLocationsForMode(path, language, mode);
  return {
    ...loaded,
    results: loaded.results.filter(looksLikeHospitalLocation),
  };
}

async function loadResolvedPath(
  primaryPath: string,
  language: string,
  mode: LocationListingContextKey
): Promise<{ itemFound: boolean; results: LocationListingChild[]; error?: string }> {
  const primary = await loadHospitalLocationsForMode(primaryPath, language, mode);
  if (primary.results.length > 0 || isLcmcDataLocationsRef(primaryPath)) {
    return primary;
  }
  const fallback = await loadHospitalLocationsForMode(LCMC_DATA_LOCATIONS_ID, language, mode);
  return {
    itemFound: primary.itemFound || fallback.itemFound,
    results: fallback.results,
    error: fallback.error || primary.error,
  };
}

/**
 * Load LCMC Hospital Location items for LocationListing.
 * Tries preview, default, and live Edge contexts because Pages editing uses preview=1
 * and SITECORE_EDGE_CONTEXT_ID_LIVE / _PREVIEW can be empty while the default context has items.
 */
export async function fetchLocationListingPayload(args: {
  path?: string;
  language: string;
  edgeMode?: LocationListingEdgeMode;
}): Promise<LocationListingPayload> {
  const language = args.language || 'en';
  const path = toLocationListingItemPath(args.path);
  if (!path) {
    return {
      locations: [],
      itemFound: false,
      childCount: 0,
      hospitalCount: 0,
      contextsTried: [],
      error: 'Invalid datasource path',
    };
  }

  const primaryPath = toLocationListingItemPath(resolveLocationListingFolderRef(path)) || path;
  const contextsTried = uniqueContextKeys(args.edgeMode || 'live');
  let itemFound = false;
  let childCount = 0;
  let lastError: string | undefined;
  let querySucceeded = false;

  for (const contextKey of contextsTried) {
    const loaded = await loadResolvedPath(primaryPath, language, contextKey);
    itemFound = itemFound || loaded.itemFound;
    childCount = Math.max(childCount, loaded.results.length);
    if (loaded.error) lastError = loaded.error;
    else querySucceeded = true;
    if (loaded.results.length > 0) {
      return {
        locations: loaded.results,
        itemFound: true,
        childCount: loaded.results.length,
        hospitalCount: loaded.results.length,
        contextsTried,
        contextUsed: contextKey,
      };
    }
  }

  return {
    locations: [],
    itemFound,
    childCount,
    hospitalCount: 0,
    contextsTried,
    error:
      lastError && !querySucceeded
        ? lastError
        : itemFound
          ? 'Edge children had no hospital-location fields'
          : 'edge-empty',
  };
}

/**
 * Load LCMC Hospital Location items for LocationListing.
 * Datasource may be Data/Locations or the Our Locations page (or a child page).
 * Page children are sitemap items without lat/long — those resolve to Data/Locations.
 */
export async function fetchLocationListingChildren(args: {
  path?: string;
  language: string;
  edgeMode?: LocationListingEdgeMode;
}): Promise<LocationListingChild[]> {
  const payload = await fetchLocationListingPayload(args);
  return payload.locations;
}
