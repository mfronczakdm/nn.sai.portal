import { finservMock } from '@/lib/portal-hub-mocks/industries/finserv';
import { healthcareMock } from '@/lib/portal-hub-mocks/industries/healthcare';
import { insuranceMock } from '@/lib/portal-hub-mocks/industries/insurance';
import { manufacturingMock } from '@/lib/portal-hub-mocks/industries/manufacturing';
import { normalizeIndustryKey } from '@/lib/portal-hub-utils';
import type { PortalHubMockIndustry } from '@/lib/portal-hub-mocks/types';

/**
 * Register mock industries here. To add one: create `industries/your-key.ts` exporting
 * `yourKeyMock: PortalHubMockIndustry`, import it here, and append to `ALL_MOCK_INDUSTRIES`.
 */
const ALL_MOCK_INDUSTRIES: PortalHubMockIndustry[] = [
  finservMock,
  insuranceMock,
  healthcareMock,
  manufacturingMock,
];

const MOCK_BY_INDUSTRY: Record<string, PortalHubMockIndustry> = {};
for (const entry of ALL_MOCK_INDUSTRIES) {
  MOCK_BY_INDUSTRY[normalizeIndustryKey(entry.industryKey)] = entry;
}

export function getRegisteredMockIndustryKeys(): string[] {
  return ALL_MOCK_INDUSTRIES.map((e) => e.industryKey);
}

export function getMockIndustryEntry(industryKey: string): PortalHubMockIndustry | undefined {
  return MOCK_BY_INDUSTRY[normalizeIndustryKey(industryKey)];
}
