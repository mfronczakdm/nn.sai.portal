import { GraphQLRequestClient } from '@sitecore-content-sdk/nextjs/client';

import type { BlogListingResult, BlogPost } from './types';

/**
 * GraphQL client lives on the `client` entry in this SDK version
 * (`@sitecore-content-sdk/nextjs/graphql` is not listed in package exports here).
 */
function createBlogGraphClient(): GraphQLRequestClient | null {
  const endpoint = process.env.SITECORE_GRAPHQL_ENDPOINT;
  const apiKey = process.env.SITECORE_API_KEY;
  if (!endpoint || !apiKey) {
    return null;
  }
  return new GraphQLRequestClient(endpoint, { apiKey });
}

async function withRetries<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === attempts - 1) {
        break;
      }
    }
  }
  throw lastError;
}

/** GraphQL query for blog children under a datasource item (cursor pagination). */
export const DEFAULT_BLOG_LISTING_QUERY = /* GraphQL */ `
  query BlogListing($datasource: String!, $language: String!, $first: Int!, $after: String) {
    item(path: $datasource, language: $language) {
      children(
        first: $first
        after: $after
        where: {
          AND: [
            {
              name: "_templates"
              operator: CONTAINS
              # TODO: Replace YOUR_BLOG_TEMPLATE_ID with your real blog post template item ID (GUID string).
              value: "YOUR_BLOG_TEMPLATE_ID"
            }
          ]
        }
      ) {
        total
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        results {
          id
          url {
            path
          }
          Title: field(name: "Title") {
            value
          }
          Summary: field(name: "Summary") {
            value
          }
          PublishDate: field(name: "PublishDate") {
            value
          }
        }
      }
    }
  }
`;

interface BlogListingQueryResponse {
  item?: {
    children?: {
      total?: number;
      pageInfo?: {
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
        endCursor?: string | null;
        startCursor?: string | null;
      };
      results?: RawBlogRow[];
    };
  };
}

interface RawBlogRow {
  id?: string;
  url?: { path?: string };
  Title?: { value?: string | null };
  Summary?: { value?: string | null };
  PublishDate?: { value?: string | null };
}

function normalizePost(row: RawBlogRow): BlogPost {
  return {
    id: row.id ?? '',
    url: { path: row.url?.path ?? '' },
    fields: {
      Title: { value: row.Title?.value ?? '' },
      Summary: { value: row.Summary?.value ?? '' },
      PublishDate: { value: row.PublishDate?.value ?? '' },
    },
  };
}

export type FetchBlogPostsArgs = {
  query?: string;
  datasourcePath: string;
  language: string;
  pageSize: number;
  after?: string | null;
};

export async function fetchBlogPosts({
  query = DEFAULT_BLOG_LISTING_QUERY,
  datasourcePath,
  language,
  pageSize,
  after,
}: FetchBlogPostsArgs): Promise<BlogListingResult> {
  const client = createBlogGraphClient();
  if (!client) {
    return {
      posts: [],
      totalCount: 0,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: null,
        startCursor: null,
      },
    };
  }

  const variables: {
    datasource: string;
    language: string;
    first: number;
    after: string | null;
  } = {
    datasource: datasourcePath,
    language,
    first: pageSize,
    after: after ?? null,
  };

  const data = await withRetries(() =>
    client.request<BlogListingQueryResponse>(query, variables),
  );

  const connection = data?.item?.children;
  const rawPosts = connection?.results ?? [];

  return {
    posts: rawPosts.map((row) => normalizePost(row)),
    totalCount: typeof connection?.total === 'number' ? connection.total : rawPosts.length,
    pageInfo: {
      hasNextPage: Boolean(connection?.pageInfo?.hasNextPage),
      hasPreviousPage: Boolean(connection?.pageInfo?.hasPreviousPage),
      endCursor: connection?.pageInfo?.endCursor ?? null,
      startCursor: connection?.pageInfo?.startCursor ?? null,
    },
  };
}
