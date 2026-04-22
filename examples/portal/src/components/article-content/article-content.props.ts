import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

/**
 * Article body intro block — fields are authored on the rendering (flat `fields`) and/or
 * merged from the page (`externalFields`, layout `data`, `route.fields`).
 *
 * Sitecore field names: pageTitle, pageShortTitle, pageHeaderTitle, pageSummary, pageSubtitle.
 */
export type ArticleContentFields = {
  pageTitle?: Field<string>;
  pageShortTitle?: Field<string>;
  pageHeaderTitle?: Field<string>;
  pageSummary?: Field<string>;
  pageSubtitle?: Field<string>;
};

/** GraphQL-style layout payload (`fields.data.*`) when no flat datasource fields are present. */
export type ArticleContentLayoutFields = {
  data?: {
    datasource?: Partial<Record<string, Field<string> | { jsonValue?: Field<string> }>>;
    externalFields?: Partial<Record<string, { jsonValue?: Field<string> }>>;
  };
};

export type ArticleContentProps = ComponentProps & {
  /** Datasource fields and/or `data` wrapper from layout; may be empty when copy comes from the page only. */
  fields?: ArticleContentFields | ArticleContentLayoutFields;
  /** Page item fields (Content SDK) — same pattern as `ArticleHeader`. */
  externalFields?: ArticleContentFields;
};
