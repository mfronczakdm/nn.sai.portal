import { event } from '@sitecore-content-sdk/events';

import { isCdpAnalyticsEnabled } from '@/lib/cdp-analytics';

/** Display name in SitecoreAI / CDP. Event `type` cannot contain spaces. */
export const LCMC_BOOKING_STARTED_EVENT_NAME = 'Booking Started';
export const LCMC_BOOKING_STARTED_EVENT_TYPE = 'Booking-Started';

export type LcmcBookingStartedDetails = {
  visitKey?: string;
  visitTitle?: string;
};

/**
 * SitecoreAI / CDP custom event when a visitor starts the LCMC appointment wizard.
 * Call once per page visit, on the first scheduler interaction (visit type or slot).
 */
export async function trackLcmcBookingStartedEvent(
  details?: LcmcBookingStartedDetails
): Promise<void> {
  if (!isCdpAnalyticsEnabled()) return;

  try {
    const response = await event({
      channel: 'WEB',
      type: LCMC_BOOKING_STARTED_EVENT_TYPE,
      page: 'Patient Appointments',
      extensionData: {
        label: LCMC_BOOKING_STARTED_EVENT_NAME,
        eventName: LCMC_BOOKING_STARTED_EVENT_NAME,
        ...(details?.visitKey ? { visitKey: details.visitKey } : {}),
        ...(details?.visitTitle ? { visitTitle: details.visitTitle } : {}),
      },
    });

    if (!response) {
      console.warn('[LcmcBookingStarted] Event failed to send', details);
    }
  } catch (error) {
    console.warn('[LcmcBookingStarted] Event failed', { details, error });
  }
}
