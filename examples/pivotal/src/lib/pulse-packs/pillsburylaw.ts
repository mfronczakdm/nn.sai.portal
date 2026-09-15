import type { PulseSource } from '@/lib/pulse-types';
import type { PulseSitePack } from './types';

/**
 * Pillsbury Law Pulse pack — preserves existing Saudi / careers / lawyer demo intents.
 * Prefer Experience Edge hydration; citationFallbacks keep curated demo copy when Edge misses.
 * Do not grow this hardcoded map for new sites — add a new pack file instead.
 */
const FALLBACKS: Record<string, Omit<PulseSource, 'score'>> = {
  '{F03B5B2C-D343-4C6B-9635-D876CD81150A}': {
    id: '{F03B5B2C-D343-4C6B-9635-D876CD81150A}',
    title: 'Associate — International Trade (Washington, DC)',
    url: '/Lawyers/Careers/Associate-International-Trade-Washington-DC',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Associate-International-Trade-Washington-DC',
    excerpt:
      'Open associate role on EAR, OFAC, customs, and national-security trade matters — the strongest match for a career in international trade.',
    type: 'other',
  },
  '{C30AB91F-550F-4452-8725-5BCCAF1B674B}': {
    id: '{C30AB91F-550F-4452-8725-5BCCAF1B674B}',
    title: 'Careers at Pillsbury',
    url: '/Lawyers/Careers',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers',
    excerpt: 'Hub for associate, summer associate, lateral, and business professional openings across the firm.',
    type: 'other',
  },
  '{B3852AD7-B1EC-4BAD-88F6-ECD2D7A349DD}': {
    id: '{B3852AD7-B1EC-4BAD-88F6-ECD2D7A349DD}',
    title: 'How to Apply',
    url: '/Lawyers/Careers/How-to-Apply',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/How-to-Apply',
    excerpt: 'Application steps for students, associates, laterals, and business professionals.',
    type: 'knowledge-article',
  },
  '{B323778A-790A-4DAB-A820-08DCD8C3F256}': {
    id: '{B323778A-790A-4DAB-A820-08DCD8C3F256}',
    title: 'Summer Associate Program',
    url: '/Lawyers/Careers/Summer-Associate-Program',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Summer-Associate-Program',
    excerpt: 'Law-student summer experience with mentoring and a clear path toward full-time offers.',
    type: 'other',
  },
  '{9EDB3C29-87F7-475B-B960-41791D29EA0D}': {
    id: '{9EDB3C29-87F7-475B-B960-41791D29EA0D}',
    title: 'Associate — Corporate (New York)',
    url: '/Lawyers/Careers/Associate-Corporate-New-York',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Associate-Corporate-New-York',
    excerpt: 'Open corporate associate role in New York for M&A, capital markets, and governance.',
    type: 'other',
  },
  '{3CFF2A06-690B-471A-8877-4D74D78BAEEE}': {
    id: '{3CFF2A06-690B-471A-8877-4D74D78BAEEE}',
    title: 'Lateral Partner — Intellectual Property',
    url: '/Lawyers/Careers/Lateral-Partner-Intellectual-Property',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Lateral-Partner-Intellectual-Property',
    excerpt: 'Lateral partner conversations for IP litigators and counselors joining the IP platform.',
    type: 'other',
  },
  '{883337F3-7C1C-4FE8-A342-55471F1355C0}': {
    id: '{883337F3-7C1C-4FE8-A342-55471F1355C0}',
    title: 'Legal Operations Specialist',
    url: '/Lawyers/Careers/Legal-Operations-Specialist',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Legal-Operations-Specialist',
    excerpt: 'Business professional career supporting legal operations, workflow, and lawyer enablement.',
    type: 'other',
  },
  '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}': {
    id: '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}',
    title: 'Ata A. Akiner — International Trade (Washington, DC)',
    url: '/Lawyers/Bios/Ata-A-Akiner',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Ata-A-Akiner',
    excerpt:
      'EAR / OFAC and national-security trade counsel for U.S. companies expanding into the Kingdom — start here on export-control questions.',
    type: 'people-and-teams',
  },
  '{4CF3E8A1-73B9-444F-9CBE-3E1F18A2D5D9}': {
    id: '{4CF3E8A1-73B9-444F-9CBE-3E1F18A2D5D9}',
    title: 'Shinya Akiyama — Corporate / Japan Practice',
    url: '/Lawyers/Bios/Shinya-Akiyama',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Shinya-Akiyama',
    excerpt:
      'Corporate partner and Japan Practice co-leader who counsels Japanese companies on starting, acquiring, and managing U.S. businesses.',
    type: 'people-and-teams',
  },
  '{3359606E-DFEC-4297-910F-7F15D0540066}': {
    id: '{3359606E-DFEC-4297-910F-7F15D0540066}',
    title: 'Mark Abate — Intellectual Property',
    url: '/Lawyers/Bios/Mark-Abate',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Mark-Abate',
    excerpt:
      'Leading IP trial lawyer recognized for patent litigation strategy and technical mastery — a natural second seat when a tech deal carries IP risk.',
    type: 'people-and-teams',
  },
  '{ED34EB16-C784-43E5-BE3C-FBFC6697B205}': {
    id: '{ED34EB16-C784-43E5-BE3C-FBFC6697B205}',
    title: 'Ranjini Acharya — Intellectual Property',
    url: '/Lawyers/Bios/Ranjini-Acharya',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Ranjini-Acharya',
    excerpt:
      'Silicon Valley IP partner covering patents, trade secrets, trademarks, and copyright enforcement across complex technology matters.',
    type: 'people-and-teams',
  },
  '{2F243F36-C6AC-477C-9577-67AB86B05306}': {
    id: '{2F243F36-C6AC-477C-9577-67AB86B05306}',
    title: 'Andrew V. Alfano — Insolvency & Restructuring',
    url: '/Lawyers/Bios/Andrew-V-Alfano',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Andrew-V-Alfano',
    excerpt:
      'Advises distressed companies, investors, and creditors through complex restructurings across industries including energy, aviation, and EVs.',
    type: 'people-and-teams',
  },
  '{30D08BD7-7D13-4B0F-A8F4-E362FB8E01FD}': {
    id: '{30D08BD7-7D13-4B0F-A8F4-E362FB8E01FD}',
    title: 'Semma G. Arzapalo — Funds / Corporate',
    url: '/Lawyers/Bios/Semma-G-Arzapalo',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Semma-G-Arzapalo',
    excerpt:
      'Global Funds practice leader representing institutional investors through private equity commitments — useful when LPs need coordinated counsel on a troubled portfolio company.',
    type: 'people-and-teams',
  },
  '{A17985F3-2812-4721-8928-6B4381768660}': {
    id: '{A17985F3-2812-4721-8928-6B4381768660}',
    title: 'Khalid A. AlArfaj — Corporate (Riyadh)',
    url: '/Lawyers/Bios/Khalid-A-AlArfaj',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Khalid-A-AlArfaj',
    excerpt:
      'Riyadh corporate partner for entity setup, commercial contracting, and local coordination alongside U.S. trade counsel.',
    type: 'people-and-teams',
  },
  '{FC3F756B-EF7C-4A68-9CD6-97FD0202EE72}': {
    id: '{FC3F756B-EF7C-4A68-9CD6-97FD0202EE72}',
    title: 'Webinar: Expanding into Saudi Arabia — Export Controls 101',
    url: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
    excerpt:
      'Client webinar with Akiner and AlArfaj on sequencing EAR/OFAC review with KSA corporate setup before the first intake call.',
    type: 'knowledge-article',
  },
  '{77C55548-522D-46D9-9367-536CE5163AC4}': {
    id: '{77C55548-522D-46D9-9367-536CE5163AC4}',
    title: 'Podcast: Trade Talks — Saudi Vision 2030 & Export Controls',
    url: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
    excerpt:
      'Short briefing episode on when to involve DC trade counsel vs Riyadh corporate counsel during Gulf expansion.',
    type: 'knowledge-article',
  },
  '{C6AD0AF7-0CCB-4109-B74D-E207ECB78A35}': {
    id: '{C6AD0AF7-0CCB-4109-B74D-E207ECB78A35}',
    title: 'Guide: Who to Talk To — Saudi Expansion & Export Controls',
    url: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
    excerpt: 'Recommended lawyer pairing plus webinars, CLE, alert, and checklist for expansion teams.',
    type: 'knowledge-article',
  },
  '{0579D7FB-48F2-4036-A8EE-E279E67958D4}': {
    id: '{0579D7FB-48F2-4036-A8EE-E279E67958D4}',
    title: 'Checklist: U.S. Companies Entering KSA',
    url: '/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
    excerpt:
      'Practical market-entry checklist covering corporate setup, trade diligence, and counsel handoffs.',
    type: 'knowledge-article',
  },
  '{68460E98-8ADA-4788-9921-EFD5270CAC89}': {
    id: '{68460E98-8ADA-4788-9921-EFD5270CAC89}',
    title: 'Alert: Gulf Expansion — EAR / OFAC Update',
    url: '/Insights/Alert/Gulf-Expansion-EAR-OFAC-Update',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Alert/Gulf-Expansion-EAR-OFAC-Update',
    excerpt: 'Current EAR and OFAC points of focus for U.S. companies expanding across the Gulf.',
    type: 'knowledge-article',
  },
  '{CC0936CE-7B39-4755-A1FF-D7E80563CB07}': {
    id: '{CC0936CE-7B39-4755-A1FF-D7E80563CB07}',
    title: 'CLE: International Trade Briefing — Riyadh & DC',
    url: '/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
    excerpt:
      'In-person / CLE-style briefing bridging Riyadh commercial realities with Washington trade compliance.',
    type: 'knowledge-article',
  },
  '{4746BD74-AC63-4ED2-8B86-A2CE1B2BA178}': {
    id: '{4746BD74-AC63-4ED2-8B86-A2CE1B2BA178}',
    title: 'Osama Abu-Dehays — Corporate (Doha / London)',
    url: '/Lawyers/Bios/Osama-Abu-Dehays',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Osama-Abu-Dehays',
    excerpt:
      'Corporate partner known across MENA for commercial, technology, media, and telecommunications matters — strong local counterpart for regional expansion.',
    type: 'people-and-teams',
  },
  '{021363E1-C472-4752-878D-55C455EA8BB5}': {
    id: '{021363E1-C472-4752-878D-55C455EA8BB5}',
    title: 'Webinar: MENA Corporate Setup & U.S. Export Compliance',
    url: '/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
    excerpt: 'How entity formation across MENA intersects with U.S. export-compliance obligations.',
    type: 'knowledge-article',
  },
  '{54B23AD1-7151-47BF-91B8-E005268353B9}': {
    id: '{54B23AD1-7151-47BF-91B8-E005268353B9}',
    title: 'Presentation: Export-Control Diligence for MENA Deals',
    url: '/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
    excerpt: 'Deal-team diligence framework for export controls on MENA transactions.',
    type: 'knowledge-article',
  },
  '{A65B716C-C64E-4F83-AC29-5BA7FAD8B503}': {
    id: '{A65B716C-C64E-4F83-AC29-5BA7FAD8B503}',
    title: 'Stephen S. Asay — Insurance Recovery & Advisory',
    url: '/Lawyers/Bios/Stephen-S-Asay',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Stephen-S-Asay',
    excerpt:
      'Advises on proactive risk management and complex commercial litigation involving insurance coverage and construction claims from Washington, DC.',
    type: 'people-and-teams',
  },
  '{3FACDBC5-B0E5-472F-9ED5-C16EC268C75C}': {
    id: '{3FACDBC5-B0E5-472F-9ED5-C16EC268C75C}',
    title: 'Jennifer Altman — Litigation (Miami)',
    url: '/Lawyers/Bios/Jennifer-Altman',
    path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Jennifer-Altman',
    excerpt:
      'Miami managing partner and Chambers-recognized commercial litigator with deep trial and arbitration experience when a coverage dispute becomes hard-fought litigation.',
    type: 'people-and-teams',
  },
};

