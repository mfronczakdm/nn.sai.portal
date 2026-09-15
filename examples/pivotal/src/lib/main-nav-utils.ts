import type { MainNavTreeNode } from '@/components/main-nav/main-nav.props';

function readId(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!value || typeof value !== 'object') return '';
  const record = value as { id?: string; href?: string; url?: string; path?: string };
  return (record.id || record.path || record.href || record.url || '').trim();
}

export function extractNavigationRootId(navigationRoot?: unknown): string {
  if (!navigationRoot || typeof navigationRoot !== 'object') return '';
  const root = navigationRoot as {
    targetItem?: { id?: string };
    jsonValue?: { value?: unknown; id?: string; href?: string; url?: string; path?: string };
    value?: unknown;
  };
  const fromTarget = root.targetItem?.id?.trim();
  if (fromTarget) return fromTarget;
  const fromJsonValue = readId(root.jsonValue?.value);
  if (fromJsonValue) return fromJsonValue;
  const fromJsonRoot = readId(root.jsonValue);
  if (fromJsonRoot) return fromJsonRoot;
  return readId(root.value);
}

/** Normalize Droptree ids/paths for Experience Edge `item(path:)`. */
export function toEdgeItemPath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/sitecore/')) return trimmed;
  const guid = trimmed.replace(/[{}]/g, '');
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid)) {
    return `{${guid.toUpperCase()}}`;
  }
  return trimmed;
}

export function pruneNonPages(node?: MainNavTreeNode | null): MainNavTreeNode | undefined {
  if (!node) return undefined;
  const name = node.name?.trim();
  if (name === 'Data') return undefined;
  const children = (node.children?.results ?? [])
    .map((child) => pruneNonPages(child))
    .filter((child): child is MainNavTreeNode => Boolean(child));
  return {
    ...node,
    children: { results: children },
  };
}
