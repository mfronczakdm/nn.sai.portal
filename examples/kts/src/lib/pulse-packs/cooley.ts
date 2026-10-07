import type { PulseSitePack } from './types';

/**
 * Cooley Pulse pack — Home-scoped Edge retrieval under Cooley/cooley/Home.
 * Citation IDs from docs/ai/manifests/sitecore-manifest.yaml → Cooley Home IA.
 * Content must be published to Experience Edge to appear in Pulse.
 */
export const cooleyPulsePack: PulseSitePack = {
  siteName: 'cooley',
  brandName: 'Cooley',
  homePath: '/sitecore/content/Cooley/cooley/Home',
  homeRootId: '{E17C24E2-6BC8-4415-8745-484D0DBBF8D0}',
  enableStatePersona: false,
  typeLabels: {
    product: 'Practice',
    'knowledge-article': 'Insight',
    'people-and-teams': 'Lawyer',
    'shared-content': 'Related',
    other: 'Page',
    default: 'Page',
  },
  starterPrompts: [
    'Who should I talk to about a Series B venture financing?',
    'Life sciences IPO counsel',
    'AI governance webinar for boards',
    'Show me recent media and insight on technology companies.',
    'How do I explore careers at Cooley?',
  ],
  intents: [
    {
      id: 'practices',
      matchAny: [
        ['practice'],
        ['venture', 'financ'],
        ['capital', 'market'],
        ['litigation'],
        ['intellectual', 'property'],
        ['acquisition'],
        ['merger'],
      ],
      citationItemIds: [
        '{F93A9099-45BF-40DD-B1D0-1D4CD7CD2861}', // Practices
      ],
    },
    {
      id: 'industries',
      matchAny: [
        ['industr'],
        ['life', 'science'],
        ['technology', 'compan'],
        ['healthcare'],
        ['fintech'],
      ],
      citationItemIds: [
        '{BCAB7711-8D2A-4040-9EBD-C2ECA3E8553F}', // Industries
      ],
    },
    {
      id: 'people',
      matchAny: [
        ['who', 'should'],
        ['talk', 'to'],
        ['lawyer'],
        ['partner'],
        ['people'],
        ['attorney'],
        ['bio'],
      ],
      citationItemIds: [
        '{E94FC8B8-FAF1-47EF-8985-B2B39BD102D1}', // People
      ],
    },
    {
      id: 'media-insight',
      matchAny: [
        ['insight'],
        ['media'],
        ['news'],
        ['article'],
        ['webinar'],
        ['thought', 'leadership'],
      ],
      citationItemIds: [
        '{F2CFB86E-36DD-4F44-A5C9-1814BDB074EC}', // Media and Insight
      ],
    },
    {
      id: 'about',
      matchAny: [['about'], ['office'], ['firm'], ['history'], ['diversity']],
      citationItemIds: [
        '{1FBF29A1-4BDC-43C8-A2D6-8B5B6DB33E30}', // About
      ],
    },
    {
      id: 'careers',
      matchAny: [
        ['career'],
        ['job'],
        ['opening'],
        ['summer', 'associate'],
        ['how', 'apply'],
        ['work', 'at', 'cooley'],
      ],
      citationItemIds: [
        '{C7E84C98-3C61-49FE-A3D7-92290EB40DBF}', // Careers
      ],
    },
  ],
};
