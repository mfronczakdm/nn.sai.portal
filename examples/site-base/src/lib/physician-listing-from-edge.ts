import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import client from '@/lib/sitecore-client';

export type PhysicianListingJsonField<T = unknown> = {
  jsonValue?: { value?: T };
};

export type PhysicianListingLocation = {
  id?: string;
  name?: string;
  displayName?: string;
};

export type PhysicianListingChild = {
  id?: string;
  name?: string;
  url?: { path?: string };
  physicianFullName?: PhysicianListingJsonField<string>;
  credentials?: PhysicianListingJsonField<string>;
  specialty?: PhysicianListingJsonField<string>;
  physicianPhone?: PhysicianListingJsonField<string>;
  physicianDetailPage?: PhysicianListingJsonField<unknown>;
  servingLocations?: {
    jsonValue?: unknown;
    targetItems?: PhysicianListingLocation[];
  };
};

export type PhysicianListingEdgeMode = 'live' | 'preview';

/**
 * Layout ComponentQuery with children(first: 50) + MultilistField ServingLocations
 * exceeds the Edge layout complexity budget. Pages still has a datasource assigned,
 * but `fields.data` is dropped and React shows NoDataFallback.
 *
 * Chrome stays on a slim ComponentQuery (id/name only). Physician cards load here
 * through the Content API, paging 10 at a time with cheap `value` fields.
 */
const PAGE_SIZE = 10;
const MAX_PAGES = 5;

const PHYSICIAN_FIELDS = `
  id
  name
  url { path }
  physicianFullName: field(name: "PhysicianFullName") { value }
  credentials: field(name: "Credentials") { value }
  specialty: field(name: "Specialty") { value }
  physicianPhone: field(name: "PhysicianPhone") { value }
  physicianDetailPage: field(name: "PhysicianDetailPage") { value }
  servingLocations: field(name: "ServingLocations") {
    value
    ... on MultilistField {
      targetItems {
        id
        name
        displayName
      }
    }
  }
`;

const CHILDREN_QUERY = `
  query PhysicianListingChildren($path: String!, $language: String!, $after: String) {
    item(path: $path, language: $language) {
      children(first: ${PAGE_SIZE}, after: $after) {
        results {
          ${PHYSICIAN_FIELDS}
        }
        pageInfo {
          endCursor
          hasNext
        }
      }
    }
  }
`;

