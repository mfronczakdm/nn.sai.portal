import type { PulseSource } from '@/lib/pulse-types';
import type { PulseSitePack } from './types';

function page(
  id: string,
  title: string,
  url: string,
  path: string,
  excerpt: string,
  type: PulseSource['type'] = 'other'
): Omit<PulseSource, 'score'> {
  return { id, title, url, path, excerpt, type };
}

const HOME = '/sitecore/content/andmore/atlanta-apparel/Home';

/**
 * Used when Experience Edge item() misses a published GUID (common on the editing host).
 * Hrefs match the atlanta-apparel search pack / content tree so Pulse cards open detail pages.
 */
const FALLBACKS: Record<string, Omit<PulseSource, 'score'>> = {
  '{AB056721-5D0E-4E80-8A05-62258E42679A}': page(
    '{AB056721-5D0E-4E80-8A05-62258E42679A}',
    'Outdoor Living Trends Talk',
    '/Visit/Events/Outdoor-Living-Trends-Talk',
    `${HOME}/Visit/Events/Outdoor Living Trends Talk`,
    'Trend Talk · Tue Sep 15, 2026 · 8:30–9:30 EST · Oasis Meeting Space. Register for market first, then add this seminar to your plan.'
  ),
  '{3A0AF5AB-111F-4DFE-B3EB-FA345F69C6FF}': page(
    '{3A0AF5AB-111F-4DFE-B3EB-FA345F69C6FF}',
    'Shoe and All Accessories Market Grand Opening',
    '/Visit/Events/Shoe-and-All-Accessories-Market-Grand-Opening',
    `${HOME}/Visit/Events/Shoe and All Accessories Market Grand Opening`,
    'Opening-night networking for shoe and accessories buyers. Physical attendance starts with market registration. Mon Sep 14, 2026.'
  ),
  '{F68C01D1-1069-4B42-844B-3518189B6D2F}': page(
    '{F68C01D1-1069-4B42-844B-3518189B6D2F}',
    'Buyer Grab-n-Go Hub',
    '/Visit/Events/Buyer-Grab-n-Go-Hub',
    `${HOME}/Visit/Events/Buyer Grab-n-Go Hub`,
    'Buyer amenity hub between appointments. Use it after you register and build your Market Plan. Tue Sep 15, 2026.'
  ),
  '{21480263-A6C0-4BAE-AC58-48CE1CD53F1B}': page(
    '{21480263-A6C0-4BAE-AC58-48CE1CD53F1B}',
    'Best Brands A Mid-day Mix',
    '/Visit/Events/Best-Brands-A-Mid-day-Mix',
    `${HOME}/Visit/Events/Best Brands A Mid-day Mix`,
    'Mid-day mix for brand discovery. Registration required for floor and event access. Tue Sep 15, 2026.'
  ),
  '{46ED2003-BAA1-4BFC-82BA-A7DC03912109}': page(
    '{46ED2003-BAA1-4BFC-82BA-A7DC03912109}',
    'New Vibe Junior Fashion',
    '/Visit/Events/New-Vibe-Junior-Fashion',
    `${HOME}/Visit/Events/New Vibe Junior Fashion`,
    'Junior fashion seminar on the show calendar. Register, then add the session and nearby exhibitors to your plan. Wed Sep 16, 2026.'
  ),
  '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}': page(
    '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
    'Events & Seminars',
    '/Visit/Events',
    `${HOME}/Visit/Events`,
    'Full September market calendar — seminars, trend talks, amenities, and networking.'
  ),
  '{EBD89713-040D-4B8F-810D-23E44B93F2A6}': page(
    '{EBD89713-040D-4B8F-810D-23E44B93F2A6}',
    'Register for Market',
    '/Visit/Registration',
    `${HOME}/Visit/Registration`,
    'Buyer registration for Atlanta Apparel. Physical market attendance starts here — first-time and returning buyers.',
    'knowledge-article'
  ),
  '{0C67BC67-B071-4243-ABA0-71606A1A4194}': page(
    '{0C67BC67-B071-4243-ABA0-71606A1A4194}',
    'First-Time Buyers',
    '/Visit/Registration/First-Time-Buyers',
    `${HOME}/Visit/Registration/First-Time Buyers`,
    'First-time buyer registration steps, credentials, and what to expect on the floor.',
    'knowledge-article'
  ),
  '{D4057D10-C1BC-44DF-9A6C-5302C5D25CD4}': page(
    '{D4057D10-C1BC-44DF-9A6C-5302C5D25CD4}',
    'Returning Buyers',
    '/Visit/Registration/Returning-Buyers',
    `${HOME}/Visit/Registration/Returning Buyers`,
    'Returning buyer sign-in and badge renewal — fastest path back onto the floor.',
    'knowledge-article'
  ),
  '{94A9563C-55F2-4348-BFAF-95D95DDD58A6}': page(
    '{94A9563C-55F2-4348-BFAF-95D95DDD58A6}',
    'Plan Your Market',
    '/Visit/Plan-Your-Market',
    `${HOME}/Visit/Plan Your Market`,
    'Build a Market Plan so seminars and exhibitor appointments continue after you leave the building.',
    'knowledge-article'
  ),
  '{21A89CBC-2730-4989-8289-085CEA0B6BA5}': page(
    '{21A89CBC-2730-4989-8289-085CEA0B6BA5}',
    'Exhibitor Directory',
    '/Discover',
    `${HOME}/Exhibitor Directory`,
    'Find exhibitors, booths, and lines — Anna Ober, Stia, Outdoor Living Collective, New Vibe — then add them to your Market Plan.',
    'product'
  ),
  '{2D770D8D-618A-4035-BC74-58C9BA6C6E8D}': page(
    '{2D770D8D-618A-4035-BC74-58C9BA6C6E8D}',
    'Jewelry and Fashion Accessories',
    '/Discover/Categories/Jewelry-and-Fashion-Accessories',
    `${HOME}/Discover/Categories/Jewelry and Fashion Accessories`,
    'Jewelry and accessories lines on the floor — including September birthstone stories buyers can shop year-round.',
    'product'
  ),
};

