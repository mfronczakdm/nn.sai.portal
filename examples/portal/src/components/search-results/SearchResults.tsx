'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Heart,
  Loader2,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import type { ComponentProps } from '@/lib/component-props';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
  /** Card hero image (editable per result) */
  imageSrc?: string;
  /** BCBS blue “new” ribbon on the card image */
  isNew?: boolean;
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

const cardImage = (id: string) => `https://picsum.photos/seed/bcbs-${id}/800/520`;

const searchCatalog: SearchResultItem[] = [
  {
    id: '1',
    imageSrc: cardImage('1'),
    isNew: true,
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
    imageSrc: cardImage('2'),
    isNew: true,
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
    imageSrc: cardImage('3'),
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
    imageSrc: cardImage('4'),
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
    imageSrc: cardImage('5'),
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
    imageSrc: cardImage('6'),
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
    imageSrc: cardImage('7'),
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
    imageSrc: cardImage('8'),
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
    imageSrc: cardImage('9'),
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
    imageSrc: cardImage('10'),
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
    imageSrc: cardImage('11'),
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
    imageSrc: cardImage('12'),
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
  /** When true, ignores `?q=` and uses `initialQuery` only (e.g. previews) */
  disableUrlSync?: boolean;
  /** Used when `disableUrlSync` is true */
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

function itemMetadataLine(item: SearchResultItem): string {
  const type = searchFacetLabels.contentType[item.contentType];
  const when = item.dateLabel ?? 'Resource';
  const trail = item.breadcrumb?.length ? item.breadcrumb.join(' · ') : '';
  return trail ? `${type} · ${when} · ${trail}` : `${type} · ${when}`;
}

function itemAttributeRows(item: SearchResultItem) {
  return [
    {
      label: 'Content type',
      value: searchFacetLabels.contentType[item.contentType],
      Icon: FileText,
    },
    {
      label: 'Topic',
      value: item.topics.map((t) => searchFacetLabels.topic[t]).join(', '),
      Icon: Heart,
    },
    {
      label: 'Audience',
      value: item.audiences.map((a) => searchFacetLabels.audience[a]).join(', '),
      Icon: Users,
    },
  ];
}

const contentTypes = Object.keys(searchFacetLabels.contentType) as SearchContentType[];
const topics = Object.keys(searchFacetLabels.topic) as SearchTopic[];
const audiences = Object.keys(searchFacetLabels.audience) as SearchAudience[];

function SearchFacetsPanel({
  selectedTypes,
  selectedTopics,
  selectedAudiences,
  countsTypes,
  countsTopics,
  countsAudiences,
  onToggleType,
  onToggleTopic,
  onToggleAudience,
  activeFilterCount,
  clearFilters,
}: {
  selectedTypes: Set<SearchContentType>;
  selectedTopics: Set<SearchTopic>;
  selectedAudiences: Set<SearchAudience>;
  countsTypes: Record<SearchContentType, number>;
  countsTopics: Record<SearchTopic, number>;
  countsAudiences: Record<SearchAudience, number>;
  onToggleType: (key: SearchContentType) => void;
  onToggleTopic: (key: SearchTopic) => void;
  onToggleAudience: (key: SearchAudience) => void;
  activeFilterCount: number;
  clearFilters: () => void;
}) {
  return (
    <div className="rounded-default border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <span className="text-sm font-semibold text-secondary-foreground">Refine results</span>
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
                  className="mt-0.5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-1">
                  <span>{searchFacetLabels.audience[key]}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">({countsAudiences[key]})</span>
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
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-foreground outline-none [&[data-state=open]_svg]:rotate-180">
        {title}
        <ChevronDown className="size-4 shrink-0 text-primary transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function ResultCard({ item }: { item: SearchResultItem }) {
  const img = item.imageSrc ?? cardImage(item.id);
  const rows = itemAttributeRows(item);
  return (
    <article className="group flex flex-col overflow-hidden rounded-default border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex flex-1 flex-col text-inherit no-underline">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          {item.isNew ? (
            <span className="absolute left-2 top-2 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow">
              New
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
          <p className="text-xs text-muted-foreground">
            {itemMetadataLine(item)
              .split(' · ')
              .map((part, i) => (
                <span key={`${part}-${i}`}>
                  {i > 0 ? <span className="mx-1 text-border">|</span> : null}
                  {part}
                </span>
              ))}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-secondary-foreground group-hover:text-primary">
            {item.title}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {rows.map(({ label, value, Icon }) => (
              <li key={label} className="flex gap-2">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span>
                  <span className="font-semibold text-secondary-foreground">{label}: </span>
                  <span className="text-foreground/85">{value}</span>
                </span>
              </li>
            ))}
          </ul>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Read more
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
  const [selectedTopics, setSelectedTopics] = useState<Set<SearchTopic>>(new Set());
  const [selectedAudiences, setSelectedAudiences] = useState<Set<SearchAudience>>(new Set());

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
    const t = window.setTimeout(() => setIsSearching(false), 200);
    return () => window.clearTimeout(t);
  }, [query, selectedTypes, selectedTopics, selectedAudiences, sort]);

  const queryMatched = useMemo(
    () => searchCatalog.filter((item) => itemMatchesQuery(item, query)),
    [query]
  );

  const countsTypes = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedTopics.size && !item.topics.some((t) => selectedTopics.has(t))) return false;
      if (selectedAudiences.size && !item.audiences.some((a) => selectedAudiences.has(a))) return false;
      return true;
    });
    return Object.fromEntries(
      contentTypes.map((k) => [k, base.filter((i) => i.contentType === k).length])
    ) as Record<SearchContentType, number>;
  }, [queryMatched, selectedTopics, selectedAudiences]);

  const countsTopics = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedTypes.size && !selectedTypes.has(item.contentType)) return false;
      if (selectedAudiences.size && !item.audiences.some((a) => selectedAudiences.has(a))) return false;
      return true;
    });
    return Object.fromEntries(
      topics.map((k) => [k, base.filter((i) => i.topics.includes(k)).length])
    ) as Record<SearchTopic, number>;
  }, [queryMatched, selectedTypes, selectedAudiences]);

  const countsAudiences = useMemo(() => {
    const base = queryMatched.filter((item) => {
      if (selectedTypes.size && !selectedTypes.has(item.contentType)) return false;
      if (selectedTopics.size && !item.topics.some((t) => selectedTopics.has(t))) return false;
      return true;
    });
    return Object.fromEntries(
      audiences.map((k) => [k, base.filter((i) => i.audiences.includes(k)).length])
    ) as Record<SearchAudience, number>;
  }, [queryMatched, selectedTypes, selectedTopics]);

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
    selectedTopics,
    selectedAudiences,
    countsTypes,
    countsTopics,
    countsAudiences,
    onToggleType: (key: SearchContentType) => toggle(setSelectedTypes, key),
    onToggleTopic: (key: SearchTopic) => toggle(setSelectedTopics, key),
    onToggleAudience: (key: SearchAudience) => toggle(setSelectedAudiences, key),
    activeFilterCount,
    clearFilters,
  };

  const displayHeading = draft.trim() || qFromUrl.trim();

  return (
    <section
      className={cn('min-h-[60vh] bg-background pb-16 pt-6 sm:pt-8', className)}
      aria-label="Search results"
    >
      <div className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8">
        <div className="rounded-default border border-border/70 bg-secondary/40 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary"
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
                placeholder="Search articles, plans, tools, and news…"
                className="h-12 w-full rounded-default border border-border bg-background pl-10 pr-10 text-sm text-foreground shadow-sm outline-none ring-primary/25 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25"
                autoComplete="off"
              />
              {draft ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-default p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                  onClick={clearSearchField}
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            <Button type="button" className="h-12 shrink-0 px-8" onClick={runSearch}>
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
                className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary/40 hover:bg-card"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <header className="mt-10">
          <h1 className="text-2xl font-semibold tracking-tight text-secondary-foreground sm:text-3xl">
            {normalizeQuery(query) ? (
              <>
                Showing results for <span className="text-primary">&ldquo;{displayHeading}&rdquo;</span>
              </>
            ) : (
              'Search resources'
            )}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Use the filters to narrow by content type, topic, or audience. Counts reflect how many items match your
            search and other active filters.
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-[min(100%,20rem)] xl:w-80">
            <div className="hidden lg:block">
              <SearchFacetsPanel {...facetPanelProps} />
            </div>
            <div className="lg:hidden">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex w-full items-center justify-center gap-2 rounded-default border border-border bg-card px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-sm">
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
            {featured ? (
              <section
                className="relative overflow-hidden rounded-default border border-primary/25 bg-gradient-to-br from-secondary via-background to-secondary/60 p-5 shadow-sm"
                aria-labelledby="search-qa-heading"
              >
                <div className="absolute right-0 top-0 size-40 rounded-full bg-primary/5 blur-3xl" />
                <div className="relative flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Sparkles className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p id="search-qa-heading" className="text-xs font-bold uppercase tracking-wider text-primary">
                      Quick answer
                    </p>
                    <h2 className="text-lg font-semibold leading-snug text-secondary-foreground">{featured.question}</h2>
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

            <div
              className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
                featured ? 'mt-8' : 'mt-0'
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
                    ' — browse the catalog or add filters'
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
              <div className="mt-4 flex flex-wrap gap-2">
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

            {filtered.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-default border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
                <p className="text-sm font-medium text-secondary-foreground">No matches for that combination.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try clearing filters or a shorter phrase like &ldquo;coverage&rdquo; or &ldquo;news&rdquo;.
                </p>
                <Button type="button" variant="secondary" className="mt-5" onClick={clearFilters}>
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
