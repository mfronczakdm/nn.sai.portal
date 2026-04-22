import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

/**
 * Article body intro block — fields are authored on the rendering (flat `fields`).
 * Sitecore field names: Title, ShortTitle, HeaderTitle, Summary, Subtitle.
 */
export type ArticleContentFields = {
  Title?: Field<string>;
  ShortTitle?: Field<string>;
  HeaderTitle?: Field<string>;
  Summary?: Field<string>;
  Subtitle?: Field<string>;
};

export type ArticleContentProps = ComponentProps & {
  fields: ArticleContentFields;
};
