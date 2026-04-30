'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  FileText,
  Loader2,
  Package,
  Search,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';

import type { ComponentProps } from '@/lib/component-props';
import { DEMO_TAXONOMY_CHANGE_EVENT, DEMO_TAXONOMY_STORAGE_KEY } from '@/lib/demo-taxonomy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import {
  brands,
  categories,
  contentTypes,
  getDefaultCardImage,
  itemMatchesQuery,
  itemMetadataLine,
  itemVisibleForDemoUser,
  normalizeQuery,
  parseDemoUserTaxonomy,
  popularSearches,
  relevanceScore,
  RESULTS_PAGE_SIZE,
  searchCatalog,
  searchFacetLabels,
  selectAiSearchInsight,
  supplementalResultsForDemoUserTaxonomy,
  type SearchBrand,
  type SearchCategory,
  type SearchContentType,
  type SearchResultItem,
} from './data';

export type SearchResultsProps = {
  className?: string;
  disableUrlSync?: boolean;
  initialQuery?: string;
};

type SortMode = 'relevance' | 'az';

function SearchFacetsPanel({
  selectedTypes,
  selectedCategories,
  selectedBrands,
  countsTypes,
  countsCategories,
  countsBrands,
  onToggleType,
  onToggleCategory,
  onToggleBrand,
  activeFilterCount,
  clearFilters,
}: {
  selectedTypes: Set<SearchContentType>;
  selectedCategories: Set<SearchCategory>;
  selectedBrands: Set<SearchBrand>;
  countsTypes: Record<SearchContentType, number>;
  countsCategories: Record<SearchCategory, number>;
  countsBrands: Record<SearchBrand, number>;
  onToggleType: (key: SearchContentType) => void;
  onToggleCategory: (key: SearchCategory) => void;
  onToggleBrand: (key: SearchBrand) => void;
  activeFilterCount: number;
  clearFilters: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm dark:ring-white/[0.06]">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
        <span className="text-sm font-semibold tracking-tight text-foreground">Refine results</span>
        {activeFilterCount > 0 ? (
          <Button type="button" variant="ghost" size="sm" className="h-8 text-primary" onClick={clearFilters}>
            Clear all
          </Button>
        ) : null}
      </div>
      <div className="max-h-[min(70vh,40rem)] overflow-y-auto px-2">
        <FacetSection title="Content type">
          <div className="flex flex-col gap-2.5">
            {contentTypes.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
              >
                <Checkbox
                  checked={selectedTypes.has(key)}
                  onCheckedChange={() => onToggleType(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{searchFacetLabels.contentType[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">({countsTypes[key]})</span>
                </span>
              </label>
            ))}
          </div>
        </FacetSection>
        <FacetSection title="Product family">
          <div className="flex flex-col gap-2.5">
            {categories.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
              >
                <Checkbox
                  checked={selectedCategories.has(key)}
                  onCheckedChange={() => onToggleCategory(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{searchFacetLabels.category[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">({countsCategories[key]})</span>
                </span>
              </label>
            ))}
          </div>
        </FacetSection>
        <FacetSection title="Brand" defaultOpen={false}>
          <div className="flex flex-col gap-2.5">
            {brands.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
              >
                <Checkbox
                  checked={selectedBrands.has(key)}
                  onCheckedChange={() => onToggleBrand(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{searchFacetLabels.brand[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">({countsBrands[key]})</span>
                </span>
              </label>
            ))}
          </div>
        </FacetSection>
      </div>
    </div>
  );
}

function FacetSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-border/60 py-3 last:border-b-0">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground outline-none [&[data-state=open]_svg]:rotate-180">
        {title}
        <ChevronDown className="size-4 shrink-0 text-primary transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

const contentTypeIcons: Record<SearchContentType, typeof Package> = {
  product: Package,
  featuredArticle: BookOpen,
  technicalResource: Wrench,
  productManual: FileText,
};

function ctaLabel(item: SearchResultItem): string {
  switch (item.contentType) {
    case 'product':
      return 'View product';
    case 'featuredArticle':
      return 'Read article';
    case 'technicalResource':
      return 'Open resource';
    case 'productManual':
      return 'View manual';
    default:
      return 'Open';
  }
}

function ResultCard({ item }: { item: SearchResultItem }) {
  const img = item.imageSrc ?? getDefaultCardImage();
  const Icon = contentTypeIcons[item.contentType];
  const meta = itemMetadataLine(item);
  const brandLine = item.brands.map((b) => searchFacetLabels.brand[b]).join(' · ');

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md dark:ring-white/[0.05]">
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col text-inherit no-underline"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={img}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
          {item.isNew ? (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow">
              New
            </span>
          ) : null}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
              <Icon className="size-3.5 text-primary" aria-hidden />
              {searchFacetLabels.contentType[item.contentType]}
            </span>
            {item.priceLabel ? (
              <span className="rounded-full bg-primary/95 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow">
                {item.priceLabel}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{meta}</p>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-md bg-secondary/80 px-2 py-0.5 font-medium text-secondary-foreground">
              {brandLine}
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {ctaLabel(item)}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </a>
    </article>
  );
}

export const SearchResults: FC<SearchResultsProps> = ({
  className,
  disableUrlSync = false,
  initialQuery = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(() =>
    disableUrlSync ? normalizeQuery(initialQuery) : normalizeQuery(qFromUrl)
  );
  const [draft, setDraft] = useState(() => (disableUrlSync ? initialQuery : qFromUrl));
  const [sort, setSort] = useState<SortMode>('relevance');
  const [isSearching, setIsSearching] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<Set<SearchContentType>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<SearchCategory>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<SearchBrand>>(new Set());
  const [resultsPage, setResultsPage] = useState(1);
  const [demoTaxonomyRaw, setDemoTaxonomyRaw] = useState('');

  useEffect(() => {
    const readTaxonomy = () => {
      setDemoTaxonomyRaw(typeof window !== 'undefined' ? (window.localStorage.getItem(DEMO_TAXONOMY_STORAGE_KEY) ?? '') : '');
    };
    readTaxonomy();
    window.addEventListener(DEMO_TAXONOMY_CHANGE_EVENT, readTaxonomy);
    return () => {
      window.removeEventListener(DEMO_TAXONOMY_CHANGE_EVENT, readTaxonomy);
    };
  }, []);

  const activeDemoUserTaxonomy = useMemo(() => parseDemoUserTaxonomy(demoTaxonomyRaw), [demoTaxonomyRaw]);

  const activeCatalog = useMemo(() => {
    const merged = activeDemoUserTaxonomy
      ? [...supplementalResultsForDemoUserTaxonomy(activeDemoUserTaxonomy), ...searchCatalog]
      : searchCatalog;
    return merged.filter((item) => itemVisibleForDemoUser(item, activeDemoUserTaxonomy));
  }, [activeDemoUserTaxonomy]);

  const toggle = useCallback(<T extends string>(set: Dispatch<SetStateAction<Set<T>>>, v: T) => {
    set((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }, []);

  useEffect(() => {
    if (disableUrlSync) return;
    setDraft(qFromUrl);
    setQuery(normalizeQuery(qFromUrl));
  }, [disableUrlSync, qFromUrl]);

  useEffect(() => {
    setIsSearching(true);
    const t = window.setTimeout(() => setIsSearching(false), 220);
    return () => window.clearTimeout(t);
  }, [query, selectedTypes, selectedCategories, selectedBrands, sort]);

  useEffect(() => {
    setResultsPage(1);
  }, [query, selectedTypes, selectedCategories, selectedBrands, sort]);

  const queryMatched = useMemo(
    () => activeCatalog.filter((item) => itemMatchesQuery(item, query)),
    [activeCatalog, query]
  );

  const countsTypes = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedCategories.size && !item.categories.some((c) => selectedCategories.has(c))) return false;
      if (selectedBrands.size && !item.brands.some((b) => selectedBrands.has(b))) return false;
      return true;
    });
    return Object.fromEntries(
      contentTypes.map((k) => [k, base.filter((i) => i.contentType === k).length])
    ) as Record<SearchContentType, number>;
  }, [queryMatched, selectedCategories, selectedBrands]);

  const countsCategories = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedTypes.size && !selectedTypes.has(item.contentType)) return false;
      if (selectedBrands.size && !item.brands.some((b) => selectedBrands.has(b))) return false;
      return true;
    });
    return Object.fromEntries(
      categories.map((k) => [k, base.filter((i) => i.categories.includes(k)).length])
    ) as Record<SearchCategory, number>;
  }, [queryMatched, selectedTypes, selectedBrands]);

  const countsBrands = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedTypes.size && !selectedTypes.has(item.contentType)) return false;
      if (selectedCategories.size && !item.categories.some((c) => selectedCategories.has(c))) return false;
      return true;
    });
    return Object.fromEntries(
      brands.map((k) => [k, base.filter((i) => i.brands.includes(k)).length])
    ) as Record<SearchBrand, number>;
  }, [queryMatched, selectedTypes, selectedCategories]);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    let list = activeCatalog.filter((item) => itemMatchesQuery(item, q));

    if (selectedTypes.size) {
      list = list.filter((item) => selectedTypes.has(item.contentType));
    }
    if (selectedCategories.size) {
      list = list.filter((item) => item.categories.some((c) => selectedCategories.has(c)));
    }
    if (selectedBrands.size) {
      list = list.filter((item) => item.brands.some((b) => selectedBrands.has(b)));
    }

    const sorted = [...list];
    if (sort === 'az') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        const ra = relevanceScore(a, q, activeDemoUserTaxonomy);
        const rb = relevanceScore(b, q, activeDemoUserTaxonomy);
        if (rb !== ra) return rb - ra;
        return a.title.localeCompare(b.title);
      });
    }
    return sorted;
  }, [activeCatalog, activeDemoUserTaxonomy, query, selectedTypes, selectedCategories, selectedBrands, sort]);

  const resultsTotalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PAGE_SIZE));
  const safeResultsPage = Math.min(resultsPage, resultsTotalPages);
  const pagedResults = useMemo(() => {
    const start = (safeResultsPage - 1) * RESULTS_PAGE_SIZE;
    return filtered.slice(start, start + RESULTS_PAGE_SIZE);
  }, [filtered, safeResultsPage]);

  useEffect(() => {
    if (resultsPage > resultsTotalPages) setResultsPage(resultsTotalPages);
  }, [resultsPage, resultsTotalPages]);

  const aiInsight = useMemo(
    () => selectAiSearchInsight(query, activeDemoUserTaxonomy),
    [query, activeDemoUserTaxonomy]
  );

  const activeFilterCount = selectedTypes.size + selectedCategories.size + selectedBrands.size;

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
  };

  const syncUrl = useCallback(
    (qRaw: string) => {
      if (disableUrlSync) return;
      const trimmed = qRaw.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set('q', trimmed);
      else params.delete('q');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [disableUrlSync, pathname, router, searchParams]
  );

  const runSearch = useCallback(() => {
    const trimmed = draft.trim();
    setQuery(normalizeQuery(trimmed));
    syncUrl(trimmed);
  }, [draft, syncUrl]);

  const applyPopular = (term: string) => {
    setDraft(term);
    setQuery(normalizeQuery(term));
    syncUrl(term);
  };

  const clearSearchField = () => {
    setDraft('');
    setQuery('');
    syncUrl('');
  };

  const facetPanelProps = {
    selectedTypes,
    selectedCategories,
    selectedBrands,
    countsTypes,
    countsCategories,
    countsBrands,
    onToggleType: (key: SearchContentType) => toggle(setSelectedTypes, key),
    onToggleCategory: (key: SearchCategory) => toggle(setSelectedCategories, key),
    onToggleBrand: (key: SearchBrand) => toggle(setSelectedBrands, key),
    activeFilterCount,
    clearFilters,
  };

  const displayHeading = draft.trim() || qFromUrl.trim();
  const personaLabel = activeDemoUserTaxonomy ?? 'All personas';

  return (
    <section
      className={cn(
        'min-h-[60vh] bg-gradient-to-b from-background via-background to-secondary/25 pb-16 pt-6 sm:pt-8',
        className
      )}
      aria-label="Search results"
    >
      <div className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-md dark:bg-card/50 dark:ring-white/[0.06] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary"
                aria-hidden
              />
              <input
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    runSearch();
                  }
                }}
                placeholder="Search products, articles, manuals, and technical resources…"
                className="h-12 w-full rounded-xl border border-border/80 bg-background pl-11 pr-10 text-sm text-foreground shadow-inner outline-none ring-primary/20 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="off"
              />
              {draft ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                  onClick={clearSearchField}
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            <Button type="button" className="h-12 shrink-0 rounded-xl px-8 font-semibold shadow-sm" onClick={runSearch}>
              Search
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Popular</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => applyPopular(term)}
                className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/35 hover:bg-primary/5 hover:text-primary"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <header className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary/90">Dwyer Omega</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {normalizeQuery(query) ? (
                  <>
                    Results for <span className="text-primary">&ldquo;{displayHeading}&rdquo;</span>
                  </>
                ) : (
                  'Instrument search'
                )}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Faceted navigation mirrors a modern commerce experience: filter by content type, product family, and
                brand. Switch the demo user to see different personalized rows and AI guidance.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Demo persona:</span> {personaLabel}
            </div>
          </div>
        </header>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
          <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[min(100%,19rem)] xl:w-72">
            <div className="hidden lg:block">
              <SearchFacetsPanel {...facetPanelProps} />
            </div>
            <div className="lg:hidden">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-sm">
                  Filters
                  {activeFilterCount > 0 ? (
                    <Badge variant="secondary" className="rounded-full">
                      {activeFilterCount}
                    </Badge>
                  ) : null}
                  <ChevronDown className="size-4 text-primary opacity-80" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <SearchFacetsPanel {...facetPanelProps} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            {aiInsight ? (
              <section
                className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-background to-cyan-500/[0.06] p-5 shadow-sm ring-1 ring-violet-500/10"
                aria-labelledby="ai-insight-heading"
              >
                <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-2xl" />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow-md">
                    <Sparkles className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p id="ai-insight-heading" className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
                      AI suggestion
                    </p>
                    <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{aiInsight.headline}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{aiInsight.body}</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90 marker:text-primary">
                      {aiInsight.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <a
                      href={aiInsight.learnMoreHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {aiInsight.learnMoreLabel ?? 'Learn more'}
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </div>
                </div>
              </section>
            ) : null}

            <div
              className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
                aiInsight ? 'mt-8' : 'mt-0'
              )}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSearching ? <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden /> : null}
                <span>
                  <strong className="font-semibold text-foreground">{filtered.length}</strong>{' '}
                  {filtered.length === 1 ? 'result' : 'results'}
                  {normalizeQuery(query) ? (
                    <>
                      {' '}
                      for &ldquo;<span className="text-foreground">{displayHeading}</span>&rdquo;
                    </>
                  ) : (
                    ' — search or pick a popular term'
                  )}
                </span>
              </div>
              <label className="flex items-center gap-2 text-sm text-secondary-foreground">
                <span className="sr-only">Sort by</span>
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none ring-primary/20 focus:ring-2"
                >
                  <option value="relevance">Best match</option>
                  <option value="az">Title A–Z</option>
                </select>
              </label>
            </div>

            {activeFilterCount > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {[...selectedTypes].map((key) => (
                  <Badge
                    key={`t-${key}`}
                    variant="secondary"
                    className="cursor-pointer gap-1 rounded-full pr-1.5 hover:bg-secondary/80"
                    onClick={() => toggle(setSelectedTypes, key)}
                  >
                    {searchFacetLabels.contentType[key]}
                    <X className="size-3" aria-hidden />
                  </Badge>
                ))}
                {[...selectedCategories].map((key) => (
                  <Badge
                    key={`c-${key}`}
                    variant="secondary"
                    className="cursor-pointer gap-1 rounded-full pr-1.5 hover:bg-secondary/80"
                    onClick={() => toggle(setSelectedCategories, key)}
                  >
                    {searchFacetLabels.category[key]}
                    <X className="size-3" aria-hidden />
                  </Badge>
                ))}
                {[...selectedBrands].map((key) => (
                  <Badge
                    key={`b-${key}`}
                    variant="secondary"
                    className="cursor-pointer gap-1 rounded-full pr-1.5 hover:bg-secondary/80"
                    onClick={() => toggle(setSelectedBrands, key)}
                  >
                    {searchFacetLabels.brand[key]}
                    <X className="size-3" aria-hidden />
                  </Badge>
                ))}
              </div>
            ) : null}

            {filtered.length > 0 ? (
              <>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {pagedResults.map((item) => (
                    <ResultCard key={item.id} item={item} />
                  ))}
                </div>
                {filtered.length > RESULTS_PAGE_SIZE ? (
                  <nav
                    className="mt-8 flex flex-col items-stretch justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center"
                    aria-label="Paged search results"
                  >
                    <p className="text-sm text-muted-foreground">
                      Showing{' '}
                      <span className="font-semibold tabular-nums text-foreground">
                        {(safeResultsPage - 1) * RESULTS_PAGE_SIZE + 1}
                      </span>
                      –
                      <span className="font-semibold tabular-nums text-foreground">
                        {Math.min(safeResultsPage * RESULTS_PAGE_SIZE, filtered.length)}
                      </span>{' '}
                      of <span className="font-semibold tabular-nums text-foreground">{filtered.length}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-w-[5.5rem] rounded-lg"
                        disabled={safeResultsPage <= 1}
                        onClick={() => setResultsPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <span className="px-2 text-sm tabular-nums text-secondary-foreground">
                        Page {safeResultsPage} of {resultsTotalPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-w-[5.5rem] rounded-lg"
                        disabled={safeResultsPage >= resultsTotalPages}
                        onClick={() => setResultsPage((p) => Math.min(resultsTotalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </nav>
                ) : null}
              </>
            ) : (
              <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/25 px-6 py-12 text-center">
                <p className="text-sm font-medium text-secondary-foreground">No matches for that combination.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing filters or a phrase like &ldquo;Pressure regulators&rdquo;, &ldquo;Data loggers&rdquo;, or
                  &ldquo;IIoT&rdquo;.
                </p>
                <Button type="button" variant="secondary" className="mt-5 rounded-lg" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export const Default = (props: ComponentProps) => (
  <SearchResults className={typeof props.params?.styles === 'string' ? props.params.styles : undefined} />
);
