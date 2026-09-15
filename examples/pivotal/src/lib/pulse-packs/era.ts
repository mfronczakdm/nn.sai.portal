import type { PulseSitePack } from './types';

/**
 * ERA Everywhere Pulse pack — Home-scoped Edge retrieval under quanex/era/Home.
 * Citation IDs from docs/ai/manifests/sitecore-manifest.yaml → era-ia-tree.
 * Content must be published to Experience Edge to appear in Pulse.
 */
export const eraPulsePack: PulseSitePack = {
  siteName: 'era',
  brandName: 'ERA',
  homePath: '/sitecore/content/quanex/era/Home',
  homeRootId: '{69A414F6-9E12-48D6-92C1-215609517A83}',
  enableStatePersona: false,
  typeLabels: {
    product: 'Product',
    'knowledge-article': 'Technical',
    'people-and-teams': 'People',
    'shared-content': 'Related',
    other: 'Category',
    default: 'Page',
  },
  starterPrompts: [
    'What window handles and locks do you offer for casement windows?',
    'I need multi-point door locks and cylinders for entrance doors.',
    'Tell me about ERA Protect and smart home security options.',
    'Where can I browse Fab & Fix ranges and weatherseals?',
    'How do I get technical downloads or customer service support?',
  ],
  intents: [
    {
      id: 'window-components',
      matchAny: [
        ['window', 'component'],
        ['casement'],
        ['sash', 'window'],
        ['tilt', 'turn'],
        ['window', 'handle'],
        ['window', 'lock'],
        ['friction', 'stay'],
      ],
      citationItemIds: [
        '{67799195-7BEF-493D-B16D-C5D890EF7F37}', // Window Components
        '{5C16876B-73CF-44E0-B1F3-FEB511694AEC}', // Casement Windows
        '{5055E532-B6F1-4BB4-A035-1DCD93F0E3A0}', // Window Handles
        '{7FFFC5DB-BF47-440D-A01E-825A85859232}', // Window Locks
        '{89FD0CDB-99E6-41D8-8E9B-7A88EA9B4813}', // Sash Windows
      ],
    },
    {
      id: 'door-components',
      matchAny: [
        ['door', 'component'],
        ['entrance', 'door'],
        ['multi', 'point'],
        ['cylinder'],
        ['mortice'],
        ['digital', 'door'],
        ['sliding', 'door'],
      ],
      citationItemIds: [
        '{205D5CB8-B1E3-4E0D-9AD8-E2FBB9326B46}', // Door Components
        '{26E81270-ADAD-40F9-BF24-8F3338236567}', // Entrance Doors
        '{06B0C966-F143-4C64-B217-D7953C7E5180}', // Multi-Point Door Locks
        '{BCB7E205-6A0B-48FF-9B54-C49F0C6020BF}', // Cylinders
        '{7712A8E4-7F01-41B6-AE93-0FE15872D8D8}', // Sliding Doors
      ],
    },
    {
      id: 'home-security-protect',
      matchAny: [
        ['era', 'protect'],
        ['home', 'security'],
        ['smart', 'home'],
        ['alarm'],
        ['neighbourhood', 'watch'],
      ],
      citationItemIds: [
        '{8E4B55C2-EC73-410F-835C-91CC41470700}', // Home Security
        '{A2D84554-5738-47DF-8F98-256A5CA3738A}', // ERA Protect Ecosystem
        '{630A8BE1-05C6-41DE-9A19-130C62FFE82D}', // Smart Home Alarm Systems
        '{1ADF37C4-1EE5-4F08-BE7B-9E1C52D58289}', // Neighbourhood Watch
      ],
    },
    {
      id: 'fabfix-weatherseals-ironmongery',
      matchAny: [
        ['fab', 'fix'],
        ['fabandfix'],
        ['weatherseal'],
        ['ironmongery'],
        ['heritage', 'range'],
        ['classic', 'range'],
      ],
      citationItemIds: [
        '{012818BA-915F-4B1E-89F8-41250A1A6FC2}', // Fab and Fix
        '{54011403-C279-43C0-A356-633762218CFF}', // Classic Range
        '{9BD39BF1-C5CD-4371-850C-145577D9BCF4}', // Heritage Range
        '{C8A4AF67-7A18-4962-BE84-4B2E7876787E}', // Weatherseals
        '{C55EB5E7-15FB-4F94-8297-2A1799CDA7E2}', // Ironmongery
      ],
    },
    {
      id: 'technical-customer-service',
      matchAny: [
        ['technical'],
        ['download'],
        ['certification'],
        ['customer', 'service'],
        ['contact'],
        ['career'],
        ['delivery'],
      ],
      citationItemIds: [
        '{2CF36081-802B-4CF7-A21E-559F5E66C004}', // Technical
        '{B343BCDE-6935-4747-8F0D-4063D51A9099}', // Technical Downloads
        '{127F600F-3859-4AF3-A564-3F7B931A0461}', // Customer Service
        '{D7BB5D97-0E6E-4EAF-A4A6-70C75C5E1764}', // Contact Us
        '{F8C16D16-07E7-405F-B548-897BF7898E7B}', // Careers
      ],
    },
  ],
};
