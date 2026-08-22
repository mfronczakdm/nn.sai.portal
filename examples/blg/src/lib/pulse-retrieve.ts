import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import {
  isSitecoreSearchConfigured,
  SEARCH_WIDGET_ID,
} from '@/lib/search-customizations';
import { buildDemoPlaybookSources } from '@/lib/pulse-demo-playbook';
import type { PulseSource, PulseSourceType, PulseStateCode } from '@/lib/pulse-types';

const DEFAULT_HOME_PATH = '/sitecore/content/pillsbury/pillsburylaw/Home';
const DEFAULT_KA_ROOT_ID = '5dad4c5c-84cd-471a-80ef-c805570be79a';
const FETCH_FIRST = 36;
/** Enough room for demo playbook people + webinars / podcasts / guides. */
const MAX_SOURCES = 8;

type EdgeJsonField = { jsonValue?: unknown };

type EdgeNode = {
  id?: string;
  name?: string;
  path?: string;
  url?: { path?: string };
  title?: EdgeJsonField;
  pageTitle?: EdgeJsonField;
  purpose?: EdgeJsonField;
  content?: EdgeJsonField;
  pageSummary?: EdgeJsonField;
};

type SearchResult = {
  search?: { results?: EdgeNode[] };
};

type ItemIdResult = {
  item?: { id?: string } | null;
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'for',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'is',
  'are',
  'was',
  'were',
  'be',
  'what',
  'who',
  'how',
  'when',
  'where',
  'why',
  'do',
  'does',
  'did',
  'can',
  'could',
  'should',
  'would',
  'i',
  'me',
  'my',
  'we',
  'our',
  'you',
  'your',
  'with',
  'about',
  'from',
  'this',
  'that',
  'these',
  'those',
  'please',
  'tell',
  'show',
  'find',
  'get',
  'need',
  'help',
]);

function edgeGuid(id: string): string {
  const raw = id.replace(/[{}]/g, '').toLowerCase();
  if (raw.includes('-')) return raw;
  if (raw.length !== 32) return raw;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function readString(field?: EdgeJsonField): string {
  if (!field || field.jsonValue == null) return '';
  const jv = field.jsonValue;
  if (typeof jv === 'string') return jv.trim();
  if (typeof jv === 'object' && jv !== null && 'value' in jv) {
    const v = (jv as { value?: unknown }).value;
    if (typeof v === 'string') return v.trim();
  }
  return '';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Significant tokens from the user question for Edge matching / scoring. */
export function extractKeywords(question: string): string[] {
  const tokens = question
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));

  const unique: string[] = [];
  for (const t of tokens) {
    if (!unique.includes(t)) unique.push(t);
  }
  return unique.slice(0, 8);
}

