import type { PulseSource } from '@/lib/pulse-types';
import type { PulseSitePack } from './types';

function page(
  id: string,
  title: string,
  url: string,
  path: string,
  excerpt: string,
  type: PulseSource['type'] = 'product'
): Omit<PulseSource, 'score'> {
  return { id, title, url, path, excerpt, type };
}

/**
 * Used when Experience Edge item() misses a published GUID (common on the editing host).
 * Paths match the amkor/amkor content tree so hydrate can query by path instead of GUID.
 */
const FALLBACKS: Record<string, Omit<PulseSource, 'score'>> = {
  '{0EBC33FF-8697-49B8-A276-19BD86E99074}': page(
    '{0EBC33FF-8697-49B8-A276-19BD86E99074}',
    'Memory',
    '/Packaging/Memory',
    '/sitecore/content/amkor/amkor/Home/Packaging/Memory',
    'Amkor memory and storage solutions support NAND, DRAM, eMMC, M.2 modules and custom products for mobile, automotive and data centers.'
  ),
  '{764CB846-8081-439C-BAB5-A0BA97F45BF7}': page(
    '{764CB846-8081-439C-BAB5-A0BA97F45BF7}',
    'FlipStack CSP',
    '/Packaging/Laminate/FlipStack-CSP',
    '/sitecore/content/amkor/amkor/Home/Packaging/Laminate/FlipStack CSP',
    'Stacked CSP packaging for memory-plus-logic combinations in a compact laminate form factor.'
  ),
  '{D36A3F10-8A1C-46E6-BFFC-59F318C87129}': page(
    '{D36A3F10-8A1C-46E6-BFFC-59F318C87129}',
    'Package-on-Package',
    '/Technology/Package-on-Package',
    '/sitecore/content/amkor/amkor/Home/Technology/Package-on-Package',
    'Package-on-package stacking for memory and logic in a compact vertical footprint.'
  ),
  '{874F21E1-91B9-44BD-BE36-A5AEF1A95055}': page(
    '{874F21E1-91B9-44BD-BE36-A5AEF1A95055}',
    'System in Package (SiP)',
    '/Packaging/System-in-Package-SiP',
    '/sitecore/content/amkor/amkor/Home/Packaging/System in Package SiP',
    'System-in-package solutions that combine multiple die in a single module for RF, IoT, and compact systems.'
  ),
  '{CFF1B3A2-45C1-44F9-8411-32C55F316627}': page(
    '{CFF1B3A2-45C1-44F9-8411-32C55F316627}',
    'Packaging',
    '/Packaging',
    '/sitecore/content/amkor/amkor/Home/Packaging',
    'Amkor packaging families including laminate, wafer-level, SiP, memory, leadframe, and power.'
  ),
  '{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}': page(
    '{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}',
    'Careers',
    '/About-Us/Careers',
    '/sitecore/content/amkor/amkor/Home/About Us/Careers',
    'Global engineering, operations, and corporate openings across Amkor sites.',
    'other'
  ),
  '{74297BC9-7EA0-496D-A956-882BEFEE3230}': page(
    '{74297BC9-7EA0-496D-A956-882BEFEE3230}',
    'Careers — United States',
    '/About-Us/Careers/United-States',
    '/sitecore/content/amkor/amkor/Home/About Us/Careers/United States',
    'U.S. roles including the Arizona advanced packaging and test campus.',
    'other'
  ),
  '{F4F4B8B7-38C9-4990-9934-9A55A96CC425}': page(
    '{F4F4B8B7-38C9-4990-9934-9A55A96CC425}',
    'Careers — Korea',
    '/About-Us/Careers/Korea',
    '/sitecore/content/amkor/amkor/Home/About Us/Careers/Korea',
    'Korea manufacturing and engineering career paths.',
    'other'
  ),
  '{A3CAEC3B-1A9D-4FFE-A8E1-926C1540E0AE}': page(
    '{A3CAEC3B-1A9D-4FFE-A8E1-926C1540E0AE}',
    'Careers — Vietnam',
    '/About-Us/Careers/Vietnam',
    '/sitecore/content/amkor/amkor/Home/About Us/Careers/Vietnam',
    'Vietnam site openings for manufacturing and operations.',
    'other'
  ),
  '{E0C7CEB1-0EC3-4B9C-B96C-684C52DCE4AB}': page(
    '{E0C7CEB1-0EC3-4B9C-B96C-684C52DCE4AB}',
    'Careers — Portugal',
    '/About-Us/Careers/Portugal',
    '/sitecore/content/amkor/amkor/Home/About Us/Careers/Portugal',
    'Portugal site openings.',
    'other'
  ),
  '{EDDB8EF0-8C38-401C-92F5-F618A696A6ED}': page(
    '{EDDB8EF0-8C38-401C-92F5-F618A696A6ED}',
    'Building the Talent Pipeline with West-MEC Students',
    '/About-Us/News/Blog/Building-Talent-Pipeline-West-MEC-Students',
    '/sitecore/content/amkor/amkor/Home/About Us/News/Blog/Building Talent Pipeline West-MEC Students',
    'How Amkor partners with West-MEC advanced manufacturing students to grow the semiconductor workforce.',
    'knowledge-article'
  ),
  '{620CDBA1-8F9D-4B45-BCC2-6F89BFFD78C0}': page(
    '{620CDBA1-8F9D-4B45-BCC2-6F89BFFD78C0}',
    'Semiconductor Educator Bootcamp',
    '/About-Us/News/Blog/Amkor-Semiconductor-Educator-Bootcamp',
    '/sitecore/content/amkor/amkor/Home/About Us/News/Blog/Amkor Semiconductor Educator Bootcamp',
    'Educator bootcamp to strengthen the future semiconductor workforce pipeline.',
    'knowledge-article'
  ),
  '{172CA403-7A83-4003-8ABF-F3C174C4D2F8}': page(
    '{172CA403-7A83-4003-8ABF-F3C174C4D2F8}',
    "Arizona's Next Chip Leaders",
    '/About-Us/News/Blog/Arizona-Next-Chip-Leaders-CUSD-SEMI-CTE',
    '/sitecore/content/amkor/amkor/Home/About Us/News/Blog/Arizona Next Chip Leaders CUSD SEMI CTE',
    'CUSD SEMI CTE program and Amkor’s role in Arizona’s next chip leaders.',
    'knowledge-article'
  ),
};

