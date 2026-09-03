import type { PulseSitePack } from './types';

/**
 * Atlanta Apparel Pulse pack — Home-scoped Edge retrieval.
 * Intents push physical-market registration, then events + exhibitor follow-on.
 */
export const atlantaApparelPulsePack: PulseSitePack = {
  siteName: 'atlanta-apparel',
  brandName: 'Atlanta Apparel',
  homePath: '/sitecore/content/andmore/atlanta-apparel/Home',
  homeRootId: '{011D81AC-F13E-4DC1-A142-88119D17A7B5}',
  enableStatePersona: false,
  typeLabels: {
    product: 'Exhibitor',
    'knowledge-article': 'Guide',
    'people-and-teams': 'Team',
    'shared-content': 'Related',
    other: 'Event',
    default: 'Page',
  },
  starterPrompts: [
    'How do I register for September market?',
    'What events are happening in September?',
    'Tell me about the Outdoor Living Trends Talk',
    'I am a first-time buyer — where do I start?',
    'Find jewelry exhibitors for September',
  ],
  intents: [
    {
      id: 'register-market',
      matchAny: [
        ['register'],
        ['registration'],
        ['sign', 'in'],
        ['first-time'],
        ['returning', 'buyer'],
        ['market', 'plan'],
        ['badge'],
      ],
      citationItemIds: [
        '{EBD89713-040D-4B8F-810D-23E44B93F2A6}',
        '{0C67BC67-B071-4243-ABA0-71606A1A4194}',
        '{D4057D10-C1BC-44DF-9A6C-5302C5D25CD4}',
        '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
      ],
      answer: {
        intro:
          'Start at Registration so you can attend Atlanta Apparel in person. First-time and returning buyers have separate paths, then you can add seminars and exhibitors to a Market Plan for year-round sourcing.',
      },
    },
    {
      id: 'september-events',
      matchAny: [
        ['september'],
        ['event'],
        ['seminar'],
        ['calendar'],
        ['outdoor', 'living'],
        ['trends', 'talk'],
      ],
      citationItemIds: [
        '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
        '{AB056721-5D0E-4E80-8A05-62258E42679A}',
        '{3A0AF5AB-111F-4DFE-B3EB-FA345F69C6FF}',
        '{EBD89713-040D-4B8F-810D-23E44B93F2A6}',
      ],
      answer: {
        intro:
          'September market is the in-person moment. Open the Events calendar, lock Outdoor Living Trends Talk, and register if you do not already have credentials.',
      },
    },
    {
      id: 'directory-sourcing',
      matchAny: [['exhibitor'], ['directory'], ['jewelry'], ['booth'], ['showroom'], ['sourcing']],
      citationItemIds: [
        '{21A89CBC-2730-4989-8289-085CEA0B6BA5}',
        '{EBD89713-040D-4B8F-810D-23E44B93F2A6}',
        '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
      ],
      answer: {
        intro:
          'Use the exhibitor directory to find booths and lines, then register so you can add them to a Market Plan and keep sourcing after you leave the building.',
      },
    },
  ],
};
