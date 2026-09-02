import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  Default as LcmcAppointmentScheduler,
} from '@/components/uiim/appointments/LcmcAppointmentScheduler';
import type { LcmcAppointmentSchedulerProps } from '@/components/uiim/appointments/LcmcAppointmentScheduler';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
  capitalCase: (s: string) => s,
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div>{componentName} requires a datasource item assigned. Please assign a datasource item to edit the content.</div>
  ),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => {
  const mode = { isEditing: false };
  return {
    __esModule: true,
    sitecoreMode: mode,
    useSitecore: () => ({
      page: {
        mode,
        layout: { sitecore: { context: {}, route: { displayName: 'Portal' } } },
      },
    }),
    Text: ({
      field,
      tag: Tag = 'span',
      className,
    }: {
      field?: { value?: string };
      tag?: React.ElementType;
      className?: string;
    }) => (field?.value ? React.createElement(Tag, { className }, field.value) : null),
    RichText: ({ field }: { field?: { value?: string } }) =>
      field?.value ? <div dangerouslySetInnerHTML={{ __html: field.value }} /> : null,
  };
});

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('lucide-react', () => {
  const Icon = () => null;
  return new Proxy({}, { get: () => Icon });
});

const baseParams = { styles: '', RenderingIdentifier: 'lcmc-appt-test' };
const mockPage = {} as LcmcAppointmentSchedulerProps['page'];
const mockRendering = { componentName: 'LcmcAppointmentScheduler' } as LcmcAppointmentSchedulerProps['rendering'];

function json(value: string) {
  return { jsonValue: { value } };
}

const datasource = {
  appointmentTitle: json('Patient Appointments'),
  emergencyText: json('For emergencies, please call 911 or go directly to the nearest emergency room.'),
  visitQuestion: json('What type of visit would you like to schedule for your child?'),
  filtersLabel: json('Filters'),
  showMoreLabel: json('Show more appointment times'),
  fluNote: json('Note: Flu vaccine scheduling is now open.'),
  finishTitle: json('Finish Scheduling'),
  detailsHeading: json('Appointment details (not yet scheduled)'),
  loginHeading: json('Continue through My LCMC Health'),
  loginCta: json('Log in and schedule'),
  guestCta: json('Schedule as guest'),
  confirmationTitle: json('Your visit is scheduled'),
  children: {
    results: [
      {
        id: '1',
        visitTitle: json('Check up'),
        visitDescription: json('Well-baby visit or physical.'),
        visitKey: json('check-up'),
      },
      {
        id: '2',
        visitTitle: json('Sick visit'),
        visitDescription: json('Cold, fever, sore throat, or other illness.'),
        visitKey: json('sick-visit'),
      },
    ],
  },
};

function renderScheduler() {
  return render(
    <LcmcAppointmentScheduler
      fields={{ data: { datasource } }}
      params={baseParams}
      page={mockPage}
      rendering={mockRendering}
    />
  );
}

describe('LcmcAppointmentScheduler', () => {
  afterEach(() => {
    const sdk = jest.requireMock('@sitecore-content-sdk/nextjs') as { sitecoreMode: { isEditing: boolean } };
    sdk.sitecoreMode.isEditing = false;
  });

  it('shows NoDataFallback when the datasource is missing', () => {
    render(
      <LcmcAppointmentScheduler
        fields={{ data: {} }}
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );
    expect(screen.getByText(/LcmcAppointmentScheduler requires a datasource/i)).toBeInTheDocument();
  });

  it('renders visit cards from JSS field names when GraphQL datasource is absent', () => {
    render(
      <LcmcAppointmentScheduler
        fields={{
          AppointmentTitle: { value: 'Patient Appointments' },
          VisitQuestion: { value: 'What type of visit would you like to schedule for your child?' },
        }}
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );
    expect(screen.getByTestId('lcmc-appointment-scheduler')).toBeInTheDocument();
    expect(screen.getByTestId('lcmc-visit-sick-visit')).toBeInTheDocument();
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
  });

  it('renders fallback visit cards in Pages editing when GraphQL datasource is empty', () => {
    const sdk = jest.requireMock('@sitecore-content-sdk/nextjs') as { sitecoreMode: { isEditing: boolean } };
    sdk.sitecoreMode.isEditing = true;
    render(
      <LcmcAppointmentScheduler
        fields={{ data: { datasource: null } }}
        params={baseParams}
        page={mockPage}
        rendering={mockRendering}
      />
    );
    expect(screen.getByTestId('lcmc-appointment-scheduler')).toBeInTheDocument();
    expect(screen.getByTestId('lcmc-visit-sick-visit')).toBeInTheDocument();
    expect(screen.queryByText(/requires a datasource/i)).not.toBeInTheDocument();
    sdk.sitecoreMode.isEditing = false;
  });

  it('walks visit type to slot to finish scheduling to login confirmation', () => {
    renderScheduler();
    expect(screen.getByText('Patient Appointments')).toBeInTheDocument();
    expect(screen.getByTestId('lcmc-visit-sick-visit')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('lcmc-visit-sick-visit'));
    expect(screen.getByTestId('lcmc-appt-slots')).toBeInTheDocument();
    expect(screen.getByTestId('lcmc-appt-filters')).toBeInTheDocument();

    const slotButton = screen.getAllByRole('button').find((button) => /AM|PM/.test(button.textContent || ''));
    expect(slotButton).toBeTruthy();
    fireEvent.click(slotButton as HTMLElement);

    expect(screen.getByTestId('lcmc-appt-finish')).toBeInTheDocument();
    expect(screen.getByText('Finish Scheduling')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('lcmc-appt-login-cta'));

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'parent@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'demo' } });
    fireEvent.click(screen.getByTestId('lcmc-appt-login-submit'));

    expect(screen.getByTestId('lcmc-appt-confirmed')).toBeInTheDocument();
    expect(screen.getByText('Your visit is scheduled')).toBeInTheDocument();
    expect(screen.getByText(/Booked as My LCMC Health/)).toBeInTheDocument();
  });

  it('completes the guest path after a slot is selected', () => {
    renderScheduler();
    fireEvent.click(screen.getByTestId('lcmc-visit-sick-visit'));
    const slotButton = screen.getAllByRole('button').find((button) => /AM|PM/.test(button.textContent || ''));
    fireEvent.click(slotButton as HTMLElement);
    fireEvent.click(screen.getByTestId('lcmc-appt-guest-cta'));
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Avery' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Nguyen' } });
    fireEvent.change(screen.getByLabelText("Child's date of birth"), { target: { value: '2019-04-12' } });
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '504-555-0100' } });
    fireEvent.click(screen.getByTestId('lcmc-appt-guest-submit'));
    expect(screen.getByText(/Booked as guest for Avery Nguyen/)).toBeInTheDocument();
  });
});

describe('LCMC scheduler is an isolated named export', () => {
  it('exposes Default and does not replace shared portal components', async () => {
    const scheduler = await import('@/components/uiim/appointments/LcmcAppointmentScheduler');
    expect(typeof scheduler.Default).toBe('function');
    expect(Object.keys(scheduler).filter((key) => key !== 'Default')).toEqual([]);
  });
});
