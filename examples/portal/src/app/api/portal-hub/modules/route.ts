import { NextResponse } from 'next/server';

import { fetchPortalHubModules } from '@/lib/portal-hub-from-edge';
import { isPortalHubMocksEnabled } from '@/lib/portal-hub-mocks';
import { isAllowedPortalHubPath, normalizeIndustryKey } from '@/lib/portal-hub-utils';

/**
 * Returns serialized portal module rows for a hub path + industry key.
 * Used when `?industry=` overrides rendering `industryType` on the client.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path')?.trim() ?? '';
  const industryRaw = searchParams.get('industry') ?? '';
  const industryKey = normalizeIndustryKey(industryRaw);
  const language = searchParams.get('language')?.trim() || 'en';
  const industryTemplateType = searchParams.get('industryTemplateType')?.trim() || undefined;
  const moduleTemplateType = searchParams.get('moduleTemplateType')?.trim() || undefined;

  if (!industryKey) {
    return NextResponse.json({ modules: [] }, { status: 400 });
  }

  if (!isPortalHubMocksEnabled() && (!path || !isAllowedPortalHubPath(path))) {
    return NextResponse.json({ modules: [] }, { status: 400 });
  }

  const modules = await fetchPortalHubModules({
    path,
    language,
    industryKey,
    industryFragmentType: industryTemplateType,
    moduleFragmentType: moduleTemplateType,
  });

  return NextResponse.json({ modules });
}
