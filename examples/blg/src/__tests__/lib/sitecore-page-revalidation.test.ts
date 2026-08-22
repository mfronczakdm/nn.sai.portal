import {
  buildAppRouterPagePath,
  getSitecorePageRevalidateSeconds,
  resolveAppRouterPagePath,
} from '@/lib/sitecore-page-revalidation';

jest.mock('sitecore.config', () => ({
  __esModule: true,
  default: {
    defaultSite: 'rockland',
    defaultLanguage: 'en',
  },
}));

describe('sitecore-page-revalidation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SITECORE_PAGE_REVALIDATE_SECONDS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults page revalidation to 300 seconds', () => {
    expect(getSitecorePageRevalidateSeconds()).toBe(300);
  });

  it('reads SITECORE_PAGE_REVALIDATE_SECONDS from env', () => {
    process.env.SITECORE_PAGE_REVALIDATE_SECONDS = '60';
    expect(getSitecorePageRevalidateSeconds()).toBe(60);
  });

  it('allows disabling ISR with zero', () => {
    process.env.SITECORE_PAGE_REVALIDATE_SECONDS = '0';
    expect(getSitecorePageRevalidateSeconds()).toBe(0);
  });

  it('builds internal app router paths', () => {
    expect(
      buildAppRouterPagePath({
        site: 'rockland',
        locale: 'en',
        path: ['checking', 'free-checking'],
      })
    ).toBe('/rockland/en/checking/free-checking');
  });

  it('resolves full app router paths unchanged', () => {
    expect(
      resolveAppRouterPagePath({
        path: '/rockland/en/checking/free-checking',
      })
    ).toBe('/rockland/en/checking/free-checking');
  });

  it('resolves content paths using default site and locale', () => {
    expect(
      resolveAppRouterPagePath({
        path: '/checking/free-checking',
      })
    ).toBe('/rockland/en/checking/free-checking');
  });

  it('resolves homepage content path', () => {
    expect(
      resolveAppRouterPagePath({
        path: '/',
      })
    ).toBe('/rockland/en');
  });
});
