const DEFAULT_PATH = '/';

const QUERY_LOGIN_KEYS = ['callbackUrl', 'redirect'] as const;
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

function firstQueryMatch(
  searchParams: URLSearchParams | AuthRedirectSearchParams | null | undefined,
  keys: readonly string[],
): string | undefined {
  if (!searchParams) {
    return undefined;
  }
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value && isSafeInternalPath(value)) {
      return value;
    }
  }
  return undefined;
}

/**
 * Resolves where to send the user after a successful login.
 * Priority: query string → rendering param → default `/`.
 */
export function resolvePostLoginRedirect(
  searchParams: URLSearchParams | AuthRedirectSearchParams | null | undefined,
  paramRedirect?: string,
): string {
  return (
    firstQueryMatch(searchParams, QUERY_LOGIN_KEYS) ??
    (paramRedirect && isSafeInternalPath(paramRedirect) ? paramRedirect : undefined) ??
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
    (paramPostLogout && isSafeInternalPath(paramPostLogout) ? paramPostLogout : undefined) ??
    DEFAULT_PATH
  );
}
