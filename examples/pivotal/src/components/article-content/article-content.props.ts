import type { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { JsonWrappedImageField } from '@/lib/sitecore-image-field';
import type { ComponentProps } from '@/lib/component-props';

/**
 * Article body intro block — fields are authored on the rendering (flat `fields`) and/or
 * merged from the page (`externalFields`, layout `data`, `route.fields`).
 *
 * Sitecore field names: pageTitle, pageShortTitle, pageHeaderTitle, pageSummary, pageSubtitle,
 * ArticleBody, Detail, image.
 */
export type ArticleContentFields = {
  pageTitle?: Field<string>;
  pageShortTitle?: Field<string>;
  pageHeaderTitle?: Field<string>;
  pageSummary?: Field<string>;
  pageSubtitle?: Field<string>;
  /** Rich Text (HTML) — Sitecore field name `ArticleBody` (same key in layout JSON). */
  ArticleBody?: Field<string> | RichTextField;
  /** Rich Text (HTML) — Sitecore field name `Detail` (Services Page / KM pages). */
  Detail?: Field<string> | RichTextField;
  /** Image — Sitecore field name `image`. */
  image?: ImageField | JsonWrappedImageField;
};

/** GraphQL-style layout payload (`fields.data.*`) when no flat datasource fields are present. */
export type ArticleContentLayoutFields = {
  data?: {
    datasource?: Partial<
      Record<
        string,
        | Field<string>
        | RichTextField
        | ImageField
        | JsonWrappedImageField
        | { jsonValue?: Field<string> | RichTextField | ImageField }
      >
    >;
    externalFields?: Partial<
      Record<string, { jsonValue?: Field<string> | RichTextField | ImageField }>
    >;
  };
};

export type ArticleContentProps = ComponentProps & {
  /** Datasource fields and/or `data` wrapper from layout; may be empty when copy comes from the page only. */
  fields?: ArticleContentFields | ArticleContentLayoutFields;
  /** Page item fields (Content SDK) — same pattern as `ArticleHeader`. */
  externalFields?: ArticleContentFields;
};
