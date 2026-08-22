import type { PulseSource, PulseStateCode } from '@/lib/pulse-types';

/**
 * Curated Pulse demo intents for the BLG (Borden Ladner Gervais) visitor demo.
 * These scenarios are intentionally hard to solve with keyword search alone —
 * they need multi-criteria matching (practice + industry + geography + situation).
 *
 * Sitecore paths are under /sitecore/content/pillsbury/blg/Home.
 * Public hrefs keep leftover item slugs (MCP cannot rename __Name).
 */

export type PulseDemoIntentId =
  | 'genai-canadian-issuer'
  | 'distressed-portfolio-company'
  | 'canada-tariffs-trade'
  | 'esg-indigenous-infrastructure'
  | 'construction-act-dispute'
  | 'careers-find-opening';

type PulseDemoIntent = {
  id: PulseDemoIntentId;
  /** All tokens in a group must appear in the normalized question; any matching group wins. */
  matchAny: string[][];
  /** Ordered citations (highest confidence first). */
  sources: Omit<PulseSource, 'score'>[];
};

const BLG_HOME = '/sitecore/content/pillsbury/blg/Home';

const INTENTS: PulseDemoIntent[] = [
  {
    id: 'careers-find-opening',
    matchAny: [
      ['looking', 'career'],
      ['career', 'corporate'],
      ['career', 'opening'],
      ['job', 'opening'],
      ['summer', 'associate'],
      ['how', 'apply'],
      ['lateral', 'partner'],
      ['find', 'career'],
      ['looking', 'job'],
      ['open', 'role'],
      ['careers', 'blg'],
      ['business', 'professional'],
      ['work', 'at', 'blg'],
    ],
    sources: [
      {
        id: '{90A7E66E-18C1-42C4-BB58-ACBB18AEF330}',
        title: 'Associate — Corporate Commercial (Toronto)',
        url: '/Lawyers/Careers/Associate-Corporate-New-York',
        path: `${BLG_HOME}/Lawyers/Careers/Associate-Corporate-New-York`,
        excerpt:
          'Open associate role on public and private M&A, capital markets, and governance — the strongest match for a corporate commercial career.',
        type: 'other',
      },
      {
        id: '{4C243B26-7226-4BDE-B4B5-DD3FCE658616}',
        title: 'Careers at BLG',
        url: '/Lawyers/Careers',
        path: `${BLG_HOME}/Lawyers/Careers`,
        excerpt:
          'Hub for associate, summer associate, lateral, and business professional openings across Calgary, Montréal, Ottawa, Toronto, and Vancouver.',
        type: 'other',
      },
      {
        id: '{CDD1FE58-84A7-4737-AEAE-1BDC8EFAC6F8}',
        title: 'How to Apply',
        url: '/Lawyers/Careers/How-to-Apply',
        path: `${BLG_HOME}/Lawyers/Careers/How-to-Apply`,
        excerpt:
          'Application steps for students, associates, laterals, and business professionals.',
        type: 'knowledge-article',
      },
      {
        id: '{A0AE63E5-0458-40F8-9B1B-310AF9580901}',
        title: 'Summer Associate Program',
        url: '/Lawyers/Careers/Summer-Associate-Program',
        path: `${BLG_HOME}/Lawyers/Careers/Summer-Associate-Program`,
        excerpt:
          'Law-student summer experience with mentoring and a clear path toward articling and associate offers.',
        type: 'other',
      },
      {
        id: '{16E69073-18AE-4670-8C04-9990A8A971CF}',
        title: 'Associate — Disputes (Ottawa)',
        url: '/Lawyers/Careers/Associate-International-Trade-Washington-DC',
        path: `${BLG_HOME}/Lawyers/Careers/Associate-International-Trade-Washington-DC`,
        excerpt:
          'Open disputes associate role in Ottawa for commercial litigation, public law, and related regulatory matters.',
        type: 'other',
      },
      {
        id: '{2F860237-0B2C-4B72-B166-8FA4468C7176}',
        title: 'Lateral Partner — Intellectual Property',
        url: '/Lawyers/Careers/Lateral-Partner-Intellectual-Property',
        path: `${BLG_HOME}/Lawyers/Careers/Lateral-Partner-Intellectual-Property`,
        excerpt:
          'Lateral partner conversations for IP litigators and counselors joining BLG’s national IP platform.',
        type: 'other',
      },
      {
        id: '{360D65FD-2B32-4449-9A89-700FEBE50A82}',
        title: 'Legal Operations Specialist',
        url: '/Lawyers/Careers/Legal-Operations-Specialist',
        path: `${BLG_HOME}/Lawyers/Careers/Legal-Operations-Specialist`,
        excerpt:
          'Business professional career supporting legal operations, workflow, and lawyer enablement.',
        type: 'other',
      },
      {
        id: '{3BF2422C-6266-4FA6-9C40-73446C27DD9E}',
        title: 'Duncan Ault — Disputes (practice contact)',
        url: '/Lawyers/Bios/Shinya-Akiyama',
        path: `${BLG_HOME}/Lawyers/Bios/Shinya-Akiyama`,
        excerpt:
          'Ottawa Disputes partner — useful practice contact when exploring a disputes associate path.',
        type: 'people-and-teams',
      },
    ],
  },
  {
    id: 'genai-canadian-issuer',
    matchAny: [
      ['genai'],
      ['gen', 'ai'],
      ['generative', 'ai'],
      ['ai', 'governance'],
      ['ai', 'issuer'],
      ['canadian', 'issuer'],
    ],
    sources: [
      {
        id: '{F44A4534-F15D-46FF-BC5A-296F62AF63D7}',
        title: 'Julie Bogle — Capital Markets',
        url: '/Lawyers/Bios/Stephen-S-Asay',
        path: `${BLG_HOME}/Lawyers/Bios/Stephen-S-Asay`,
        excerpt:
          'Vancouver capital markets partner advising Canadian issuers on offerings, continuous disclosure, and GenAI governance.',
        type: 'people-and-teams',
      },
      {
        id: '{6248A778-41F5-4B53-A427-305B9B5B52E8}',
        title: 'Makena Anderson — Capital Markets',
        url: '/Lawyers/Bios/Osama-Abu-Dehays',
        path: `${BLG_HOME}/Lawyers/Bios/Osama-Abu-Dehays`,
        excerpt:
          'Vancouver capital markets associate covering public offerings and GenAI-related disclosure.',
        type: 'people-and-teams',
      },
      {
        id: '{91A24EA5-6A3B-44DE-9690-9941EEDE770A}',
        title: 'Shane Barnes — Capital Markets',
        url: '/Lawyers/Bios/Stephanie-Angkadjaja',
        path: `${BLG_HOME}/Lawyers/Bios/Stephanie-Angkadjaja`,
        excerpt:
          'Calgary capital markets partner for public and private offerings, including energy and technology issuers.',
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
      ['ccaa'],
      ['portfolio', 'company', 'trouble'],
      ['financial', 'distress'],
    ],
    sources: [
      {
        id: '{AB3FB02F-0C92-42ED-B826-3DE899CF4CB6}',
        title: 'Kendall Andersen — Banking / Insolvency',
        url: '/Lawyers/Bios/Natalie-Alexander',
        path: `${BLG_HOME}/Lawyers/Bios/Natalie-Alexander`,
        excerpt:
          'Vancouver partner advising lenders and distressed companies through insolvency, CCAA, and banking restructurings.',
        type: 'people-and-teams',
      },
      {
        id: '{EC2D2447-E509-421E-AD67-44A82626181C}',
        title: 'Suhuyini Abudulai — Financial Services',
        url: '/Lawyers/Bios/Jennifer-Altman',
        path: `${BLG_HOME}/Lawyers/Bios/Jennifer-Altman`,
        excerpt:
          'Toronto financial services partner — useful when lenders and institutional clients need coordinated counsel on a troubled portfolio company.',
        type: 'people-and-teams',
      },
    ],
  },
  {
    id: 'canada-tariffs-trade',
    matchAny: [
      ['entering', 'canada'],
      ['expanding', 'canada'],
      ['expand', 'canada'],
      ['doing', 'business', 'canada'],
      ['tariff'],
      ['who', 'talk', 'canada'],
      ['canada', 'trade'],
      ['customs'],
    ],
    sources: [
      {
        id: '{30CB4A17-2ACC-463C-ABAA-7B17D7394BBF}',
        title: 'Marc Abdelsayed — Corporate Commercial (Montréal)',
        url: '/Lawyers/Bios/Ata-A-Akiner',
        path: `${BLG_HOME}/Lawyers/Bios/Ata-A-Akiner`,
        excerpt:
          'Inbound Canada entity setup and tariff-sensitive supply-chain contracts — start here on doing-business questions.',
        type: 'people-and-teams',
      },
      {
        id: '{3BF2422C-6266-4FA6-9C40-73446C27DD9E}',
        title: 'Duncan Ault — Disputes (Ottawa)',
        url: '/Lawyers/Bios/Shinya-Akiyama',
        path: `${BLG_HOME}/Lawyers/Bios/Shinya-Akiyama`,
        excerpt:
          'Ottawa disputes partner for tariff, trade-remedy, and public-law conflicts alongside Montréal corporate counsel.',
        type: 'people-and-teams',
      },
      {
        id: '{16474C7B-EFF3-4251-BA9E-594B6FAD9774}',
        title: 'Webinar: Tariffs and Trade Resource Centre',
        url: '/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101',
        path: `${BLG_HOME}/Insights/Events/Webinar/Expanding-into-Saudi-Arabia-Export-Controls-101`,
        excerpt:
          'Client webinar with Abdelsayed and Ault on sequencing tariff diligence with Canadian corporate setup.',
        type: 'knowledge-article',
      },
      {
        id: '{EDC51F31-CCA4-4D5B-9713-C1104D4703E4}',
        title: 'Podcast: Trade Talks — Canada’s Tariff Response',
        url: '/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls',
        path: `${BLG_HOME}/Insights/Thought-Leadership/Podcast/Trade-Talks-Saudi-Vision-2030-Export-Controls`,
        excerpt:
          'Short briefing episode on when to involve Montréal corporate counsel vs Ottawa disputes counsel.',
        type: 'knowledge-article',
      },
      {
        id: '{B68AB708-EAF5-46DF-9364-F111E2070B34}',
        title: 'Guide: Who to Talk To — Tariffs & Doing Business in Canada',
        url: '/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls',
        path: `${BLG_HOME}/Insights/Thought-Leadership/Article/Who-to-Talk-To-Saudi-Expansion-Export-Controls`,
        excerpt:
          'Recommended lawyer pairing plus webinars, CLE, alert, and checklist for inbound teams.',
        type: 'knowledge-article',
      },
      {
        id: '{F11B117B-A06E-415E-84FA-073A82CB7645}',
        title: 'Amanda Afeich — Disputes (Montréal)',
        url: '/Lawyers/Bios/Khalid-A-AlArfaj',
        path: `${BLG_HOME}/Lawyers/Bios/Khalid-A-AlArfaj`,
        excerpt:
          'Montréal disputes associate supporting commercial litigation and trade-related conflicts.',
        type: 'people-and-teams',
      },
    ],
  },
  {
    id: 'esg-indigenous-infrastructure',
    matchAny: [
      ['esg'],
      ['indigenous'],
      ['first', 'nations'],
      ['infrastructure', 'project'],
      ['duty', 'consult'],
      ['sustainability'],
    ],
    sources: [
      {
        id: '{84235479-63FB-48F6-8601-9DDF63892744}',
        title: 'Sarah Bird — Infrastructure / Indigenous Law',
        url: '/Lawyers/Bios/Stephen-C-Ashley',
        path: `${BLG_HOME}/Lawyers/Bios/Stephen-C-Ashley`,
        excerpt:
          'Vancouver partner advising on infrastructure, Indigenous law, construction, and ESG for major Canadian projects.',
        type: 'people-and-teams',
      },
      {
        id: '{3F444BEC-F590-462F-9AD9-2A650F700F9F}',
        title: 'Jennifer Archer — Corporate Commercial (Vancouver)',
        url: '/Lawyers/Bios/Rolando-T-Acosta',
        path: `${BLG_HOME}/Lawyers/Bios/Rolando-T-Acosta`,
        excerpt:
          'Vancouver corporate commercial partner for M&A, governance, and ESG-related corporate transactions.',
        type: 'people-and-teams',
      },
    ],
  },
  {
    id: 'construction-act-dispute',
    matchAny: [
      ['construction', 'act'],
      ['holdback'],
      ['construction', 'claim'],
      ['lien'],
      ['prompt', 'payment'],
      ['construction', 'insurance'],
    ],
    sources: [
      {
        id: '{8C046A38-BA3E-45EF-BD2D-39E5773FF1E9}',
        title: 'Frank Arnone — Commercial Real Estate',
        url: '/Lawyers/Bios/Ryan-R-Adelsperger',
        path: `${BLG_HOME}/Lawyers/Bios/Ryan-R-Adelsperger`,
        excerpt:
          'Toronto commercial real estate partner advising on development, Construction Act holdbacks, and national real estate portfolios.',
        type: 'people-and-teams',
      },
      {
        id: '{C139E395-B409-4F6D-9F13-9548B58F96B3}',
        title: 'Line Abecassis — Commercial Real Estate',
        url: '/Lawyers/Bios/Andrew-V-Alfano',
        path: `${BLG_HOME}/Lawyers/Bios/Andrew-V-Alfano`,
        excerpt:
          'Montréal commercial real estate partner for acquisitions, leasing, and development across Québec and national portfolios.',
        type: 'people-and-teams',
      },
      {
        id: '{84235479-63FB-48F6-8601-9DDF63892744}',
        title: 'Sarah Bird — Infrastructure',
        url: '/Lawyers/Bios/Stephen-C-Ashley',
        path: `${BLG_HOME}/Lawyers/Bios/Stephen-C-Ashley`,
        excerpt:
          'Vancouver infrastructure partner when a Construction Act file is also an Indigenous-facing or major project.',
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
 * BLG visitor demos do not layer U.S. state Shared Content.
 */
export function buildDemoPlaybookSources(
  question: string,
  _stateCode?: PulseStateCode | null
): PulseSource[] {
  void _stateCode;
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
  "I'm looking for a career in corporate commercial. What openings do you have?",
  'We need GenAI governance advice for a Canadian issuer — who should lead?',
  'One of our portfolio companies is in financial distress. Who should we talk to?',
  "We're entering Canada and have tariff questions. Who should we talk to?",
] as const;
