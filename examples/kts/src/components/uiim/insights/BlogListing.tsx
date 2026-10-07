'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  RichText as ContentSdkRichText,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ChevronRight, Newspaper, Search, UserRound, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type { BlogListingBlog, BlogListingProps } from './blog-listing.props';
import {
  blogImageFallback,
  isBlogListingChild,
  resolveBlogTopicMeta,
  type BlogSpecialty,
  type RelatedLawyer,
} from './blog-listing.taxonomy';

/** Shared with BioListing / MultiPromo card hover. */
const hoverSurfaceClassName =
  'transition-colors duration-300 hover:bg-white hover:text-neutral-950';

function fieldValue(field?: { jsonValue?: { value?: unknown } } | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function isChecked(field?: { jsonValue?: { value?: unknown } } | null): boolean {
  const value = field?.jsonValue?.value;
  return value === true || value === '1' || value === 'true';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function blogTitle(blog: BlogListingBlog): string {
  if (blog.displayName?.trim()) return blog.displayName.trim();
  return (blog.name || 'Blog').replace(/-/g, ' ');
}

function blogHref(blog: BlogListingBlog): string {
  const path = blog.url?.path?.trim();
  if (!path) return '#';
  return path.startsWith('/') ? path : `/${path}`;
}

function blogSummary(blog: BlogListingBlog): string {
  const raw = fieldValue(blog.detail);
  if (!raw) return '';
  return stripHtml(raw);
}

/** Pull a usable URL from Sitecore Image jsonValue (media, DAM, or raw XML/external). */
function sitecoreImageSrc(image?: BlogListingBlog['image']): string {
  const raw = image?.jsonValue as
    | {
        value?:
          | string
          | {
              src?: string;
              href?: string;
              url?: string;
            };
      }
    | undefined;
  const value = raw?.value;
  if (!value) return '';
  if (typeof value === 'string') {
    const fromAttr = value.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (fromAttr) return fromAttr.trim();
    if (/^https?:\/\//i.test(value.trim())) return value.trim();
    return '';
  }
  const src = (value.src || value.href || value.url || '').trim();
  return src;
}

type ResolvedBlog = {
  key: string;
  name: string;
  title: string;
  summary: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  specialties: BlogSpecialty[];
  lawyers: RelatedLawyer[];
  keywords: string[];
  searchText: string;
};

function resolveBlog(blog: BlogListingBlog): ResolvedBlog {
  const title = blogTitle(blog);
  const summary = blogSummary(blog);
  const meta = resolveBlogTopicMeta(blog.name, [title, summary, blog.name || ''].join(' '));
  const lawyerNames = meta.lawyers.map((lawyer) => lawyer.name);
  const fallback = blogImageFallback(blog.name);
  const fromSitecore = sitecoreImageSrc(blog.image);
  const imageSrc = fromSitecore || fallback?.src || '';
  const imageAlt = fallback?.alt || title;
  const searchText = [
    title,
    summary,
    blog.name || '',
    ...meta.specialties,
    ...meta.keywords,
    ...lawyerNames,
  ]
    .join(' ')
    .toLowerCase();

  return {
    key: blog.id || title,
    name: blog.name || '',
    title,
    summary,
    href: blogHref(blog),
    imageSrc,
    imageAlt,
    specialties: meta.specialties,
    lawyers: meta.lawyers,
    keywords: meta.keywords,
    searchText,
  };
}

const BlogListingEmpty: React.FC<{ message: string }> = ({ message }) => (
  <div className="border-border bg-muted/20 text-muted-foreground rounded-2xl border border-dashed px-6 py-12 text-center text-sm">
    {message}
  </div>
);

function HoverChevron({ className }: { className?: string }) {
  return (
    <ChevronRight
      aria-hidden
      className={cn(
        'size-5 shrink-0 transition-colors duration-300 group-hover:text-primary',
        className
      )}
    />
  );
}

function BlogImage({
  title,
  src,
  alt,
  className,
}: {
  title: string;
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-muted text-muted-foreground relative flex shrink-0 items-center justify-center overflow-hidden',
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          unoptimized={src.includes('images.unsplash.com')}
        />
      ) : (
        <Newspaper className="size-8 opacity-50" aria-hidden />
      )}
    </div>
  );
}

function SpecialtyTags({
  specialties,
  onSelect,
}: {
  specialties: BlogSpecialty[];
  onSelect?: (specialty: BlogSpecialty) => void;
}) {
  if (!specialties.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {specialties.map((label) => (
        <button
          key={label}
          type="button"
          onClick={(event) => {
            if (!onSelect) return;
            event.preventDefault();
            event.stopPropagation();
            onSelect(label);
          }}
          className={cn(
            'border-border rounded-md border px-2 py-0.5 text-xs',
            onSelect && 'hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function RelatedLawyers({ lawyers }: { lawyers: RelatedLawyer[] }) {
  if (!lawyers.length) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="text-muted-foreground inline-flex items-center gap-1.5 font-medium">
        <UserRound className="size-3.5 shrink-0" aria-hidden />
        Related counsel
      </span>
      {lawyers.map((lawyer) => (
        <Link
          key={lawyer.href}
          href={lawyer.href}
          onClick={(event) => event.stopPropagation()}
          className="text-primary font-medium underline-offset-2 hover:underline"
        >
          {lawyer.name}
        </Link>
      ))}
    </div>
  );
}

function RowItem({
  blog,
  onSpecialty,
}: {
  blog: ResolvedBlog;
  onSpecialty: (specialty: BlogSpecialty) => void;
}) {
  return (
    <li className={cn('group px-4 py-5 sm:px-6', hoverSurfaceClassName)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <Link href={blog.href} className="shrink-0 no-underline">
          <BlogImage
            title={blog.title}
            src={blog.imageSrc}
            alt={blog.imageAlt}
            className="aspect-[16/10] w-full rounded-xl sm:w-44"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={blog.href} className="no-underline">
            <h2 className="font-heading flex items-center gap-1 text-xl font-semibold tracking-tight">
              {blog.title}
              <HoverChevron />
            </h2>
          </Link>

          <div className="mt-2">
            <SpecialtyTags specialties={blog.specialties} onSelect={onSpecialty} />
          </div>

          {blog.summary && (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed opacity-70">{blog.summary}</p>
          )}

          <RelatedLawyers lawyers={blog.lawyers} />

          <Link
            href={blog.href}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary no-underline"
          >
            Read blog
            <HoverChevron className="size-4" />
          </Link>
        </div>
      </div>
    </li>
  );
}

function CardItem({
  blog,
  onSpecialty,
}: {
  blog: ResolvedBlog;
  onSpecialty: (specialty: BlogSpecialty) => void;
}) {
  return (
    <li
      className={cn(
        'group border-border bg-background flex h-full flex-col border p-5',
        hoverSurfaceClassName
      )}
    >
      <Link href={blog.href} className="no-underline">
        <BlogImage
          title={blog.title}
          src={blog.imageSrc}
          alt={blog.imageAlt}
          className="mb-5 aspect-[16/10] w-full rounded-none"
        />
        <h2 className="font-heading mb-2 flex items-center gap-1 text-xl font-semibold tracking-tight lg:text-2xl">
          {blog.title}
          <HoverChevron />
        </h2>
      </Link>

      <div className="mb-3">
        <SpecialtyTags specialties={blog.specialties} onSelect={onSpecialty} />
      </div>

      {blog.summary && (
        <p className="line-clamp-4 text-sm leading-relaxed opacity-70">{blog.summary}</p>
      )}

      {blog.lawyers.length > 0 ? (
        <div className="mt-auto pt-3">
          <RelatedLawyers lawyers={blog.lawyers} />
        </div>
      ) : null}
    </li>
  );
}

type LayoutMode = 'rows' | 'cards';

function BlogListingView({ props, layout }: { props: BlogListingProps; layout: LayoutMode }) {
  const { fields, params, isPageEditing: propEditing } = props;
  const { page } = useSitecore();
  const isEditing = propEditing ?? page.mode.isEditing;

  const datasource = fields?.data?.datasource;
  const blogs = (datasource?.blogsRoot?.targetItem?.children?.results ?? []).filter((blog) =>
    isBlogListingChild(blog.name)
  );

  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [lawyer, setLawyer] = useState('all');

  const resolved = useMemo(() => blogs.map(resolveBlog), [blogs]);

  const specialtyOptions = useMemo(() => {
    const set = new Set<BlogSpecialty>();
    for (const blog of resolved) {
      for (const item of blog.specialties) set.add(item);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [resolved]);

  const lawyerOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const blog of resolved) {
      for (const item of blog.lawyers) {
        map.set(item.href, item.name);
      }
    }
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [resolved]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const words = q.split(/\s+/).filter((word) => word.length > 1);

    return resolved
      .filter((blog) => {
        if (specialty !== 'all' && !blog.specialties.includes(specialty as BlogSpecialty)) {
          return false;
        }
        if (lawyer !== 'all' && !blog.lawyers.some((item) => item.href === lawyer)) {
          return false;
        }
        if (!words.length) return true;
        return words.every((word) => blog.searchText.includes(word));
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [lawyer, query, resolved, specialty]);

  if (!datasource) {
    return <NoDataFallback componentName="BlogListing" />;
  }

  const showFilters = isChecked(datasource.showFilters) || isEditing;
  const emptyText = fieldValue(datasource.emptyResultsText) || 'No blogs match your filters.';
  const sectionId = params?.RenderingIdentifier || 'blog-listing';
  const hasActiveFilters = query.trim() !== '' || specialty !== 'all' || lawyer !== 'all';

  const clearFilters = () => {
    setQuery('');
    setSpecialty('all');
    setLawyer('all');
  };

  const selectSpecialty = (value: BlogSpecialty) => {
    setSpecialty(value);
  };

  return (
    <section
      id={sectionId}
      data-component="BlogListing"
      data-variant={layout === 'cards' ? 'Cards' : 'Default'}
      className={cn('@container bg-background text-foreground', params?.styles)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="mb-8 max-w-3xl">
          {(fieldValue(datasource.title) || isEditing) && (
            <Text
              tag="h1"
              field={datasource.title?.jsonValue}
              className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
            />
          )}
          {(datasource.intro?.jsonValue?.value || isEditing) && (
            <div className="mt-4 text-pretty text-base leading-relaxed opacity-70 sm:text-lg">
              <ContentSdkRichText field={datasource.intro?.jsonValue} />
            </div>
          )}
        </header>

        {showFilters && (
          <div className="border-border bg-muted/20 mb-8 rounded-2xl border p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="relative block">
                <span className="sr-only">Search blogs</span>
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by topic, specialty, or lawyer (e.g. sanctions, Asay)"
                  className="bg-background h-11 pl-9"
                />
              </label>

              <label className="block">
                <span className="sr-only">Specialty</span>
                <select
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                >
                  <option value="all">All specialties</option>
                  {specialtyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="sr-only">Related lawyer</span>
                <select
                  value={lawyer}
                  onChange={(event) => setLawyer(event.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                >
                  <option value="all">All related lawyers</option>
                  {lawyerOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={!hasActiveFilters}
                onClick={clearFilters}
              >
                <X className="size-4" aria-hidden />
                Clear
              </Button>
            </div>

            {specialtyOptions.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick filters
                </span>
                {specialtyOptions.map((option) => {
                  const active = specialty === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSpecialty(active ? 'all' : option)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border/70 bg-background text-secondary-foreground hover:border-primary/35 hover:text-primary'
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="text-muted-foreground mt-3 text-sm">
              Showing {filtered.length} of {blogs.length} blogs
              {specialty !== 'all' ? (
                <>
                  {' '}
                  in <span className="font-medium text-foreground">{specialty}</span>
                </>
              ) : null}
              {lawyer !== 'all' ? (
                <>
                  {' '}
                  · counsel{' '}
                  <span className="font-medium text-foreground">
                    {lawyerOptions.find((option) => option.id === lawyer)?.label}
                  </span>
                </>
              ) : null}
            </p>
          </div>
        )}

        {filtered.length === 0 ? (
          <BlogListingEmpty
            message={
              isEditing && blogs.length === 0
                ? 'Select a Blogs Root page that contains blog children.'
                : emptyText
            }
          />
        ) : layout === 'cards' ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((blog) => (
              <CardItem key={blog.key} blog={blog} onSpecialty={selectSpecialty} />
            ))}
          </ul>
        ) : (
          <ul className="divide-border border-border divide-y overflow-hidden rounded-2xl border">
            {filtered.map((blog) => (
              <RowItem key={blog.key} blog={blog} onSpecialty={selectSpecialty} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export const Default: React.FC<BlogListingProps> = (props) => (
  <BlogListingView props={props} layout="rows" />
);

export const Cards: React.FC<BlogListingProps> = (props) => (
  <BlogListingView props={props} layout="cards" />
);
