import { NextResponse } from 'next/server';

import { fetchMainNavTree } from '@/lib/main-nav-from-edge';
import { toEdgeItemPath } from '@/lib/main-nav-utils';

function isAllowedNavRoot(path: string): boolean {
  if (path.startsWith('/sitecore/content/')) return true;
  const guid = path.replace(/[{}]/g, '');
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid);
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get('path')?.trim() ?? '';
  const language = searchParams.get('language')?.trim() || 'en';
  const path = toEdgeItemPath(rawPath);

  if (!path || !isAllowedNavRoot(path)) {
    return NextResponse.json({ tree: null }, { status: 400 });
  }

  const tree = await fetchMainNavTree({ path, language });
  return NextResponse.json({ tree: tree ?? null });
}
