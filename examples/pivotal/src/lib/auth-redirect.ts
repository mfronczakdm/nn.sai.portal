const DEFAULT_PATH = '/';

/** Root-relative portal hub path — matches PortalHub and PortalPageDetail links. */
export const PORTAL_HUB_HREF = '/portal';

const DEFAULT_PORTAL_LOGIN_PATH = PORTAL_HUB_HREF;

const QUERY_LOGIN_KEYS = ['callbackUrl', 'redirect', 'redirectUrl'] as const;
const QUERY_LOGOUT_KEYS = ['post_logout_redirect', 'callbackUrl', 'redirect'] as const;

/** Narrow surface used from `useSearchParams()` / `URLSearchParams` without coupling to Next types. */
export type AuthRedirectSearchParams = {
  get(name: string): string | null;
};

/**
 * Returns true for same-origin style paths only (relative URL path).
 * Rejects protocol-relative and absolute URLs to avoid open redirects.
 */
export function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith('/')) {
    return false;
  }
  if (path.startsWith('//')) {
    return false;
  }
  if (path.includes('\\')) {
    return false;
  }
  return true;
}

function toSafeRedirect(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const mapped = mapSitecorePortalItemPath(value);
  if (mapped) {
    return mapped;
  }

  if (isSafeInternalPath(value)) {
    return value;
  }

  return undefined;
}

function firstQueryMatch(
  searchParams: URLSearchParams | AuthRedirectSearchParams | null | undefined,
  keys: readonly string[],
): string | undefined {
  if (!searchParams) {
    return undefined;
  }
  for (const key of keys) {
    const safe = toSafeRedirect(searchParams.get(key) ?? undefined);
    if (safe) {
      return safe;
    }
  }
  return undefined;
}

/**
 * Resolves where to send the user after a successful login.
 * Priority: query string → datasource link href → rendering param → default `/`.
 */
export function resolvePostLoginRedirect(
  searchParams: URLSearchParams | AuthRedirectSearchParams | null | undefined,
  paramRedirect?: string,
  linkHref?: string,
): string {
  return (
    firstQueryMatch(searchParams, QUERY_LOGIN_KEYS) ??
    toSafeRedirect(linkHref) ??
    toSafeRedirect(paramRedirect) ??
    DEFAULT_PATH
  );
}

/**
 * Resolves where to send the user after logout.
 * Priority: query string → rendering param → default `/`.
 */
export function resolvePostLogoutRedirect(
  searchParams: URLSearchParams | AuthRedirectSearchParams | null | undefined,
  paramPostLogout?: string,
): string {
  return (
    firstQueryMatch(searchParams, QUERY_LOGOUT_KEYS) ??
    toSafeRedirect(paramPostLogout) ??
    DEFAULT_PATH
  );
}

/**
 * Maps Sitecore item paths for the portal page to the live URL `/portal`.
 * Examples: `/sitecore/content/dfs/dfs/Home/Portal`, `dfs/dfs/home/portal`.
 * Does not treat `/dfs/dfs/home/portal` as a Next.js route.
 */
export function mapSitecorePortalItemPath(href: string): string | undefined {
  const withoutQuery = href.trim().split(/[?#]/)[0] ?? '';
  const withSlashes = withoutQuery.replace(/\\/g, '/');
  const stripped = withSlashes.replace(/^\/?sitecore\/content\//i, '').replace(/^\/+/, '');
  const match = stripped.match(/^[^/]+\/[^/]+\/home\/portal(\/.*)?$/i);
  if (!match) {
    return undefined;
  }

  return `${PORTAL_HUB_HREF}${match[1] ?? ''}`;
}

/**
 * Sitecore General Links may include `/site/locale` prefixes (e.g. `/dfs/en/portal`)
 * or item paths (`/sitecore/content/.../Home/Portal`).
 * Portal hub navigation uses root-relative paths (`/portal`) so multisite middleware can rewrite.
 */
export function normalizePortalRedirectPath(path: string): string {
  const fromItemPath = mapSitecorePortalItemPath(path);
  if (fromItemPath) {
    return fromItemPath;
  }

  if (!isSafeInternalPath(path)) {
    return DEFAULT_PORTAL_LOGIN_PATH;
  }

  if (path === PORTAL_HUB_HREF || path.startsWith(`${PORTAL_HUB_HREF}/`)) {
    return path;
  }

  const siteLocalePortalMatch = path.match(/^\/[^/]+\/[^/]+(\/portal(?:\/.*)?)$/);
  if (siteLocalePortalMatch?.[1]) {
    return siteLocalePortalMatch[1];
  }

  return path;
}

/**
 * Resolves post-login redirect for the Authentication portal component.
 * Falls back to `/portal` instead of `/` when no target is configured.
 */
export function resolvePortalPostLoginRedirect(
  searchParams: URLSearchParams | AuthRedirectSearchParams | null | undefined,
  paramRedirect?: string,
  linkHref?: string,
): string {
  const resolved = resolvePostLoginRedirect(searchParams, paramRedirect, linkHref);
  if (resolved === DEFAULT_PATH) {
    return DEFAULT_PORTAL_LOGIN_PATH;
  }
  return normalizePortalRedirectPath(resolved);
}
