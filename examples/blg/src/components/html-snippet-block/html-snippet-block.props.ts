import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

/**
 * Fields on the **Html Snippet Block** rendering (same flat `fields` pattern as Portal Hub /
 * Auth Panel — authored on the rendering; no datasource item).
 *
 * - `title` — Single-Line Text (optional)
 * - `subtitle` — Single-Line Text (optional)
 * - `body` — Rich Text (HTML; e.g. mock snippets from `/mock-snippets/`)
 */
export type HtmlSnippetBlockFields = {
  title?: Field<string>;
  subtitle?: Field<string>;
  body?: RichTextField;
};

export type HtmlSnippetBlockProps = ComponentProps & {
  fields: HtmlSnippetBlockFields;
};
