import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import client from '@/lib/sitecore-client';
import {
  fieldString,
  humanizeName,
  toServiceListingItemPath,
  toServiceListingSearchGuid,
} from '@/components/uiim/services/service-listing.model';
import type { ServiceListingPageNode } from '@/components/uiim/services/service-listing.props';

export type ServiceListingEdgeMode = 'live' | 'preview';

const SERVICES_PAGE_TEMPLATE_ID = 'd77937ac-bae4-4eb0-8d7e-69ec09d5bbfc';
const DETAIL_PAGE_TEMPLATE_ID = 'a9919790-3389-4fc2-abc8-24f73c847c8e';

const PAGE_FIELDS = `
  id
  name
  displayName
  url { path }
  parent {
    id
    name
    displayName
    pageTitle: field(name: "pageTitle") { value }
    pageShortTitle: field(name: "pageShortTitle") { value }
  }
  pageTitle: field(name: "pageTitle") { value }
  pageShortTitle: field(name: "pageShortTitle") { value }
  pageSummary: field(name: "pageSummary") { value }
`;

const CHILDREN_QUERY = `
  query ServiceListingChildren($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      id
      children(first: 60) {
        results {
          ${PAGE_FIELDS}
          children(first: 40) {
            results {
              ${PAGE_FIELDS}
              children(first: 20) {
                results {
                  ${PAGE_FIELDS}
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SEARCH_QUERY = `
  query ServiceListingSearch($rootId: String!, $templateId: String!, $first: Int!) {
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
        ${PAGE_FIELDS}
      }
    }
  }
`;

const DATASOURCE_QUERY = `
  query ServiceListingRoot($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      servicesRoot: field(name: "ServicesRoot") { value }
    }
  }