export const pillsburylawPulsePack: PulseSitePack = {
  siteName: 'pillsburylaw',
  brandName: 'Pillsbury',
  homePath: '/sitecore/content/pillsbury/pillsburylaw/Home',
  homeRootId: '', // resolved via homePath / optional PULSE_HOME_ROOT_ID
  enableStatePersona: false,
  typeLabels: {
    'knowledge-article': 'Insight',
    'people-and-teams': 'Lawyer',
    product: 'Capability',
    'shared-content': 'Related',
    other: 'Career',
    default: 'Content',
  },
  starterPrompts: [
    "I'm looking for a career in international trade. What openings do you have?",
    'A Japanese company is buying a U.S. tech business — who should lead, and who covers the IP risk?',
    'One of our portfolio companies is in financial distress. Who should we talk to?',
    "We're expanding into Saudi Arabia and have export-control questions. Who should we talk to?",
  ],
  citationFallbacks: FALLBACKS,
  intents: [
    {
      id: 'careers-find-opening',
      matchAny: [
        ['looking', 'career'],
        ['career', 'international', 'trade'],
        ['career', 'trade'],
        ['career', 'opening'],
        ['job', 'opening'],
        ['summer', 'associate'],
        ['how', 'apply'],
        ['lateral', 'partner'],
        ['find', 'career'],
        ['looking', 'job'],
        ['open', 'role'],
        ['careers', 'pillsbury'],
        ['business', 'professional'],
        ['work', 'at', 'pillsbury'],
      ],
      citationItemIds: [
        '{F03B5B2C-D343-4C6B-9635-D876CD81150A}',
        '{C30AB91F-550F-4452-8725-5BCCAF1B674B}',
        '{B3852AD7-B1EC-4BAD-88F6-ECD2D7A349DD}',
        '{B323778A-790A-4DAB-A820-08DCD8C3F256}',
        '{9EDB3C29-87F7-475B-B960-41791D29EA0D}',
        '{3CFF2A06-690B-471A-8877-4D74D78BAEEE}',
        '{883337F3-7C1C-4FE8-A342-55471F1355C0}',
        '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}',
      ],
    },
    {
      id: 'japan-us-tech-acquisition',
      matchAny: [
        ['japanese', 'acqui'],
        ['japan', 'us', 'tech'],
        ['japan', 'intellectual'],
        ['japan', 'patent'],
        ['cross', 'border', 'japan'],
        ['japanese', 'company'],
        ['japan', 'practice'],
      ],
      citationItemIds: [
        '{4CF3E8A1-73B9-444F-9CBE-3E1F18A2D5D9}',
        '{3359606E-DFEC-4297-910F-7F15D0540066}',
        '{ED34EB16-C784-43E5-BE3C-FBFC6697B205}',
      ],
    },
    {
      id: 'distressed-portfolio-company',
      matchAny: [
        ['distress'],
        ['insolvency'],
        ['restructur'],
        ['bankrupt'],
        ['creditor'],
        ['portfolio', 'company', 'trouble'],
        ['financial', 'distress'],
      ],
      citationItemIds: [
        '{2F243F36-C6AC-477C-9577-67AB86B05306}',
        '{30D08BD7-7D13-4B0F-A8F4-E362FB8E01FD}',
      ],
    },
    {
      id: 'saudi-expansion-export-controls',
      matchAny: [
        ['expanding', 'saudi'],
        ['expand', 'saudi'],
        ['saudi', 'export'],
        ['ksa', 'export'],
        ['vision', '2030', 'export'],
        ['who', 'talk', 'saudi'],
        ['saudi', 'arabia', 'export'],
        ['export', 'control', 'questions'],
        ['saudi', 'arabia', 'talk'],
      ],
      citationItemIds: [
        '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}',
        '{A17985F3-2812-4721-8928-6B4381768660}',
        '{FC3F756B-EF7C-4A68-9CD6-97FD0202EE72}',
        '{77C55548-522D-46D9-9367-536CE5163AC4}',
        '{C6AD0AF7-0CCB-4109-B74D-E207ECB78A35}',
        '{0579D7FB-48F2-4036-A8EE-E279E67958D4}',
        '{68460E98-8ADA-4788-9921-EFD5270CAC89}',
        '{CC0936CE-7B39-4755-A1FF-D7E80563CB07}',
      ],
    },
    {
      id: 'mena-trade-sanctions',
      matchAny: [
        ['sanction'],
        ['export', 'control'],
        ['international', 'trade'],
        ['national', 'security', 'trade'],
        ['middle', 'east'],
        ['qatar'],
        ['mena'],
        ['riyadh'],
        ['doha'],
        ['saudi'],
      ],
      citationItemIds: [
        '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}',
        '{4746BD74-AC63-4ED2-8B86-A2CE1B2BA178}',
        '{A17985F3-2812-4721-8928-6B4381768660}',
        '{021363E1-C472-4752-878D-55C455EA8BB5}',
        '{54B23AD1-7151-47BF-91B8-E005268353B9}',
      ],
    },
    {
      id: 'insurance-construction-dispute',
      matchAny: [
        ['insurance', 'recover'],
        ['insurance', 'coverage'],
        ['construction', 'insurance'],
        ['construction', 'claim'],
        ['carrier', 'dispute'],
        ['risk', 'management', 'insurance'],
        ['coverage', 'fight'],
      ],
      citationItemIds: [
        '{A65B716C-C64E-4F83-AC29-5BA7FAD8B503}',
        '{3FACDBC5-B0E5-472F-9ED5-C16EC268C75C}',
      ],
    },
  ],
};