const CHILDREN_QUERY_NO_LOCATIONS = `
  query PhysicianListingChildrenLite($path: String!, $language: String!, $after: String) {
    item(path: $path, language: $language) {
      children(first: ${PAGE_SIZE}, after: $after) {
        results {
          id
          name
          url { path }
          physicianFullName: field(name: "PhysicianFullName") { value }
          credentials: field(name: "Credentials") { value }
          specialty: field(name: "Specialty") { value }
          physicianPhone: field(name: "PhysicianPhone") { value }
          physicianDetailPage: field(name: "PhysicianDetailPage") { value }
          servingLocations: field(name: "ServingLocations") { value }
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

type EdgeLocationItem = {
  id?: string;
  name?: string;
  displayName?: string;
};

type EdgePhysicianResult = {
  id?: string;
  name?: string;
  url?: { path?: string };
  physicianFullName?: EdgeFieldValue;
  credentials?: EdgeFieldValue;
  specialty?: EdgeFieldValue;
  physicianPhone?: EdgeFieldValue;
  physicianDetailPage?: EdgeFieldValue;
  servingLocations?: EdgeFieldValue & { targetItems?: EdgeLocationItem[] };
};

type ChildrenQueryResult = {
  item?: {
    children?: {
      results?: EdgePhysicianResult[];
      pageInfo?: { endCursor?: string | null; hasNext?: boolean };
    };
  } | null;
};

function resolvePhysicianListingContextId(mode: PhysicianListingEdgeMode): string {
  const fallback =
    process.env.SITECORE_EDGE_CONTEXT_ID?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID?.trim() ||
    '';
  if (mode === 'preview') {
    return process.env.SITECORE_EDGE_CONTEXT_ID_PREVIEW?.trim() || fallback;
  }
  return process.env.SITECORE_EDGE_CONTEXT_ID_LIVE?.trim() || fallback;
}

function createEdgeClient(mode: PhysicianListingEdgeMode): SitecoreClient {
  const contextId = resolvePhysicianListingContextId(mode);
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
  mode: PhysicianListingEdgeMode,
  query: string,
  variables: Record<string, unknown>
): Promise<T | undefined> {
  if (mode === 'preview') {
    return createEdgeClient('preview').getData<T>(query, variables);
  }
  return client.getData<T>(query, variables);
}

const toJsonField = (field?: EdgeFieldValue) => {
  const value = field?.value;
  if (value === undefined || value === null) return undefined;
  return { jsonValue: { value } };
};

/** Experience Edge `item(path:)` expects `{GUID}` with braces, or a Sitecore path. */
export function toPhysicianListingItemPath(raw?: string | null): string {
  const value = raw?.trim() ?? '';
  if (!value || value.toLowerCase().startsWith('local:')) return '';
  if (value.startsWith('/sitecore/')) return value;
  const guid = value.replace(/[{}]/g, '');
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid)) {
    return `{${guid.toUpperCase()}}`;
  }
  return '';
}

function locationFromTarget(item: EdgeLocationItem): PhysicianListingLocation {
  return {
    id: item.id,
    name: item.name,
    displayName: item.displayName,
  };
}

function locationsFromValue(value: unknown): PhysicianListingLocation[] {
  if (typeof value !== 'string' || !value.trim()) return [];
  return value
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((id) => ({ id, name: '', displayName: '' }));
}

function mapChild(item: EdgePhysicianResult): PhysicianListingChild | null {
  if (!item.id && !item.name) return null;
  const fromTargets = (item.servingLocations?.targetItems ?? []).map(locationFromTarget);
  const servingLocations = fromTargets.length
    ? { jsonValue: item.servingLocations?.value, targetItems: fromTargets }
    : { jsonValue: item.servingLocations?.value, targetItems: locationsFromValue(item.servingLocations?.value) };

  return {
    id: item.id,
    name: item.name,
    url: item.url,
    physicianFullName: toJsonField(item.physicianFullName),
    credentials: toJsonField(item.credentials),
    specialty: toJsonField(item.specialty),
    physicianPhone: toJsonField(item.physicianPhone),
    physicianDetailPage: toJsonField(item.physicianDetailPage),
    servingLocations,
  };
}

function mapResults(results: EdgePhysicianResult[] | undefined): PhysicianListingChild[] {
  return (results ?? [])
    .map((child) => mapChild(child))
    .filter((child): child is PhysicianListingChild => Boolean(child));
}

async function fetchPage(
  path: string,
  language: string,
  mode: PhysicianListingEdgeMode,
  query: string,
  after?: string
): Promise<{ results: PhysicianListingChild[]; endCursor?: string; hasNext: boolean }> {
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
  mode: PhysicianListingEdgeMode,
  query: string
): Promise<PhysicianListingChild[]> {
  const collected: PhysicianListingChild[] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await fetchPage(path, language, mode, query, after);
    collected.push(...batch.results);
    if (!batch.hasNext || !batch.endCursor) break;
    after = batch.endCursor;
  }

  return collected;
}

async function loadPhysiciansForMode(
  path: string,
  language: string,
  mode: PhysicianListingEdgeMode
): Promise<PhysicianListingChild[]> {
  try {
    return await fetchAllPages(path, language, mode, CHILDREN_QUERY);
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchPhysicianListingChildren] Multilist query failed, retrying without targetItems:',
      path,
      details ? JSON.stringify(details) : error
    );
    try {
      return await fetchAllPages(path, language, mode, CHILDREN_QUERY_NO_LOCATIONS);
    } catch (liteError) {
      const liteDetails = (liteError as { response?: { errors?: unknown } })?.response?.errors;
      console.error(
        '[fetchPhysicianListingChildren] lite children query failed:',
        path,
        liteDetails ? JSON.stringify(liteDetails) : liteError
      );
      return [];
    }
  }
}

export async function fetchPhysicianListingChildren(args: {
  path?: string;
  language: string;
  edgeMode?: PhysicianListingEdgeMode;
}): Promise<PhysicianListingChild[]> {
  const language = args.language || 'en';
  const mode = args.edgeMode || 'live';
  const path = toPhysicianListingItemPath(args.path);
  if (!path) return [];

  const primary = await loadPhysiciansForMode(path, language, mode);
  if (primary.length > 0) return primary;
  if (mode === 'preview') {
    return loadPhysiciansForMode(path, language, 'live');
  }
  return [];
}
