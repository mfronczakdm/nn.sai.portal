import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

import type { BlogPost } from './types';

function formatPublishDate(isoOrRaw: string): string {
  const d = new Date(isoOrRaw);
  if (Number.isNaN(d.getTime())) {
    return isoOrRaw;
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(d);
}

function normalizeHref(path: string): string {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  const href = normalizeHref(post.url.path);
  const title = post.fields.Title.value;
  const summary = post.fields.Summary.value;
  const published = formatPublishDate(post.fields.PublishDate.value);

  return (
    <Card className="flex h-full flex-col overflow-hidden shadow-sm">
      <CardHeader className="space-y-2 pb-2">
        <Link
          href={href}
          className="font-heading text-xl font-semibold leading-snug text-foreground hover:underline"
        >
          {title}
        </Link>
        <p className="text-muted-foreground text-xs">{published}</p>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{summary}</p>
      </CardContent>
      <CardFooter className="mt-auto border-t pt-4">
        <Link
          href={href}
          className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Read more
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
