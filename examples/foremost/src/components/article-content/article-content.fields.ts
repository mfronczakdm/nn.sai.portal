import type { Field, Page } from '@sitecore-content-sdk/nextjs';

import type { ArticleContentFields, ArticleContentProps } from './article-content.props';

const FIELD_KEYS: (keyof ArticleContentFields)[] = [
  'pageTitle',
  'pageShortTitle',
  'pageHeaderTitle',
  'pageSummary',
  'pageSubtitle',
  'ArticleBody',
];

/** Accept legacy Sitecore / layout keys until templates and queries are fully renamed. */
const MIGRATION_ALIASES: Record<keyof ArticleContentFields, readonly string[]> = {
  pageTitle: ['pageTitle', 'Title'],
  pageShortTitle: ['pageShortTitle', 'ShortTitle'],
  pageHeaderTitle: ['pageHeaderTitle', 'HeaderTitle'],
  pageSummary: ['pageSummary', 'Summary'],
  pageSubtitle: ['pageSubtitle', 'Subtitle'],
  ArticleBody: ['ArticleBody'],
};

function hasText(field?: { value?: string | null }) {
  return Boolean(field?.value?.trim());
}

function unwrapCell(cell: Field<string> | { jsonValue?: Field<string> } | undefined): Field<string> | undefined {
  if (!cell) return undefined;
  if (typeof cell === 'object' && 'jsonValue' in cell && cell.jsonValue !== undefined) {
    return cell.jsonValue;
  }
  return cell as Field<string>;
}

function pickResolvedField(
  bag: Record<string, unknown> | undefined,
  key: keyof ArticleContentFields,
  requireNonEmpty: boolean,
): Field<string> | undefined {
  if (!bag) return undefined;
  for (const name of MIGRATION_ALIASES[key]) {
    const raw = bag[name];
    const field = unwrapCell(raw as Field<string> | { jsonValue?: Field<string> } | undefined);
    if (!field) continue;
    if (requireNonEmpty) {
      if (hasText(field)) return field;
    } else if (field !== undefined) {
      return field;
    }
  }
  return undefined;
}

function readNestedFieldBag(bag: unknown): Partial<ArticleContentFields> {
  if (!bag || typeof bag !== 'object') return {};
  const rec = bag as Record<string, unknown>;
  const out: Partial<ArticleContentFields> = {};
  for (const key of FIELD_KEYS) {
    const field = pickResolvedField(rec, key, true);
    if (field) out[key] = field;
  }
  return out;
}

function flatFieldsWithoutData(fields: unknown): Record<string, unknown> {
  if (!fields || typeof fields !== 'object') return {};
  const obj = { ...(fields as Record<string, unknown>) };
  delete obj.data;
  return obj;
}

function hasLayoutData(fields: unknown): fields is { data: { datasource?: unknown; externalFields?: unknown } } {
  if (typeof fields !== 'object' || fields === null || !('data' in fields)) return false;
  const data = (fields as { data: unknown }).data;
  return typeof data === 'object' && data !== null;
}

function readRouteFields(page: Page): Partial<ArticleContentFields> {
  const route = page.layout?.sitecore?.route;
  const rf = route?.fields as Record<string, unknown> | undefined;
  if (!rf) return {};
  const out: Partial<ArticleContentFields> = {};
  for (const key of FIELD_KEYS) {
    const field = pickResolvedField(rf, key, true);
    if (field) out[key] = field;
  }
  return out;
}

/**
 * Resolves article copy from (in order of precedence for each key):
 * 1. Flat `fields` on the rendering (excluding `data` — datasource / local fields)
 * 2. `fields.data.datasource` (GraphQL datasource item)
 * 3. Top-level `externalFields` (page item — same pattern as ArticleHeader)
 * 4. `fields.data.externalFields` (page item — same pattern as PageHeader `fields.data.externalFields`)
 * 5. `page.layout.sitecore.route.fields` (page item — same pattern as SXA PageContent / Title)
 *
 * Each canonical field also accepts legacy keys (e.g. `Title` → `pageTitle`) when reading from bags.
 */
export function mergeArticleContentFields(props: ArticleContentProps, isEditing: boolean): ArticleContentFields {
  const { fields, externalFields, page } = props;
  const pageFromProps = externalFields || {};

  const flatFromRoot = flatFieldsWithoutData(fields);
  let nestedDs: Partial<ArticleContentFields> = {};
  let nestedPage: Partial<ArticleContentFields> = {};

  if (hasLayoutData(fields)) {
    const data = fields.data;
    nestedDs = readNestedFieldBag(data.datasource);
    nestedPage = readNestedFieldBag(data.externalFields);
  }

  const merged: Partial<ArticleContentFields> = {};
  const candidatesList: Record<string, unknown>[] = [
    flatFromRoot,
    nestedDs as Record<string, unknown>,
    pageFromProps as Record<string, unknown>,
    nestedPage as Record<string, unknown>,
    readRouteFields(page) as Record<string, unknown>,
  ];

  for (const key of FIELD_KEYS) {
    let chosen: Field<string> | undefined;
    for (const bag of candidatesList) {
      chosen = pickResolvedField(bag, key, true);
      if (chosen) break;
    }
    if (!chosen && isEditing) {
      for (const bag of candidatesList) {
        chosen = pickResolvedField(bag, key, false);
        if (chosen) break;
      }
    }
    if (chosen !== undefined) {
      merged[key] = chosen;
    }
  }

  return merged as ArticleContentFields;
}