export function classifySourceType(path?: string): PulseSourceType {
  const p = (path || '').replace(/\\/g, '/');
  if (/\/Shared(?:%20| )?Content\//i.test(p)) return 'shared-content';
  if (/\/Knowledge(?:%20|-)?Articles?\//i.test(p)) return 'knowledge-article';
  if (/\/Insights\//i.test(p) || /\/Blogs?\//i.test(p)) return 'knowledge-article';
  if (/\/Lawyers\/Bios?\//i.test(p) || /\/Bios?\//i.test(p)) return 'people-and-teams';
  if (/\/People(?:%20|-)?and(?:%20|-)?Teams?\//i.test(p)) return 'people-and-teams';
  if (/\/Products?\//i.test(p) || /\/Capabilities\//i.test(p)) return 'product';
  return 'other';
}

export function extractStateFromPath(path?: string): string | undefined {
  if (!path) return undefined;
  const match = path.replace(/\\/g, '/').match(/\/StateSpecific\/([A-Z]{2})(?:\/|$)/i);
  return match?.[1]?.toUpperCase();
}

function publicUrl(urlPath?: string, itemPath?: string): string {
  if (urlPath?.trim()) {
    const p = urlPath.trim();
    return p.startsWith('/') ? p : `/${p}`;
  }
  if (!itemPath) return '/';
  // /sitecore/content/progressive/pkm/Home/Knowledge Articles/... → /Knowledge-Articles/...
  const homeIdx = itemPath.toLowerCase().indexOf('/home/');
  if (homeIdx >= 0) {
    const rest = itemPath.slice(homeIdx + '/home/'.length);
    return (
      '/' +
      rest
        .split('/')
        .filter(Boolean)
        .map((seg) => encodeURIComponent(seg.replace(/\s+/g, '-')))
        .join('/')
    );
  }
  return '/';
}

function scoreSource(
  source: Omit<PulseSource, 'score'>,
  keywords: string[],
  stateCode?: PulseStateCode | null
): number {
  const hay = `${source.title} ${source.path || ''} ${source.excerpt || ''}`.toLowerCase();
  let score = 0;

  for (const kw of keywords) {
    if (hay.includes(kw)) score += 10;
  }

  if (source.type === 'shared-content') score += 4;
  if (source.type === 'knowledge-article') score += 3;
  if (source.type === 'people-and-teams' || source.type === 'product') score += 2;

  const itemState = source.stateCode?.toUpperCase();
  if (stateCode) {
    if (itemState === stateCode) score += 40;
    else if (itemState && itemState !== stateCode) score -= 50;
  }

  return score;
}

function createEdgeClient(): SitecoreClient {
  const contextId =
    process.env.SITECORE_EDGE_CONTEXT_ID_LIVE?.trim() ||
    process.env.SITECORE_EDGE_CONTEXT_ID?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID?.trim() ||
    '';

  return new SitecoreClient({
    ...scConfig,
    api: {
      ...scConfig.api,
      edge: {
        ...scConfig.api.edge,
        contextId,
        clientContextId: contextId,
      },
    },
  });
}

async function resolveHomeRootId(client: SitecoreClient, language: string): Promise<string> {
  const envId = process.env.PULSE_HOME_ROOT_ID?.trim();
  if (envId) return edgeGuid(envId);

  try {
    const homePath = process.env.PULSE_HOME_PATH?.trim() || DEFAULT_HOME_PATH;
    const data = await client.getData<ItemIdResult>(
      `query PulseHome($path: String!, $language: String!) {
        item(path: $path, language: $language) { id }
      }`,
      { path: homePath, language }
    );
    if (data?.item?.id) return edgeGuid(data.item.id);
  } catch (error) {
    console.error('[pulse-retrieve] Failed to resolve Home root:', error);
  }

  return edgeGuid(process.env.KNOWLEDGE_ARTICLES_ROOT_ID?.trim() || DEFAULT_KA_ROOT_ID);
}

function buildEdgeSearchQuery(keywordCount: number): string {
  const orClauses = Array.from({ length: keywordCount }, (_, i) => {
    return `
      { name: "_name", value: $kw${i}, operator: CONTAINS }
      { name: "Title", value: $kw${i}, operator: CONTAINS }
      { name: "pageTitle", value: $kw${i}, operator: CONTAINS }
    `;
  }).join('\n');

  const vars = Array.from({ length: keywordCount }, (_, i) => `$kw${i}: String!`).join(', ');

  return `
    query PulseEdgeSearch($rootId: String!, $first: Int!, ${vars}) {
      search(
        where: {
          AND: [
            { name: "_path", value: $rootId, operator: CONTAINS }
            { OR: [ ${orClauses} ] }
          ]
        }
        first: $first
      ) {
        results {
          id
          name
          path
          url { path }
          title: field(name: "Title") { jsonValue }
          pageTitle: field(name: "pageTitle") { jsonValue }
          purpose: field(name: "Purpose") { jsonValue }
          content: field(name: "Content") { jsonValue }
          pageSummary: field(name: "pageSummary") { jsonValue }
        }
      }
    }
  `;
}

function mapEdgeNode(node: EdgeNode): Omit<PulseSource, 'score'> | null {
  if (!node?.id) return null;
  const title =
    readString(node.title) ||
    readString(node.pageTitle) ||
    node.name ||
    'Untitled';
  const excerptRaw =
    readString(node.purpose) ||
    readString(node.pageSummary) ||
    readString(node.content);
  const excerpt = stripHtml(excerptRaw).slice(0, 220);
  const path = node.path;
  return {
    id: node.id,
    title,
    url: publicUrl(node.url?.path, path),
    path,
    excerpt: excerpt || undefined,
    type: classifySourceType(path),
    stateCode: extractStateFromPath(path),
  };
}

async function retrieveFromEdge(
  question: string,
  keywords: string[],
  stateCode?: PulseStateCode | null,
  language = 'en'
): Promise<PulseSource[]> {
  const kws = keywords.length ? keywords : extractKeywords(question);
  if (!kws.length) return [];

  const client = createEdgeClient();
  const rootId = await resolveHomeRootId(client, language);
  const query = buildEdgeSearchQuery(kws.length);
  const variables: Record<string, string | number> = {
    rootId,
    first: FETCH_FIRST,
  };
  kws.forEach((kw, i) => {
    variables[`kw${i}`] = kw;
  });

  try {
    const data = await client.getData<SearchResult>(query, variables);
    const mapped = (data?.search?.results ?? [])
      .map(mapEdgeNode)
      .filter((s): s is Omit<PulseSource, 'score'> => Boolean(s));

    return rankAndCap(mapped, kws, stateCode);
  } catch (error) {
    console.error('[pulse-retrieve] Edge search failed:', error);
    return [];
  }
}

type SearchApiContentItem = {
  id?: string;
  name?: string;
  title?: string;
  url?: string;
  description?: string;
  type?: string;
  source_id?: string;
};

function searchApiHost(env: string): string {
  switch (env) {
    case 'prodEu':
      return 'https://discover-euc1.sitecorecloud.io';
    case 'apse2':
      return 'https://discover-apse2.sitecorecloud.io';
    default:
      return 'https://discover.sitecorecloud.io';
  }
}

async function retrieveFromSitecoreSearch(
  question: string,
  keywords: string[],
  stateCode?: PulseStateCode | null
): Promise<PulseSource[]> {
  const env = process.env.NEXT_PUBLIC_SEARCH_ENV?.trim() || 'prod';
  const customerKey = process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY?.trim() || '';
  const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY?.trim() || '';
  const rfkId = SEARCH_WIDGET_ID;
  const source = process.env.NEXT_PUBLIC_SEARCH_SOURCE?.trim() || '';

  const url = `${searchApiHost(env)}/discover/v2/${encodeURIComponent(customerKey)}`;

  const widgetItem: Record<string, unknown> = {
    rfk_id: rfkId,
    entity: 'content',
    search: {
      content: {},
      limit: FETCH_FIRST,
      query: { keyphrase: question },
    },
  };

  if (source) {
    (widgetItem.search as Record<string, unknown>).source = {
      id: source.split('|').map((s) => s.trim()).filter(Boolean),
    };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        context: {
          page: { uri: '/pulse' },
          locale: { country: 'us', language: 'en' },
          user: { uuid: 'pulse-assistant-demo' },
        },
        widget: { items: [widgetItem] },
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[pulse-retrieve] Sitecore Search HTTP', res.status, await res.text());
      return [];
    }

    const json = (await res.json()) as {
      widgets?: Array<{ content?: SearchApiContentItem[] }>;
    };
    const content = json.widgets?.[0]?.content ?? [];

    const mapped: Omit<PulseSource, 'score'>[] = content.map((item) => {
      const path = item.url || item.name || '';
      const title = item.title || item.name || 'Untitled';
      return {
        id: item.id || title,
        title,
        url: item.url?.startsWith('http')
          ? (() => {
              try {
                return new URL(item.url!).pathname;
              } catch {
                return item.url || '/';
              }
            })()
          : item.url || '/',
        path,
        excerpt: item.description ? stripHtml(item.description).slice(0, 220) : undefined,
        type: classifySourceType(path) !== 'other' ? classifySourceType(path) : inferTypeFromLabel(item.type),
        stateCode: extractStateFromPath(path),
      };
    });

    return rankAndCap(mapped, keywords, stateCode);
  } catch (error) {
    console.error('[pulse-retrieve] Sitecore Search failed:', error);
    return [];
  }
}

function inferTypeFromLabel(type?: string): PulseSourceType {
  const t = (type || '').toLowerCase();
  if (t.includes('knowledge') || t.includes('article')) return 'knowledge-article';
  if (t.includes('people') || t.includes('team')) return 'people-and-teams';
  if (t.includes('product')) return 'product';
  if (t.includes('shared')) return 'shared-content';
  return 'other';
}

function rankAndCap(
  sources: Omit<PulseSource, 'score'>[],
  keywords: string[],
  stateCode?: PulseStateCode | null
): PulseSource[] {
  const byId = new Map<string, PulseSource>();

  for (const s of sources) {
    const scored: PulseSource = { ...s, score: scoreSource(s, keywords, stateCode) };
    const existing = byId.get(s.id);
    if (!existing || scored.score > existing.score) {
      byId.set(s.id, scored);
    }
  }

  return [...byId.values()]
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SOURCES);
}

/**
 * Retrieve trusted content hits for Pulse.
 * Demo playbook intents (multi-factor lawyer matching) always win for reliable SE demos.
 * Prefer Sitecore Search when configured; fall back to Experience Edge GraphQL.
 */
export async function retrievePulseSources(
  question: string,
  stateCode?: PulseStateCode | null,
  language = 'en'
): Promise<PulseSource[]> {
  const playbook = buildDemoPlaybookSources(question, stateCode);
  const keywords = extractKeywords(question);

  let dynamic: PulseSource[] = [];
  if (isSitecoreSearchConfigured()) {
    dynamic = await retrieveFromSitecoreSearch(question, keywords, stateCode);
  }
  if (!dynamic.length) {
    dynamic = await retrieveFromEdge(question, keywords, stateCode, language);
  }

  if (!playbook.length) return dynamic;

  // Playbook first; append unique dynamic hits that add variety
  const seen = new Set(playbook.map((s) => s.id.toLowerCase().replace(/[{}]/g, '')));
  const extras = dynamic.filter((s) => {
    const key = s.id.toLowerCase().replace(/[{}]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return [...playbook, ...extras].slice(0, MAX_SOURCES);
}
