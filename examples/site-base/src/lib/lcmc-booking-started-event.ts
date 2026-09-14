import { event } from '@sitecore-content-sdk/events';

import { isCdpAnalyticsEnabled } from '@/lib/cdp-analytics';

/** Display name in SitecoreAI / CDP. Event `type` cannot contain spaces. */
export const LCMC_BOOKING_STARTED_EVENT_NAME = 'Booking Started';
export const LCMC_BOOKING_STARTED_EVENT_TYPE = 'Booking-Started';

export type LcmcBookingStartedDetails = {
  visitKey?: string;
  visitTitle?: string;
};

export const LCMC_APPOINTMENT_BOOKED_EVENT_NAME = 'Appointment Booked';
export const LCMC_APPOINTMENT_BOOKED_EVENT_TYPE = 'Appointment-Booked';

export type LcmcAppointmentBookedDetails = {
  visitKey?: string;
  visitTitle?: string;
  providerName?: string;
  bookedAs?: 'guest';
};

async function sendLcmcSchedulerEvent(
  type: string,
  label: string,
  extensionData: Record<string, string>
): Promise<void> {
  if (!isCdpAnalyticsEnabled()) return;

  try {
    const response = await event({
      channel: 'WEB',
      type,
      page: 'Patient Appointments',
      extensionData: {
        label,
        eventName: label,
        ...extensionData,
      },
    });

    if (!response) {
      console.warn(`[${label}] Event failed to send`, extensionData);
    }
  } catch (error) {
    console.warn(`[${label}] Event failed`, { extensionData, error });
  }
}

/**
 * SitecoreAI / CDP custom event when a visitor starts the LCMC appointment wizard.
 * Call once per page visit, on the first scheduler interaction (visit type or slot).
 */
export async function trackLcmcBookingStartedEvent(
  details?: LcmcBookingStartedDetails
): Promise<void> {
  await sendLcmcSchedulerEvent(LCMC_BOOKING_STARTED_EVENT_TYPE, LCMC_BOOKING_STARTED_EVENT_NAME, {
    ...(details?.visitKey ? { visitKey: details.visitKey } : {}),
    ...(details?.visitTitle ? { visitTitle: details.visitTitle } : {}),
  });
}

/**
 * SitecoreAI / CDP custom event when a guest confirms the appointment.
 */
export async function trackLcmcAppointmentBookedEvent(
  details?: LcmcAppointmentBookedDetails
): Promise<void> {
  await sendLcmcSchedulerEvent(LCMC_APPOINTMENT_BOOKED_EVENT_TYPE, LCMC_APPOINTMENT_BOOKED_EVENT_NAME, {
    bookedAs: details?.bookedAs || 'guest',
    ...(details?.visitKey ? { visitKey: details.visitKey } : {}),
    ...(details?.visitTitle ? { visitTitle: details.visitTitle } : {}),
    ...(details?.providerName ? { providerName: details.providerName } : {}),
  });
}
