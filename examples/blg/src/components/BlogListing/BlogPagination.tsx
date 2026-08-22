'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type BlogPaginationProps = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function buildPageNumbers(totalPages: number, currentPage: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const win = 5;
  let start = Math.max(1, Math.min(currentPage - 2, totalPages - win + 1));
  const end = Math.min(totalPages, start + win - 1);
  start = Math.max(1, end - win + 1);

  const out: (number | 'ellipsis')[] = [];
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push('ellipsis');
  }
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) out.push('ellipsis');
    out.push(totalPages);
  }
  return out;
}

export function BlogPagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: BlogPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = useCallback(
    (page: number) => {
      const next = new URLSearchParams(searchParams?.toString() ?? '');
      if (page <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(page));
      }
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const pages = useMemo(
    () => buildPageNumbers(totalPages, currentPage),
    [currentPage, totalPages],
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row"
      aria-label="Blog pagination"
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage && currentPage <= 1}
          onClick={() => goToPage(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage && currentPage >= totalPages}
          onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {pages.map((entry, idx) =>
          entry === 'ellipsis' ? (
            <span key={`e-${idx}`} className="text-muted-foreground px-1 text-sm">
              …
            </span>
          ) : (
            <Button
              key={entry}
              type="button"
              size="sm"
              variant={entry === currentPage ? 'default' : 'outline'}
              className="min-w-9"
              onClick={() => goToPage(entry)}
            >
              {entry}
            </Button>
          ),
        )}
      </div>
    </nav>
  );
}
