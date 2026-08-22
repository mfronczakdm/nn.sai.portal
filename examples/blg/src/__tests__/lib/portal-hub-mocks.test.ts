import { getMockPortalHubModules } from '@/lib/portal-hub-mocks';

describe('portal-hub-mocks', () => {
  it('returns modules for registered industry keys (case-insensitive)', () => {
    expect(getMockPortalHubModules('insurance').length).toBeGreaterThan(0);
    expect(getMockPortalHubModules('INSURANCE').length).toBeGreaterThan(0);
    expect(getMockPortalHubModules('finserv').length).toBeGreaterThan(0);
  });

  it('returns empty array for unknown industries', () => {
    expect(getMockPortalHubModules('unknown-vertical')).toEqual([]);
  });
});
