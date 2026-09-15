import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { isSafeInternalPath, mapSitecorePortalItemPath } from '@/lib/auth-redirect';

export function resolveLinkFieldHref(field?: LinkField | null): string | undefined {
  const href = field?.value?.href?.trim();
  if (!href) {
    return undefined;
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return undefined;
  }

  const fromItemPath = mapSitecorePortalItemPath(href);
  if (fromItemPath) {
    return fromItemPath;
  }

  if (isSafeInternalPath(href)) {
    return href;
  }

  return undefined;
}
