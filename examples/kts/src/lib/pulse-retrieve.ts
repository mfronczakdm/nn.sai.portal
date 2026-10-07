import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

import {
  isSitecoreSearchConfigured,
  SEARCH_WIDGET_ID,
} from '@/lib/search-customizations';
import {
  getPulsePack,
  matchPulsePackIntent,
  type PulseSitePack,
} from '@/lib/pulse-packs';
import type {
  PulseRetrieveOptions,
  PulseSource,
  PulseSourceType,
  PulseStateCode,
} from '@/lib/pulse-types';

const FETCH_FIRST = 80;
/** Enough room for demo intent citations + keyword supplements. */
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
  detail?: EdgeJsonField;
  pageSummary?: EdgeJsonField;
  summary?: EdgeJsonField;
  fullName?: EdgeJsonField;
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

const ITEM_FIELDS_SELECTION = `
  id
  name
  path
  url { path }
  title: field(name: "Title") { jsonValue }
  pageTitle: field(name: "pageTitle") { jsonValue }
  purpose: field(name: "Purpose") { jsonValue }
  content: field(name: "Content") { jsonValue }
  detail: field(name: "Detail") { jsonValue }
  pageSummary: field(name: "pageSummary") { jsonValue }
  summary: field(name: "Summary") { jsonValue }
  fullName: field(name: "FullName") { jsonValue }
`;

