import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { TaxonomyTopicReference } from '@/lib/taxonomy-topic';

export type KnowledgeListingMode = 'Recently Updated' | 'Recently Viewed' | 'Favorites';

export type KnowledgeArticleListItem = {
  id: string;
  name: string;
  path?: string;
  url?: string | { path?: string };
  updatedDate?: string;
  title?: { jsonValue?: Field<string> } | Field<string>;
  kbId?: { jsonValue?: Field<string> } | Field<string>;
  purpose?: { jsonValue?: RichTextField } | RichTextField;
  lob?: {
    targetItems?: TaxonomyTopicReference[];
  };
  perilType?: {
    targetItems?: TaxonomyTopicReference[];
  };
  /** Parsed from Knowledge Article rating fields (Edge) */
  averageRating?: number;
  positiveCount?: number;
  totalRatings?: number;
  /** Layout-service expanded Multilist shape (fallback without ComponentQuery) */
  fields?: {
    Title?: Field<string>;
    'KB-ID'?: Field<string>;
    Purpose?: RichTextField;
    LOB?: TaxonomyTopicReference[];
    'Peril type'?: TaxonomyTopicReference[];
  };
};

export type KnowledgeListingDatasource = {
  title?: { jsonValue?: Field<string> };
  description?: { jsonValue?: Field<string> };
  maxItems?: { jsonValue?: Field<string | number> };
  listingMode?: { jsonValue?: Field<string> };
  articles?: {
    targetItems?: KnowledgeArticleListItem[];
  };
  /** Flat layout-service shape fallbacks */
  Title?: Field<string>;
  Description?: Field<string>;
  MaxItems?: Field<string | number>;
  ListingMode?: Field<string>;
  /** Unused — listing is selected dynamically from Edge */
  FeaturedArticles?: KnowledgeArticleListItem[];
};

export type KnowledgeListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: KnowledgeListingDatasource | null;
    };
  } & KnowledgeListingDatasource;
  isPageEditing?: boolean;
};
