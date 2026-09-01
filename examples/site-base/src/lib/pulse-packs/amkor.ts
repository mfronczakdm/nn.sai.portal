import type { PulseSitePack } from './types';

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
    'Which packaging should I use for an AI accelerator with HBM?',
    'Tell me about S-Connect and SWIFT fan-out.',
    'Where do you test in the United States, and what is Peoria?',
    'I am looking for engineering careers at Amkor in Arizona.',
    'Do you have automotive power packages and qualified test flows?',
  ],
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
      id: 'packaging-families',
      matchAny: [
        ['packag'],
        ['fcbga'],
        ['fccsp'],
        ['wlcsp'],
        ['wafer', 'level'],
        ['sip'],
        ['system', 'in', 'package'],
        ['memory'],
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
