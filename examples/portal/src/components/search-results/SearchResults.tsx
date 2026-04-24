'use client';

import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import {
  ArrowUpRight,
  ChevronDown,
  Filter,
  Loader2,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

import { useToggleWithClickOutside } from '@/hooks/useToggleWithClickOutside';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

/**
 * ——— Editable search data (links, Q&A, facets) ———
 * In-memory search matches title, description, breadcrumb labels, and matchTerms.
 */

type SearchContentType = 'article' | 'plan' | 'provider' | 'news' | 'form' | 'tool';

type SearchTopic = 'coverage' | 'costs' | 'care' | 'wellness' | 'news' | 'about';

type SearchAudience = 'members' | 'employers' | 'brokers' | 'providers';

type SearchResultItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  contentType: SearchContentType;
  topics: SearchTopic[];
  audiences: SearchAudience[];
  dateLabel?: string;
  breadcrumb?: string[];
  matchTerms?: string[];
};

type FeaturedAnswer = {
  id: string;
  triggeredWhenQueryIncludes: string[];
  question: string;
  answer: string;
  learnMoreHref: string;
  learnMoreLabel?: string;
};

const searchFacetLabels = {
  contentType: {
    article: 'Articles & guides',
    plan: 'Plans & benefits',
    provider: 'Find care / providers',
    news: 'Newsroom',
    form: 'Forms & documents',
    tool: 'Tools & calculators',
  },
  topic: {
    coverage: 'Coverage & eligibility',
    costs: 'Costs & billing',
    care: 'Care & treatment',
    wellness: 'Wellness & prevention',
    news: 'Industry news',
    about: 'About Blue Cross',
  },
  audience: {
    members: 'Members',
    employers: 'Employers',
    brokers: 'Brokers & consultants',
    providers: 'Healthcare professionals',
  },
} as const;

const popularSearches = [
  'prior authorization',
  'find a doctor',
  'HSA vs FSA',
  'mental health coverage',
  'EOB explained',
];

const featuredAnswers: FeaturedAnswer[] = [
  {
    id: 'fa-pa',
    triggeredWhenQueryIncludes: ['prior', 'authorization', 'pre auth', 'precert'],
    question: 'What is prior authorization?',
    answer:
      'Prior authorization means your health plan reviews certain services, prescriptions, or procedures before they are covered. It helps ensure care is medically necessary and covered under your benefits.',
    learnMoreHref: 'https://www.bcbs.com/understanding-health-insurance',
    learnMoreLabel: 'Understanding health insurance',
  },
  {
    id: 'fa-hsa',
    triggeredWhenQueryIncludes: ['hsa', 'fsa', 'flexible spending', 'health savings'],
    question: 'HSA vs FSA — what is the difference?',
    answer:
      'An HSA is paired with a qualified high-deductible plan and rolls over year to year. An FSA is offered through an employer and often has a “use it or lose it” rule for unused funds unless your plan allows rollover or grace periods.',
    learnMoreHref: 'https://www.bcbs.com/the-health-of-america',
    learnMoreLabel: 'Explore member resources',
  },
  {
    id: 'fa-eob',
    triggeredWhenQueryIncludes: ['eob', 'explanation of benefits', 'claim', 'bill'],
    question: 'How do I read an Explanation of Benefits (EOB)?',
    answer:
      'Your EOB is not a bill. It summarizes what your provider billed, what your plan allowed, what was paid, and what you may still owe the provider based on your benefits.',
    learnMoreHref: 'https://www.bcbs.com/understanding-health-insurance',
    learnMoreLabel: 'Insurance basics',
  },
  {
    id: 'fa-network',
    triggeredWhenQueryIncludes: ['network', 'out of network', 'ppo', 'hmo', 'find a doctor', 'doctor'],
    question: 'Why does network matter for costs?',
    answer:
      'In-network providers contract with your plan for negotiated rates. Out-of-network care may cost more or not be covered depending on your plan type and benefits.',
    learnMoreHref: 'https://www.bcbs.com/healthcare-access',
    learnMoreLabel: 'Healthcare access',
  },
];

