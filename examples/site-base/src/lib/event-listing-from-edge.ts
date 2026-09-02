import client from '@/lib/sitecore-client';
import { extractEventsRootId, type EventListingChild } from '@/lib/event-listing-model';
import { toEdgeItemPath } from '@/lib/location-footprint-from-edge';

/**
 * Layout ComponentQuery cannot expand EventsRoot LookupField children (Edge rejects it).
 * Chrome fields stay on the rendering query; event cards load here via the Content API.
 */
const CHILDREN_QUERY = `
  query EventListingChildren($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      children(first: 20) {
        results {
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
        }
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

type DatasourceQueryResult = {
  item?: {
    eventsRoot?: EdgeFieldValue;
  } | null;
};

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

async function resolveEventsRootPath(datasourcePath: string, language: string): Promise<string> {
  const path = toEdgeItemPath(datasourcePath);
  if (!path) return '';
  try {
    const result = await client.getData<DatasourceQueryResult>(DATASOURCE_QUERY, { path, language });
    return toEdgeItemPath(extractEventsRootId({ value: result?.item?.eventsRoot?.value }));
  } catch (error) {
    console.error('[fetchEventListingChildren] datasource EventsRoot query failed:', path, error);
    return '';
  }
}

export async function fetchEventListingChildren(args: {
  rootPath?: string;
  datasourcePath?: string;
  language: string;
}): Promise<EventListingChild[]> {
  const language = args.language || 'en';
  let path = toEdgeItemPath(args.rootPath || '');
  if (!path && args.datasourcePath) {
    path = await resolveEventsRootPath(args.datasourcePath, language);
  }
  if (!path) return [];

  try {
    const result = await client.getData<ChildrenQueryResult>(CHILDREN_QUERY, { path, language });
    return (result?.item?.children?.results ?? [])
      .map((child) => mapChild(child))
      .filter((child): child is EventListingChild => Boolean(child));
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[fetchEventListingChildren] GraphQL request failed:',
      path,
      details ? JSON.stringify(details) : error
    );
    return [];
  }
}
