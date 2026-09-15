import type { RichTextField } from '@sitecore-content-sdk/nextjs';

import type {
  VariantContentChunkReference,
  VariantContentFields,
  VariantContentProps,
} from './variant-content.props';

export type ResolvedVariantChunk = {
  id: string;
  name: string;
  path: string;
  sectionKey: string;
  sectionLabel: string;
  stateCode?: string;
  content?: RichTextField;
};

/** Insert spaces before capitals in the name portion: ClaimsTimelines → Claims Timelines */
export function formatSectionFolderLabel(folderName: string): string {
  const trimmed = folderName.trim();
  const match = trimmed.match(/^(\d{2}-)(.+)$/);
  if (!match) {
    return trimmed.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  const spaced = match[2].replace(/([a-z])([A-Z])/g, '$1 $2').replace(/And/g, 'And');
  return `${match[1]}${spaced}`;
}

/**
 * Pull the Shared Content section folder from an item path, e.g.
 * .../Shared Content/07-ClaimsTimelines/StateSpecific/FL/... → 07-ClaimsTimelines
 */
export function extractSectionFolder(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl?.trim()) return undefined;
  const normalized = pathOrUrl.replace(/\\/g, '/');

  const sharedMatch = normalized.match(/\/Shared(?:%20| )?Content\/([^/]+)/i);
  if (sharedMatch?.[1]) {
    try {
      return decodeURIComponent(sharedMatch[1]);
    } catch {
      return sharedMatch[1];
    }
  }

  const numbered = normalized.match(/\/(\d{2}-[^/]+)\//);
  return numbered?.[1];
}

export function extractStateCode(pathOrUrl?: string, itemName?: string): string | undefined {
  if (pathOrUrl?.trim()) {
    const fromPath = pathOrUrl
      .replace(/\\/g, '/')
      .match(/\/StateSpecific\/([A-Z]{2})(?:\/|$)/i);
    if (fromPath?.[1]) return fromPath[1].toUpperCase();
  }

  if (itemName?.trim()) {
    const fromName = itemName.trim().match(/-([A-Z]{2})$/i);
    if (fromName?.[1]) return fromName[1].toUpperCase();
  }

  return undefined;
}

/**
 * Nationwide (no persona / logged out): show all chunks.
 * Logged-in state persona: only chunks for that state code.
 */
export function filterChunksByPersonaState(
  chunks: ResolvedVariantChunk[],
  personaStateCode: string | null | undefined
): ResolvedVariantChunk[] {
  const state = personaStateCode?.trim().toUpperCase();
  if (!state) return chunks;
  return chunks.filter((chunk) => chunk.stateCode === state);
}

function unwrapRichText(
  cell: RichTextField | { jsonValue?: RichTextField } | undefined
): RichTextField | undefined {
  if (!cell) return undefined;
  if (typeof cell === 'object' && cell !== null && 'jsonValue' in cell && cell.jsonValue) {
    return cell.jsonValue;
  }
  return cell as RichTextField;
}

function chunkPath(item: VariantContentChunkReference): string {
  return (
    item.path ||
    (typeof (item as { url?: string }).url === 'string' ? (item as { url?: string }).url : '') ||
    ''
  );
}

function chunkContent(item: VariantContentChunkReference): RichTextField | undefined {
  return unwrapRichText(item.content) || unwrapRichText(item.fields?.Content);
}

export function resolveVariantChunks(
  fields: VariantContentFields | undefined,
  routeFields?: Record<string, unknown>
): ResolvedVariantChunk[] {
  const fromQuery = fields?.data?.datasource?.sharedContent?.targetItems;
  const fromFields = fields?.sharedContent ?? fields?.SharedContent;
  const fromRoute = (routeFields?.sharedContent ?? routeFields?.SharedContent) as
    | VariantContentChunkReference[]
    | undefined;

  const raw: VariantContentChunkReference[] = [];
  const seen = new Set<string>();

  for (const list of [fromQuery, fromFields, fromRoute]) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item) continue;
      const id = (item.id || item.name || '').toLowerCase();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      raw.push(item);
    }
  }

  return raw
    .map((item, index) => {
      const path = chunkPath(item);
      const name = item.displayName || item.name || `Variant ${index + 1}`;
      const sectionKey = extractSectionFolder(path) || 'Shared';
      const sectionLabel = formatSectionFolderLabel(sectionKey);
      const content = chunkContent(item);
      return {
        id: item.id || `variant-chunk-${index}`,
        name,
        path,
        sectionKey,
        sectionLabel,
        stateCode: extractStateCode(path, name),
        content,
      } satisfies ResolvedVariantChunk;
    })
    .filter((chunk) => Boolean(chunk.content?.value?.trim()) || Boolean(chunk.path));
}

export function groupChunksBySection(
  chunks: ResolvedVariantChunk[]
): { sectionKey: string; sectionLabel: string; chunks: ResolvedVariantChunk[] }[] {
  const order: string[] = [];
  const map = new Map<string, ResolvedVariantChunk[]>();

  for (const chunk of chunks) {
    if (!map.has(chunk.sectionKey)) {
      map.set(chunk.sectionKey, []);
      order.push(chunk.sectionKey);
    }
    map.get(chunk.sectionKey)!.push(chunk);
  }

  return order.map((sectionKey) => ({
    sectionKey,
    sectionLabel: map.get(sectionKey)![0].sectionLabel,
    chunks: map.get(sectionKey)!,
  }));
}

export function mergeVariantContentFields(
  props: VariantContentProps,
  routeFields?: Record<string, unknown>
): VariantContentFields {
  return {
    ...(props.fields || {}),
    sharedContent:
      props.fields?.sharedContent ||
      props.fields?.SharedContent ||
      ((routeFields?.sharedContent ?? routeFields?.SharedContent) as
        | VariantContentChunkReference[]
        | undefined),
  };
}

export function hasRichText(field?: RichTextField): boolean {
  return Boolean(field?.value?.trim());
}
