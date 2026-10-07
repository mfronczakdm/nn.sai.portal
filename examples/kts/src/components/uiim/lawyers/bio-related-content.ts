/**
 * Curated related insights / speaking for BioDetail.
 * Keyed by Sitecore Bio page item name (hyphenated).
 * Start with Ata A. Akiner for the Saudi expansion / export-control demo journey.
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

/** Demo-ready related content for Ata — people → learning assets journey */
const ATA_AKINER: BioRelatedContentProfile = {
  sectionTitle: 'Insights & speaking',
  sectionIntro:
    'Export controls, sanctions, and Saudi / MENA expansion — webinars, podcasts, and guides to brief your team before the first call.',
  items: [
    {
      id: 'blog-saudi-expansion-export',
      type: 'blog',
      title: 'Saudi Expansion and U.S. Export Controls',
      description:
        'Commentary on EAR/OFAC diligence for Vision 2030 market entry—and how to pair DC trade counsel with Riyadh corporate counsel.',
      href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law/Saudi-Expansion-and-US-Export-Controls',
      dateLabel: 'Latest post',
    },
    {
      id: 'blog-global-trade',
      type: 'blog',
      title: 'Global Trade & Sanctions Law',
      description:
        'Ongoing commentary on OFAC, EAR, customs, and cross-border trade compliance.',
      href: '/Insights/Blogs/Global-Trade-and-Sanctions-Law',
      dateLabel: 'Blog',
    },
    {
      id: 'webinar-saudi-export-101',
      type: 'webinar',
      title: 'Expanding into Saudi Arabia: Export Controls 101',
      description:
        'With Khalid AlArfaj (Riyadh) — sequencing EAR/OFAC review with KSA corporate setup.',
      href: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
      dateLabel: 'Upcoming webinar',
    },
    {
      id: 'webinar-mena-corporate',
      type: 'webinar',
      title: 'MENA Corporate Setup & U.S. Export Compliance',
      description:
        'Standing up a Saudi or Qatar entity without missing U.S. trade controls.',
      href: '/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
      dateLabel: 'On demand',
    },
    {
      id: 'podcast-trade-talks',
      type: 'podcast',
      title: 'Trade Talks: Saudi Vision 2030 & Export Controls',
      description:
        'When to involve DC trade counsel vs Riyadh corporate counsel during Gulf expansion.',
      href: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
      dateLabel: 'Listen now',
    },
    {
      id: 'cle-riyadh-dc',
      type: 'cle',
      title: 'International Trade Briefing: Riyadh & DC',
      description:
        'Half-day CLE for in-house teams managing Saudi expansion and export-control risk.',
      href: '/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
      dateLabel: 'CLE · Live',
    },
    {
      id: 'guide-who-to-talk-to',
      type: 'guide',
      title: 'Who Should We Talk To? Saudi Expansion & Export Controls',
      description:
        'Recommended lawyer pairing plus webinars, podcast, alert, and checklist for expansion teams.',
      href: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
      dateLabel: 'Client guide',
    },
    {
      id: 'alert-gulf-ear-ofac',
      type: 'alert',
      title: 'Gulf Expansion: EAR & OFAC Update',
      description:
        'Recent EAR and OFAC developments for U.S. companies expanding into Saudi Arabia and the Gulf.',
      href: '/Insights/Alert/Gulf-Expansion-EAR-OFAC-Update',
      dateLabel: 'Legal alert',
    },
    {
      id: 'checklist-ksa',
      type: 'white-paper',
      title: 'Checklist: U.S. Companies Entering KSA',
      description:
        'Corporate setup, contracting, and U.S. export-control diligence for Saudi market entry.',
      href: '/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
      dateLabel: 'White paper',
    },
    {
      id: 'presentation-mena-diligence',
      type: 'presentation',
      title: 'Export-Control Diligence for MENA Deals',
      description:
        'Workshop outline: deal screening, technology classification, and RACI for DC vs MENA counsel.',
      href: '/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
      dateLabel: 'Presentation',
    },
  ],
};

export const BIO_RELATED_CONTENT_BY_NAME: Record<string, BioRelatedContentProfile> = {
  'Ata-A-Akiner': ATA_AKINER,
};

export function resolveBioRelatedContent(itemName?: string | null): BioRelatedContentProfile | null {
  if (!itemName?.trim()) return null;
  return BIO_RELATED_CONTENT_BY_NAME[itemName.trim()] ?? null;
}
