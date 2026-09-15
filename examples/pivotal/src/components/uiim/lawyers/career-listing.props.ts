import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export type CareerListingJsonField<T = string> = {
  jsonValue?: Field<T>;
};

export type CareerListingRole = {
  id?: string;
  name?: string;
  url?: { path?: string };
  pageHeaderTitle?: CareerListingJsonField;
  pageShortTitle?: CareerListingJsonField;
  pageSubtitle?: CareerListingJsonField;
  pageSummary?: CareerListingJsonField;
  pageTitle?: CareerListingJsonField;
};

export type CareerListingDatasource = {
  title?: CareerListingJsonField;
  intro?: { jsonValue?: RichTextField };
  emptyResultsText?: CareerListingJsonField;
  showFilters?: CareerListingJsonField<boolean | string>;
  careersRoot?: {
    targetItem?: {
      id?: string;
      children?: {
        results?: CareerListingRole[];
      };
    } | null;
  };
};

export type CareerListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: CareerListingDatasource | null;
    };
  };
  isPageEditing?: boolean;
};
