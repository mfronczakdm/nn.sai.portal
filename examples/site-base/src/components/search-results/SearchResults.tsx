'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import {
  ArrowUpRight,
  Briefcase,
  ChevronDown,
  Factory,
  FileText,
  Globe2,
  Layers,
  Loader2,
  MessageSquareText,
  Bookmark,
  MapPin,
  Search,
  Sparkles,
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
  RESULTS_PAGE_SIZE,
  getSearchPack,
  itemMatchesQuery,
  itemMetadataLine,
  itemVisibleForDemoUser,
  listSearchPackSiteNames,
  normalizeQuery,
  relevanceScore,
  resolveSearchSiteName,
  selectAiSearchInsight,
  toSiteAwareHref,
  type AiSearchInsight,
  type SearchResultItem,
  type SearchSitePack,
} from '@/lib/search-packs';

export type SearchResultsLayout = 'default' | 'directory';

export type SearchResultsProps = {
  className?: string;
  disableUrlSync?: boolean;
  initialQuery?: string;
  /** Override Sitecore/URL site resolution (tests). */
  siteName?: string | null;
  /** directory = Atlanta Apparel exhibitor/event results. Default is unchanged. */
  layout?: SearchResultsLayout;
};

type SortMode = 'relevance' | 'az';

function resultIcon(lob: string, pack: SearchSitePack) {
  return pack.iconByLob[lob] || FileText;
}

function resultCta(lob: string, pack: SearchSitePack): string {
  return pack.ctaByLob[lob] || pack.defaultCta;
}

const TIP_ICONS = [Layers, Globe2, Factory] as const;

