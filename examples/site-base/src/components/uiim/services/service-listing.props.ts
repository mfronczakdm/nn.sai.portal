import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export type ServiceListingJsonField<T = string> = {
  jsonValue?: Field<T>;
  value?: unknown;
};

export type ServiceListingPageNode = {
  id?: string;
  name?: string;
  displayName?: string;
  url?: { path?: string };
  serviceType?: string;
  pageTitle?: ServiceListingJsonField;
  pageShortTitle?: ServiceListingJsonField;
  pageSummary?: ServiceListingJsonField;
  children?: {
    results?: ServiceListingPageNode[];
  };
};

export type ServiceListingRoot = {
  jsonValue?: unknown;
  value?: unknown;
  targetItem?: {
    id?: string;
    name?: string;
    url?: { path?: string };
    children?: {
      results?: ServiceListingPageNode[];
    };
  } | null;
};

export type ServiceListingDatasource = {
  title?: ServiceListingJsonField;
  intro?: { jsonValue?: RichTextField };
  emptyResultsText?: ServiceListingJsonField;
  showFilters?: ServiceListingJsonField<boolean | string>;
  searchPlaceholder?: ServiceListingJsonField;
  filterFacetLabel?: ServiceListingJsonField;
  servicesRoot?: ServiceListingRoot;
};

export type ServiceListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: ServiceListingDatasource | null;
    };
  };
  isPageEditing?: boolean;
};

export type ResolvedService = {
  key: string;
  title: string;
  shortTitle: string;
  summary: string;
  href: string;
  serviceType: string;
  searchText: string;
};

export type ServiceTypeOption = {
  type: string;
  count: number;
};
