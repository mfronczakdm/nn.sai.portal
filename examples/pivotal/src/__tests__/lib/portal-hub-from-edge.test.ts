import type { Field } from '@sitecore-content-sdk/nextjs';
import scConfig from 'sitecore.config';

import { resolvePortalHubItemPath, wireLinkField } from '@/lib/portal-hub-from-edge';

jest.mock('sitecore.config', () => ({
  __esModule: true,
  default: { defaultSite: 'dfs' },
}));

jest.mock('@/lib/sitecore-client', () => ({
  __esModule: true,
  default: { getData: jest.fn() },
}));

describe('resolvePortalHubItemPath', () => {
  const mockScConfig = scConfig as { defaultSite?: string };
  const originalEnv = {
    portalHubItemPath: process.env.PORTAL_HUB_ITEM_PATH,
    defaultSiteName: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME,
    dataPathSuffix: process.env.PORTAL_HUB_DATA_PATH_SUFFIX,
  };

  afterEach(() => {
    if (originalEnv.portalHubItemPath === undefined) {
      delete process.env.PORTAL_HUB_ITEM_PATH;
    } else {
      process.env.PORTAL_HUB_ITEM_PATH = originalEnv.portalHubItemPath;
    }
    if (originalEnv.defaultSiteName === undefined) {
      delete process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME;
    } else {
      process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME = originalEnv.defaultSiteName;
    }
    if (originalEnv.dataPathSuffix === undefined) {
      delete process.env.PORTAL_HUB_DATA_PATH_SUFFIX;
    } else {
      process.env.PORTAL_HUB_DATA_PATH_SUFFIX = originalEnv.dataPathSuffix;
    }
    mockScConfig.defaultSite = 'dfs';
  });

  it('prefers PORTAL_HUB_ITEM_PATH env over param, field, and default', () => {
    process.env.PORTAL_HUB_ITEM_PATH = '/sitecore/content/dfs/dfs/Data/Portal Hub';
    expect(
      resolvePortalHubItemPath({
        paramsHubItemPath: '/sitecore/content/param/Data/Portal Hub',
        fieldsHubRootPath: { value: '/sitecore/content/field/Data/Portal Hub' } as Field<string>,
      }),
    ).toBe('/sitecore/content/dfs/dfs/Data/Portal Hub');
  });

  it('uses rendering param when env is unset', () => {
    delete process.env.PORTAL_HUB_ITEM_PATH;
    expect(
      resolvePortalHubItemPath({
        paramsHubItemPath: '/sitecore/content/dfs/dfs/Data/Portal Hub',
        fieldsHubRootPath: { value: '/sitecore/content/field/Data/Portal Hub' } as Field<string>,
      }),
    ).toBe('/sitecore/content/dfs/dfs/Data/Portal Hub');
  });

  it('uses hubRootPath field when env and param are unset', () => {
    delete process.env.PORTAL_HUB_ITEM_PATH;
    expect(
      resolvePortalHubItemPath({
        fieldsHubRootPath: { value: '/sitecore/content/dfs/dfs/Data/Portal Hub' } as Field<string>,
      }),
    ).toBe('/sitecore/content/dfs/dfs/Data/Portal Hub');
  });

  it('falls back to /sitecore/content/{site}/{site}/Data/Portal Hub from scConfig.defaultSite', () => {
    delete process.env.PORTAL_HUB_ITEM_PATH;
    delete process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME;
    delete process.env.PORTAL_HUB_DATA_PATH_SUFFIX;
    mockScConfig.defaultSite = 'dfs';

    expect(resolvePortalHubItemPath({})).toBe('/sitecore/content/dfs/dfs/Data/Portal Hub');
  });

  it('uses NEXT_PUBLIC_DEFAULT_SITE_NAME when scConfig.defaultSite is empty', () => {
    delete process.env.PORTAL_HUB_ITEM_PATH;
    delete process.env.PORTAL_HUB_DATA_PATH_SUFFIX;
    mockScConfig.defaultSite = undefined;
    process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME = 'quanex';

    expect(resolvePortalHubItemPath({})).toBe('/sitecore/content/quanex/quanex/Data/Portal Hub');
  });

  it('honors PORTAL_HUB_DATA_PATH_SUFFIX for the default path', () => {
    delete process.env.PORTAL_HUB_ITEM_PATH;
    mockScConfig.defaultSite = 'dfs';
    process.env.PORTAL_HUB_DATA_PATH_SUFFIX = '/Data/Custom Hub';

    expect(resolvePortalHubItemPath({})).toBe('/sitecore/content/dfs/dfs/Data/Custom Hub');
  });

  it('returns empty string when no site name is configured', () => {
    delete process.env.PORTAL_HUB_ITEM_PATH;
    delete process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME;
    mockScConfig.defaultSite = undefined;

    expect(resolvePortalHubItemPath({})).toBe('');
  });
});

describe('wireLinkField', () => {
  it('parses General Link XML from Edge value', () => {
    const wired = wireLinkField({
      value: '<link linktype="internal" url="/portal/account" />',
    });
    expect(wired?.jsonValue?.value?.href).toBe('/portal/account');
    expect(wired?.jsonValue?.value?.linktype).toBe('internal');
  });

  it('passes through structured link objects', () => {
    const wired = wireLinkField({
      value: { href: '/portal/orders', text: 'Orders', linktype: 'internal' },
    });
    expect(wired?.jsonValue?.value?.href).toBe('/portal/orders');
    expect(wired?.jsonValue?.value?.text).toBe('Orders');
  });

  it('returns undefined for empty values', () => {
    expect(wireLinkField({ value: '' })).toBeUndefined();
    expect(wireLinkField(undefined)).toBeUndefined();
  });
});
