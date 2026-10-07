import type { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export type BlogListingJsonField<T = string> = {
  jsonValue?: Field<T>;
};

export type BlogListingBlog = {
  id?: string;
  name?: string;
  displayName?: string;
  url?: { path?: string };
  detail?: { jsonValue?: RichTextField };
  image?: { jsonValue?: ImageField };
};

export type BlogListingDatasource = {
  title?: BlogListingJsonField;
  intro?: { jsonValue?: RichTextField };
  emptyResultsText?: BlogListingJsonField;
  showFilters?: BlogListingJsonField<boolean | string>;
  blogsRoot?: {
    targetItem?: {
      id?: string;
      children?: {
        results?: BlogListingBlog[];
      };
    } | null;
  };
};

export type BlogListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: BlogListingDatasource | null;
    };
  };
  isPageEditing?: boolean;
};