const searchCatalog: SearchResultItem[] = [
  {
    id: '1',
    title: 'Understanding your health insurance coverage',
    description:
      'Key terms like deductible, copay, coinsurance, and out-of-pocket maximum — and how they work together.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['coverage', 'costs'],
    audiences: ['members'],
    dateLabel: 'Updated 2025',
    breadcrumb: ['Members', 'Coverage basics'],
    matchTerms: ['benefits', 'deductible', 'copay'],
  },
  {
    id: '2',
    title: 'The Health of America Report®',
    description:
      'Data-driven insights on affordability, access, and trends shaping healthcare in communities nationwide.',
    href: 'https://www.bcbs.com/the-health-of-america',
    contentType: 'tool',
    topics: ['news', 'about'],
    audiences: ['members', 'employers', 'brokers'],
    dateLabel: 'Research hub',
    breadcrumb: ['Insights', 'Research'],
  },
  {
    id: '3',
    title: 'Healthcare access & health equity',
    description:
      'How Blue Cross and Blue Shield companies are working to improve access to affordable, quality care.',
    href: 'https://www.bcbs.com/healthcare-access',
    contentType: 'article',
    topics: ['care', 'about'],
    audiences: ['members', 'providers'],
    breadcrumb: ['Our impact', 'Access'],
  },
  {
    id: '4',
    title: 'Newsroom: industry updates and announcements',
    description:
      'Press releases, statements, and stories about innovation, policy, and community health programs.',
    href: 'https://www.bcbs.com/news',
    contentType: 'news',
    topics: ['news'],
    audiences: ['employers', 'brokers', 'providers'],
    dateLabel: 'Latest',
    breadcrumb: ['Company', 'News'],
  },
  {
    id: '5',
    title: 'Employer solutions: benefits strategy',
    description:
      'Resources for designing competitive benefits, controlling trend, and supporting workforce health.',
    href: 'https://www.bcbs.com/employers',
    contentType: 'plan',
    topics: ['costs', 'coverage'],
    audiences: ['employers', 'brokers'],
    breadcrumb: ['Employers', 'Solutions'],
    matchTerms: ['self funded', 'level funded'],
  },
  {
    id: '6',
    title: 'Broker & consultant resources',
    description:
      'Sales support, plan highlights, and educational materials to help clients choose the right coverage.',
    href: 'https://www.bcbs.com/brokers',
    contentType: 'form',
    topics: ['coverage'],
    audiences: ['brokers'],
    breadcrumb: ['Brokers', 'Resources'],
  },
  {
    id: '7',
    title: 'Clinical programs & care management',
    description:
      'Programs that help members navigate complex conditions, transitions of care, and high-value networks.',
    href: 'https://www.bcbs.com/providers',
    contentType: 'article',
    topics: ['care'],
    audiences: ['providers', 'members'],
    breadcrumb: ['Providers', 'Programs'],
    matchTerms: ['prior authorization', 'utilization'],
  },
  {
    id: '8',
    title: 'Wellness & prevention: staying healthy year-round',
    description:
      'Preventive care benefits, screenings, vaccines, and lifestyle programs often available at no additional cost.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['wellness', 'coverage'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Wellness'],
    matchTerms: ['screening', 'vaccine', 'prevention'],
  },
  {
    id: '9',
    title: 'Prescription drug coverage overview',
    description:
      'Formularies, tiers, specialty medications, and how to estimate what you will pay at the pharmacy.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'plan',
    topics: ['costs', 'care'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Pharmacy'],
    matchTerms: ['rx', 'drug', 'formulary'],
  },
  {
    id: '10',
    title: 'Federal policy & advocacy',
    description:
      'BCBS perspectives on regulations and legislation that affect coverage stability and affordability.',
    href: 'https://www.bcbs.com/news',
    contentType: 'news',
    topics: ['news', 'about'],
    audiences: ['employers', 'brokers'],
    breadcrumb: ['Advocacy', 'Policy'],
  },
  {
    id: '11',
    title: 'Find care: choosing a primary care clinician',
    description:
      'What to look for in a PCP, how referrals work in some plan types, and how to compare quality signals.',
    href: 'https://www.bcbs.com/healthcare-access',
    contentType: 'provider',
    topics: ['care'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Find care'],
    matchTerms: ['doctor', 'pcp', 'specialist'],
  },
  {
    id: '12',
    title: 'Transparency & billing: questions members ask most',
    description:
      'Surprise billing protections, good faith estimates, and where to go when a claim does not look right.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['costs'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Billing'],
    matchTerms: ['surprise bill', 'no surprises'],
  },
];

