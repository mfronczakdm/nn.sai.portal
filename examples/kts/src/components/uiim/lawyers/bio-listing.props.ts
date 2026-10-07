import type { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export type BioListingJsonField<T = string> = {
  jsonValue?: Field<T>;
};

export type BioListingTaxonomyItem = {
  id?: string;
  name?: string;
  displayName?: string;
  title?: BioListingJsonField;
};

export type BioListingOfficeItem = {
  id?: string;
  name?: string;
  displayName?: string;
};

export type BioListingAttorney = {
  id?: string;
  name?: string;
  url?: { path?: string };
  fullName?: BioListingJsonField;
  preferredName?: BioListingJsonField;
  jobTitle?: BioListingJsonField;
  summary?: BioListingJsonField;
  phone?: BioListingJsonField;
  email?: BioListingJsonField;
  headshot?: { jsonValue?: ImageField };
  office?: {
    targetItem?: BioListingOfficeItem | null;
  };
  practiceAreas?: {
    targetItems?: BioListingTaxonomyItem[];
  };
};

export type BioListingDatasource = {
  title?: BioListingJsonField;
  intro?: { jsonValue?: RichTextField };
  emptyResultsText?: BioListingJsonField;
  showFilters?: BioListingJsonField<boolean | string>;
  biosRoot?: {
    targetItem?: {
      id?: string;
      children?: {
        results?: BioListingAttorney[];
      };
    } | null;
  };
};

export type BioListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: BioListingDatasource | null;
    };
  };
  isPageEditing?: boolean;
};
