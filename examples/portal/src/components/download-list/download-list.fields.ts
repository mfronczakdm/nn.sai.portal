import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import type { DownloadListFields } from './download-list.props';

function flatFieldsWithoutData(fields: unknown): Record<string, unknown> {
  if (!fields || typeof fields !== 'object') return {};
  const obj = { ...(fields as Record<string, unknown>) };
  delete obj.data;
  return obj;
}

function hasLayoutData(
  fields: unknown,
): fields is { data: { datasource?: Partial<DownloadListFields> } } {
  if (typeof fields !== 'object' || fields === null || !('data' in fields)) return false;
  const data = (fields as { data: unknown }).data;
  return typeof data === 'object' && data !== null;
}

function unwrapTextField(
  cell: Field<string> | { jsonValue?: Field<string> } | undefined,
): Field<string> | undefined {
  if (cell == null) return undefined;
  if (typeof cell === 'object' && 'jsonValue' in cell && cell.jsonValue !== undefined) {
    return cell.jsonValue;
  }
  return cell as Field<string>;
}

function pickTitleSubtitle(flat: Record<string, unknown>, ds: Record<string, unknown>) {
  const titleKeys = ['title', 'Title', 'heading', 'Heading'] as const;
  const subtitleKeys = ['subtitle', 'Subtitle', 'description', 'Description'] as const;

  let title: Field<string> | undefined;
  for (const key of titleKeys) {
    const fromFlat = unwrapTextField(flat[key] as Field<string> | { jsonValue?: Field<string> });
    if (fromFlat) {
      title = fromFlat;
      break;
    }
    const fromDs = unwrapTextField(ds[key] as Field<string> | { jsonValue?: Field<string> });
    if (fromDs) {
      title = fromDs;
      break;
    }
  }

  let subtitle: Field<string> | undefined;
  for (const key of subtitleKeys) {
    const fromFlat = unwrapTextField(flat[key] as Field<string> | { jsonValue?: Field<string> });
    if (fromFlat) {
      subtitle = fromFlat;
      break;
    }
    const fromDs = unwrapTextField(ds[key] as Field<string> | { jsonValue?: Field<string> });
    if (fromDs) {
      subtitle = fromDs;
      break;
    }
  }

  return { title, subtitle };
}

function isLinkFieldShape(x: unknown): x is LinkField {
  return (
    typeof x === 'object' &&
    x !== null &&
    'value' in x &&
    typeof (x as LinkField).value === 'object' &&
    (x as LinkField).value !== null
  );
}

function unwrapLinkField(cell: unknown): LinkField | undefined {
  if (cell == null) return undefined;
  if (typeof cell === 'object' && 'jsonValue' in cell) {
    const jv = (cell as { jsonValue?: unknown }).jsonValue;
    if (jv != null) return unwrapLinkField(jv);
  }
  if (isLinkFieldShape(cell)) return cell;
  return undefined;
}

function extractLinkFromRow(row: unknown): LinkField | undefined {
  if (!row || typeof row !== 'object') return undefined;
  const r = row as Record<string, unknown>;

  const direct =
    unwrapLinkField(r.link) ??
    unwrapLinkField(r.Link) ??
    unwrapLinkField(r.url) ??
    unwrapLinkField(r.Url);
  if (direct) return direct;

  const field = r.field as Record<string, unknown> | undefined;
  if (field) {
    const fromField =
      unwrapLinkField(field.link) ??
      unwrapLinkField(field.Link) ??
      unwrapLinkField(field.url);
    if (fromField) return fromField;
  }

  const fields = r.fields as Record<string, unknown> | undefined;
  if (fields) {
    const fromFields =
      unwrapLinkField(fields.Link) ??
      unwrapLinkField(fields.link) ??
      unwrapLinkField(fields.url) ??
      unwrapLinkField(fields.URL);
    if (fromFields) return fromFields;
  }

  return undefined;
}

function normalizeFeaturedRows(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;

  if ('jsonValue' in o && o.jsonValue != null) {
    return normalizeFeaturedRows(o.jsonValue);
  }
  if (Array.isArray(o.targetItems)) return o.targetItems;
  if (Array.isArray(o.results)) return o.results;
  if (Array.isArray(o.children)) return o.children;
  const children = o.children as { results?: unknown[] } | undefined;
  if (children && Array.isArray(children.results)) return children.results;

  return [];
}

function pickFeaturedRaw(flat: Record<string, unknown>, ds: Record<string, unknown>): unknown {
  const keys = ['featuredContent', 'FeaturedContent'] as const;
  for (const bag of [flat, ds]) {
    for (const key of keys) {
      if (bag[key] != null) return bag[key];
    }
  }
  return undefined;
}

export function resolveDownloadListFields(rawFields: unknown): DownloadListFields {
  const flat = flatFieldsWithoutData(rawFields) as Record<string, unknown>;
  const ds: Record<string, unknown> = hasLayoutData(rawFields)
    ? ((rawFields.data.datasource ?? {}) as Record<string, unknown>)
    : {};

  const { title, subtitle } = pickTitleSubtitle(flat, ds);
  const merged = { ...ds, ...flat } as DownloadListFields;
  const featuredRaw = pickFeaturedRaw(flat, ds);

  return {
    ...merged,
    title: title ?? merged.title,
    subtitle: subtitle ?? merged.subtitle,
    featuredContent: featuredRaw ?? merged.featuredContent,
  };
}

export function extractDownloadLinks(featuredContent: unknown): LinkField[] {
  const rows = normalizeFeaturedRows(featuredContent);
  const links: LinkField[] = [];
  for (const row of rows) {
    const link = extractLinkFromRow(row);
    if (link?.value?.href) {
      links.push(link);
    }
  }
  return links;
}
