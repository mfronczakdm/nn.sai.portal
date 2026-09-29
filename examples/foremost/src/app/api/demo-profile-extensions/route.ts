import { NextResponse } from 'next/server';

import { isCdpAnalyticsEnabled } from '@/lib/cdp-analytics';
import { importDemoIdentifiedContactProfile } from '@/lib/sitecore-ai-profile-import';

export async function POST() {
  if (!isCdpAnalyticsEnabled()) {
    return NextResponse.json({ message: 'Demo analytics is disabled' }, { status: 404 });
  }

  const result = await importDemoIdentifiedContactProfile();
  return NextResponse.json(result.body, { status: result.status });
}
