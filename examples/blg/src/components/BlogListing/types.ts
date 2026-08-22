import type { ComponentRendering } from '@sitecore-content-sdk/nextjs';

export interface BlogPost {
  id: string;
  url: { path: string };
  fields: {
    Title: { value: string };
    Summary: { value: string };
    PublishDate: { value: string };
  };
}

export interface BlogListingPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string | null;
  startCursor: string | null;
}

export interface BlogListingResult {
  posts: BlogPost[];
  totalCount: number;
  pageInfo: BlogListingPageInfo;
}

export interface BlogListingProps {
  rendering?: ComponentRendering;
  fields?: {
    datasource?: {
      id?: string;
    };
  };
  /** Optional override for the GraphQL query string. */
  query?: string;
  /** Page size (default applied in the listing component: 9). */
  pageSize?: number;
  /** 1-based current page (default applied in the listing component: 1). */
  currentPage?: number;
}
