'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  FileText,
  Globe2,
  Loader2,
  MapPin,
  MessageSquareText,
  Mic2,
  Newspaper,
  Scale,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';

import type { ComponentProps } from '@/lib/component-props';
import {
  DEMO_TAXONOMY_CHANGE_EVENT,
  getPersonaCode,
  parseDemoUserTaxonomy,
  readStoredDemoTaxonomy,
} from '@/lib/demo-taxonomy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

import {
  itemMatchesQuery,
  itemMetadataLine,
  itemVisibleForDemoUser,
  lobs,
  normalizeQuery,
  perils,
  popularSearches,
  relevanceScore,
  RESULTS_PAGE_SIZE,
  searchCatalog,
  searchFacetLabels,
  selectAiSearchInsight,
  topics,
  type AiSearchInsight,
  type SearchLob,
  type SearchPeril,
  type SearchResultItem,
  type SearchTopic,
} from './data';

export type SearchResultsProps = {
  className?: string;
  disableUrlSync?: boolean;
  initialQuery?: string;
};

type SortMode = 'relevance' | 'az';

function resultIcon(lob: SearchLob) {
  switch (lob) {
    case 'lawyer':
      return UserRound;
    case 'insight':
      return Newspaper;
    case 'event':
      return CalendarDays;
    case 'podcast':
      return Mic2;
    case 'capability':
      return Scale;
    case 'office':
      return Building2;
    case 'career':
      return Briefcase;
    default:
      return FileText;
  }
}

function resultCta(lob: SearchLob): string {
  switch (lob) {
    case 'lawyer':
      return 'View bio';
    case 'insight':
      return 'Read insights';
    case 'event':
      return 'View event';
    case 'podcast':
      return 'Listen / open';
    case 'capability':
      return 'Explore practice';
    case 'office':
      return 'View office';
    case 'career':
      return 'View role';
    default:
      return 'Open page';
  }
}