function edgeGuid(id: string): string {
  const raw = id.replace(/[{}]/g, '').toLowerCase();
  if (raw.includes('-')) return raw;
  if (raw.length !== 32) return raw;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function normalizeIdKey(id: string): string {
  return id.replace(/[{}]/g, '').toLowerCase();
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
  if (/\/Resources\//i.test(p) || /\/Technical\//i.test(p)) return 'knowledge-article';
  if (/\/Lawyers\/Bios?\//i.test(p) || /\/Bios?\//i.test(p)) return 'people-and-teams';
  if (/\/People(?:%20|-)?and(?:%20|-)?Teams?\//i.test(p)) return 'people-and-teams';
  if (/\/People(?:\/|$)/i.test(p)) return 'people-and-teams';
  if (/\/Practices(?:\/|$)/i.test(p) || /\/Industries(?:\/|$)/i.test(p)) return 'product';
  if (/\/Media/i.test(p) || /\/Insight/i.test(p)) return 'knowledge-article';
  if (/\/Careers(?:\/|$)/i.test(p)) return 'other';
  if (
    /\/Products?(?:\/|$)/i.test(p) ||
    /\/Capabilities(?:\/|$)/i.test(p) ||
    /\/Window(?:%20|[- ])?Hardware(?:\/|$)/i.test(p) ||
    /\/Door(?:%20|[- ])?Hardware(?:\/|$)/i.test(p) ||
    /\/Window(?:%20|[- ])?Components(?:\/|$)/i.test(p) ||
    /\/Door(?:%20|[- ])?Components(?:\/|$)/i.test(p) ||
    /\/Weatherseals(?:\/|$)/i.test(p) ||
    /\/Extrusions?(?:\/|$)/i.test(p) ||
    /\/Hardware(?:\/|$)/i.test(p)
  ) {
    return 'product';
  }
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

async function resolveHomeRootId(
  client: SitecoreClient,
  pack: PulseSitePack,
  language: string
): Promise<string> {
  if (pack.homeRootId?.trim()) return edgeGuid(pack.homeRootId);

  const envId = process.env.PULSE_HOME_ROOT_ID?.trim();
  if (envId) return edgeGuid(envId);

  const homePath = process.env.PULSE_HOME_PATH?.trim() || pack.homePath;
  try {
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

  return edgeGuid(pack.homeRootId || '');
}

function buildEdgeSearchQuery(keywordCount: number): string {
  const orClauses = Array.from({ length: keywordCount }, (_, i) => {
    return `
      { name: "_name", value: $kw${i}, operator: CONTAINS }
      { name: "Title", value: $kw${i}, operator: CONTAINS }
      { name: "pageTitle", value: $kw${i}, operator: CONTAINS }
      { name: "Detail", value: $kw${i}, operator: CONTAINS }
      { name: "pageSummary", value: $kw${i}, operator: CONTAINS }
      { name: "Summary", value: $kw${i}, operator: CONTAINS }
      { name: "FullName", value: $kw${i}, operator: CONTAINS }
      { name: "Content", value: $kw${i}, operator: CONTAINS }
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
          ${ITEM_FIELDS_SELECTION}
        }
      }
    }
  `;
}

function mapEdgeNode(node: EdgeNode): Omit<PulseSource, 'score'> | null {
  if (!node?.id) return null;
  const title =
    readString(node.fullName) ||
    readString(node.title) ||
    readString(node.pageTitle) ||
    node.name ||
    'Untitled';
  const excerptRaw =
    readString(node.purpose) ||
    readString(node.pageSummary) ||
    readString(node.summary) ||
    readString(node.detail) ||
    readString(node.content);
  const excerpt = stripHtml(excerptRaw).slice(0, 220);
  const path = node.path;
  return {
    id: node.id.startsWith('{') ? node.id : `{${edgeGuid(node.id).toUpperCase()}}`,
    title,
    url: publicUrl(node.url?.path, path),
    path,
    excerpt: excerpt || undefined,
    type: classifySourceType(path),
    stateCode: extractStateFromPath(path),
  };
}

function mergeWithFallback(
  edge: Omit<PulseSource, 'score'> | null,
  id: string,
  pack: PulseSitePack
): Omit<PulseSource, 'score'> | null {
  const fallbacks = pack.citationFallbacks || {};
  const fallback =
    fallbacks[id] ||
    fallbacks[id.toUpperCase()] ||
    fallbacks[`{${normalizeIdKey(id).toUpperCase()}}`];

  if (!edge && !fallback) return null;
  if (!edge) return { ...fallback! };
  if (!fallback) return edge;

  return {
    ...fallback,
    ...edge,
    title: edge.title || fallback.title,
    url: edge.url && edge.url !== '/' ? edge.url : fallback.url,
    path: edge.path || fallback.path,
    excerpt: edge.excerpt || fallback.excerpt,
    type: edge.type !== 'other' ? edge.type : fallback.type,
  };
}

/**
 * Hydrate citation item IDs from Experience Edge (same published content as the live site).
 */
export async function hydrateCitationIdsFromEdge(
  itemIds: string[],
  pack: PulseSitePack,
  language = 'en'
): Promise<Omit<PulseSource, 'score'>[]> {
  if (!itemIds.length) return [];

  const client = createEdgeClient();
  const results: Omit<PulseSource, 'score'>[] = [];

  // Alias batch keeps round-trips low for demo intents (typically ≤8 IDs).
  const aliases = itemIds.map((id, i) => {
    const guid = edgeGuid(id);
    return {
      alias: `item${i}`,
      id,
      guid,
    };
  });

  const query = `
    query PulseHydrateCitations($language: String!) {
      ${aliases
        .map(
          (a) => `
        ${a.alias}: item(path: "${a.guid}", language: $language) {
          ${ITEM_FIELDS_SELECTION}
        }
      `
        )
        .join('\n')}
    }
  `;

  try {
    const data = await client.getData<Record<string, EdgeNode | null>>(query, { language });
    for (const a of aliases) {
      const node = data?.[a.alias] ?? null;
      const mapped = mergeWithFallback(node ? mapEdgeNode(node) : null, a.id, pack);
      if (mapped) results.push(mapped);
    }
  } catch (error) {
    console.error('[pulse-retrieve] Edge citation hydrate failed:', error);
    // Fall back to static pack metadata when Edge is unavailable (legacy Pillsbury).
    for (const id of itemIds) {
      const mapped = mergeWithFallback(null, id, pack);
      if (mapped) results.push(mapped);
    }
  }

  return results;
}

async function retrieveFromEdge(
  question: string,
  keywords: string[],
  pack: PulseSitePack,
  stateCode?: PulseStateCode | null,
  language = 'en'
): Promise<PulseSource[]> {
  const kws = keywords.length ? keywords : extractKeywords(question);
  if (!kws.length) return [];

  const client = createEdgeClient();
  const rootId = await resolveHomeRootId(client, pack, language);
  if (!rootId) return [];

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
        type:
          classifySourceType(path) !== 'other'
            ? classifySourceType(path)
            : inferTypeFromLabel(item.type),
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
    const existing = byId.get(normalizeIdKey(s.id));
    if (!existing || scored.score > existing.score) {
      byId.set(normalizeIdKey(s.id), scored);
    }
  }

  return [...byId.values()]
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SOURCES);
}

function mergeIntentAndDynamic(
  intentSources: PulseSource[],
  dynamic: PulseSource[]
): PulseSource[] {
  const seen = new Set(intentSources.map((s) => normalizeIdKey(s.id)));
  const extras = dynamic.filter((s) => {
    const key = normalizeIdKey(s.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...intentSources, ...extras].slice(0, MAX_SOURCES);
}

/**
 * Retrieve trusted content hits for Pulse.
 * Primary path: Experience Edge under the site pack Home root (no Sitecore Search required).
 * Optional: Sitecore Search when isSitecoreSearchConfigured() (e.g. legacy Pillsbury).
 * Demo intents hydrate citation IDs from Edge first, then supplement with keyword hits.
 */
export async function retrievePulseSources(
  question: string,
  options?: PulseRetrieveOptions | PulseStateCode | null,
  languageArg = 'en'
): Promise<PulseSource[]> {
  // Back-compat: retrievePulseSources(question, stateCode, language)
  const opts: PulseRetrieveOptions =
    typeof options === 'string' || options === null || options === undefined
      ? { stateCode: (options as PulseStateCode | null) ?? null, language: languageArg }
      : { language: languageArg, ...options };

  const pack = getPulsePack(opts.siteName);
  const language = opts.language || 'en';
  const stateCode = pack.enableStatePersona ? opts.stateCode ?? null : null;
  const keywords = extractKeywords(question);

  const intent = matchPulsePackIntent(question, pack);
  let intentSources: PulseSource[] = [];
  if (intent?.citationItemIds?.length) {
    const hydrated = await hydrateCitationIdsFromEdge(intent.citationItemIds, pack, language);
    intentSources = hydrated.map((source, index) => ({
      ...source,
      score: 1000 - index * 50,
    }));
  }

  // Default: Edge keyword search under this site's Home (required path for Quanex family).
  let dynamic: PulseSource[] = await retrieveFromEdge(
    question,
    keywords,
    pack,
    stateCode,
    language
  );

  // Optional legacy path: Sitecore Search when configured (e.g. Pillsbury). Never required.
  if (isSitecoreSearchConfigured()) {
    const fromSearch = await retrieveFromSitecoreSearch(question, keywords, stateCode);
    if (fromSearch.length) {
      dynamic = mergeIntentAndDynamic(dynamic, fromSearch);
    }
  }

  if (!intentSources.length) return dynamic;
  return mergeIntentAndDynamic(intentSources, dynamic);
}
