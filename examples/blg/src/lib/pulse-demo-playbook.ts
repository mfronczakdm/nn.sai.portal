import type { PulseSource, PulseStateCode } from '@/lib/pulse-types';

/**
 * Curated Pulse demo intents for the Pillsbury Law visitor demo.
 * These scenarios are intentionally hard to solve with keyword search alone —
 * they need multi-criteria matching (practice + industry + geography + situation).
 */

export type PulseDemoIntentId =
  | 'japan-us-tech-acquisition'
  | 'distressed-portfolio-company'
  | 'saudi-expansion-export-controls'
  | 'mena-trade-sanctions'
  | 'insurance-construction-dispute'
  | 'careers-find-opening';

type PulseDemoIntent = {
  id: PulseDemoIntentId;
  /** All tokens in a group must appear in the normalized question; any matching group wins. */
  matchAny: string[][];
  /** Ordered citations (highest confidence first). */
  sources: Omit<PulseSource, 'score'>[];
};

const INTENTS: PulseDemoIntent[] = [
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
    sources: [
      {
        id: '{F03B5B2C-D343-4C6B-9635-D876CD81150A}',
        title: 'Associate — International Trade (Washington, DC)',
        url: '/Lawyers/Careers/Associate-International-Trade-Washington-DC',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Associate-International-Trade-Washington-DC',
        excerpt:
          'Open associate role on EAR, OFAC, customs, and national-security trade matters — the strongest match for a career in international trade.',
        type: 'other',
      },
      {
        id: '{C30AB91F-550F-4452-8725-5BCCAF1B674B}',
        title: 'Careers at Pillsbury',
        url: '/Lawyers/Careers',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers',
        excerpt:
          'Hub for associate, summer associate, lateral, and business professional openings across the firm.',
        type: 'other',
      },
      {
        id: '{B3852AD7-B1EC-4BAD-88F6-ECD2D7A349DD}',
        title: 'How to Apply',
        url: '/Lawyers/Careers/How-to-Apply',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/How-to-Apply',
        excerpt:
          'Application steps for students, associates, laterals, and business professionals.',
        type: 'knowledge-article',
      },
      {
        id: '{B323778A-790A-4DAB-A820-08DCD8C3F256}',
        title: 'Summer Associate Program',
        url: '/Lawyers/Careers/Summer-Associate-Program',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Summer-Associate-Program',
        excerpt:
          'Law-student summer experience with mentoring and a clear path toward full-time offers.',
        type: 'other',
      },
      {
        id: '{9EDB3C29-87F7-475B-B960-41791D29EA0D}',
        title: 'Associate — Corporate (New York)',
        url: '/Lawyers/Careers/Associate-Corporate-New-York',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Associate-Corporate-New-York',
        excerpt:
          'Open corporate associate role in New York for M&A, capital markets, and governance.',
        type: 'other',
      },
      {
        id: '{3CFF2A06-690B-471A-8877-4D74D78BAEEE}',
        title: 'Lateral Partner — Intellectual Property',
        url: '/Lawyers/Careers/Lateral-Partner-Intellectual-Property',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Lateral-Partner-Intellectual-Property',
        excerpt:
          'Lateral partner conversations for IP litigators and counselors joining the IP platform.',
        type: 'other',
      },
      {
        id: '{883337F3-7C1C-4FE8-A342-55471F1355C0}',
        title: 'Legal Operations Specialist',
        url: '/Lawyers/Careers/Legal-Operations-Specialist',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Careers/Legal-Operations-Specialist',
        excerpt:
          'Business professional career supporting legal operations, workflow, and lawyer enablement.',
        type: 'other',
      },
      {
        id: '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}',
        title: 'Ata A. Akiner — International Trade (practice contact)',
        url: '/Lawyers/Bios/Ata-A-Akiner',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Ata-A-Akiner',
        excerpt:
          'Washington, DC International Trade partner — useful practice contact when exploring a trade associate path.',
        type: 'people-and-teams',
      },
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
    sources: [
      {
        id: '{4CF3E8A1-73B9-444F-9CBE-3E1F18A2D5D9}',
        title: 'Shinya Akiyama — Corporate / Japan Practice',
        url: '/Lawyers/Bios/Shinya-Akiyama',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Shinya-Akiyama',
        excerpt:
          'Corporate partner and Japan Practice co-leader who counsels Japanese companies on starting, acquiring, and managing U.S. businesses.',
        type: 'people-and-teams',
      },
      {
        id: '{3359606E-DFEC-4297-910F-7F15D0540066}',
        title: 'Mark Abate — Intellectual Property',
        url: '/Lawyers/Bios/Mark-Abate',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Mark-Abate',
        excerpt:
          'Leading IP trial lawyer recognized for patent litigation strategy and technical mastery — a natural second seat when a tech deal carries IP risk.',
        type: 'people-and-teams',
      },
      {
        id: '{ED34EB16-C784-43E5-BE3C-FBFC6697B205}',
        title: 'Ranjini Acharya — Intellectual Property',
        url: '/Lawyers/Bios/Ranjini-Acharya',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Ranjini-Acharya',
        excerpt:
          'Silicon Valley IP partner covering patents, trade secrets, trademarks, and copyright enforcement across complex technology matters.',
        type: 'people-and-teams',
      },
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
    sources: [
      {
        id: '{2F243F36-C6AC-477C-9577-67AB86B05306}',
        title: 'Andrew V. Alfano — Insolvency & Restructuring',
        url: '/Lawyers/Bios/Andrew-V-Alfano',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Andrew-V-Alfano',
        excerpt:
          'Advises distressed companies, investors, and creditors through complex restructurings across industries including energy, aviation, and EVs.',
        type: 'people-and-teams',
      },
      {
        id: '{30D08BD7-7D13-4B0F-A8F4-E362FB8E01FD}',
        title: 'Semma G. Arzapalo — Funds / Corporate',
        url: '/Lawyers/Bios/Semma-G-Arzapalo',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Semma-G-Arzapalo',
        excerpt:
          'Global Funds practice leader representing institutional investors through private equity commitments — useful when LPs need coordinated counsel on a troubled portfolio company.',
        type: 'people-and-teams',
      },
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
    sources: [
      {
        id: '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}',
        title: 'Ata A. Akiner — International Trade (Washington, DC)',
        url: '/Lawyers/Bios/Ata-A-Akiner',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Ata-A-Akiner',
        excerpt:
          'EAR / OFAC and national-security trade counsel for U.S. companies expanding into the Kingdom — start here on export-control questions.',
        type: 'people-and-teams',
      },
      {
        id: '{A17985F3-2812-4721-8928-6B4381768660}',
        title: 'Khalid A. AlArfaj — Corporate (Riyadh)',
        url: '/Lawyers/Bios/Khalid-A-AlArfaj',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Khalid-A-AlArfaj',
        excerpt:
          'Riyadh corporate partner for entity setup, commercial contracting, and local coordination alongside U.S. trade counsel.',
        type: 'people-and-teams',
      },
      {
        id: '{FC3F756B-EF7C-4A68-9CD6-97FD0202EE72}',
        title: 'Webinar: Expanding into Saudi Arabia — Export Controls 101',
        url: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
        excerpt:
          'Client webinar with Akiner and AlArfaj on sequencing EAR/OFAC review with KSA corporate setup before the first intake call.',
        type: 'knowledge-article',
      },
      {
        id: '{77C55548-522D-46D9-9367-536CE5163AC4}',
        title: 'Podcast: Trade Talks — Saudi Vision 2030 & Export Controls',
        url: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
        excerpt:
          'Short briefing episode on when to involve DC trade counsel vs Riyadh corporate counsel during Gulf expansion.',
        type: 'knowledge-article',
      },
      {
        id: '{C6AD0AF7-0CCB-4109-B74D-E207ECB78A35}',
        title: 'Guide: Who to Talk To — Saudi Expansion & Export Controls',
        url: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
        excerpt:
          'Recommended lawyer pairing plus webinars, CLE, alert, and checklist for expansion teams.',
        type: 'knowledge-article',
      },
      {
        id: '{0579D7FB-48F2-4036-A8EE-E279E67958D4}',
        title: 'Checklist: U.S. Companies Entering KSA',
        url: '/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/White-Paper/Checklist-US-Companies-Entering-KSA',
        excerpt:
          'Practical market-entry checklist covering corporate setup, trade diligence, and counsel handoffs.',
        type: 'knowledge-article',
      },
      {
        id: '{68460E98-8ADA-4788-9921-EFD5270CAC89}',
        title: 'Alert: Gulf Expansion — EAR / OFAC Update',
        url: '/Insights/Alert/Gulf-Expansion-EAR-OFAC-Update',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Alert/Gulf-Expansion-EAR-OFAC-Update',
        excerpt:
          'Current EAR and OFAC points of focus for U.S. companies expanding across the Gulf.',
        type: 'knowledge-article',
      },
      {
        id: '{CC0936CE-7B39-4755-A1FF-D7E80563CB07}',
        title: 'CLE: International Trade Briefing — Riyadh & DC',
        url: '/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Events/CLE/International-Trade-Briefing-Riyadh-and-DC',
        excerpt:
          'In-person / CLE-style briefing bridging Riyadh commercial realities with Washington trade compliance.',
        type: 'knowledge-article',
      },
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
    sources: [
      {
        id: '{8306EB6F-3AA2-474A-ABF0-CD35B805CE6E}',
        title: 'Ata A. Akiner — International Trade',
        url: '/Lawyers/Bios/Ata-A-Akiner',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Ata-A-Akiner',
        excerpt:
          'Helps global and U.S. clients navigate complex international trade, regulatory, and national-security matters from Washington, DC.',
        type: 'people-and-teams',
      },
      {
        id: '{4746BD74-AC63-4ED2-8B86-A2CE1B2BA178}',
        title: 'Osama Abu-Dehays — Corporate (Doha / London)',
        url: '/Lawyers/Bios/Osama-Abu-Dehays',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Osama-Abu-Dehays',
        excerpt:
          'Corporate partner known across MENA for commercial, technology, media, and telecommunications matters — strong local counterpart for regional expansion.',
        type: 'people-and-teams',
      },
      {
        id: '{A17985F3-2812-4721-8928-6B4381768660}',
        title: 'Khalid A. AlArfaj — Corporate (Riyadh)',
        url: '/Lawyers/Bios/Khalid-A-AlArfaj',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Khalid-A-AlArfaj',
        excerpt:
          'Advises national and international clients on complex corporate and commercial matters across Saudi Arabia and the United States.',
        type: 'people-and-teams',
      },
      {
        id: '{021363E1-C472-4752-878D-55C455EA8BB5}',
        title: 'Webinar: MENA Corporate Setup & U.S. Export Compliance',
        url: '/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Events/Webinar/MENA-Corporate-Setup-and-US-Export-Compliance',
        excerpt:
          'How entity formation across MENA intersects with U.S. export-compliance obligations.',
        type: 'knowledge-article',
      },
      {
        id: '{54B23AD1-7151-47BF-91B8-E005268353B9}',
        title: 'Presentation: Export-Control Diligence for MENA Deals',
        url: '/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Insights/Thought-Leadership/Presentation/Export-Control-Diligence-for-MENA-Deals',
        excerpt:
          'Deal-team diligence framework for export controls on MENA transactions.',
        type: 'knowledge-article',
      },
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
    sources: [
      {
        id: '{A65B716C-C64E-4F83-AC29-5BA7FAD8B503}',
        title: 'Stephen S. Asay — Insurance Recovery & Advisory',
        url: '/Lawyers/Bios/Stephen-S-Asay',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Stephen-S-Asay',
        excerpt:
          'Advises on proactive risk management and complex commercial litigation involving insurance coverage and construction claims from Washington, DC.',
        type: 'people-and-teams',
      },
      {
        id: '{3FACDBC5-B0E5-472F-9ED5-C16EC268C75C}',
        title: 'Jennifer Altman — Litigation (Miami)',
        url: '/Lawyers/Bios/Jennifer-Altman',
        path: '/sitecore/content/pillsbury/pillsburylaw/Home/Lawyers/Bios/Jennifer-Altman',
        excerpt:
          'Miami managing partner and Chambers-recognized commercial litigator with deep trial and arbitration experience when a coverage dispute becomes hard-fought litigation.',
        type: 'people-and-teams',
      },
    ],
  },
];

function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchPulseDemoIntent(question: string): PulseDemoIntent | null {
  const normalized = normalizeQuestion(question);
  if (!normalized) return null;

  let best: PulseDemoIntent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    for (const group of intent.matchAny) {
      if (group.every((token) => normalized.includes(token))) {
        const score = group.length;
        if (score > bestScore) {
          best = intent;
          bestScore = score;
        }
      }
    }
  }

  return best;
}

/**
 * Build high-confidence sources for a matched demo intent.
 * `stateCode` is retained for API compatibility with the Pulse ask route;
 * Pillsbury visitor demos do not layer state Shared Content.
 */
export function buildDemoPlaybookSources(
  question: string,
  _stateCode?: PulseStateCode | null
): PulseSource[] {
  const intent = matchPulseDemoIntent(question);
  if (!intent) return [];

  return intent.sources.map((source, index) => ({
    ...source,
    score: 1000 - index * 50,
  }));
}

/**
 * Starter prompts shown in the Pulse empty state.
 * Each maps to a demo intent and is phrased as a visitor would ask — not as a keyword search.
 */
export const PULSE_DEMO_STARTER_PROMPTS = [
  "I'm looking for a career in international trade. What openings do you have?",
  'A Japanese company is buying a U.S. tech business — who should lead, and who covers the IP risk?',
  'One of our portfolio companies is in financial distress. Who should we talk to?',
  "We're expanding into Saudi Arabia and have export-control questions. Who should we talk to?",
] as const;
