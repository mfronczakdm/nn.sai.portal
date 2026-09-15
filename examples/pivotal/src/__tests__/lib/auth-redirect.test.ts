import { resolveLinkFieldHref } from '@/lib/auth/link-field';
import {
  isSafeInternalPath,
  mapSitecorePortalItemPath,
  normalizePortalRedirectPath,
  PORTAL_HUB_HREF,
  resolvePortalPostLoginRedirect,
  resolvePostLoginRedirect,
  resolvePostLogoutRedirect,
} from '@/lib/auth-redirect';

describe('auth-redirect', () => {
  it('rejects unsafe redirect targets', () => {
    expect(isSafeInternalPath('/ok')).toBe(true);
    expect(isSafeInternalPath('//evil.com')).toBe(false);
    expect(isSafeInternalPath('https://evil.com')).toBe(false);
    expect(isSafeInternalPath('/x\\y')).toBe(false);
  });

  it('prefers query string over params for login', () => {
    const sp = new URLSearchParams();
    sp.set('callbackUrl', '/after-login');
    expect(resolvePostLoginRedirect(sp, '/from-param')).toBe('/after-login');
  });

  it('prefers datasource link over rendering param for login', () => {
    expect(resolvePostLoginRedirect(new URLSearchParams(), '/from-param', '/from-link')).toBe(
      '/from-link',
    );
  });

  it('falls back to param then default for login', () => {
    expect(resolvePostLoginRedirect(new URLSearchParams(), '/from-param')).toBe('/from-param');
    expect(resolvePostLoginRedirect(new URLSearchParams())).toBe('/');
  });

  it('prefers post_logout_redirect for logout', () => {
    const sp = new URLSearchParams();
    sp.set('post_logout_redirect', '/bye');
    expect(resolvePostLogoutRedirect(sp, '/param')).toBe('/bye');
  });

  it('normalizes site/locale portal paths to root-relative /portal', () => {
    expect(normalizePortalRedirectPath('/dfs/en/portal')).toBe('/portal');
    expect(normalizePortalRedirectPath('/dfs/en/portal/account')).toBe('/portal/account');
    expect(normalizePortalRedirectPath('/portal')).toBe('/portal');
  });

  it('defaults portal login redirect to /portal', () => {
    expect(resolvePortalPostLoginRedirect(new URLSearchParams())).toBe(PORTAL_HUB_HREF);
  });

  it('prefers query string for portal login redirect', () => {
    const sp = new URLSearchParams();
    sp.set('callbackUrl', '/dfs/en/portal/orders');
    expect(resolvePortalPostLoginRedirect(sp)).toBe('/portal/orders');
  });

  it('accepts redirectUrl query string', () => {
    const sp = new URLSearchParams();
    sp.set('redirectUrl', '/portal/orders');
    expect(resolvePortalPostLoginRedirect(sp)).toBe('/portal/orders');
  });

  it('maps Sitecore Home/Portal item paths to /portal', () => {
    expect(mapSitecorePortalItemPath('/sitecore/content/dfs/dfs/Home/Portal')).toBe('/portal');
    expect(mapSitecorePortalItemPath('dfs/dfs/home/portal')).toBe('/portal');
    expect(mapSitecorePortalItemPath('/dfs/dfs/home/portal')).toBe('/portal');
    expect(mapSitecorePortalItemPath('/sitecore/content/dfs/dfs/Home/Portal/orders')).toBe(
      '/portal/orders',
    );
    expect(normalizePortalRedirectPath('/dfs/dfs/home/portal')).toBe('/portal');
    expect(resolvePortalPostLoginRedirect(new URLSearchParams(), undefined, 'dfs/dfs/home/portal')).toBe(
      '/portal',
    );
    expect(
      resolvePortalPostLoginRedirect(
        new URLSearchParams(),
        undefined,
        '/sitecore/content/dfs/dfs/Home/Portal',
      ),
    ).toBe('/portal');
  });
});

describe('resolveLinkFieldHref', () => {
  it('returns safe internal paths from General Link fields', () => {
    expect(
      resolveLinkFieldHref({
        value: { href: '/portal/dashboard', text: 'Dashboard', linktype: 'internal' },
      }),
    ).toBe('/portal/dashboard');
  });

  it('rejects external links', () => {
    expect(
      resolveLinkFieldHref({
        value: { href: 'https://example.com', text: 'External', linktype: 'external' },
      }),
    ).toBeUndefined();
  });

  it('maps Sitecore internal Portal item paths to /portal', () => {
    expect(
      resolveLinkFieldHref({
        value: {
          href: '/sitecore/content/dfs/dfs/Home/Portal',
          text: 'Portal',
          linktype: 'internal',
        },
      }),
    ).toBe('/portal');
    expect(
      resolveLinkFieldHref({
        value: { href: 'dfs/dfs/home/portal', text: 'Portal', linktype: 'internal' },
      }),
    ).toBe('/portal');
  });
});