export type SearchResultsProps = {
  className?: string;
  /** Visible label on the header control */
  triggerLabel?: string;
  /** Additional classes for the header trigger (match your nav link styling) */
  triggerClassName?: string;
  /** Seed the search field when the panel opens */
  initialQuery?: string;
};

type SortMode = 'relevance' | 'az';

function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, ' ');
}

function relevanceScore(item: SearchResultItem, q: string): number {
  const n = normalizeQuery(q);
  if (!n) return 0;
  const words = n.split(' ').filter(Boolean);
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const crumbs = (item.breadcrumb ?? []).join(' ').toLowerCase();
  const extra = (item.matchTerms ?? []).join(' ').toLowerCase();
  let score = 0;
  for (const w of words) {
    if (title.includes(w)) score += 5;
    if (desc.includes(w)) score += 2;
    if (crumbs.includes(w)) score += 1;
    if (extra.includes(w)) score += 3;
  }
  return score;
}

function itemMatchesQuery(item: SearchResultItem, q: string): boolean {
  const n = normalizeQuery(q);
  if (!n) return true;
  const hay = [
    item.title,
    item.description,
    ...(item.breadcrumb ?? []),
    ...(item.matchTerms ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return n.split(' ').filter(Boolean).every((w) => hay.includes(w));
}

function selectFeaturedAnswer(query: string): FeaturedAnswer | null {
  const n = normalizeQuery(query);
  if (n.length < 2) return null;
  let best: { fa: FeaturedAnswer; score: number } | null = null;
  for (const fa of featuredAnswers) {
    const score = fa.triggeredWhenQueryIncludes.filter((t) => n.includes(t.toLowerCase())).length;
    if (score > 0 && (!best || score > best.score)) best = { fa, score };
  }
  return best?.fa ?? null;
}

const contentTypes = Object.keys(searchFacetLabels.contentType) as SearchContentType[];
const topics = Object.keys(searchFacetLabels.topic) as SearchTopic[];
const audiences = Object.keys(searchFacetLabels.audience) as SearchAudience[];

function SearchFacetsPanel({
  selectedTypes,
  selectedTopics,
  selectedAudiences,
  onToggleType,
  onToggleTopic,
  onToggleAudience,
  activeFilterCount,
  clearFilters,
}: {
  selectedTypes: Set<SearchContentType>;
  selectedTopics: Set<SearchTopic>;
  selectedAudiences: Set<SearchAudience>;
  onToggleType: (key: SearchContentType) => void;
  onToggleTopic: (key: SearchTopic) => void;
  onToggleAudience: (key: SearchAudience) => void;
  activeFilterCount: number;
  clearFilters: () => void;
}) {
  return (
    <div className="rounded-default border border-border/80 bg-card p-1 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold text-secondary-foreground">Refine results</span>
        {activeFilterCount > 0 ? (
          <Button type="button" variant="ghost" size="sm" className="h-8 text-primary" onClick={clearFilters}>
            Clear all
          </Button>
        ) : null}
      </div>
      <Separator />
      <ScrollArea className="max-h-[min(70vh,32rem)] pr-2">
        <div className="px-3 pb-2">
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
                    className="mt-0.5"
                  />
                  <span>{searchFacetLabels.contentType[key]}</span>
                </label>
              ))}
            </div>
          </FacetSection>
          <FacetSection title="Topic">
            <div className="flex flex-col gap-2.5">
              {topics.map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
                >
                  <Checkbox
                    checked={selectedTopics.has(key)}
                    onCheckedChange={() => onToggleTopic(key)}
                    className="mt-0.5"
                  />
                  <span>{searchFacetLabels.topic[key]}</span>
                </label>
              ))}
            </div>
          </FacetSection>
          <FacetSection title="Audience" defaultOpen={false}>
            <div className="flex flex-col gap-2.5">
              {audiences.map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90"
                >
                  <Checkbox
                    checked={selectedAudiences.has(key)}
                    onCheckedChange={() => onToggleAudience(key)}
                    className="mt-0.5"
                  />
                  <span>{searchFacetLabels.audience[key]}</span>
                </label>
              ))}
            </div>
          </FacetSection>
        </div>
      </ScrollArea>
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
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-1 text-left text-sm font-semibold text-secondary-foreground outline-none [&[data-state=open]_svg]:rotate-180">
        {title}
        <ChevronDown className="size-4 shrink-0 text-primary transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export const SearchResults: FC<SearchResultsProps> = ({
  className,
  triggerLabel = 'Search',
  triggerClassName,
  initialQuery = '',
}) => {
  const { isVisible, setIsVisible, ref } = useToggleWithClickOutside<HTMLDivElement>(false);
  const [query, setQuery] = useState(initialQuery);
  const [draft, setDraft] = useState(initialQuery);
  const [sort, setSort] = useState<SortMode>('relevance');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedTypes, setSelectedTypes] = useState<Set<SearchContentType>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<SearchTopic>>(new Set());
  const [selectedAudiences, setSelectedAudiences] = useState<Set<SearchAudience>>(new Set());

  const toggle = useCallback(<T extends string>(set: React.Dispatch<React.SetStateAction<Set<T>>>, v: T) => {
    set((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    setDraft(query);
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [isVisible, query]);

  useEffect(() => {
    if (!isVisible) return;
    setIsSearching(true);
    const t = window.setTimeout(() => setIsSearching(false), 220);
    return () => window.clearTimeout(t);
  }, [query, selectedTypes, selectedTopics, selectedAudiences, sort, isVisible]);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    let list = searchCatalog.filter((item) => itemMatchesQuery(item, q));

    if (selectedTypes.size) {
      list = list.filter((item) => selectedTypes.has(item.contentType));
    }
    if (selectedTopics.size) {
      list = list.filter((item) => item.topics.some((t) => selectedTopics.has(t)));
    }
    if (selectedAudiences.size) {
      list = list.filter((item) => item.audiences.some((a) => selectedAudiences.has(a)));
    }

    const sorted = [...list];
    if (sort === 'az') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        const ra = relevanceScore(a, q);
        const rb = relevanceScore(b, q);
        if (rb !== ra) return rb - ra;
        return a.title.localeCompare(b.title);
      });
    }
    return sorted;
  }, [query, selectedTypes, selectedTopics, selectedAudiences, sort]);

  const featured = useMemo(() => selectFeaturedAnswer(query), [query]);

  const activeFilterCount =
    selectedTypes.size + selectedTopics.size + selectedAudiences.size;

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setSelectedTopics(new Set());
    setSelectedAudiences(new Set());
  };

  const runSearch = () => {
    setQuery(normalizeQuery(draft));
  };

  const applyPopular = (term: string) => {
    setDraft(term);
    setQuery(normalizeQuery(term));
  };

  const facetPanelProps = {
    selectedTypes,
    selectedTopics,
    selectedAudiences,
    onToggleType: (key: SearchContentType) => toggle(setSelectedTypes, key),
    onToggleTopic: (key: SearchTopic) => toggle(setSelectedTopics, key),
    onToggleAudience: (key: SearchAudience) => toggle(setSelectedAudiences, key),
    activeFilterCount,
    clearFilters,
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          'block w-full p-4 text-left font-[family-name:var(--font-body)] font-normal text-secondary-foreground outline-none transition-colors hover:text-primary lg:w-auto',
          triggerClassName
        )}
        aria-expanded={isVisible}
        aria-haspopup="dialog"
        onClick={() => setIsVisible((v) => !v)}
      >
        {triggerLabel}
      </button>

      <div
        className={cn(
          'fixed inset-x-0 top-14 z-40 flex max-h-[calc(100dvh-3.5rem)] flex-col border-t border-border/40 bg-background/95 backdrop-blur-md transition-all duration-300 ease-out lg:absolute lg:inset-x-auto lg:left-1/2 lg:top-full lg:mt-2 lg:max-h-[min(85vh,820px)] lg:w-[min(100vw-2rem,72rem)] lg:-translate-x-1/2 lg:rounded-default lg:border lg:border-border/60 lg:shadow-xl',
          isVisible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
      >
        {isVisible ? (
          <FocusTrap
            focusTrapOptions={{
              allowOutsideClick: true,
              initialFocus: false,
              fallbackFocus: '#search-results-panel',
            }}
          >
            <div id="search-results-panel" className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="relative border-b border-border/50 bg-secondary/40 px-4 py-4 sm:px-6">
                <button
                  type="button"
                  className="absolute right-3 top-3 hidden rounded-default p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground lg:inline-flex"
                  aria-label="Close search"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="size-5" />
                </button>
                <div className="flex flex-col gap-3 pr-10 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary"
                      aria-hidden
                    />
                    <input
                      ref={inputRef}
                      type="search"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          runSearch();
                        }
                      }}
                      placeholder="Search articles, plans, tools, and news…"
                      className={cn(
                        'h-11 w-full rounded-default border border-border bg-background pl-10 pr-10 text-sm text-foreground shadow-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25'
                      )}
                      autoComplete="off"
                    />
                    {draft ? (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-default p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Clear search"
                        onClick={() => {
                          setDraft('');
                          setQuery('');
                        }}
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" className="h-11 min-w-[5.5rem]" onClick={runSearch}>
                      Search
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 border-border text-secondary-foreground lg:hidden"
                      aria-label="Close search"
                      onClick={() => setIsVisible(false)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Popular
                  </span>
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => applyPopular(term)}
                      className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
                <aside className="hidden w-[min(100%,280px)] shrink-0 border-r border-border/50 bg-background p-4 lg:block">
                  <SearchFacetsPanel {...facetPanelProps} />
                </aside>

                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <div className="border-b border-border/40 px-4 py-3 sm:px-6 lg:hidden">
                    <Collapsible>
                      <CollapsibleTrigger className="flex w-full items-center justify-center gap-2 rounded-default border border-border bg-secondary/30 px-3 py-2 text-sm font-semibold text-secondary-foreground">
                        <Filter className="size-4 text-primary" />
                        Filters
                        {activeFilterCount > 0 ? (
                          <Badge variant="secondary" className="ml-1 rounded-full">
                            {activeFilterCount}
                          </Badge>
                        ) : null}
                        <ChevronDown className="size-4 opacity-60" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3">
                        <SearchFacetsPanel {...facetPanelProps} />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  <ScrollArea className="min-h-0 flex-1">
                    <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
                      {featured ? (
                        <section
                          className="relative overflow-hidden rounded-default border border-primary/25 bg-gradient-to-br from-secondary via-background to-secondary/60 p-5 shadow-sm"
                          aria-labelledby="search-qa-heading"
                        >
                          <div className="absolute right-0 top-0 size-32 rounded-full bg-primary/5 blur-2xl" />
                          <div className="relative flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                              <Sparkles className="size-5" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <p
                                id="search-qa-heading"
                                className="text-xs font-semibold uppercase tracking-wide text-primary"
                              >
                                Quick answer
                              </p>
                              <h2 className="text-lg font-semibold leading-snug text-secondary-foreground">
                                {featured.question}
                              </h2>
                              <p className="text-sm leading-relaxed text-foreground/85">{featured.answer}</p>
                              <a
                                href={featured.learnMoreHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                              >
                                {featured.learnMoreLabel ?? 'Learn more'}
                                <ArrowUpRight className="size-3.5" aria-hidden />
                              </a>
                            </div>
                          </div>
                        </section>
                      ) : null}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {isSearching ? (
                            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                          ) : null}
                          <span>
                            <strong className="font-semibold text-foreground">{filtered.length}</strong>{' '}
                            {filtered.length === 1 ? 'result' : 'results'}
                            {normalizeQuery(query) ? (
                              <>
                                {' '}
                                for &ldquo;
                                <span className="text-foreground">{query.trim() || draft.trim()}</span>
                                &rdquo;
                              </>
                            ) : (
                              ' — browse or use filters'
                            )}
                          </span>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-secondary-foreground">
                          <span className="sr-only">Sort by</span>
                          <span className="hidden sm:inline">Sort</span>
                          <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortMode)}
                            className="h-9 rounded-default border border-border bg-background px-2 text-sm outline-none ring-primary/20 focus:ring-2"
                          >
                            <option value="relevance">Best match</option>
                            <option value="az">Title A–Z</option>
                          </select>
                        </label>
                      </div>

                      {activeFilterCount > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {[...selectedTypes].map((key) => (
                            <Badge
                              key={`t-${key}`}
                              variant="secondary"
                              className="cursor-pointer gap-1 pr-1.5 hover:bg-secondary/80"
                              onClick={() => toggle(setSelectedTypes, key)}
                            >
                              {searchFacetLabels.contentType[key]}
                              <X className="size-3" aria-hidden />
                            </Badge>
                          ))}
                          {[...selectedTopics].map((key) => (
                            <Badge
                              key={`tp-${key}`}
                              variant="secondary"
                              className="cursor-pointer gap-1 pr-1.5 hover:bg-secondary/80"
                              onClick={() => toggle(setSelectedTopics, key)}
                            >
                              {searchFacetLabels.topic[key]}
                              <X className="size-3" aria-hidden />
                            </Badge>
                          ))}
                          {[...selectedAudiences].map((key) => (
                            <Badge
                              key={`a-${key}`}
                              variant="secondary"
                              className="cursor-pointer gap-1 pr-1.5 hover:bg-secondary/80"
                              onClick={() => toggle(setSelectedAudiences, key)}
                            >
                              {searchFacetLabels.audience[key]}
                              <X className="size-3" aria-hidden />
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      <ul className="space-y-3 pb-8">
                        {filtered.map((item) => (
                          <li key={item.id}>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block rounded-default border border-border/70 bg-card p-4 shadow-sm transition-all hover:border-primary/35 hover:shadow-md"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                                  {searchFacetLabels.contentType[item.contentType]}
                                </Badge>
                                {item.dateLabel ? (
                                  <span className="text-xs text-muted-foreground">{item.dateLabel}</span>
                                ) : null}
                              </div>
                              {item.breadcrumb?.length ? (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {item.breadcrumb.join(' · ')}
                                </p>
                              ) : null}
                              <h3 className="mt-1 flex items-start justify-between gap-2 text-base font-semibold text-secondary-foreground group-hover:text-primary">
                                <span className="min-w-0">{item.title}</span>
                                <ArrowUpRight
                                  className="mt-0.5 size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                                  aria-hidden
                                />
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.description}</p>
                            </a>
                          </li>
                        ))}
                      </ul>

                      {filtered.length === 0 ? (
                        <div className="rounded-default border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                          <p className="text-sm font-medium text-secondary-foreground">No matches for that combination.</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Try clearing filters or a shorter phrase like &ldquo;coverage&rdquo; or &ldquo;news&rdquo;.
                          </p>
                          <Button type="button" variant="secondary" className="mt-4" onClick={clearFilters}>
                            Clear filters
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </ScrollArea>
                </main>
              </div>
            </div>
          </FocusTrap>
        ) : null}
      </div>
    </div>
  );
};
