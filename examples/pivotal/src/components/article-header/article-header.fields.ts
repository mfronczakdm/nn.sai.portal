import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ArticleHeaderFields } from './article-header.props';

function flatFieldsWithoutData(fields: unknown): Record<string, unknown> {
  if (!fields || typeof fields !== 'object') return {};
  const obj = { ...(fields as Record<string, unknown>) };
  delete obj.data;
  return obj;
}

function hasLayoutData(
  fields: unknown,
): fields is { data: { datasource?: Partial<ArticleHeaderFields> } } {
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

/** Sitecore template field is often `Eyebrow`; component prop is `eyebrowOptional`. */
const EYEBROW_FIELD_KEYS = ['eyebrowOptional', 'Eyebrow', 'eyebrow'] as const;

function pickEyebrowField(...bags: Array<Record<string, unknown> | undefined>): Field<string> | undefined {
  for (const bag of bags) {
    if (!bag) continue;
    for (const key of EYEBROW_FIELD_KEYS) {
      const raw = bag[key];
      if (raw == null) continue;
      const field = unwrapTextField(raw as Field<string> | { jsonValue?: Field<string> });
      if (field !== undefined) {
        return field;
      }
    }
  }
  return undefined;
}

/**
 * GraphQL / Content SDK often sends component fields under `fields.data.datasource`
 * (same as PageHeader). ArticleHeader historically read only flat `fields.*`.
 */
export function resolveArticleHeaderFields(rawFields: unknown): ArticleHeaderFields {
  const flat = flatFieldsWithoutData(rawFields) as Record<string, unknown>;
  const ds: Record<string, unknown> = hasLayoutData(rawFields)
    ? ((rawFields.data.datasource ?? {}) as Record<string, unknown>)
    : {};

  const merged = { ...ds, ...flat } as ArticleHeaderFields;
  const eyebrow = pickEyebrowField(flat, ds);
  if (eyebrow !== undefined) {
    merged.eyebrowOptional = eyebrow;
  }
  return merged;
}
