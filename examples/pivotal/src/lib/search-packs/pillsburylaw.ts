import {
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  Mic2,
  Newspaper,
  Scale,
  UserRound,
} from 'lucide-react';

import {
  AI_INSIGHT_RULES,
  QUERY_BUCKET_SYNONYMS,
  popularSearches,
  searchCatalog,
  searchFacetLabels,
} from '@/components/search-results/data';

import type { SearchSitePack } from './types';

export const pillsburylawSearchPack: SearchSitePack = {
  siteName: 'pillsburylaw',
  brandName: 'Pillsbury',
  catalog: searchCatalog,
  facetLabels: searchFacetLabels,
  bucketSynonyms: QUERY_BUCKET_SYNONYMS,
  popularSearches,
  insightRules: AI_INSIGHT_RULES,
  copy: {
    kicker: 'Pillsbury search',
    headingEmpty: 'Find lawyers, insights & practices',
    intro:
      'Built for a global firm: search by person, practice, office, or matter narrative. Results link into Bios, capabilities, offices, and insight hubs already in the content tree—then refine by type, practice area, and region.',
    placeholder: 'Search lawyers, practices, offices, insights… or describe your matter',
    emptyHint:
      'Try “Mark Abate intellectual property,” “Japanese company acquisition,” or “Policyholder Pulse.”',
    resultsHint: ' — try a starter search or describe your matter',
    aiHeading: 'Matter-aware guidance',
    citationsHeading: 'Recommended people & pages',
    facetLob: 'Content type',
    facetPeril: 'Practice area',
    facetTopic: 'Office / region',
    tips: [
      {
        title: 'People first',
        body: 'Name a lawyer, practice, or city to land on Bios and offices in the content tree.',
      },
      {
        title: 'Situation search',
        body: 'Describe the matter—“expanding into Saudi Arabia,” “export-control questions”—for AI routing to people + events.',
      },
      {
        title: 'Learn while you connect',
        body: 'Filter webinars, CLE, podcasts, and alerts alongside bios so the right content supports the right counsel.',
      },
    ],
  },
  ctaByLob: {
    lawyer: 'View bio',
    insight: 'Read insights',
    event: 'View event',
    podcast: 'Listen / open',
    capability: 'Explore practice',
    office: 'View office',
    career: 'View role',
    page: 'Open page',
  },
  defaultCta: 'Open page',
  iconByLob: {
    lawyer: UserRound,
    insight: Newspaper,
    event: CalendarDays,
    podcast: Mic2,
    capability: Scale,
    office: Building2,
    career: Briefcase,
    page: FileText,
  },
  featuredLob: 'lawyer',
  enableDemoPersona: true,
};
