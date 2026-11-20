import type {
  ResolvedService,
  ServiceListingPageNode,
  ServiceListingRoot,
  ServiceTypeOption,
} from './service-listing.props';

const GUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function fieldString(field?: { jsonValue?: { value?: unknown }; value?: unknown } | null): string {
  const json = field?.jsonValue?.value;
  if (typeof json === 'string' && json.trim()) return json.trim();
  if (typeof field?.value === 'string' && field.value.trim()) return field.value.trim();
  return '';
}

export function humanizeName(name?: string): string {
  if (!name?.trim()) return '';
  return name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function readId(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const record = value as { id?: unknown; value?: unknown; href?: unknown };
  if (typeof record.id === 'string' && record.id.trim()) return record.id.trim();
  if (typeof record.href === 'string' && record.href.trim()) return record.href.trim();
  if (record.value !== undefined) return readId(record.value);
  return '';
}

/** Experience Edge `item(path:)` accepts `{GUID}` or a Sitecore path. */
export function toServiceListingItemPath(raw?: string | null): string {
  const value = raw?.trim() ?? '';
  if (!value || value.toLowerCase().startsWith('local:')) return '';
  if (value.startsWith('/sitecore/')) return value;
  const guid = value.replace(/[{}]/g, '');
  if (GUID_RE.test(guid)) return `{${guid.toUpperCase()}}`;
  return '';
}

export function toServiceListingSearchGuid(raw?: string | null): string {
  const path = toServiceListingItemPath(raw);
  if (!path || path.startsWith('/')) return '';
  return path.replace(/[{}]/g, '').toLowerCase();
}

export function extractServicesRootId(servicesRoot?: ServiceListingRoot | null): string {
  if (!servicesRoot) return '';
  const fromTarget = servicesRoot.targetItem?.id?.trim();
  if (fromTarget) return fromTarget;
  const fromJson = readId(servicesRoot.jsonValue);
  if (fromJson) return fromJson;
  return readId(servicesRoot.value);
}

export function serviceHref(node: ServiceListingPageNode): string {
  const path = node.url?.path?.trim();
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}

function ownType(node: ServiceListingPageNode, title: string, shortTitle: string): string {
  return title || shortTitle || humanizeName(node.displayName) || humanizeName(node.name) || 'Service';
}

export function collectServices(
  nodes: ServiceListingPageNode[] | undefined,
  ancestorType = ''
): ResolvedService[] {
  const cards: ResolvedService[] = [];

  for (const node of nodes ?? []) {
    if (!node) continue;
    const title =
      fieldString(node.pageTitle) ||
      node.displayName?.trim() ||
      humanizeName(node.name) ||
      'Service';
    const shortTitle = fieldString(node.pageShortTitle);
    const summary = stripHtml(fieldString(node.pageSummary));
    const children = node.children?.results ?? [];
    const hasCopy = Boolean(fieldString(node.pageTitle) || shortTitle || summary);
    const serviceType = node.serviceType?.trim() || ancestorType || ownType(node, title, shortTitle);

    if (hasCopy || children.length === 0) {
      const searchText = [title, shortTitle, summary, serviceType, node.name || '']
        .join(' ')
        .toLowerCase();
      cards.push({
        key: node.id || `${title}-${cards.length}`,
        title,
        shortTitle,
        summary,
        href: serviceHref(node),
        serviceType,
        searchText,
      });
    }

    if (children.length > 0) {
      const childType = ancestorType || ownType(node, title, shortTitle);
      cards.push(...collectServices(children, childType));
    }
  }

  const seen = new Set<string>();
  return cards.filter((card) => {
    if (seen.has(card.key)) return false;
    seen.add(card.key);
    return true;
  });
}

export function serviceTypeOptions(services: ResolvedService[]): ServiceTypeOption[] {
  const counts = new Map<string, number>();
  for (const service of services) {
    if (!service.serviceType) continue;
    counts.set(service.serviceType, (counts.get(service.serviceType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => a.type.localeCompare(b.type));
}

export function filterServices(
  services: ResolvedService[],
  query: string,
  selectedTypes: string[]
): ResolvedService[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1);
  const types = new Set(selectedTypes);

  return services
    .filter((service) => {
      if (types.size > 0 && !types.has(service.serviceType)) return false;
      if (!words.length) return true;
      return words.every((word) => service.searchText.includes(word));
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function servicesMatchingQuery(services: ResolvedService[], query: string): ResolvedService[] {
  return filterServices(services, query, []);
}
