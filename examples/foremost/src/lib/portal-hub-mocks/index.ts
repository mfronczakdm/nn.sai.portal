import type { PortalHubModuleWire } from '@/lib/portal-hub-from-edge';

import { getMockIndustryEntry, getRegisteredMockIndustryKeys } from '@/lib/portal-hub-mocks/registry';

export type { PortalHubMockIndustry } from '@/lib/portal-hub-mocks/types';

/** `PORTAL_HUB_USE_MOCKS=true` | `1` | `yes` (case-insensitive). */
export function isPortalHubMocksEnabled(): boolean {
  const v = process.env.PORTAL_HUB_USE_MOCKS?.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/**
 * Returns modules for a normalized industry key, or [] if unknown (no fallback industry).
 */
export function getMockPortalHubModules(industryKey: string): PortalHubModuleWire[] {
  const entry = getMockIndustryEntry(industryKey);
  return entry?.modules ?? [];
}

/** Useful for diagnostics or Storybook controls. */
export function listMockPortalIndustryKeys(): string[] {
  return getRegisteredMockIndustryKeys();
}