/**
 * Atlanta Apparel Pulse pack — Home-scoped Edge retrieval.
 * Intents mirror the search pack: September research → events + exhibitors + registration
 * with citation hrefs that open Sitecore detail routes (not homepage dead ends).
 */
export const atlantaApparelPulsePack: PulseSitePack = {
  siteName: 'atlanta-apparel',
  brandName: 'Atlanta Apparel',
  homePath: HOME,
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
    'What is happening in September?',
    'How do I register for September market?',
    'Tell me about the Outdoor Living Trends Talk',
    'I am a first-time buyer — where do I start?',
    'Find jewelry exhibitors for September',
  ],
  citationFallbacks: FALLBACKS,
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
        '{AB056721-5D0E-4E80-8A05-62258E42679A}',
        '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
        '{94A9563C-55F2-4348-BFAF-95D95DDD58A6}',
      ],
      answer: {
        intro:
          'Start at **Register for Market** so you can attend Atlanta Apparel in person. First-time and returning buyers have separate paths, then add **Outdoor Living Trends Talk** and exhibitors (Anna Ober, Stia, Outdoor Living Collective) to a Market Plan for year-round sourcing.',
      },
    },
    {
      id: 'september-events',
      matchAny: [
        ['what', 'happening'],
        ['happening', 'september'],
        ['happening', 'sept'],
        ['september'],
        ['sept'],
        ['fall', 'market'],
        ['market'],
        ['event'],
        ['seminar'],
        ['calendar'],
        ['outdoor', 'living'],
        ['trends', 'talk'],
        ['oasis'],
        ['grand', 'opening'],
        ['buyer', 'hub'],
        ['grab-n-go'],
      ],
      citationItemIds: [
        '{AB056721-5D0E-4E80-8A05-62258E42679A}',
        '{3A0AF5AB-111F-4DFE-B3EB-FA345F69C6FF}',
        '{F68C01D1-1069-4B42-844B-3518189B6D2F}',
        '{46ED2003-BAA1-4BFC-82BA-A7DC03912109}',
        '{EBD89713-040D-4B8F-810D-23E44B93F2A6}',
        '{21A89CBC-2730-4989-8289-085CEA0B6BA5}',
        '{2D770D8D-618A-4035-BC74-58C9BA6C6E8D}',
        '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
      ],
      answer: {
        intro:
          'September market is the in-person moment — the same catalog Search returns. Lock **Outdoor Living Trends Talk** (Tue Sep 15, Oasis), the shoe-and-accessories **Grand Opening**, and the **Buyer Grab-n-Go Hub**, then walk matching booths: Anna Ober & Co., Stia, Outdoor Living Collective, and New Vibe. Register if you do not already have credentials.',
      },
    },
    {
      id: 'directory-sourcing',
      matchAny: [
        ['jewelry', 'exhibitor'],
        ['anna', 'ober'],
        ['stia'],
        ['new', 'vibe'],
        ['sapphire'],
        ['exhibitor'],
        ['directory'],
        ['jewelry'],
        ['booth'],
        ['showroom'],
        ['sourcing'],
      ],
      citationItemIds: [
        '{2D770D8D-618A-4035-BC74-58C9BA6C6E8D}',
        '{21A89CBC-2730-4989-8289-085CEA0B6BA5}',
        '{46ED2003-BAA1-4BFC-82BA-A7DC03912109}',
        '{AB056721-5D0E-4E80-8A05-62258E42679A}',
        '{EBD89713-040D-4B8F-810D-23E44B93F2A6}',
        '{47CEA21C-AEC1-4775-93BC-7F5D5B92DFAF}',
      ],
      answer: {
        intro:
          'Use the exhibitor directory the way Search does: find jewelry and outdoor-living lines (Anna Ober & Co., Stia, Outdoor Living Collective, New Vibe), pair them with **Outdoor Living Trends Talk** or the **New Vibe Junior Fashion** seminar, then register so you can add booths to a Market Plan and keep sourcing after you leave the building.',
      },
    },
  ],
};