`;

type EdgeField = { value?: unknown } | null;

type EdgePage = {
  id?: string;
  name?: string;
  displayName?: string;
  url?: { path?: string };
  parent?: {
    id?: string;
    name?: string;
    displayName?: string;
    pageTitle?: EdgeField;
    pageShortTitle?: EdgeField;
  } | null;
  pageTitle?: EdgeField;
  pageShortTitle?: EdgeField;
  pageSummary?: EdgeField;
  children?: { results?: EdgePage[] };
};

type ChildrenQueryResult = { item?: EdgePage | null };
type SearchQueryResult = { search?: { results?: EdgePage[] } };
type DatasourceQueryResult = { item?: { servicesRoot?: EdgeField } | null };

function resolveContextId(mode: ServiceListingEdgeMode): string {
  const fallback =
    process.env.SITECORE_EDGE_CONTEXT_ID?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID?.trim() ||
    '';
  if (mode === 'preview') {
    return process.env.SITECORE_EDGE_CONTEXT_ID_PREVIEW?.trim() || fallback;
  }
  return process.env.SITECORE_EDGE_CONTEXT_ID_LIVE?.trim() || fallback;
}

function createEdgeClient(mode: ServiceListingEdgeMode): SitecoreClient {
  const contextId = resolveContextId(mode);
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
  mode: ServiceListingEdgeMode,
  query: string,
  variables: Record<string, unknown>
): Promise<T | undefined> {
  if (mode === 'preview') {
    return createEdgeClient('preview').getData<T>(query, variables);
  }
  return client.getData<T>(query, variables);
}

function toJsonField(field?: EdgeField) {
  const value = field?.value;
  if (typeof value !== 'string') return undefined;
  return { jsonValue: { value }, value };
}

function idsMatch(left?: string, right?: string): boolean {
  const normalize = (value?: string) => value?.replace(/[{}]/g, '').toLowerCase() ?? '';
  return Boolean(normalize(left) && normalize(left) === normalize(right));
}

function textValue(field?: EdgeField): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function parentType(page: EdgePage): string {
  const parent = page.parent;
  if (!parent) return '';
  return (
    textValue(parent.pageTitle) ||
    textValue(parent.pageShortTitle) ||
    parent.displayName?.trim() ||
    humanizeName(parent.name)
  );
}

function ownLabel(page: EdgePage): string {
  return (
    textValue(page.pageTitle) ||
    textValue(page.pageShortTitle) ||
    page.displayName?.trim() ||
    humanizeName(page.name)
  );
}

function mapPage(page: EdgePage, rootId: string, ancestorType = ''): ServiceListingPageNode {
  const isDirectChild = idsMatch(page.parent?.id, rootId);
  const serviceType = ancestorType || (isDirectChild || !page.parent ? '' : parentType(page));
  const childType = ancestorType || ownLabel(page);
  return {
    id: page.id,
    name: page.name,
    displayName: page.displayName,
    url: page.url,
    serviceType: serviceType || undefined,
    pageTitle: toJsonField(page.pageTitle),
    pageShortTitle: toJsonField(page.pageShortTitle),
    pageSummary: toJsonField(page.pageSummary),
    children: page.children?.results
      ? {
          results: page.children.results
            .filter((child) => !idsMatch(child.id, rootId))
            .map((child) => mapPage(child, rootId, childType)),
        }
      : undefined,
  };
}

function hasCopy(node: ServiceListingPageNode): boolean {
  return Boolean(fieldString(node.pageTitle) || fieldString(node.pageShortTitle) || fieldString(node.pageSummary));
}

function flattenMapped(nodes: ServiceListingPageNode[] | undefined): ServiceListingPageNode[] {
  const flat: ServiceListingPageNode[] = [];
  const walk = (items: ServiceListingPageNode[] | undefined) => {
    for (const item of items ?? []) {
      if (hasCopy(item) || !item.children?.results?.length) flat.push({ ...item, children: undefined });
      walk(item.children?.results);
    }
  };
  walk(nodes);
  return flat;
}

async function resolveRootPath(
  datasourcePath: string,
  language: string,
  mode: ServiceListingEdgeMode
): Promise<string> {
  const path = toServiceListingItemPath(datasourcePath);
  if (!path) return '';
  try {
    const result = await edgeGetData<DatasourceQueryResult>(mode, DATASOURCE_QUERY, { path, language });
    const raw = result?.item?.servicesRoot?.value;
    return toServiceListingItemPath(typeof raw === 'string' ? raw : '');
  } catch (error) {
    console.error('[service-listing] ServicesRoot query failed:', path, error);
    return '';
  }
}

async function fetchByChildren(
  path: string,
  language: string,
  mode: ServiceListingEdgeMode
): Promise<ServiceListingPageNode[]> {
  try {
    const result = await edgeGetData<ChildrenQueryResult>(mode, CHILDREN_QUERY, { path, language });
    const rootId = result?.item?.id || path;
    const mapped = (result?.item?.children?.results ?? [])
      .filter((child) => !idsMatch(child.id, rootId))
      .map((child) => mapPage(child, rootId));
    return flattenMapped(mapped);
  } catch (error) {
    const details = (error as { response?: { errors?: unknown } })?.response?.errors;
    console.error(
      '[service-listing] children query failed:',
      path,
      details ? JSON.stringify(details) : error
    );
    return [];
  }
}

async function fetchBySearch(
  rootPath: string,
  mode: ServiceListingEdgeMode
): Promise<ServiceListingPageNode[]> {
  const rootId = toServiceListingSearchGuid(rootPath);
  if (!rootId) return [];
  const pages: ServiceListingPageNode[] = [];
  for (const templateId of [SERVICES_PAGE_TEMPLATE_ID, DETAIL_PAGE_TEMPLATE_ID]) {
    try {
      const result = await edgeGetData<SearchQueryResult>(mode, SEARCH_QUERY, {
        rootId,
        templateId,
        first: 80,
      });
      const mapped = (result?.search?.results ?? [])
        .filter((page) => !idsMatch(page.id, rootId))
        .map((page) => mapPage(page, rootId));
      pages.push(...flattenMapped(mapped));
    } catch (error) {
      const details = (error as { response?: { errors?: unknown } })?.response?.errors;
      console.error(
        '[service-listing] search query failed:',
        templateId,
        details ? JSON.stringify(details) : error
      );
    }
  }
  return pages;
}

async function loadForMode(
  path: string,
  language: string,
  mode: ServiceListingEdgeMode
): Promise<ServiceListingPageNode[]> {
  const fromChildren = await fetchByChildren(path, language, mode);
  if (fromChildren.length > 0) return fromChildren;
  return fetchBySearch(path, mode);
}

export async function fetchServiceListingPages(args: {
  rootPath?: string;
  datasourcePath?: string;
  language: string;
  edgeMode?: ServiceListingEdgeMode;
}): Promise<ServiceListingPageNode[]> {
  const language = args.language || 'en';
  const mode = args.edgeMode || 'live';
  let path = toServiceListingItemPath(args.rootPath || '');
  if (!path && args.datasourcePath) {
    path = await resolveRootPath(args.datasourcePath, language, mode);
    if (!path && mode === 'preview') {
      path = await resolveRootPath(args.datasourcePath, language, 'live');
    }
  }
  if (!path) return [];

  const primary = await loadForMode(path, language, mode);
  if (primary.length > 0) return primary;
  if (mode === 'preview') return loadForMode(path, language, 'live');
  return [];
}
