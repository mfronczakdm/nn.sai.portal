/**
 * Curated related insights / speaking for BioDetail.
 * Keyed by leftover Sitecore Bio page item name (hyphenated).
 * Start with Ata-A-Akiner (display: Marc Abdelsayed) for the
 * Canada tariffs / doing-business demo journey.
 */

export type BioRelatedContentType =
  | 'blog'
  | 'webinar'
  | 'podcast'
  | 'cle'
  | 'alert'
  | 'guide'
  | 'white-paper'
  | 'presentation';

export type BioRelatedContentItem = {
  id: string;
  type: BioRelatedContentType;
  title: string;
  description: string;
  href: string;
  /** Short label shown as badge (defaults from type) */
  badge?: string;
  dateLabel?: string;
};

export type BioRelatedContentProfile = {
  /** Section heading on the bio */
  sectionTitle: string;
  /** One-line intro under the heading */
  sectionIntro: string;
  items: BioRelatedContentItem[];
};

const TYPE_BADGE: Record<BioRelatedContentType, string> = {
  blog: 'Blog',
  webinar: 'Webinar',
  podcast: 'Podcast',
  cle: 'CLE',
  alert: 'Alert',
  guide: 'Guide',
  'white-paper': 'White paper',
  presentation: 'Presentation',
};

export function relatedContentBadge(item: BioRelatedContentItem): string {
  return item.badge || TYPE_BADGE[item.type];
}

/** Demo-ready related content for Marc Abdelsayed — people → learning assets journey */
const MARC_ABDELSAYED: BioRelatedContentProfile = {
  sectionTitle: 'Insights & speaking',
  sectionIntro:
    'Tariffs, customs, and doing business in Canada — webinars, podcasts, and guides to brief your team before the first call.',
  items: [
    {
      id: 'blog-canada-tariffs',
      type: 'blog',
      title: 'Canada Tariffs and Supply Chains',
      description:
        'Commentary on tariff diligence for inbound market entry—and how to pair Montréal corporate counsel with Ottawa disputes counsel.',
      href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law/Saudi-Expansion-and-US-Export-Controls',
      dateLabel: 'Latest post',
    },
    {
      id: 'blog-tariffs-trade',
      type: 'blog',
      title: 'Tariffs and Trade',
      description: 'Ongoing commentary on Canadian tariffs, customs, and cross-border trade.',
      href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law',
      dateLabel: 'Blog',
    },
    {
      id: 'webinar-tariffs-centre',
      type: 'webinar',
      title: 'Tariffs and Trade Resource Centre',
      description:
        'With Duncan Ault (Ottawa) — sequencing tariff review with Canadian corporate setup.',
      href: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
      dateLabel: 'Upcoming webinar',
    },
    {
      id: 'webinar-doing-business-canada',
      type: 'webinar',
      title: 'Doing Business in Canada: Corporate Setup',
      description: 'Standing up a Canadian entity without missing tariff and employment workstreams.',
      href: '/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
      dateLabel: 'On demand',
    },
    {
      id: 'podcast-trade-talks',
      type: 'podcast',
      title: 'Trade Talks: Canada’s Tariff Response',
      description:
        'When to involve Montréal corporate counsel vs Ottawa disputes counsel during inbound expansion.',
      href: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
      dateLabel: 'Listen now',
    },
    {
      id: 'cle-ottawa-toronto',
      type: 'cle',
      title: 'Tariffs & Trade Briefing: Ottawa & Toronto',
      description: 'Half-day CLE for in-house teams managing Canadian tariff and trade-remedy risk.',
      href: '/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
      dateLabel: 'CLE · Live',
    },
    {
      id: 'guide-who-to-talk-to',
      type: 'guide',
      title: 'Who Should We Talk To? Tariffs & Doing Business in Canada',
      description:
        'Recommended lawyer pairing plus webinars, podcast, alert, and checklist for inbound teams.',
      href: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
      dateLabel: 'Client guide',
    },
    {
      id: 'alert-canada-tariff',
      type: 'alert',
      title: 'Canada Tariff Update',
      description: 'Recent tariff and customs developments for companies doing business in Canada.',
      href: '/Insights/Alert/Gulf-Expansion-EAR-OFAC-Update',
      dateLabel: 'Legal alert',
    },
    {
      id: 'checklist-canada',
      type: 'white-paper',
      title: 'Checklist: Doing Business in Canada',
      description: 'Corporate setup, contracting, and tariff diligence for Canadian market entry.',
      href: '/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
      dateLabel: 'White paper',
    },
    {
      id: 'presentation-genai',
      type: 'presentation',
      title: 'GenAI Diligence for Canadian Issuers',
      description:
        'Workshop outline: disclosure, governance, and RACI for capital-markets and technology counsel.',
      href: '/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
      dateLabel: 'Presentation',
    },
  ],
};

export const BIO_RELATED_CONTENT_BY_NAME: Record<string, BioRelatedContentProfile> = {
  'Ata-A-Akiner': MARC_ABDELSAYED,
};

export function resolveBioRelatedContent(itemName?: string | null): BioRelatedContentProfile | null {
  if (!itemName?.trim()) return null;
  return BIO_RELATED_CONTENT_BY_NAME[itemName.trim()] ?? null;
}