function SearchFacetsPanel({
  selectedLobs,
  selectedPerils,
  selectedTopics,
  countsLobs,
  countsPerils,
  countsTopics,
  onToggleLob,
  onTogglePeril,
  onToggleTopic,
  activeFilterCount,
  clearFilters,
}: {
  selectedLobs: Set<SearchLob>;
  selectedPerils: Set<SearchPeril>;
  selectedTopics: Set<SearchTopic>;
  countsLobs: Record<SearchLob, number>;
  countsPerils: Record<SearchPeril, number>;
  countsTopics: Record<SearchTopic, number>;
  onToggleLob: (key: SearchLob) => void;
  onTogglePeril: (key: SearchPeril) => void;
  onToggleTopic: (key: SearchTopic) => void;
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
            {lobs.map((key) => (
              <label key={key} className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90">
                <Checkbox
                  checked={selectedLobs.has(key)}
                  onCheckedChange={() => onToggleLob(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{searchFacetLabels.lob[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">({countsLobs[key]})</span>
                </span>
              </label>
            ))}
          </div>
        </FacetSection>
        <FacetSection title="Practice area">
          <div className="flex flex-col gap-2.5">
            {perils.map((key) => (
              <label key={key} className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90">
                <Checkbox
                  checked={selectedPerils.has(key)}
                  onCheckedChange={() => onTogglePeril(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{searchFacetLabels.peril[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">({countsPerils[key]})</span>
                </span>
              </label>
            ))}
          </div>
        </FacetSection>
        <FacetSection title="Office / region" defaultOpen={false}>
          <div className="flex flex-col gap-2.5">
            {topics.map((key) => (
              <label key={key} className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90">
                <Checkbox
                  checked={selectedTopics.has(key)}
                  onCheckedChange={() => onToggleTopic(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{searchFacetLabels.topic[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">({countsTopics[key]})</span>
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

function ResultCard({ item }: { item: SearchResultItem }) {
  const meta = itemMetadataLine(item);
  const practiceLabels = item.perils.map((p) => searchFacetLabels.peril[p]).slice(0, 2);
  const Icon = resultIcon(item.lob);
  const isLawyer = item.lob === 'lawyer';

  return (
    <article
      className={cn(
        'group rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:border-primary/30 hover:shadow-md dark:ring-white/[0.05]',
        isLawyer && 'border-l-[3px] border-l-primary/70'
      )}
    >
      <Link
        href={item.href}
        className="flex flex-col gap-3 p-4 text-inherit no-underline sm:flex-row sm:items-start sm:gap-4 sm:p-5"
      >
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            isLawyer ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-md font-mono text-[10px] uppercase tracking-wide">
              {item.kbId}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">{searchFacetLabels.lob[item.lob]}</span>
            {item.isNew ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                Featured
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="mt-0.5 text-sm font-medium text-primary/90">{item.subtitle}</p>
          ) : null}
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{meta}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {practiceLabels.map((label) => (
              <span
                key={label}
                className="rounded-md border border-border/70 bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {label}
              </span>
            ))}
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {resultCta(item.lob)}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}

function AiQaPanel({ insight }: { insight: AiSearchInsight }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-secondary/40 p-5 shadow-sm ring-1 ring-primary/10"
      aria-labelledby="ai-qa-heading"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p id="ai-qa-heading" className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Matter-aware guidance
            </p>
            <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium leading-snug text-foreground">
                <span className="sr-only">Question: </span>
                {insight.question}
              </p>
            </div>
            <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{insight.headline}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{insight.answer}</p>
            {insight.stateCallout ? (
              <p className="inline-flex rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                {insight.stateCallout}
              </p>
            ) : null}
            <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90 marker:text-primary">
              {insight.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {insight.learnMoreHref ? (
              <Link
                href={insight.learnMoreHref}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary no-underline hover:underline"
              >
                {insight.learnMoreLabel ?? 'Continue'}
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        {insight.citations.length ? (
          <div className="space-y-2 border-t border-border/50 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Recommended people &amp; pages
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {insight.citations.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="flex h-full flex-col rounded-xl border border-border/70 bg-card px-3 py-3 text-inherit no-underline transition-colors hover:border-primary/35 hover:bg-primary/[0.03]"
                  >
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Briefcase className="size-3" aria-hidden />
                      {c.kbId ?? 'Resource'}
                    </span>
                    <span className="mt-1 text-sm font-semibold leading-snug text-foreground">{c.title}</span>
                    {c.excerpt ? (
                      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {c.excerpt}
                      </span>
                    ) : null}
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Open
                      <ArrowUpRight className="size-3" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SearchTips() {
  return (
    <div className="mt-4 grid gap-3 border-t border-border/50 pt-4 sm:grid-cols-3">
      {[
        {
          icon: UserRound,
          title: 'People first',
          body: 'Name a lawyer, practice, or city to land on Bios and offices in the content tree.',
        },
        {
          icon: Globe2,
          title: 'Situation search',
          body: 'Describe the matter—“Series B financing,” “AI board oversight”—for AI routing to people, insights, and webinars.',
        },
        {
          icon: CalendarDays,
          title: 'Learn while you connect',
          body: 'Filter webinars, CLE, podcasts, and alerts alongside bios so the right content supports the right counsel.',
        },
      ].map((tip) => (
        <div key={tip.title} className="flex gap-2.5 rounded-xl bg-background/60 px-3 py-2.5">
          <tip.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-xs font-semibold text-foreground">{tip.title}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{tip.body}</p>
          </div>
        </div>
      ))}
    </div>
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

  const [selectedLobs, setSelectedLobs] = useState<Set<SearchLob>>(new Set());
  const [selectedPerils, setSelectedPerils] = useState<Set<SearchPeril>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<SearchTopic>>(new Set());
  const [resultsPage, setResultsPage] = useState(1);
  const [demoTaxonomyRaw, setDemoTaxonomyRaw] = useState('');

  useEffect(() => {
    const readTaxonomy = () => {
      setDemoTaxonomyRaw(readStoredDemoTaxonomy() ?? '');
    };
    readTaxonomy();
    window.addEventListener(DEMO_TAXONOMY_CHANGE_EVENT, readTaxonomy);
    return () => {
      window.removeEventListener(DEMO_TAXONOMY_CHANGE_EVENT, readTaxonomy);
    };
  }, []);

  const activeDemoUserTaxonomy = useMemo(() => parseDemoUserTaxonomy(demoTaxonomyRaw), [demoTaxonomyRaw]);

  const activeCatalog = useMemo(
    () => searchCatalog.filter((item) => itemVisibleForDemoUser(item, activeDemoUserTaxonomy)),
    [activeDemoUserTaxonomy]
  );

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
  }, [query, selectedLobs, selectedPerils, selectedTopics, sort]);

  useEffect(() => {
    setResultsPage(1);
  }, [query, selectedLobs, selectedPerils, selectedTopics, sort]);

  const queryMatched = useMemo(
    () => activeCatalog.filter((item) => itemMatchesQuery(item, query)),
    [activeCatalog, query]
  );

  const countsLobs = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedPerils.size && !item.perils.some((p) => selectedPerils.has(p))) return false;
      if (selectedTopics.size && !item.topics.some((t) => selectedTopics.has(t))) return false;
      return true;
    });
    return Object.fromEntries(lobs.map((k) => [k, base.filter((i) => i.lob === k).length])) as Record<
      SearchLob,
      number
    >;
  }, [queryMatched, selectedPerils, selectedTopics]);

  const countsPerils = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedLobs.size && !selectedLobs.has(item.lob)) return false;
      if (selectedTopics.size && !item.topics.some((t) => selectedTopics.has(t))) return false;
      return true;
    });
    return Object.fromEntries(
      perils.map((k) => [k, base.filter((i) => i.perils.includes(k)).length])
    ) as Record<SearchPeril, number>;
  }, [queryMatched, selectedLobs, selectedTopics]);

  const countsTopics = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedLobs.size && !selectedLobs.has(item.lob)) return false;
      if (selectedPerils.size && !item.perils.some((p) => selectedPerils.has(p))) return false;
      return true;
    });
    return Object.fromEntries(
      topics.map((k) => [k, base.filter((i) => i.topics.includes(k)).length])
    ) as Record<SearchTopic, number>;
  }, [queryMatched, selectedLobs, selectedPerils]);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    let list = activeCatalog.filter((item) => itemMatchesQuery(item, q));

    if (selectedLobs.size) {
      list = list.filter((item) => selectedLobs.has(item.lob));
    }
    if (selectedPerils.size) {
      list = list.filter((item) => item.perils.some((p) => selectedPerils.has(p)));
    }
    if (selectedTopics.size) {
      list = list.filter((item) => item.topics.some((t) => selectedTopics.has(t)));
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
  }, [activeCatalog, activeDemoUserTaxonomy, query, selectedLobs, selectedPerils, selectedTopics, sort]);

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

  const activeFilterCount = selectedLobs.size + selectedPerils.size + selectedTopics.size;

  const clearFilters = () => {
    setSelectedLobs(new Set());
    setSelectedPerils(new Set());
    setSelectedTopics(new Set());
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
    selectedLobs,
    selectedPerils,
    selectedTopics,
    countsLobs,
    countsPerils,
    countsTopics,
    onToggleLob: (key: SearchLob) => toggle(setSelectedLobs, key),
    onTogglePeril: (key: SearchPeril) => toggle(setSelectedPerils, key),
    onToggleTopic: (key: SearchTopic) => toggle(setSelectedTopics, key),
    activeFilterCount,
    clearFilters,
  };

  const displayHeading = draft.trim() || qFromUrl.trim();
  const personaLabel = activeDemoUserTaxonomy ?? 'All visitors';
  const personaCode = activeDemoUserTaxonomy ? getPersonaCode(activeDemoUserTaxonomy) : null;

  return (
    <section
      className={cn(
        'min-h-[60vh] bg-gradient-to-b from-background via-background to-secondary/25 pb-16 pt-6 sm:pt-8',
        className
      )}
      aria-label="Site search results"
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
                placeholder="Search lawyers, practices, offices, insights… or describe your matter"
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Try searching
            </span>
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
          <SearchTips />
        </div>

        <header className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary/90">Cooley search</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {normalizeQuery(query) ? (
                  <>
                    Results for <span className="text-primary">&ldquo;{displayHeading}&rdquo;</span>
                  </>
                ) : (
                  'Find lawyers, insights & events'
                )}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Search by lawyer, practice, industry, or matter narrative. Results link into People, Media and
                Insight, Practices, and webinars—then refine by type, practice area, and office.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Demo context:</span> {personaLabel}
              {personaCode ? <span className="ml-1 text-primary">({personaCode})</span> : null}
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
            {aiInsight ? <AiQaPanel insight={aiInsight} /> : null}

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
                    ' — try a starter search or describe your matter'
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
                {[...selectedLobs].map((key) => (
                  <Badge
                    key={`lob-${key}`}
                    variant="secondary"
                    className="cursor-pointer gap-1 rounded-full pr-1.5 hover:bg-secondary/80"
                    onClick={() => toggle(setSelectedLobs, key)}
                  >
                    {searchFacetLabels.lob[key]}
                    <X className="size-3" aria-hidden />
                  </Badge>
                ))}
                {[...selectedPerils].map((key) => (
                  <Badge
                    key={`peril-${key}`}
                    variant="secondary"
                    className="cursor-pointer gap-1 rounded-full pr-1.5 hover:bg-secondary/80"
                    onClick={() => toggle(setSelectedPerils, key)}
                  >
                    {searchFacetLabels.peril[key]}
                    <X className="size-3" aria-hidden />
                  </Badge>
                ))}
                {[...selectedTopics].map((key) => (
                  <Badge
                    key={`topic-${key}`}
                    variant="secondary"
                    className="cursor-pointer gap-1 rounded-full pr-1.5 hover:bg-secondary/80"
                    onClick={() => toggle(setSelectedTopics, key)}
                  >
                    {searchFacetLabels.topic[key]}
                    <X className="size-3" aria-hidden />
                  </Badge>
                ))}
              </div>
            ) : null}

            {filtered.length > 0 ? (
              <>
                <div className="mt-6 flex flex-col gap-4">
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
                <p className="text-sm font-medium text-secondary-foreground">No results for that combination.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try &ldquo;Who should I talk to about a Series B venture financing?,&rdquo; &ldquo;AI governance
                  webinar,&rdquo; or &ldquo;Life sciences IPO counsel.&rdquo;
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
