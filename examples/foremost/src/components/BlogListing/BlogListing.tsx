import { Suspense, type ReactElement } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { BlogCard } from './BlogCard';
import { BlogPagination } from './BlogPagination';
import { fetchBlogPosts } from './blog-listing.query';
import type { BlogListingProps } from './types';

/** In-process cursor cache: `${datasourcePath}:${pageSize}:${page}` → endCursor after that page. */
const endCursorByPage = new Map<string, string | null>();

function cacheKey(datasourcePath: string, pageSize: number, pageIndex: number): string {
  return `${datasourcePath}:${pageSize}:${pageIndex}`;
}

async function resolveAfterCursor(
  query: string | undefined,
  datasourcePath: string,
  language: string,
  pageSize: number,
  targetPage: number,
): Promise<string | null | undefined> {
  if (targetPage <= 1) {
    return undefined;
  }
  let after: string | null | undefined;
  for (let p = 1; p < targetPage; p += 1) {
    const key = cacheKey(datasourcePath, pageSize, p);
    if (endCursorByPage.has(key)) {
      after = endCursorByPage.get(key) ?? undefined;
    } else {
      const res = await fetchBlogPosts({
        query,
        datasourcePath,
        language,
        pageSize,
        after: after ?? null,
      });
      endCursorByPage.set(key, res.pageInfo.endCursor ?? null);
      after = res.pageInfo.endCursor ?? undefined;
    }
  }
  return after ?? undefined;
}

export function BlogListingSkeleton(): ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 h-4 w-72 max-w-full rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="border-border flex min-h-[220px] flex-col rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <Skeleton className="mb-3 h-7 w-4/5" />
            <Skeleton className="mb-4 h-3 w-28" />
            <Skeleton className="mb-2 h-3 w-full" />
            <Skeleton className="mb-2 h-3 w-full" />
            <Skeleton className="mb-auto h-3 w-2/3" />
            <Skeleton className="mt-6 h-9 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function BlogListingContent(props: BlogListingProps): Promise<ReactElement> {
  const pageSize = props.pageSize ?? 9;
  // TODO: When using URL `?page=` with BlogPagination, pass `currentPage` from the route (e.g. parsed `searchParams`) so the grid matches the query string.
  const currentPage = props.currentPage ?? 1;
  // TODO: Wire language from Sitecore / next-intl request context instead of hardcoding.
  const language = 'en';
  const datasourcePath =
    props.rendering?.dataSource ?? props.fields?.datasource?.id ?? '/sitecore/content/Home/Blog';
  const gqlQuery = props.query;

  const after = await resolveAfterCursor(gqlQuery, datasourcePath, language, pageSize, currentPage);

  const result = await fetchBlogPosts({
    query: gqlQuery,
    datasourcePath,
    language,
    pageSize,
    after: after ?? null,
  });

  endCursorByPage.set(
    cacheKey(datasourcePath, pageSize, currentPage),
    result.pageInfo.endCursor ?? null,
  );

  const { posts, totalCount, pageInfo } = result;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (posts.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">No blog posts found.</p>
        <Suspense fallback={null}>
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={pageInfo.hasNextPage}
            hasPreviousPage={pageInfo.hasPreviousPage}
          />
        </Suspense>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-muted-foreground mb-6 text-sm">
        Showing page {currentPage} of {totalPages} — {totalCount} total posts
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      <Suspense fallback={null}>
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={pageInfo.hasNextPage}
          hasPreviousPage={pageInfo.hasPreviousPage}
        />
      </Suspense>
    </section>
  );
}

export default function BlogListing(props: BlogListingProps): ReactElement {
  return (
    <Suspense fallback={<BlogListingSkeleton />}>
      <BlogListingContent {...props} />
    </Suspense>
  );
}
