import { NextRequest, NextResponse } from 'next/server';
import type { SiteInfo } from '@sitecore-content-sdk/nextjs';
import { resolveTheme } from './lib/theme';
import {
  defineProxy,
  AppRouterMultisiteProxy,
  PersonalizeProxy,
  PreviewProxy,
  RedirectsProxy,
  LocaleProxy,
} from '@sitecore-content-sdk/nextjs/proxy';
import sitesJson from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import { routing } from './i18n/routing';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  buildLocalePathname,
  getLocaleFromPathname,
  isSupportedLocale,
} from './lib/locale';
import client from './lib/sitecore-client';
import { tryScrunchAxp } from './lib/scrunch-axp';

/** Sites JSON may be empty at build time; cast so site.name is typed correctly. */
const sitesAll = sitesJson as SiteInfo[];

/**
 * Edge publishes many sites with hostName "*". SiteResolver picks the first match,
 * so rockland (listed first in sites.json) wins on localhost unless we prefer
 * NEXT_PUBLIC_DEFAULT_SITE_NAME.
 */
const sites = (() => {
  const defaultSite = scConfig.defaultSite?.trim();
  if (!defaultSite) return sitesAll;
  const preferred = sitesAll.filter((site) => site.name === defaultSite);
  if (preferred.length === 0) return sitesAll;
  return [...preferred, ...sitesAll.filter((site) => site.name !== defaultSite)];
})();

const locale = new LocaleProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  /**
   * List of all supported locales configured in routing.ts
   */
  locales: routing.locales.slice(),
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  // in multilanguage scenarios, we need locale middleware to always run first to ensure locale is set and used correctly by the rest of the middlewares
  skip: () => false,
});

const multisite = new AppRouterMultisiteProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.multisite,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

const redirects = new RedirectsProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.api.local,
  ...scConfig.redirects,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

const personalize = new PersonalizeProxy({
  /**
   * List of sites for site resolver to work with
   */
  sites,
  ...scConfig.api.edge,
  ...scConfig.personalize,
  // This function determines if the middleware should be turned off on per-request basis.
  // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
  // By default it is disabled while in development mode.
  // This is an important performance consideration since Next.js Edge middleware runs on every request.
  skip: () => false,
});

const preview = new PreviewProxy({
  client,
});

/**
 * Edge entry (Next.js 16 `proxy` convention).
 * Scrunch AXP runs first for AI bots only; everyone else (and Scrunch miss/error)
 * continues through the Sitecore Content SDK proxy chain unchanged.
 */
function siteFromPathname(pathname: string): string | undefined {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment || segment === 'api' || segment === '_next') return undefined;
  return segment;
}

function applyAppTheme(req: NextRequest, res: NextResponse): NextResponse {
  const rewrite = res.headers.get('x-middleware-rewrite') || '';
  let rewritePath = '';
  try {
    if (rewrite.startsWith('http')) rewritePath = new URL(rewrite).pathname;
  } catch {
    rewritePath = '';
  }

  const site =
    req.nextUrl.searchParams.get('sc_site') ||
    req.nextUrl.searchParams.get('site') ||
    siteFromPathname(rewritePath) ||
    siteFromPathname(req.nextUrl.pathname);

  const theme = resolveTheme({ site });
  res.cookies.set('app-theme', theme, { path: '/', sameSite: 'lax' });
  return res;
}

/**
 * Sitecore renders internal links without a locale prefix, so a visitor who picked a language
 * would drop back to the default one on the next click. Remember the language chosen via a
 * locale-prefixed URL and replay it on subsequent unprefixed requests.
 */
function resolveLocaleRequest(req: NextRequest): { request: NextRequest; locale?: string } {
  const localeFromPath = getLocaleFromPathname(req.nextUrl.pathname);
  if (localeFromPath) {
    return { request: req, locale: localeFromPath };
  }

  const cookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (!isSupportedLocale(cookieLocale) || cookieLocale === DEFAULT_LOCALE) {
    return { request: req };
  }

  const url = req.nextUrl.clone();
  url.pathname = buildLocalePathname(req.nextUrl.pathname, cookieLocale as string);
  return { request: new NextRequest(url, req), locale: cookieLocale };
}

export default async function proxy(req: NextRequest) {
  const axp = await tryScrunchAxp(req);
  if (axp) return axp;

  const { request, locale: activeLocale } = resolveLocaleRequest(req);

  const res = await defineProxy(locale, preview, multisite, redirects, personalize).exec(request);
  if (activeLocale) {
    res.cookies.set(LOCALE_COOKIE_NAME, activeLocale, { path: '/', sameSite: 'lax' });
  }
  return applyAppTheme(req, res);
}

export const config = {
  /*
   * Match all paths except for:
   * 1. API route handlers
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 7. all root files inside /public
   *
   * Kept Sitecore exclusions (do not replace with Scrunch’s broader matcher)
   * so editing, APIs, and media stay on the Sitecore/origin path.
   */
  matcher: [
    '/',
    '/((?!api/|\\.well-known/|sitemap|robots|llms|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg|ai/).*)',
  ],
};
