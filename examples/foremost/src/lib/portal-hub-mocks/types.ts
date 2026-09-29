import type { PortalHubModuleWire } from '@/lib/portal-hub-from-edge';

/** One file per industry: export a constant with this shape, then register it in `registry.ts`. */
export type PortalHubMockIndustry = {
  /** Matches `params.industryType` / `?industry=` (case-insensitive). */
  industryKey: string;
  modules: PortalHubModuleWire[];
};
