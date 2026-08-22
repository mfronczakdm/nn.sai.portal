import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createSitecoreRevalidateRouteHandler } from '@sitecore-content-sdk/nextjs/route-handler';
import { SiteInfo } from '@sitecore-content-sdk/nextjs';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';

import {
  getSitecoreRevalidateSecret,
  resolveAppRouterPagePath,
} from '@/lib/sitecore-page-revalidation';

const sdkRevalidateHandler = createSitecoreRevalidateRouteHandler({
  sites: sites as SiteInfo[],
  defaultLocale: scConfig.defaultLanguage || 'en',
});

type PathRevalidateBody = {
  path?: string;
  site?: string;
  locale?: string;
  paths?: string[];
  updates?: unknown[];
  tags?: unknown[];
};

function isAuthorized(request: NextRequest): boolean {
  const secret = getSitecoreRevalidateSecret();
  if (!secret) return false;

  const headerSecret = request.headers.get('x-revalidate-secret');
  const querySecret = request.nextUrl.searchParams.get('secret');

  return headerSecret === secret || querySecret === secret;
}

function unauthorizedResponse() {
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}

function revalidatePagePath(path: string) {
  revalidatePath(path, 'page');
}

function isWebhookRevalidateBody(body: PathRevalidateBody): boolean {
  return Array.isArray(body.updates) || Array.isArray(body.tags);
}

function revalidatePathsFromBody(body: PathRevalidateBody): string[] {
  const pathsToRevalidate = new Set<string>();

  if (body.path) {
    const appPath = resolveAppRouterPagePath({
      path: body.path,
      site: body.site,
      locale: body.locale,
    });

    if (appPath) {
      pathsToRevalidate.add(appPath);
    }
  }

  for (const path of body.paths ?? []) {
    const appPath = resolveAppRouterPagePath({
      path,
      site: body.site,
      locale: body.locale,
    });

    if (appPath) {
      pathsToRevalidate.add(appPath);
    }
  }

  return Array.from(pathsToRevalidate);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const path = request.nextUrl.searchParams.get('path');
  const site = request.nextUrl.searchParams.get('site') ?? undefined;
  const locale = request.nextUrl.searchParams.get('locale') ?? undefined;

  if (!path) {
    return NextResponse.json({ message: 'path is required' }, { status: 400 });
  }

  const appPath = resolveAppRouterPagePath({ path, site, locale });
  if (!appPath) {
    return NextResponse.json(
      { message: 'Unable to resolve page path. Provide site and locale for content paths.' },
      { status: 400 }
    );
  }

  revalidatePagePath(appPath);

  return NextResponse.json({
    revalidated: true,
    path: appPath,
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let body: PathRevalidateBody = {};

  if (rawBody) {
    try {
      body = JSON.parse(rawBody) as PathRevalidateBody;
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
  }

  if (isWebhookRevalidateBody(body)) {
    return sdkRevalidateHandler.POST(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: rawBody,
      })
    );
  }

  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const paths = revalidatePathsFromBody(body);
  if (paths.length === 0) {
    return NextResponse.json({ message: 'No valid paths to revalidate' }, { status: 400 });
  }

  for (const appPath of paths) {
    revalidatePagePath(appPath);
  }

  return NextResponse.json({
    revalidated: true,
    paths,
  });
}
