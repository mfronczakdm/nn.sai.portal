import {
  getCdpLinkClickEventName,
  sanitizeCdpEventType,
  trackCdpLinkClickEvent,
} from '@/lib/cdp-link-click-event';

const mockEvent = jest.fn().mockResolvedValue({ status: 'ok' });

jest.mock('@sitecore-content-sdk/events', () => ({
  event: (...args: unknown[]) => mockEvent(...args),
}));

describe('cdp-link-click-event', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnableFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS = originalEnableFlag;
  });

  it('returns trimmed link text as the display event name', () => {
    expect(getCdpLinkClickEventName('  Opening a free checking account  ')).toBe(
      'Opening a free checking account'
    );
  });

  it('sanitizes link text into a valid CDP event type', () => {
    expect(sanitizeCdpEventType('Open A Free Checking Account')).toBe('Open-A-Free-Checking-Account');
    expect(sanitizeCdpEventType('OPEN A FREE CHECKING ACCOUNT')).toBe('OPEN-A-FREE-CHECKING-ACCOUNT');
  });

  it('sends a WEB channel event with a valid type and readable label', async () => {
    process.env.NODE_ENV = 'production';

    await trackCdpLinkClickEvent('Open A Free Checking Account');

    expect(mockEvent).toHaveBeenCalledWith({
      channel: 'WEB',
      type: 'Open-A-Free-Checking-Account',
      extensionData: {
        linkText: 'Open A Free Checking Account',
        label: 'Open A Free Checking Account',
      },
    });
  });

  it('does not send events in development unless explicitly enabled', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS = undefined;

    await trackCdpLinkClickEvent('Opening a free checking account');

    expect(mockEvent).not.toHaveBeenCalled();
  });
});
