'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
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
import { DEMO_TAXONOMY_CHANGE_EVENT, DEMO_TAXONOMY_STORAGE_KEY } from '@/lib/demo-taxonomy';
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

/** Demo plan keys aligned with `DemoUserSwitcher` / `$taxonomy` values */
type DemoPlanTaxonomy = 'BCBS of California' | 'BCBS of Illinois' | 'BCBS of Massachusetts';

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
  /** When set, relevance is boosted for searches while this demo plan user is selected */
  demoPlanTaxonomy?: DemoPlanTaxonomy;
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
  'health of america',
  'EOB explained',
];

const featuredAnswers: FeaturedAnswer[] = [
  {
    id: 'fa-claim-denial',
    triggeredWhenQueryIncludes: ['claim denial', 'denied claim', 'claim denied', 'denial', 'appeal'],
    question: 'What is a claim denial, and what can I do next?',
    answer:
      'A claim denial means your plan determined a service or charge is not payable as submitted — often due to coding, eligibility, network, or medical‑policy reasons. Review the denial notice and EOB, gather records your plan requests, and use the appeals or reconsideration process outlined in your member materials if you disagree.',
    learnMoreHref: 'https://www.bcbs.com/understanding-health-insurance',
    learnMoreLabel: 'Claims & member rights',
  },
  {
    id: 'fa-ma',
    triggeredWhenQueryIncludes: [
      'medicare advantage',
      'medicare',
      'advantage',
      'medicare part c',
      'part c',
      'ma plan',
      'mapd',
    ],
    question: 'What is Medicare Advantage (Part C)?',
    answer:
      'Medicare Advantage is an alternative way to get Medicare Part A and Part B benefits through a private plan (such as an HMO or PPO) that contracts with Medicare. Plans often bundle drug coverage and extra benefits; networks and cost‑sharing differ from Original Medicare, so compare premiums, copays, and covered providers each year.',
    learnMoreHref: 'https://www.bcbs.com/understanding-health-insurance',
    learnMoreLabel: 'Medicare & plan basics',
  },
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
    learnMoreHref: 'https://www.bcbs.com/understanding-health-insurance',
    learnMoreLabel: 'Understanding health insurance',
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

/** Unsplash — healthcare & benefits imagery for BCBS.com-style demo cards. */
function unsplashPhoto(path: string) {
  return `https://images.unsplash.com/${path}?auto=format&fit=crop&w=800&h=520&q=80`;
}

function parseDemoPlanTaxonomy(raw: string | undefined | null): DemoPlanTaxonomy | null {
  const t = raw?.trim();
  if (t === 'BCBS of California' || t === 'BCBS of Illinois' || t === 'BCBS of Massachusetts') {
    return t;
  }
  return null;
}

function supplementalResultsForDemoPlan(plan: DemoPlanTaxonomy): SearchResultItem[] {
  const state =
    plan === 'BCBS of California'
      ? 'California'
      : plan === 'BCBS of Illinois'
        ? 'Illinois'
        : 'Massachusetts';

  const planShort =
    plan === 'BCBS of California'
      ? 'Blue Cross of California'
      : plan === 'BCBS of Illinois'
        ? 'Blue Cross and Blue Shield of Illinois'
        : 'Blue Cross Blue Shield of Massachusetts';

  const code = plan === 'BCBS of California' ? 'ca' : plan === 'BCBS of Illinois' ? 'il' : 'ma';

  return [
    {
      id: `demo-${code}-claim-1`,
      imageSrc: unsplashPhoto('photo-1450101499163-c8848c66ca85'),
      isNew: true,
      demoPlanTaxonomy: plan,
      title: `${state} — Claim denial member guide: codes, timelines & appeals`,
      description: `${planShort}-specific steps after a claim denial in ${state}, including where to upload documents, typical reconsideration windows, and how to request an external review when applicable.`,
      href: 'https://www.bcbs.com/understanding-health-insurance',
      contentType: 'article',
      topics: ['costs', 'coverage'],
      audiences: ['members'],
      dateLabel: `${state} plan office`,
      breadcrumb: ['Claims & billing', `${state} members`],
      matchTerms: ['claim denial', 'appeal', 'reconsideration', 'eob', 'denial'],
    },
    {
      id: `demo-${code}-claim-2`,
      imageSrc: unsplashPhoto('photo-1576091160550-2173dba999ef'),
      demoPlanTaxonomy: plan,
      title: `${state} provider & member toolkit: resolving claim denials faster`,
      description: `Coordinated billing tips for ${state} members working with local providers after a claim denial — prior auth records, coding fixes, and plan-specific forms from ${planShort}.`,
      href: 'https://www.bcbs.com/providers',
      contentType: 'form',
      topics: ['costs', 'care'],
      audiences: ['members', 'providers'],
      breadcrumb: ['Providers', `${state} denials`],
      matchTerms: ['claim denial', 'claim', 'denial', 'prior auth', 'billing'],
    },
    {
      id: `demo-${code}-ma-1`,
      imageSrc: unsplashPhoto('photo-1519494026892-80bbd2d6fd0d'),
      isNew: true,
      demoPlanTaxonomy: plan,
      title: `${state} Medicare Advantage overview: networks, copays & drug tiers`,
      description: `How ${planShort} structures Medicare Advantage (Part C) in ${state} — comparing HMO/PPO access, embedded Part D, and what to verify during Annual Enrollment.`,
      href: 'https://www.bcbs.com/understanding-health-insurance',
      contentType: 'article',
      topics: ['coverage', 'costs'],
      audiences: ['members', 'brokers'],
      dateLabel: `${state} Medicare`,
      breadcrumb: ['Medicare Advantage', `${state}`],
      matchTerms: ['medicare advantage', 'part c', 'mapd', 'enrollment', 'aep'],
    },
    {
      id: `demo-${code}-ma-2`,
      imageSrc: unsplashPhoto('photo-1551288049-bebda4e38f71'),
      demoPlanTaxonomy: plan,
      title: `${state} Medicare Advantage quality & care management highlights`,
      description: `State-focused summary of Medicare Advantage care programs available through ${planShort} in ${state}, including chronic-condition support and how star ratings compare to national benchmarks.`,
      href: 'https://www.bcbs.com/the-health-of-america',
      contentType: 'tool',
      topics: ['coverage', 'about'],
      audiences: ['members', 'brokers'],
      dateLabel: 'Guide',
      breadcrumb: ['Medicare Advantage', `${state} quality`],
      matchTerms: ['medicare advantage', 'part c', 'cms stars', 'dual eligible'],
    },
  ];
}

const defaultCardImage = unsplashPhoto('photo-1576091160399-112ba8d25d1d');

const searchCatalog: SearchResultItem[] = [
  {
    id: '1',
    imageSrc: unsplashPhoto('photo-1576091160399-112ba8d25d1d'),
    isNew: true,
    title: 'Understanding health insurance (BCBS.com)',
    description:
      'How deductibles, copays, coinsurance, and out-of-pocket maximums work — the same concepts members see explained on bcbs.com.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['coverage', 'costs'],
    audiences: ['members'],
    dateLabel: 'Member guide',
    breadcrumb: ['Understanding health insurance', 'Basics'],
    matchTerms: ['benefits', 'deductible', 'copay', 'bcbs', 'blue cross'],
  },
  {
    id: '2',
    imageSrc: unsplashPhoto('photo-1551288049-bebda4e38f71'),
    isNew: true,
    title: 'The Health of America Report®',
    description:
      'BCBS-commissioned research on affordability, chronic conditions, and access — aligned with the public Health of America hub on bcbs.com.',
    href: 'https://www.bcbs.com/the-health-of-america',
    contentType: 'tool',
    topics: ['news', 'about'],
    audiences: ['members', 'employers', 'brokers'],
    dateLabel: 'Research',
    breadcrumb: ['The Health of America', 'Data & insights'],
    matchTerms: ['health of america', 'research', 'affordability', 'trends'],
  },
  {
    id: '3',
    imageSrc: unsplashPhoto('photo-1519494026892-80bbd2d6fd0d'),
    title: 'Healthcare access & health equity',
    description:
      'How Blue Cross and Blue Shield companies advance equitable access to care — mirroring the Healthcare access themes on bcbs.com.',
    href: 'https://www.bcbs.com/healthcare-access',
    contentType: 'article',
    topics: ['care', 'about'],
    audiences: ['members', 'providers'],
    breadcrumb: ['Healthcare access', 'Equity'],
    matchTerms: ['access', 'equity', 'community health', 'medicaid'],
  },
  {
    id: '4',
    imageSrc: unsplashPhoto('photo-1504711434969-e33886168f5c'),
    title: 'BCBS.com Newsroom',
    description:
      'Press releases, statements on federal policy, and stories about BCBS innovation and community programs — as published on bcbs.com/news.',
    href: 'https://www.bcbs.com/news',
    contentType: 'news',
    topics: ['news'],
    audiences: ['employers', 'brokers', 'providers'],
    dateLabel: 'Newsroom',
    breadcrumb: ['News', 'Company updates'],
    matchTerms: ['press', 'policy', 'announcement', 'advocacy'],
  },
  {
    id: '5',
    imageSrc: unsplashPhoto('photo-1600880292203-757bb62b4baf'),
    title: 'Employers: health benefits & workforce health',
    description:
      'Strategy, trend, and plan design topics for HR and benefits leaders — aligned with the Employers section of bcbs.com.',
    href: 'https://www.bcbs.com/employers',
    contentType: 'plan',
    topics: ['costs', 'coverage'],
    audiences: ['employers', 'brokers'],
    breadcrumb: ['Employers', 'Benefits strategy'],
    matchTerms: ['self funded', 'level funded', 'workplace', 'hr'],
  },
  {
    id: '6',
    imageSrc: unsplashPhoto('photo-1521791136064-7986c2920216'),
    title: 'Brokers & consultants: tools and plan highlights',
    description:
      'Materials to support renewals, RFPs, and client education — consistent with bcbs.com resources for brokers and consultants.',
    href: 'https://www.bcbs.com/brokers',
    contentType: 'form',
    topics: ['coverage'],
    audiences: ['brokers'],
    breadcrumb: ['Brokers', 'Sales support'],
    matchTerms: ['consultant', 'rfp', 'renewal', 'proposal'],
  },
  {
    id: '7',
    imageSrc: unsplashPhoto('photo-1576091160550-2173dba999ef'),
    title: 'Healthcare professionals & clinical collaboration',
    description:
      'Care management, quality, and network programs for clinicians and systems — reflecting bcbs.com provider-facing content.',
    href: 'https://www.bcbs.com/providers',
    contentType: 'article',
    topics: ['care'],
    audiences: ['providers', 'members'],
    breadcrumb: ['Providers', 'Clinical programs'],
    matchTerms: ['prior authorization', 'utilization', 'value based care', 'hospital'],
  },
  {
    id: '8',
    imageSrc: unsplashPhoto('photo-1571019613454-1cb2f99b2d8b'),
    title: 'Wellness, prevention & healthy living',
    description:
      'Preventive benefits, screenings, and lifestyle support many BCBS plans emphasize — tied to member wellness content on bcbs.com.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['wellness', 'coverage'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Prevention'],
    matchTerms: ['screening', 'vaccine', 'prevention', 'fitness', 'mental health'],
  },
  {
    id: '9',
    imageSrc: unsplashPhoto('photo-1587854692152-cbe660dbde88'),
    title: 'Pharmacy & prescription drug benefits',
    description:
      'Formularies, tiers, specialty drugs, and pharmacy spend — how BCBS members navigate Rx coverage (see bcbs.com insurance basics).',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'plan',
    topics: ['costs', 'care'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Pharmacy'],
    matchTerms: ['rx', 'drug', 'formulary', 'specialty pharmacy'],
  },
  {
    id: '10',
    imageSrc: unsplashPhoto('photo-1589829545856-d10d557cf95f'),
    title: 'Federal policy, legislation & BCBS advocacy',
    description:
      'How proposed rules and laws affect coverage and affordability — the type of policy perspective BCBS shares via bcbs.com and the Newsroom.',
    href: 'https://www.bcbs.com/news',
    contentType: 'news',
    topics: ['news', 'about'],
    audiences: ['employers', 'brokers'],
    breadcrumb: ['Advocacy', 'Federal policy'],
    matchTerms: ['legislation', 'affordable care', 'cms', 'regulation'],
  },
  {
    id: '11',
    imageSrc: unsplashPhoto('photo-1505751172876-fa1923c5c528'),
    title: 'Find a doctor, compare quality & network care',
    description:
      'Choosing in-network clinicians, PCPs, and specialists — aligned with bcbs.com guidance on healthcare access and finding care.',
    href: 'https://www.bcbs.com/healthcare-access',
    contentType: 'provider',
    topics: ['care'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Find care'],
    matchTerms: ['doctor', 'pcp', 'specialist', 'network', 'telehealth'],
  },
  {
    id: '12',
    imageSrc: unsplashPhoto('photo-1450101499163-c8848c66ca85'),
    title: 'Claims, EOBs & billing transparency',
    description:
      'Reading an EOB, understanding a claim denial or partial denial, surprise-billing protections, and good-faith estimates — topics BCBS covers under understanding health insurance on bcbs.com.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['costs'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Claims & billing'],
    matchTerms: ['surprise bill', 'no surprises', 'eob', 'claim', 'denial', 'appeal'],
  },
  {
    id: '13',
    imageSrc: unsplashPhoto('photo-1576091160399-112ba8d25d1d'),
    title: 'How to read a claim denial code',
    description:
      'Carrier reason codes explain why a claim denial was issued and what documentation may resolve it — use them with your provider’s billing office and your plan’s portal.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['costs', 'care'],
    audiences: ['members', 'providers'],
    breadcrumb: ['Claims', 'Denials'],
    matchTerms: ['denial code', 'claim', 'reconsideration', 'clinical review'],
  },
  {
    id: '14',
    imageSrc: unsplashPhoto('photo-1589829545856-d10d557cf95f'),
    title: 'Appealing a claim denial: timelines & levels',
    description:
      'Most plans use structured appeal levels after an initial claim denial; note deadlines, required forms, and independent review rights in your benefit booklet.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'form',
    topics: ['costs', 'coverage'],
    audiences: ['members'],
    breadcrumb: ['Members', 'Appeals'],
    matchTerms: ['appeal', 'claim denial', 'external review', 'grievance'],
  },
  {
    id: '15',
    imageSrc: unsplashPhoto('photo-1576091160550-2173dba999ef'),
    title: 'Prior auth vs claim denial: avoiding confusion',
    description:
      'A prior authorization denial stops service before it happens; a claim denial applies after care is billed — each has different paperwork and next steps.',
    href: 'https://www.bcbs.com/providers',
    contentType: 'article',
    topics: ['care', 'costs'],
    audiences: ['members', 'providers'],
    breadcrumb: ['Providers', 'Authorizations'],
    matchTerms: ['prior auth', 'claim', 'denial', 'precert'],
  },
  {
    id: '16',
    imageSrc: unsplashPhoto('photo-1504711434969-e33886168f5c'),
    title: 'Surprise bills, denials & the No Surprises Act',
    description:
      'When out-of-network emergency or air-ambulance claims are denied or balanced-billed, federal protections may apply — pair this with your state rules and EOB notes.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'news',
    topics: ['costs', 'news'],
    audiences: ['members', 'employers'],
    breadcrumb: ['Policy', 'Surprise billing'],
    matchTerms: ['no surprises', 'claim', 'denial', 'air ambulance'],
  },
  {
    id: '17',
    imageSrc: unsplashPhoto('photo-1587854692152-cbe660dbde88'),
    title: 'Pharmacy claim denials & formulary exceptions',
    description:
      'Drug claims can be denied for formulary, quantity limits, or step therapy — your prescriber can request an exception when medically appropriate.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'plan',
    topics: ['costs', 'care'],
    audiences: ['members'],
    breadcrumb: ['Pharmacy', 'Denials'],
    matchTerms: ['rx claim', 'denial', 'formulary', 'prior authorization'],
  },
  {
    id: '18',
    imageSrc: unsplashPhoto('photo-1519494026892-80bbd2d6fd0d'),
    title: 'Medicare Advantage vs Original Medicare',
    description:
      'Compare Medicare Advantage (Part C) networks, copays, and out-of-pocket caps with Original Medicare plus supplemental coverage before you enroll or switch.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['coverage', 'costs'],
    audiences: ['members', 'brokers'],
    breadcrumb: ['Medicare', 'Plan choice'],
    matchTerms: ['medicare advantage', 'part c', 'supplement', 'open enrollment'],
  },
  {
    id: '19',
    imageSrc: unsplashPhoto('photo-1551288049-bebda4e38f71'),
    title: 'Medicare Advantage star ratings & quality',
    description:
      'CMS star ratings summarize Medicare Advantage plan performance on outcomes and experience — use them alongside provider directories and drug coverage.',
    href: 'https://www.bcbs.com/the-health-of-america',
    contentType: 'tool',
    topics: ['coverage', 'about'],
    audiences: ['members', 'brokers'],
    dateLabel: 'Guide',
    breadcrumb: ['Medicare', 'Quality'],
    matchTerms: ['medicare advantage', 'cms stars', 'part c', 'quality'],
  },
  {
    id: '20',
    imageSrc: unsplashPhoto('photo-1571019613454-1cb2f99b2d8b'),
    title: 'Dual-eligible & Medicare Advantage D‑SNP basics',
    description:
      'Some Medicare Advantage plans serve people who also have Medicaid (D‑SNPs) with care coordination — eligibility and benefits vary by county and contract.',
    href: 'https://www.bcbs.com/healthcare-access',
    contentType: 'plan',
    topics: ['coverage', 'care'],
    audiences: ['members', 'brokers'],
    breadcrumb: ['Medicare Advantage', 'Dual eligible'],
    matchTerms: ['dsnp', 'medicare advantage', 'medicaid', 'part c'],
  },
  {
    id: '21',
    imageSrc: unsplashPhoto('photo-1521791136064-7986c2920216'),
    title: 'Medicare Advantage open enrollment periods',
    description:
      'AEP, MA OEP, and special enrollment events govern when you can join or change Medicare Advantage coverage — missing a window can delay effective dates.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'article',
    topics: ['coverage'],
    audiences: ['members', 'brokers'],
    breadcrumb: ['Medicare Advantage', 'Enrollment'],
    matchTerms: ['aep', 'ma oep', 'medicare advantage', 'special enrollment'],
  },
  {
    id: '22',
    imageSrc: unsplashPhoto('photo-1587854692152-cbe660dbde88'),
    title: 'Medicare Advantage prescription (MAPD) coverage',
    description:
      'Most Medicare Advantage enrollees choose a MAPD plan with Part D embedded — compare tiers, mail order, and preferred pharmacies each year.',
    href: 'https://www.bcbs.com/understanding-health-insurance',
    contentType: 'plan',
    topics: ['costs', 'care'],
    audiences: ['members'],
    breadcrumb: ['Medicare Advantage', 'Drug coverage'],
    matchTerms: ['mapd', 'part d', 'medicare advantage', 'formulary'],
  },
  {
    id: '23',
    imageSrc: unsplashPhoto('photo-1505751172876-fa1923c5c528'),
    title: 'Travel & out-of-area care on Medicare Advantage',
    description:
      'Medicare Advantage plans use networks; understand urgent/emergency rules, visitor/travel benefits, and prior notification before you leave your service area.',
    href: 'https://www.bcbs.com/healthcare-access',
    contentType: 'article',
    topics: ['coverage', 'care'],
    audiences: ['members'],
    breadcrumb: ['Medicare Advantage', 'Network'],
    matchTerms: ['travel', 'urgent care', 'medicare advantage', 'network'],
  },
  {
    id: '24',
    imageSrc: unsplashPhoto('photo-1600880292203-757bb62b4baf'),
    title: 'Employer retiree coverage & Medicare Advantage',
    description:
      'Retiree carve-outs sometimes steer to Medicare Advantage or group Medicare options — align HR communications with individual Medicare rights and disclosures.',
    href: 'https://www.bcbs.com/employers',
    contentType: 'plan',
    topics: ['coverage', 'costs'],
    audiences: ['employers', 'brokers'],
    breadcrumb: ['Employers', 'Medicare Advantage'],
    matchTerms: ['retiree', 'medicare advantage', 'group medicare', 'part c'],
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

function relevanceScore(item: SearchResultItem, q: string, activeDemoPlan: DemoPlanTaxonomy | null): number {
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
  if (activeDemoPlan && item.demoPlanTaxonomy === activeDemoPlan) {
    score += 25;
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

/** Client-side page size for the result grid (3 columns × 3 rows at xl). */
const RESULTS_PAGE_SIZE = 9;

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
  const img = item.imageSrc ?? defaultCardImage;
  const rows = itemAttributeRows(item);
  return (
    <article className="group flex flex-col overflow-hidden rounded-default border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex flex-1 flex-col text-inherit no-underline">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={img}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
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

  const activeDemoPlan = useMemo(() => parseDemoPlanTaxonomy(demoTaxonomyRaw), [demoTaxonomyRaw]);

  const activeCatalog = useMemo(() => {
    if (!activeDemoPlan) return searchCatalog;
    return [...supplementalResultsForDemoPlan(activeDemoPlan), ...searchCatalog];
  }, [activeDemoPlan]);

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

  useEffect(() => {
    setResultsPage(1);
  }, [query, selectedTypes, selectedTopics, selectedAudiences, sort]);

  const queryMatched = useMemo(
    () => activeCatalog.filter((item) => itemMatchesQuery(item, query)),
    [activeCatalog, query]
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
    let list = activeCatalog.filter((item) => itemMatchesQuery(item, q));

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
        const ra = relevanceScore(a, q, activeDemoPlan);
        const rb = relevanceScore(b, q, activeDemoPlan);
        if (rb !== ra) return rb - ra;
        return a.title.localeCompare(b.title);
      });
    }
    return sorted;
  }, [activeCatalog, activeDemoPlan, query, selectedTypes, selectedTopics, selectedAudiences, sort]);

  const resultsTotalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PAGE_SIZE));
  const safeResultsPage = Math.min(resultsPage, resultsTotalPages);
  const pagedResults = useMemo(() => {
    const start = (safeResultsPage - 1) * RESULTS_PAGE_SIZE;
    return filtered.slice(start, start + RESULTS_PAGE_SIZE);
  }, [filtered, safeResultsPage]);

  useEffect(() => {
    if (resultsPage > resultsTotalPages) setResultsPage(resultsTotalPages);
  }, [resultsPage, resultsTotalPages]);

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
                        className="min-w-[5.5rem]"
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
                        className="min-w-[5.5rem]"
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
