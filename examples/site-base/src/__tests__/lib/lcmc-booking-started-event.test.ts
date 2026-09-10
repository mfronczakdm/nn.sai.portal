import {
  trackLcmcAppointmentBookedEvent,
  trackLcmcBookingStartedEvent,
} from '@/lib/lcmc-booking-started-event';

const mockEvent = jest.fn().mockResolvedValue({ status: 'ok' });

jest.mock('@sitecore-content-sdk/events', () => ({
  event: (...args: unknown[]) => mockEvent(...args),
}));

describe('trackLcmcBookingStartedEvent', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnableFlag = process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS = originalEnableFlag;
  });

  it('sends Booking-Started on WEB with a Booking Started label', async () => {
    process.env.NODE_ENV = 'production';

    await trackLcmcBookingStartedEvent({ visitKey: 'sick-visit', visitTitle: 'Sick visit' });

    expect(mockEvent).toHaveBeenCalledWith({
      channel: 'WEB',
      type: 'Booking-Started',
      page: 'Patient Appointments',
      extensionData: {
        label: 'Booking Started',
        eventName: 'Booking Started',
        visitKey: 'sick-visit',
        visitTitle: 'Sick visit',
      },
    });
  });

  it('does not send events in development unless explicitly enabled', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_ENABLE_DEMO_ANALYTICS = undefined;

    await trackLcmcBookingStartedEvent({ visitKey: 'sick-visit' });

    expect(mockEvent).not.toHaveBeenCalled();
  });

  it('sends Appointment-Booked on WEB when a guest confirms', async () => {
    process.env.NODE_ENV = 'production';

    await trackLcmcAppointmentBookedEvent({
      bookedAs: 'guest',
      visitKey: 'sick-visit',
      visitTitle: 'Sick visit',
      providerName: 'Gabrielle Moreau, MD',
    });

    expect(mockEvent).toHaveBeenCalledWith({
      channel: 'WEB',
      type: 'Appointment-Booked',
      page: 'Patient Appointments',
      extensionData: {
        label: 'Appointment Booked',
        eventName: 'Appointment Booked',
        bookedAs: 'guest',
        visitKey: 'sick-visit',
        visitTitle: 'Sick visit',
        providerName: 'Gabrielle Moreau, MD',
      },
    });
  });
});