/**
 * Amkor Pulse pack — Home-scoped Edge retrieval under amkor/amkor/Home.
 * Citation IDs from get_all_pages_by_site (amkor). Must be published to Edge.
 * Isolated from Quanex / Pillsbury packs on the shared editing host.
 */
export const amkorPulsePack: PulseSitePack = {
  siteName: 'amkor',
  brandName: 'Amkor',
  homePath: '/sitecore/content/amkor/amkor/Home',
  homeRootId: '{BB13BF5A-B102-4FE8-B410-63E3DA7AA448}',
  enableStatePersona: false,
  typeLabels: {
    product: 'Package',
    'knowledge-article': 'Story',
    'people-and-teams': 'Leadership',
    'shared-content': 'Related',
    other: 'Page',
    default: 'Page',
  },
  starterPrompts: [
    'Tell me about Amkor memory packaging',
    'Help me find a career',
    'Which packaging should I use for an AI accelerator with HBM?',
    'Tell me about S-Connect and SWIFT fan-out.',
    'Where do you test in the United States, and what is Peoria?',
  ],
  citationFallbacks: FALLBACKS,
  intents: [
    {
      id: 'ai-advanced-packaging',
      matchAny: [
        ['s-connect'],
        ['sconnect'],
        ['swift'],
        ['s-swift'],
        ['2.5d'],
        ['3d', 'tsv'],
        ['hbm'],
        ['nvidia'],
        ['artificial', 'intelligence'],
        ['ai', 'packag'],
        ['accelerator'],
        ['interposer'],
      ],
      citationItemIds: [
        '{1F93ED97-C9E0-4A5E-9B79-ABA7BEFD2157}', // Technology / S-Connect
        '{B49F5BEE-B6D4-4E71-8249-D814522087A9}', // Technology / SWIFT
        '{661EEBCD-90EE-4393-A085-F4FF6710A826}', // Technology / S-SWIFT
        '{F4903CA0-FBF5-4486-B2A9-80DA52523BF9}', // Technology / 2.5D 3D TSV
        '{2D3B2322-D080-4557-9E16-CB198F62C8AA}', // Applications / Artificial Intelligence
        '{9D6BFBE6-DF0A-4340-8F9B-2B353BA47AC1}', // Packaging / Laminate / FCBGA
        '{A42872CF-6EF9-42DA-A65E-02FE32E11A56}', // NVIDIA partnership
      ],
    },
    {
      id: 'memory-packaging',
      matchAny: [
        ['memory', 'packag'],
        ['memory', 'package'],
        ['dram'],
        ['nand'],
        ['memory'],
      ],
      citationItemIds: [
        '{0EBC33FF-8697-49B8-A276-19BD86E99074}', // Packaging / Memory — primary
        '{764CB846-8081-439C-BAB5-A0BA97F45BF7}', // Laminate / FlipStack CSP
        '{D36A3F10-8A1C-46E6-BFFC-59F318C87129}', // Technology / Package-on-Package
        '{874F21E1-91B9-44BD-BE36-A5AEF1A95055}', // SiP
        '{CFF1B3A2-45C1-44F9-8411-32C55F316627}', // Packaging hub
      ],
      answer: {
        intro:
          'Amkor memory packaging covers stacked and high-bandwidth platforms used in compute, mobile, automotive, and data centers — including NAND, DRAM, eMMC, M.2 modules, and custom memory products. The **Memory** overview is the dedicated starting point for those platforms, including devices that sit next to logic, rather than a general laminate or FCBGA family page.',
      },
    },
    {
      id: 'packaging-families',
      matchAny: [
        ['packag'],
        ['fcbga'],
        ['fccsp'],
        ['wlcsp'],
        ['wafer', 'level'],
        ['sip'],
        ['system', 'in', 'package'],
        ['leadframe'],
        ['qfn'],
        ['flip', 'chip'],
      ],
      citationItemIds: [
        '{CFF1B3A2-45C1-44F9-8411-32C55F316627}', // Packaging
        '{B508EAF5-A373-43CD-A504-D5ADD51AE36B}', // Laminate
        '{9D6BFBE6-DF0A-4340-8F9B-2B353BA47AC1}', // FCBGA
        '{E612545E-DDF3-4DA9-85D0-FA7BD8249855}', // Wafer Level
        '{1F3236AD-D353-46FF-B55B-6C0B9D6ADD95}', // WLCSP
        '{874F21E1-91B9-44BD-BE36-A5AEF1A95055}', // SiP
        '{0EBC33FF-8697-49B8-A276-19BD86E99074}', // Memory
        '{8B6D05C9-7940-49A3-B371-44BF34E1A02A}', // Leadframe
        '{65D76B35-6818-4960-9507-25C44EA92BE9}', // Flip Chip
      ],
    },
    {
      id: 'test-arizona-capacity',
      matchAny: [
        ['test'],
        ['arizona'],
        ['peoria'],
        ['ate'],
        ['final', 'test'],
        ['us', 'factory'],
        ['united', 'states', 'packag'],
        ['wafer', 'probe'],
      ],
      citationItemIds: [
        '{C39BC746-0C9C-4C76-A623-3DE87ED527F0}', // Test Services
        '{8C43BF43-1FA2-42CA-B535-D18A528B0BAC}', // Peoria blog
        '{E1435CB8-EDE6-4A86-911F-58CB91C3300D}', // Services
        '{4332E3EA-A3AF-413A-BC52-B32861D6392B}', // Wafer Bumping
        '{10C697EC-265D-45F2-9007-EAA023C90A93}', // Design Services
      ],
    },
    {
      id: 'applications-markets',
      matchAny: [
        ['automotive'],
        ['adas'],
        ['ev'],
        ['communications'],
        ['5g'],
        ['iot'],
        ['computing'],
        ['consumer'],
        ['industrial'],
        ['networking'],
        ['power', 'pack'],
      ],
      citationItemIds: [
        '{20E5730D-E035-4835-B224-BD494A0F3C99}', // Applications
        '{BC03EECC-5E7C-4897-8ACE-7E834F2BED1E}', // Automotive
        '{2D3B2322-D080-4557-9E16-CB198F62C8AA}', // AI
        '{5559500A-A62E-480F-81AF-FC453032AE38}', // Communications
        '{E7C78365-D02B-4D31-A898-E5C1D16709AB}', // IoT
        '{7D2DC1EC-89FC-49B9-A779-7A44A51D9C3C}', // Power
        '{518DF9E7-844E-413A-9F74-42108EFEE527}', // Quality
      ],
    },
    {
      id: 'careers-talent',
      matchAny: [
        ['help', 'career'],
        ['find', 'career'],
        ['looking', 'career'],
        ['career', 'arizona'],
        ['career', 'amkor'],
        ['engineering', 'career'],
        ['career'],
        ['job'],
        ['jobs'],
        ['hiring'],
        ['talent'],
        ['intern'],
        ['opening'],
        ['work', 'at', 'amkor'],
        ['join', 'amkor'],
        ['arizona', 'job'],
        ['peoria', 'job'],
        ['engineer', 'role'],
      ],
      citationItemIds: [
        '{6F39EC02-DAA7-4FED-9E65-E31A9DAF37F1}', // Careers
        '{74297BC9-7EA0-496D-A956-882BEFEE3230}', // Careers / United States
        '{F4F4B8B7-38C9-4990-9934-9A55A96CC425}', // Careers / Korea
        '{A3CAEC3B-1A9D-4FFE-A8E1-926C1540E0AE}', // Careers / Vietnam
        '{E0C7CEB1-0EC3-4B9C-B96C-684C52DCE4AB}', // Careers / Portugal
        '{EDDB8EF0-8C38-401C-92F5-F618A696A6ED}', // Building Talent Pipeline
        '{620CDBA1-8F9D-4B45-BCC2-6F89BFFD78C0}', // Semiconductor Educator Bootcamp
        '{172CA403-7A83-4003-8ABF-F3C174C4D2F8}', // Next Chip Leaders CTE
      ],
      answer: {
        intro:
          'Amkor posts engineering, operations, and corporate roles worldwide. **Careers** is where to browse openings; pick the country that matches where you want to work — United States for Arizona and Peoria, or Korea, Vietnam, and Portugal for manufacturing sites. Amkor also publishes how it grows the semiconductor workforce if you are exploring internships or early-career paths.',
      },
    },
    {
      id: 'company-contact',
      matchAny: [
        ['about', 'amkor'],
        ['who', 'we'],
        ['contact'],
        ['overview'],
        ['leadership'],
        ['document', 'library'],
        ['datasheet'],
        ['quality'],
        ['customer', 'center'],
      ],
      citationItemIds: [
        '{B6B4DA5A-F8B2-4AD1-BF08-02AADF88C82E}', // Amkor Overview
        '{86E9AAED-39B1-4E89-9E41-9C3E778F8E1D}', // About Us
        '{DF23610E-A0C4-4E95-A316-AB794CFF927F}', // Contact Us
        '{732461B7-BE88-46A1-88D6-1BA797112060}', // Document Library
        '{41FF6CB6-EAFE-4153-926F-BDFF896DB03C}', // Customer Center
        '{229DB77C-8772-482B-863D-763554D4F19F}', // Leadership
        '{518DF9E7-844E-413A-9F74-42108EFEE527}', // Quality
      ],
    },
  ],
};
