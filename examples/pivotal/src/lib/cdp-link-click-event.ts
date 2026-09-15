import { event } from '@sitecore-content-sdk/events';

import { isCdpAnalyticsEnabled } from '@/lib/cdp-analytics';

const CDP_EVENT_TYPE_PATTERN = /^[a-zA-Z0-9\-_./]{1,100}$/;

export function getCdpLinkClickEventName(linkText: string | undefined | null): string | null {
  const eventName = linkText?.trim();
  return eventName || null;
}

/**
 * Edge requires event `type` to match ^[a-zA-Z0-9\-_./]{1,100}$ (no spaces).
 * Human-readable link text is sent separately in extensionData.
 */
export function sanitizeCdpEventType(linkText: string): string {
  const sanitized = linkText
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_./]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .slice(0, 100);

  return sanitized && CDP_EVENT_TYPE_PATTERN.test(sanitized) ? sanitized : 'cta-click';
}

export async function trackCdpLinkClickEvent(linkText: string | undefined | null): Promise<void> {
  const eventName = getCdpLinkClickEventName(linkText);
  if (!eventName || !isCdpAnalyticsEnabled()) return;

  const eventType = sanitizeCdpEventType(eventName);

  try {
    const response = await event({
      channel: 'WEB',
      type: eventType,
      extensionData: {
        linkText: eventName,
        label: eventName,
      },
    });

    if (!response) {
      console.warn('[CdpLinkClick] Event failed to send', { eventName, eventType });
    }
  } catch (error) {
    console.warn('[CdpLinkClick] Event failed', { eventName, eventType, error });
  }
}
