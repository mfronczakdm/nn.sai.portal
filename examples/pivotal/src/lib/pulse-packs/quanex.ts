import type { PulseSitePack } from './types';

/**
 * Quanex Pulse pack — Home-scoped Edge retrieval under quanex/quanex/Home.
 * Citation IDs from docs/ai/manifests/sitecore-manifest.yaml → quanex-ia-tree.
 * Content must be published to Experience Edge to appear in Pulse.
 */
export const quanexPulsePack: PulseSitePack = {
  siteName: 'quanex',
  brandName: 'Quanex',
  homePath: '/sitecore/content/quanex/quanex/Home',
  homeRootId: '{E6276198-3FC7-4D8B-BD14-8669B1701536}',
  enableStatePersona: false,
  typeLabels: {
    product: 'Product',
    'knowledge-article': 'Resource',
    'people-and-teams': 'Team',
    'shared-content': 'Related',
    other: 'Capability',
    default: 'Page',
  },
  starterPrompts: [
    'Which insulating glass spacers do you offer for residential windows?',
    'What extrusion and polymer capabilities can Quanex bring to a project?',
    'I need plant equipment and IG line support — where should I start?',
    'Show me architect resources for warm-edge spacers and commercial systems.',
    'Where can I find careers and contact options at Quanex?',
  ],
  intents: [
    {
      id: 'ig-spacers-warm-edge',
      matchAny: [
        ['insulating', 'glass'],
        ['spacer'],
        ['warm', 'edge'],
        ['ig', 'spacer'],
        ['residential', 'window'],
      ],
      citationItemIds: [
        '{9726E4D1-8FCD-4DD6-B5E9-BB4467655176}', // Products / Insulating Glass Spacers
        '{2B002784-21DF-4113-8CCB-DCFB8B356362}', // Residential IG Spacers
        '{D33D7824-0D41-4A3A-AA78-EBD838EEE030}', // For Architects / Warm-Edge Spacers
        '{FBB94D30-6988-4CEF-A9F4-B6268923B7A6}', // Commercial IG Spacers
      ],
    },
    {
      id: 'products-residential-commercial',
      matchAny: [
        ['product'],
        ['residential'],
        ['commercial', 'window'],
        ['entry', 'door'],
        ['weatherseal'],
        ['hardware', 'solution'],
      ],
      citationItemIds: [
        '{C8A3F7B0-E2C4-4D27-AA20-D4018E333B38}', // Products
        '{F57BAA07-A8BC-4859-B1DB-96E0153C4D23}', // Residential
        '{1573CCC9-E6D1-4610-9A38-EBFAB293F91B}', // Commercial
        '{47DBF199-FB3B-4B43-9D50-F12D65441315}', // Weatherseals
        '{B8620C45-6876-4D82-B952-23F659BDF475}', // Hardware Solutions
      ],
    },
    {
      id: 'capabilities-extrusion-polymer',
      matchAny: [
        ['capabilit'],
        ['extrusion'],
        ['polymer'],
        ['roll', 'forming'],
        ['engineered', 'wood'],
        ['sealant'],
      ],
      citationItemIds: [
        '{FBAD5995-D416-453C-A8A7-DF4DDFDAE70F}', // Capabilities
        '{D83F6D57-2ED3-4597-B16D-D73769E7DD60}', // Extrusion Capabilities
        '{BE75F022-BF9A-4330-9D8E-F0B8A6A99204}', // Polymer Solutions
        '{3BA3C62D-A599-44FC-AC8D-51F34B8587FB}', // Roll Forming
        '{A0D6ED2C-988B-424A-B0A5-BD8847C6BF03}', // Engineered Wood
      ],
    },
    {
      id: 'service-support-equipment',
      matchAny: [
        ['service', 'support'],
        ['equipment'],
        ['plant', 'transform'],
        ['line', 'layout'],
        ['ig', 'equipment'],
        ['screens', 'plus'],
        ['account', 'management'],
      ],
      citationItemIds: [
        '{DE76695F-A5F5-40EA-B2D6-EC5E6624E08C}', // Service and Support
        '{E8BDCE5F-1B3D-4107-9E53-B1DE29FEF771}', // Equipment
        '{EE527620-7371-45DE-8A63-4857D143EFC6}', // Plant Transformation
        '{B9D629A4-B71C-488A-93AB-08C524926F57}', // Line Layouts
        '{BD42ABCC-775F-4B48-BA8B-91C6B938C92C}', // Account Management
      ],
    },
    {
      id: 'careers-contact-resources',
      matchAny: [
        ['career'],
        ['job'],
        ['contact'],
        ['location'],
        ['sustainabilit'],
        ['resource'],
        ['architect'],
      ],
      citationItemIds: [
        '{A508286F-88C3-4A67-9B0E-5856DED4FCB3}', // Careers
        '{56EA6322-F923-44F1-B0AF-2A10F9B46C04}', // Contact Us
        '{144E8B02-E31F-4059-B389-EFC605ED093B}', // Resources
        '{0377352D-5E48-4DAD-9516-808C09E2E86A}', // For Architects
        '{353D671A-9A95-4F8E-BC7D-32FD1092A0AD}', // Sustainability
      ],
    },
  ],
};
