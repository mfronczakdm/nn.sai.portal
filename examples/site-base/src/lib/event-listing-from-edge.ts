import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import client from '@/lib/sitecore-client';
import {
  extractEventsRootId,
  toEventListingItemPath,
  toEventListingSearchGuid,
  type EventListingChild,
} from '@/lib/event-listing-model';

export type EventListingEdgeMode = 'live' | 'preview';

/** Atlanta Apparel Event Page template — used by Edge search fallback. */
const EVENT_PAGE_TEMPLATE_ID = '6ccf3409-0a26-4069-92ec-2099dae63088';
const EVENT_PAGE_FIRST = 50;

/**
 * Layout ComponentQuery cannot expand EventsRoot LookupField children (Edge rejects it).
 * Chrome fields stay on the rendering query; event cards load here via the Content API.
 *
 * `item(path:)` must receive `{GUID}` with braces (KnowledgeListing / MainNav). The previous
 * location-footprint helper stripped braces, so Experience Edge returned null and the listing
 * showed EmptyResultsText even after Event Pages were published.
 */
const EVENT_FIELDS = `
  id
  name
  displayName
  url { path }
  pageTitle: field(name: "pageTitle") { value }
  image: field(name: "image") { value }
  eventStart: field(name: "EventStart") { value }
  eventEnd: field(name: "EventEnd") { value }
  eventLocation: field(name: "EventLocation") { value }
  eventType: field(name: "EventType") { value }
  eventTimezone: field(name: "EventTimezone") { value }
`;

const CHILDREN_QUERY = `
  query EventListingChildren($path: String!, $language: String!, $first: Int!) {
    item(path: $path, language: $language) {
      children(first: $first) {
        results {
          ${EVENT_FIELDS}
        }
      }
    }
  }
`;

const SEARCH_QUERY = `
  query EventListingSearch($rootId: String!, $templateId: String!, $first: Int!) {
    search(
      where: {
        AND: [
          { name: "_path", value: $rootId, operator: CONTAINS }
          { name: "_templates", value: $templateId, operator: EQ }
        ]
      }
      first: $first
    ) {
      results {
        ${EVENT_FIELDS}
      }
    }
  }
`;

const DATASOURCE_QUERY = `
  query EventListingRoot($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      eventsRoot: field(name: "EventsRoot") { value }
    }
  }
`;

type EdgeFieldValue = { value?: unknown } | null;

type EdgeEventResult = {
  id?: string;
  name?: string;
  displayName?: string;
  url?: { path?: string };
  pageTitle?: EdgeFieldValue;
  image?: EdgeFieldValue;
  eventStart?: EdgeFieldValue;
  eventEnd?: EdgeFieldValue;
  eventLocation?: EdgeFieldValue;
  eventType?: EdgeFieldValue;
  eventTimezone?: EdgeFieldValue;
};

type ChildrenQueryResult = {
  item?: {
    children?: {
      results?: EdgeEventResult[];
    };
  } | null;
};

type SearchQueryResult = {
  search?: {
    results?: EdgeEventResult[];
  };
};

type DatasourceQueryResult = {
  item?: {
    eventsRoot?: EdgeFieldValue;
  } | null;
};

function resolveEventListingContextId(mode: EventListingEdgeMode): string {
  const fallback =
    process.env.SITECORE_EDGE_CONTEXT_ID?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID?.trim() ||
    '';
  if (mode === 'preview') {
    return process.env.SITECORE_EDGE_CONTEXT_ID_PREVIEW?.trim() || fallback;
  }
  return process.env.SITECORE_EDGE_CONTEXT_ID_LIVE?.trim() || fallback;
}

function createEdgeClient(mode: EventListingEdgeMode): SitecoreClient {
  const contextId = resolveEventListingContextId(mode);
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
  mode: EventListingEdgeMode,
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
  return { jsonValue: { value }, value };
};

function mapChild(item: EdgeEventResult): EventListingChild | null {
  const eventStart = toJsonField(item.eventStart);
  const startValue = eventStart?.jsonValue?.value;
  if (typeof startValue !== 'string' || !startValue.trim()) return null;
  return {
    id: item.id,
    name: item.name,
    displayName: item.displayName,
    url: item.url,
    pageTitle: toJsonField(item.pageTitle),
    image: toJsonField(item.image),
    eventStart,
    eventEnd: toJsonField(item.eventEnd),
    eventLocation: toJsonField(item.eventLocation),
    eventType: toJsonField(item.eventType),
    eventTimezone: toJsonField(item.eventTimezone),
  };
}

function mapResults(results: EdgeEventResult[] | undefined): EventListingChild[] {
  return (results ?? [])
    .map((child) => mapChild(child))
    .filter((child): child is EventListingChild => Boolean(child));
}

async function resolveEventsRootPath(
  datasourcePath: string,
  language: string,
  mode: EventListingEdgeMode
): Promise<string> {
  const path = toEventListingItemPath(datasourcePath);
  if (!path) return '';
  try {
    const result = await edgeGetData<DatasourceQueryResult>(mode, DATASOURCE_QUERY, { path, language });
    return toEventListingItemPath(extractEventsRootId({ value: result?.item?.eventsRoot?.value }));
  } catch (error) {
    console.error('[fetchEventListingChildren] datasource EventsRoot query failed:', path, error);
    return '';
  }
}

async function fetchChildrenByItem(
  path: string,
  language: string,
  mode: EventListingEdgeMode
): Promise<EventListingChild[]> {
  try {
    const result = await edgeGetData<ChildrenQueryResult>(mode, CHILDREN_QUERY, {
      path,
      language,
      first: EVENT_PAGE_FIRST,
    });
    return mapResults(result?.item?.children?.results);
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchEventListingChildren] children query failed:',
      path,
      details ? JSON.stringify(details) : error
    );
    return [];
  }
}

async function fetchChildrenBySearch(
  rootPath: string,
  mode: EventListingEdgeMode
): Promise<EventListingChild[]> {
  const rootId = toEventListingSearchGuid(rootPath);
  if (!rootId) return [];
  try {
    const result = await edgeGetData<SearchQueryResult>(mode, SEARCH_QUERY, {
      rootId,
      templateId: EVENT_PAGE_TEMPLATE_ID,
      first: EVENT_PAGE_FIRST,
    });
    return mapResults(result?.search?.results);
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchEventListingChildren] search query failed:',
      rootId,
      details ? JSON.stringify(details) : error
    );
    return [];
  }
}

async function loadEventsForMode(
  path: string,
  language: string,
  mode: EventListingEdgeMode
): Promise<EventListingChild[]> {
  const fromItem = await fetchChildrenByItem(path, language, mode);
  if (fromItem.length > 0) return fromItem;
  return fetchChildrenBySearch(path, mode);
}

export async function fetchEventListingChildren(args: {
  rootPath?: string;
  datasourcePath?: string;
  language: string;
  edgeMode?: EventListingEdgeMode;
}): Promise<EventListingChild[]> {
  const language = args.language || 'en';
  const mode = args.edgeMode || 'live';
  let path = toEventListingItemPath(args.rootPath || '');
  if (!path && args.datasourcePath) {
    path = await resolveEventsRootPath(args.datasourcePath, language, mode);
    if (!path && mode === 'preview') {
      path = await resolveEventsRootPath(args.datasourcePath, language, 'live');
    }
  }
  if (!path) return [];

  const primary = await loadEventsForMode(path, language, mode);
  if (primary.length > 0) return primary;
  // Pages editing uses preview=1; published Event Pages often exist only on live Edge.
  if (mode === 'preview') {
    return loadEventsForMode(path, language, 'live');
  }
  return [];
}
