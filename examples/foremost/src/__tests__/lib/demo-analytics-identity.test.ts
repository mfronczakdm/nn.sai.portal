import {
  clearAnalyticsCookies,
  identifyDemoPersona,
  resetDemoPersonaAnalyticsSession,
} from '@/lib/demo-analytics-identity';
import { isCdpAnalyticsEnabled } from '@/lib/cdp-analytics';

const mockSetClientId = jest.fn().mockResolvedValue(undefined);
const mockSetProfileId = jest.fn().mockResolvedValue(undefined);
const mockIdentity = jest.fn().mockResolvedValue({ status: 'ok' });
const mockGetClientId = jest.fn();
const mockGetAnalyticsPlugin = jest.fn();
const mockGetPersonalizePlugin = jest.fn();

jest.mock('@sitecore-content-sdk/analytics-core', () => ({
  getClientId: () => mockGetClientId(),
}));

jest.mock('@sitecore-content-sdk/events', () => ({
  identity: (...args: unknown[]) => mockIdentity(...args),
}));

jest.mock('@sitecore-content-sdk/analytics-core/internal', () => ({
  CLIENT_ID_COOKIE_NAME: 'cid',
  COOKIE_NAME_PREFIX: 'sc_',
  getAnalyticsPlugin: () => mockGetAnalyticsPlugin(),
}));

jest.mock('@sitecore-content-sdk/personalize/internal', () => ({
  getPersonalizePlugin: () => mockGetPersonalizePlugin(),
}));

jest.mock('sitecore.config', () => ({
  __esModule: true,
  default: {
    api: {
      edge: {
        clientContextId: 'test-context-id',
      },
    },
  },
}));

describe('demo-analytics-identity', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnableFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS;

  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = 'sc_cid=existing-client-id; path=/';
    document.cookie = 'sc_cid_personalize=existing-profile-id; path=/';

    mockGetClientId.mockReturnValue('existing-client-id');
    mockGetAnalyticsPlugin.mockReturnValue({
      options: {
        cookies: {
          domain: 'localhost',
        },
        visitorIds: { clientId: 'existing-client-id', profileId: 'existing-profile-id' },
      },
      adapter: {
        setClientId: mockSetClientId,
      },
    });
    mockGetPersonalizePlugin.mockReturnValue({
      adapter: {
        setProfileId: mockSetProfileId,
      },
    });

    window.scContentSDK = {
      analytics_core: {
        getClientId: jest.fn(),
        getProfileId: jest.fn(),
        options: {
          siteName: 'rockland',
          contextId: 'test-context-id',
          edgeUrl: 'https://edge.example',
        },
        version: '2.0.2',
      },
    };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS = originalEnableFlag;
  });

  it('is disabled in development unless explicitly enabled', () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS = undefined;

    expect(isCdpAnalyticsEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS = 'true';

    expect(isCdpAnalyticsEnabled()).toBe(true);
  });

  it('clears analytics cookies', () => {
    clearAnalyticsCookies();

    expect(document.cookie).not.toContain('sc_cid=');
    expect(document.cookie).not.toContain('sc_cid_personalize=');
  });

  it('resets the analytics session on logout', async () => {
    process.env.NODE_ENV = 'production';
    mockGetClientId.mockReturnValueOnce('').mockReturnValue('new-client-id');

    await resetDemoPersonaAnalyticsSession();

    expect(mockSetClientId).toHaveBeenCalledTimes(1);
    expect(mockSetProfileId).toHaveBeenCalledTimes(1);
    expect(mockGetAnalyticsPlugin().options.visitorIds).toBeUndefined();
  });

  it('requests a new profile and sends identity on persona login', async () => {
    process.env.NODE_ENV = 'production';
    mockGetClientId.mockReturnValueOnce('').mockReturnValue('new-client-id');

    await identifyDemoPersona('Young Professional');

    expect(mockSetClientId).toHaveBeenCalledTimes(1);
    expect(mockSetProfileId).toHaveBeenCalledTimes(1);
    expect(mockIdentity).toHaveBeenCalledWith({
      channel: 'WEB',
      currency: 'USD',
      firstName: 'Jordan',
      lastName: 'Mitchell',
      email: 'jordan.mitchell@demo.rocklandtrust.com',
      identifiers: [{ id: 'jordan.mitchell@demo.rocklandtrust.com', provider: 'email' }],
      extensionData: {
        demoPersona: 'Young Professional',
        demoPersonaCode: 'yp',
        demoPersonaId: 'rockland-demo-yp',
      },
    });
  });

  it('can identify without resetting the session on page reload', async () => {
    process.env.NODE_ENV = 'production';

    await identifyDemoPersona('College Student', { resetSession: false });

    expect(mockSetClientId).not.toHaveBeenCalled();
    expect(mockIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'taylor.brooks@demo.rocklandtrust.com',
        identifiers: [{ id: 'taylor.brooks@demo.rocklandtrust.com', provider: 'email' }],
      })
    );
  });
});
