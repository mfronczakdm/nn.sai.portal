import { isAllowedPortalHubPath, normalizeIndustryKey } from '@/lib/portal-hub-utils';

describe('portal-hub-utils', () => {
  it('normalizes industry keys', () => {
    expect(normalizeIndustryKey('  Insurance ')).toBe('insurance');
    expect(normalizeIndustryKey(undefined)).toBe('');
  });

  it('allows only safe Sitecore content paths', () => {
    expect(isAllowedPortalHubPath('/sitecore/content/sync/demo/Data/Portal Hub')).toBe(true);
    expect(isAllowedPortalHubPath('/etc/passwd')).toBe(false);
    expect(isAllowedPortalHubPath('/sitecore/content/../secret')).toBe(false);
  });
});