function SearchFacetsPanel({
  pack,
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
  heading = 'Refine results',
  sharp = false,
}: {
  pack: SearchSitePack;
  selectedLobs: Set<string>;
  selectedPerils: Set<string>;
  selectedTopics: Set<string>;
  countsLobs: Record<string, number>;
  countsPerils: Record<string, number>;
  countsTopics: Record<string, number>;
  onToggleLob: (key: string) => void;
  onTogglePeril: (key: string) => void;
  onToggleTopic: (key: string) => void;
  activeFilterCount: number;
  clearFilters: () => void;
  heading?: string;
  sharp?: boolean;
}) {
  const lobs = Object.keys(pack.facetLabels.lob);
  const perils = Object.keys(pack.facetLabels.peril);
  const topics = Object.keys(pack.facetLabels.topic);
  return (
    <div
      className={cn(
        'border border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm dark:ring-white/[0.06]',
        sharp ? 'rounded-none' : 'rounded-2xl'
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
        <span className="text-sm font-semibold tracking-tight text-foreground">{heading}</span>
        {activeFilterCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-primary"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        ) : null}
      </div>
      <div className="max-h-[min(70vh,40rem)] overflow-y-auto px-2">
        <FacetSection title={pack.copy.facetLob}>
          <div className="flex flex-col gap-2.5">
            {lobs.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
              >
                <Checkbox
                  checked={selectedLobs.has(key)}
                  onCheckedChange={() => onToggleLob(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{pack.facetLabels.lob[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    ({countsLobs[key] ?? 0})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </FacetSection>
        <FacetSection title={pack.copy.facetPeril}>
          <div className="flex flex-col gap-2.5">
            {perils.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
              >
                <Checkbox
                  checked={selectedPerils.has(key)}
                  onCheckedChange={() => onTogglePeril(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{pack.facetLabels.peril[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    ({countsPerils[key] ?? 0})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </FacetSection>
        <FacetSection title={pack.copy.facetTopic} defaultOpen={false}>
          <div className="flex flex-col gap-2.5">
            {topics.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
              >
                <Checkbox
                  checked={selectedTopics.has(key)}
                  onCheckedChange={() => onToggleTopic(key)}
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{pack.facetLabels.topic[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    ({countsTopics[key] ?? 0})
                  </span>
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
    <Collapsible
      defaultOpen={defaultOpen}
      className="border-b border-border/60 py-3 last:border-b-0"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground outline-none [&[data-state=open]_svg]:rotate-180">
        {title}
        <ChevronDown className="size-4 shrink-0 text-primary transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function ResultCard({ item, pack }: { item: SearchResultItem; pack: SearchSitePack }) {
  const pathname = usePathname();
  const meta = itemMetadataLine(item, pack.facetLabels);
  const practiceLabels = item.perils
    .map((p) => pack.facetLabels.peril[p])
    .filter(Boolean)
    .slice(0, 2);
  const isFeatured = pack.featuredLob ? item.lob === pack.featuredLob : false;
  const href = toSiteAwareHref(item.href, pathname, listSearchPackSiteNames());

  return (
    <article
      className={cn(
        'group rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:border-primary/30 hover:shadow-md dark:ring-white/[0.05]',
        isFeatured && 'border-l-[3px] border-l-primary/70'
      )}
    >
      <Link
        href={href}
        className="flex flex-col gap-3 p-4 text-inherit no-underline sm:flex-row sm:items-start sm:gap-4 sm:p-5"
      >
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            isFeatured ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
          )}
        >
          {createElement(resultIcon(item.lob, pack), { className: 'size-5', 'aria-hidden': true })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-md font-mono text-[10px] uppercase tracking-wide"
            >
              {item.kbId}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {pack.facetLabels.lob[item.lob]}
            </span>
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
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
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
            {resultCta(item.lob, pack)}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}

function AiQaPanel({ insight, pack }: { insight: AiSearchInsight; pack: SearchSitePack }) {
  const pathname = usePathname();
  const knownSites = listSearchPackSiteNames();
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
            <p
              id="ai-qa-heading"
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary"
            >
              {pack.copy.aiHeading}
            </p>
            <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5">
              <MessageSquareText
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm font-medium leading-snug text-foreground">
                <span className="sr-only">Question: </span>
                {insight.question}
              </p>
            </div>
            <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
              {insight.headline}
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {insight.answer}
            </p>
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
                href={toSiteAwareHref(insight.learnMoreHref, pathname, knownSites)}
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
              {pack.copy.citationsHeading}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {insight.citations.map((c) => (
                <li key={c.href}>
                  <Link
                    href={toSiteAwareHref(c.href, pathname, knownSites)}
                    className="flex h-full flex-col rounded-xl border border-border/70 bg-card px-3 py-3 text-inherit no-underline transition-colors hover:border-primary/35 hover:bg-primary/[0.03]"
                  >
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Briefcase className="size-3" aria-hidden />
                      {c.kbId ?? 'Resource'}
                    </span>
                    <span className="mt-1 text-sm font-semibold leading-snug text-foreground">
                      {c.title}
                    </span>
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

type DirectoryTab = 'exhibitor' | 'page' | 'article' | 'event';

const DIRECTORY_TABS: { id: DirectoryTab; label: string }[] = [
  { id: 'exhibitor', label: 'Exhibitors & Products' },
  { id: 'page', label: 'Information' },
  { id: 'article', label: 'Articles' },
  { id: 'event', label: 'Events & Seminars' },
];

function inferDirectoryTab(query: string): DirectoryTab {
  const n = normalizeQuery(query);
  if (!n) return 'exhibitor';
  if (/(article|guide)/.test(n)) return 'article';
  if (
    /(register|event|seminar|talk|calendar)/.test(n) &&
    !/(jewelry|exhibitor|directory|ober|stia)/.test(n)
  ) {
    return 'event';
  }
  if (/(registration|first-time|returning|information)/.test(n) && !/september/.test(n)) {
    return 'page';
  }
  return 'exhibitor';
}

function DirectoryExhibitorCard({
  item,
  registerHref,
}: {
  item: SearchResultItem;
  registerHref: string;
}) {
  const pathname = usePathname();
  const knownSites = listSearchPackSiteNames();
  const href = toSiteAwareHref(item.href, pathname, knownSites);
  const planHref = toSiteAwareHref(registerHref, pathname, knownSites);
  const products = item.matchingProducts ?? [];

  return (
    <article className="border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted px-4 py-3">
        <div className="min-w-0">
          <Link
            href={href}
            className="text-base font-semibold text-foreground no-underline hover:underline"
          >
            {item.title}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.linesShown ? `${item.linesShown} Lines Shown` : item.subtitle}
            {item.booth ? (
              <span className="ml-3 inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden />
                {item.booth}
              </span>
            ) : null}
          </p>
        </div>
        <Link
          href={planHref}
          className="inline-flex items-center gap-1.5 border border-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary no-underline hover:bg-primary hover:text-primary-foreground"
        >
          <Bookmark className="size-3.5" aria-hidden />
          Add To Plan
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="px-4 py-3">
          <Link href={href} className="text-sm font-medium text-primary no-underline hover:underline">
            {products.length} Matching Products for this search →
          </Link>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {products.map((product, index) => (
              <Link key={`${item.id}-p-${index}`} href={planHref} className="group block no-underline">
                <div className="aspect-square overflow-hidden border border-border bg-card">
                  {product.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageSrc} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-foreground group-hover:text-primary">
                  {product.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <p className="px-4 py-3 text-sm text-muted-foreground">{item.description}</p>
      )}
    </article>
  );
}

function DirectoryEventCard({
  item,
  registerHref,
}: {
  item: SearchResultItem;
  registerHref: string;
}) {
  const pathname = usePathname();
  const knownSites = listSearchPackSiteNames();
  const href = toSiteAwareHref(item.href, pathname, knownSites);
  const planHref = toSiteAwareHref(registerHref, pathname, knownSites);

  return (
    <article className="flex flex-col gap-3 border border-border bg-background p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {item.dateLabel || 'Market event'}
        </p>
        <Link
          href={href}
          className="mt-1 block text-lg font-semibold text-foreground no-underline hover:underline"
        >
          {item.title}
        </Link>
        {item.subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{item.subtitle}</p> : null}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary no-underline hover:underline"
        >
          More Info
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      <Link
        href={planHref}
        className="inline-flex shrink-0 items-center justify-center bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground no-underline hover:opacity-90"
      >
        Register for market
      </Link>
    </article>
  );
}

function SearchTips({ pack }: { pack: SearchSitePack }) {
  return (
    <div className="mt-4 grid gap-3 border-t border-border/50 pt-4 sm:grid-cols-3">
      {pack.copy.tips.map((tip, index) => {
        const Icon = TIP_ICONS[index % TIP_ICONS.length];
        return (
          <div key={tip.title} className="flex gap-2.5 rounded-xl bg-background/60 px-3 py-2.5">
            <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-foreground">{tip.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{tip.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const SearchResults: FC<SearchResultsProps> = ({
  className,
  disableUrlSync = false,
  initialQuery = '',
  siteName: siteNameOverride = null,
  layout = 'default',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const { page } = useSitecore();
  const qFromUrl = searchParams.get('q') ?? '';
  const knownSites = listSearchPackSiteNames();
  const routeSite = Array.isArray(routeParams?.site)
    ? routeParams.site[0]
    : typeof routeParams?.site === 'string'
      ? routeParams.site
      : null;
  const resolvedSite = resolveSearchSiteName({
    override: siteNameOverride,
    sitecoreSite: (page as { siteName?: string } | undefined)?.siteName,
    routeSite,
    pathname,
    knownSites,
  });
  const pack = getSearchPack(resolvedSite);
  const lobKeys = Object.keys(pack.facetLabels.lob);
  const perilKeys = Object.keys(pack.facetLabels.peril);
  const topicKeys = Object.keys(pack.facetLabels.topic);

  const [query, setQuery] = useState(() =>
    disableUrlSync ? normalizeQuery(initialQuery) : normalizeQuery(qFromUrl)
  );
  const [draft, setDraft] = useState(() => (disableUrlSync ? initialQuery : qFromUrl));
  const [sort, setSort] = useState<SortMode>('relevance');
  const [isSearching, setIsSearching] = useState(false);

  const [selectedLobs, setSelectedLobs] = useState<Set<string>>(new Set());
  const [selectedPerils, setSelectedPerils] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [resultsPage, setResultsPage] = useState(1);
  const [demoTaxonomyRaw, setDemoTaxonomyRaw] = useState('');
  const [directoryTab, setDirectoryTab] = useState<DirectoryTab>(() =>
    inferDirectoryTab(disableUrlSync ? initialQuery : qFromUrl)
  );

  useEffect(() => {
    setDirectoryTab(inferDirectoryTab(query));
  }, [query]);

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

  useEffect(() => {
    setSelectedLobs(new Set());
    setSelectedPerils(new Set());
    setSelectedTopics(new Set());
    setResultsPage(1);
  }, [pack.siteName]);

  const activeDemoUserTaxonomy = useMemo(
    () => (pack.enableDemoPersona ? parseDemoUserTaxonomy(demoTaxonomyRaw) : null),
    [demoTaxonomyRaw, pack.enableDemoPersona]
  );

  const activeCatalog = useMemo(() => {
    if (!pack.enableDemoPersona) return pack.catalog;
    return pack.catalog.filter((item) => itemVisibleForDemoUser(item, activeDemoUserTaxonomy));
  }, [activeDemoUserTaxonomy, pack]);

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
    () => activeCatalog.filter((item) => itemMatchesQuery(item, query, pack.bucketSynonyms)),
    [activeCatalog, pack.bucketSynonyms, query]
  );

  const countsLobs = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedPerils.size && !item.perils.some((p) => selectedPerils.has(p))) return false;
      if (selectedTopics.size && !item.topics.some((t) => selectedTopics.has(t))) return false;
      return true;
    });
    return Object.fromEntries(lobKeys.map((k) => [k, base.filter((i) => i.lob === k).length]));
  }, [lobKeys, queryMatched, selectedPerils, selectedTopics]);

  const countsPerils = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedLobs.size && !selectedLobs.has(item.lob)) return false;
      if (selectedTopics.size && !item.topics.some((t) => selectedTopics.has(t))) return false;
      return true;
    });
    return Object.fromEntries(
      perilKeys.map((k) => [k, base.filter((i) => i.perils.includes(k)).length])
    );
  }, [perilKeys, queryMatched, selectedLobs, selectedTopics]);

  const countsTopics = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedLobs.size && !selectedLobs.has(item.lob)) return false;
      if (selectedPerils.size && !item.perils.some((p) => selectedPerils.has(p))) return false;
      return true;
    });
    return Object.fromEntries(
      topicKeys.map((k) => [k, base.filter((i) => i.topics.includes(k)).length])
    );
  }, [queryMatched, selectedLobs, selectedPerils, topicKeys]);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    let list = activeCatalog.filter((item) => itemMatchesQuery(item, q, pack.bucketSynonyms));

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
        const ra = relevanceScore(
          a,
          q,
          activeDemoUserTaxonomy,
          pack.bucketSynonyms,
          pack.featuredLob
        );
        const rb = relevanceScore(
          b,
          q,
          activeDemoUserTaxonomy,
          pack.bucketSynonyms,
          pack.featuredLob
        );
        if (rb !== ra) return rb - ra;
        return a.title.localeCompare(b.title);
      });
    }
    return sorted;
  }, [
    activeCatalog,
    activeDemoUserTaxonomy,
    pack.bucketSynonyms,
    pack.featuredLob,
    query,
    selectedLobs,
    selectedPerils,
    selectedTopics,
    sort,
  ]);

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
    () => selectAiSearchInsight(query, pack.insightRules),
    [pack.insightRules, query]
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
    pack,
    selectedLobs,
    selectedPerils,
    selectedTopics,
    countsLobs,
    countsPerils,
    countsTopics,
    onToggleLob: (key: string) => toggle(setSelectedLobs, key),
    onTogglePeril: (key: string) => toggle(setSelectedPerils, key),
    onToggleTopic: (key: string) => toggle(setSelectedTopics, key),
    activeFilterCount,
    clearFilters,
  };

  const displayHeading = draft.trim() || qFromUrl.trim();
  const personaLabel = activeDemoUserTaxonomy ?? 'All visitors';
  const personaCode = activeDemoUserTaxonomy ? getPersonaCode(activeDemoUserTaxonomy) : null;
  const registerHref = pack.registerHref || '/Visit/Registration';
  const signInHref = pack.signInHref || '/Visit/Registration/Returning-Buyers';
  const tabCounts = useMemo(
    () => ({
      exhibitor: filtered.filter((item) => item.lob === 'exhibitor').length,
      page: filtered.filter((item) => item.lob === 'page').length,
      article: filtered.filter((item) => item.lob === 'article').length,
      event: filtered.filter((item) => item.lob === 'event').length,
    }),
    [filtered]
  );
  const directoryResults = filtered.filter((item) => item.lob === directoryTab);
  const matchingProductCount = directoryResults.reduce(
    (sum, item) => sum + (item.matchingProducts?.length ?? 0),
    0
  );

  if (layout === 'directory') {
    return (
      <section
        className={cn('aa-search-results min-h-[60vh] bg-background pb-16 pt-6', className)}
        aria-label="Site search results"
        data-search-layout="directory"
      >
        <div className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <nav className="border-b border-border text-sm text-muted-foreground" aria-label="Breadcrumb">
            Home / Search Results
          </nav>

          <div className="mt-6 flex gap-0 overflow-x-auto border-b border-border">
            {DIRECTORY_TABS.map((tab) => {
              const count = tabCounts[tab.id];
              const active = directoryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDirectoryTab(tab.id)}
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-sm font-medium',
                    active
                      ? 'border-b-2 border-foreground font-bold text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  {count > 0 ? ` (${count})` : ''}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
            <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[min(100%,19rem)] xl:w-72">
              <div className="hidden lg:block">
                <SearchFacetsPanel {...facetPanelProps} heading="Filters" sharp />
              </div>
              <div className="lg:hidden">
                <Collapsible defaultOpen={false}>
                  <CollapsibleTrigger className="flex w-full items-center justify-center gap-2 border border-border bg-card px-4 py-3 text-sm font-semibold">
                    Filters
                    {activeFilterCount > 0 ? (
                      <Badge variant="secondary" className="rounded-full">
                        {activeFilterCount}
                      </Badge>
                    ) : null}
                    <ChevronDown className="size-4 opacity-80" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <SearchFacetsPanel {...facetPanelProps} heading="Filters" sharp />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </aside>

            <main className="min-w-0 flex-1">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
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
                  placeholder={pack.copy.placeholder}
                  className="h-12 w-full rounded-none border border-border bg-background pl-11 pr-10 text-sm outline-none focus:border-foreground"
                  autoComplete="off"
                />
                {draft ? (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                    onClick={clearSearchField}
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {directoryResults.length} Matching Results
                {matchingProductCount > 0 ? `, ${matchingProductCount} Products` : ''}
                {normalizeQuery(query) ? (
                  <>
                    {' '}
                    for &ldquo;<span className="text-foreground">{displayHeading}</span>&rdquo;
                  </>
                ) : null}
              </p>

              <p className="mt-3 text-sm text-foreground">
                Already Registered?{' '}
                <Link
                  href={toSiteAwareHref(signInHref, pathname, knownSites)}
                  className="font-semibold text-primary no-underline hover:underline"
                >
                  Sign In
                </Link>{' '}
                to Create Your Market Plan!
              </p>
              <Link
                href={toSiteAwareHref(registerHref, pathname, knownSites)}
                className="mt-3 inline-flex bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-background no-underline hover:opacity-90"
              >
                Register for market
              </Link>

              {aiInsight ? (
                <div className="mt-6">
                  <AiQaPanel insight={aiInsight} pack={pack} />
                </div>
              ) : null}

              {directoryResults.length > 0 ? (
                <div className="mt-6 flex flex-col gap-4">
                  {directoryResults.map((item) =>
                    item.lob === 'exhibitor' ? (
                      <DirectoryExhibitorCard key={item.id} item={item} registerHref={registerHref} />
                    ) : item.lob === 'event' ? (
                      <DirectoryEventCard key={item.id} item={item} registerHref={registerHref} />
                    ) : (
                      <ResultCard key={item.id} item={item} pack={pack} />
                    )
                  )}
                </div>
              ) : (
                <div className="mt-10 border border-dashed border-border bg-muted/25 px-6 py-12 text-center">
                  <p className="text-sm font-medium">No results in this tab.</p>
                  <p className="mt-1 text-sm text-muted-foreground">{pack.copy.emptyHint}</p>
                  <Button type="button" variant="secondary" className="mt-5 rounded-none" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    );
  }

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
                placeholder={pack.copy.placeholder}
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
            <Button
              type="button"
              className="h-12 shrink-0 rounded-xl px-8 font-semibold shadow-sm"
              onClick={runSearch}
            >
              Search
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Try searching
            </span>
            {pack.popularSearches.map((term) => (
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
          {pack.copy.tips.length > 0 ? <SearchTips pack={pack} /> : null}
        </div>

        <header className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary/90">
                {pack.copy.kicker}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {normalizeQuery(query) ? (
                  <>
                    Results for <span className="text-primary">&ldquo;{displayHeading}&rdquo;</span>
                  </>
                ) : (
                  pack.copy.headingEmpty
                )}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {pack.copy.intro}
              </p>
            </div>
            {pack.enableDemoPersona ? (
              <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Demo context:</span> {personaLabel}
                {personaCode ? <span className="ml-1 text-primary">({personaCode})</span> : null}
              </div>
            ) : null}
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
            {aiInsight ? <AiQaPanel insight={aiInsight} pack={pack} /> : null}

            <div
              className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
                aiInsight ? 'mt-8' : 'mt-0'
              )}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSearching ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
                ) : null}
                <span>
                  <strong className="font-semibold text-foreground">{filtered.length}</strong>{' '}
                  {filtered.length === 1 ? 'result' : 'results'}
                  {normalizeQuery(query) ? (
                    <>
                      {' '}
                      for &ldquo;<span className="text-foreground">{displayHeading}</span>&rdquo;
                    </>
                  ) : (
                    pack.copy.resultsHint
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
                    {pack.facetLabels.lob[key]}
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
                    {pack.facetLabels.peril[key]}
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
                    {pack.facetLabels.topic[key]}
                    <X className="size-3" aria-hidden />
                  </Badge>
                ))}
              </div>
            ) : null}

            {filtered.length > 0 ? (
              <>
                <div className="mt-6 flex flex-col gap-4">
                  {pagedResults.map((item) => (
                    <ResultCard key={item.id} item={item} pack={pack} />
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
                      of{' '}
                      <span className="font-semibold tabular-nums text-foreground">
                        {filtered.length}
                      </span>
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
                <p className="text-sm font-medium text-secondary-foreground">
                  No results for that combination.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{pack.copy.emptyHint}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-5 rounded-lg"
                  onClick={clearFilters}
                >
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
  <SearchResults
    className={typeof props.params?.styles === 'string' ? props.params.styles : undefined}
  />
);

export const Version1 = (props: ComponentProps) => (
  <SearchResults
    className={typeof props.params?.styles === 'string' ? props.params.styles : undefined}
    layout="directory"
  />
);
