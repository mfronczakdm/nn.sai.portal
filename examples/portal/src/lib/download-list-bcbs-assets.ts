/**
 * Plan asset file names from custom GraphQL (query supplied per rendering item).
 * Configure `BCBS_GRAPHQL_ENDPOINT` and `BCBS_GRAPHQL_TOKEN` (server-only); do not commit tokens.
 */

const MAX_QUERY_CHARS = 65_000;

function asRecord(x: unknown): Record<string, unknown> | null {
  return x !== null && typeof x === 'object' ? (x as Record<string, unknown>) : null;
}

function collectFileNameStringsUnderData(node: unknown, out: Set<string>): void {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const item of node) collectFileNameStringsUnderData(item, out);
    return;
  }
  if (typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if ((k === 'fileName' || k === 'FileName') && typeof v === 'string') {
      const t = v.trim();
      if (t) out.add(t);
    } else {
      collectFileNameStringsUnderData(v, out);
    }
  }
}

/** Parses the GraphQL JSON body and returns unique non-empty `fileName` / `FileName` values under `data`. */
export function collectPlanAssetFileNamesFromGraphqlBody(body: unknown): string[] {
  const root = asRecord(body);
  const names = new Set<string>();
  collectFileNameStringsUnderData(root?.data, names);
  return [...names];
}

export function assertDownloadListGraphqlQueryOk(query: string): string | null {
  const q = query.trim();
  if (!q) return 'empty_query';
  if (q.length > MAX_QUERY_CHARS) return 'query_too_large';
  return null;
}

export async function fetchPlanAssetFileNamesForGraphqlQuery(query: string): Promise<string[]> {
  const url = process.env.BCBS_GRAPHQL_ENDPOINT?.trim();
  const token = process.env.BCBS_GRAPHQL_TOKEN?.trim();
  const validation = assertDownloadListGraphqlQueryOk(query);
  if (validation || !url || !token) {
    return [];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GQL-tOKEN': token,
    },
    body: JSON.stringify({ query: query.trim() }),
    cache: 'no-store',
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    console.error('[fetchPlanAssetFileNamesForGraphqlQuery] HTTP', res.status, json);
    return [];
  }

  const root = asRecord(json);
  if (Array.isArray(root?.errors) && root.errors.length > 0) {
    console.error('[fetchPlanAssetFileNamesForGraphqlQuery] GraphQL errors', root.errors);
    return [];
  }

  return collectPlanAssetFileNamesFromGraphqlBody(json);
}
