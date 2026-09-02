'use client';

import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Filter,
  UserRound,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import {
  buildLcmcAvailability,
  confirmationNumber,
  filterLcmcAvailability,
  findLcmcSlot,
  formatHoldUntil,
  formatSlotTime,
  LCMC_VISIT_KEYS,
  lcmcVisitDetailLine,
  lcmcVisitLabel,
  listLcmcLocations,
  listLcmcProviders,
  type LcmcDayGroup,
  type LcmcSelectedSlot,
} from '@/lib/lcmc-appointment-pack';

type JsonText = { jsonValue?: { value?: string } };

export type LcmcVisitTypeChild = {
  id?: string;
  visitTitle?: JsonText;
  visitDescription?: JsonText;
  visitKey?: JsonText;
};

export type LcmcAppointmentDatasource = {
  appointmentTitle?: JsonText;
  emergencyText?: JsonText;
  visitQuestion?: JsonText;
  filtersLabel?: JsonText;
  showMoreLabel?: JsonText;
  fluNote?: JsonText;
  urgentCareBody?: JsonText;
  finishTitle?: JsonText;
  detailsHeading?: JsonText;
  loginHeading?: JsonText;
  loginBody?: JsonText;
  loginCta?: JsonText;
  guestHeading?: JsonText;
  guestCta?: JsonText;
  confirmationTitle?: JsonText;
  confirmationBody?: JsonText;
  children?: { results?: LcmcVisitTypeChild[] };
};

export type LcmcAppointmentSchedulerProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: LcmcAppointmentDatasource | null;
    };
  } & Record<string, unknown>;
};

type WizardStep = 'visit-types' | 'slots' | 'finish' | 'login' | 'guest' | 'confirmed';

type JsonFieldValue = { value?: string };

const FALLBACK_VISITS: { key: string; title: string; description: string }[] = [
  {
    key: 'check-up',
    title: 'Check up',
    description: 'Your child needs a well-baby visit or an annual, sports, or camp physical.',
  },
  {
    key: 'sick-visit',
    title: 'Sick visit',
    description:
      'Your child is sick. For example, your child has a cold, fever, sore throat, ear pain or other illness.',
  },
  {
    key: 'medicine-behavior',
    title: 'Medicine check or behavior concern',
    description:
      'You need to be seen regarding medication for ADHD, anxiety, depression, asthma or have another behavioral/mental health concern.',
  },
  {
    key: 'flu-shot',
    title: 'Flu shot (seasonal)',
    description:
      'Your child is healthy and needs a flu shot. You can schedule flu shots at any primary care location.',
  },
  {
    key: 'covid-vaccine',
    title: 'COVID-19 vaccine',
    description: 'Kids ages 6 months+ are eligible for the COVID-19 vaccine.',
  },
  {
    key: 'flu-and-covid',
    title: 'Flu and COVID-19',
    description:
      'Your child can receive the flu vaccine and this season’s COVID-19 vaccine at the same time.',
  },
];

function toJsonText(field: unknown): JsonText | undefined {
  if (!field || typeof field !== 'object') return undefined;
  const record = field as { jsonValue?: JsonFieldValue; value?: string };
  if (record.jsonValue && typeof record.jsonValue === 'object') {
    return { jsonValue: record.jsonValue };
  }
  if (typeof record.value === 'string') {
    return { jsonValue: { value: record.value } };
  }
  return undefined;
}

function fieldString(field?: JsonText | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function toEditableField(field?: JsonText | null): JsonFieldValue | undefined {
  return field?.jsonValue;
}

function jsonFieldFromRecord(record: Record<string, unknown>, ...names: string[]): JsonText | undefined {
  for (const name of names) {
    const mapped = toJsonText(record[name]);
    if (mapped) return mapped;
  }
  return undefined;
}

function mapVisitChild(child: Record<string, unknown>, index: number): LcmcVisitTypeChild {
  return {
    id: typeof child.id === 'string' && child.id ? child.id : `visit-${index}`,
    visitTitle: jsonFieldFromRecord(child, 'visitTitle', 'VisitTitle'),
    visitDescription: jsonFieldFromRecord(child, 'visitDescription', 'VisitDescription'),
    visitKey: jsonFieldFromRecord(child, 'visitKey', 'VisitKey'),
  };
}

function resolveDatasource(
  fields?: LcmcAppointmentSchedulerProps['fields']
): LcmcAppointmentDatasource | null {
  const graphql = fields?.data?.datasource;
  if (graphql && typeof graphql === 'object') {
    const children = graphql.children?.results?.map((child, index) =>
      mapVisitChild(child as Record<string, unknown>, index)
    );
    return {
      ...graphql,
      children: children ? { results: children } : graphql.children,
    };
  }

  const raw = fields as Record<string, unknown> | undefined;
  if (!raw) return null;
  if (
    !raw.AppointmentTitle &&
    !raw.appointmentTitle &&
    !raw.VisitQuestion &&
    !raw.visitQuestion &&
    !raw.EmergencyText &&
    !raw.emergencyText
  ) {
    return null;
  }

  return {
    appointmentTitle: jsonFieldFromRecord(raw, 'appointmentTitle', 'AppointmentTitle'),
    emergencyText: jsonFieldFromRecord(raw, 'emergencyText', 'EmergencyText'),
    visitQuestion: jsonFieldFromRecord(raw, 'visitQuestion', 'VisitQuestion'),
    filtersLabel: jsonFieldFromRecord(raw, 'filtersLabel', 'FiltersLabel'),
    showMoreLabel: jsonFieldFromRecord(raw, 'showMoreLabel', 'ShowMoreLabel'),
    fluNote: jsonFieldFromRecord(raw, 'fluNote', 'FluNote'),
    urgentCareBody: jsonFieldFromRecord(raw, 'urgentCareBody', 'UrgentCareBody'),
    finishTitle: jsonFieldFromRecord(raw, 'finishTitle', 'FinishTitle'),
    detailsHeading: jsonFieldFromRecord(raw, 'detailsHeading', 'DetailsHeading'),
    loginHeading: jsonFieldFromRecord(raw, 'loginHeading', 'LoginHeading'),
    loginBody: jsonFieldFromRecord(raw, 'loginBody', 'LoginBody'),
    loginCta: jsonFieldFromRecord(raw, 'loginCta', 'LoginCta'),
    guestHeading: jsonFieldFromRecord(raw, 'guestHeading', 'GuestHeading'),
    guestCta: jsonFieldFromRecord(raw, 'guestCta', 'GuestCta'),
    confirmationTitle: jsonFieldFromRecord(raw, 'confirmationTitle', 'ConfirmationTitle'),
    confirmationBody: jsonFieldFromRecord(raw, 'confirmationBody', 'ConfirmationBody'),
  };
}

const LcmcAppointmentEmpty = (): JSX.Element => (
  <NoDataFallback componentName="LcmcAppointmentScheduler" />
);

function EmergencyBanner({
  field,
  isEditing,
}: {
  field?: JsonText;
  isEditing: boolean;
}): JSX.Element {
  const fallback = 'For emergencies, please call 911 or go directly to the nearest emergency room.';
  return (
    <Alert
      className="lcmc-appt__emergency border-destructive/40 bg-destructive/10 text-destructive"
      data-testid="lcmc-appt-emergency"
    >
      <AlertDescription className="text-sm font-medium">
        {toEditableField(field) && (fieldString(field) || isEditing) ? (
          <Text field={toEditableField(field)} tag="span" />
        ) : (
          fallback
        )}
      </AlertDescription>
    </Alert>
  );
}

function InitialsAvatar({ initials, name }: { initials: string; name: string }): JSX.Element {
  return (
    <div
      className="bg-primary/15 text-primary flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      aria-hidden
      title={name}
    >
      {initials}
    </div>
  );
}

type InnerProps = LcmcAppointmentSchedulerProps & { isEditing: boolean };

const LcmcAppointmentSchedulerInner = ({
  fields,
  params,
  isEditing,
}: InnerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params || {};
  const datasource = resolveDatasource(fields) ?? (isEditing ? {} : null);

  const [step, setStep] = useState<WizardStep>('visit-types');
  const [visitKey, setVisitKey] = useState('');
  const [visitTitle, setVisitTitle] = useState('');
  const [selected, setSelected] = useState<LcmcSelectedSlot | null>(null);
  const [showAllDays, setShowAllDays] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [clinicFilters, setClinicFilters] = useState<string[]>([]);
  const [providerFilters, setProviderFilters] = useState<string[]>([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [guestFirst, setGuestFirst] = useState('');
  const [guestLast, setGuestLast] = useState('');
  const [guestDob, setGuestDob] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [bookedAs, setBookedAs] = useState<'my-lcmc' | 'guest' | null>(null);

  const now = useMemo(() => new Date(), []);
  const availability = useMemo(
    () => buildLcmcAvailability({ now, visitKey: visitKey || 'sick-visit' }),
    [now, visitKey]
  );
  const filtered = useMemo(
    () => filterLcmcAvailability(availability, { clinics: clinicFilters, providers: providerFilters }),
    [availability, clinicFilters, providerFilters]
  );
  const visibleDays: LcmcDayGroup[] = showAllDays ? filtered : filtered.slice(0, 2);
  const locations = listLcmcLocations(availability);
  const providers = listLcmcProviders(availability);
  const holdUntil = useMemo(() => new Date(now.getTime() + 15 * 60 * 1000), [now]);

  if (!datasource) {
    return <LcmcAppointmentEmpty />;
  }

  const authoredVisits = [...(datasource.children?.results ?? [])]
    .filter((child) => fieldString(child.visitTitle) || isEditing)
    .sort((left, right) => {
      const leftIndex = LCMC_VISIT_KEYS.indexOf(
        fieldString(left.visitKey) as (typeof LCMC_VISIT_KEYS)[number]
      );
      const rightIndex = LCMC_VISIT_KEYS.indexOf(
        fieldString(right.visitKey) as (typeof LCMC_VISIT_KEYS)[number]
      );
      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    });
  const visits =
    authoredVisits.length > 0
      ? authoredVisits.map((child, index) => ({
          id: child.id || `visit-${index}`,
          key: fieldString(child.visitKey) || FALLBACK_VISITS[index]?.key || `visit-${index}`,
          titleField: toEditableField(child.visitTitle),
          descriptionField: toEditableField(child.visitDescription),
          title: fieldString(child.visitTitle) || FALLBACK_VISITS[index]?.title || 'Visit',
          description: fieldString(child.visitDescription),
        }))
      : FALLBACK_VISITS.map((visit) => ({
          id: visit.key,
          key: visit.key,
          titleField: undefined,
          descriptionField: undefined,
          title: visit.title,
          description: visit.description,
        }));

  const handlePickVisit = (key: string, title: string) => {
    setVisitKey(key);
    setVisitTitle(title);
    setShowAllDays(false);
    setFiltersOpen(false);
    setStep('slots');
  };

  const handlePickSlot = (slotId: string) => {
    const found = findLcmcSlot(availability, slotId);
    if (!found) return;
    setSelected({
      visitKey,
      visitLabel: visitTitle || lcmcVisitLabel(visitKey),
      provider: found.row.provider,
      start: found.slot.start,
      slotLabel: found.slot.label,
      dateHeader: found.group.header,
    });
    setStep('finish');
  };

  const completeBooking = (mode: 'my-lcmc' | 'guest') => {
    setBookedAs(mode);
    setConfirmCode(confirmationNumber(new Date()));
    setStep('confirmed');
  };

  const resetWizard = () => {
    setStep('visit-types');
    setVisitKey('');
    setVisitTitle('');
    setSelected(null);
    setShowAllDays(false);
    setFiltersOpen(false);
    setClinicFilters([]);
    setProviderFilters([]);
    setLoginEmail('');
    setLoginPassword('');
    setGuestFirst('');
    setGuestLast('');
    setGuestDob('');
    setGuestPhone('');
    setConfirmCode('');
    setBookedAs(null);
  };

  const toggleValue = (current: string[], value: string, setter: (next: string[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  return (
    <section
      className={cn('lcmc-appt @container w-full', styles)}
      id={RenderingIdentifier}
      data-component="LcmcAppointmentScheduler"
      data-testid="lcmc-appointment-scheduler"
      data-step={step}
    >
      {step === 'visit-types' || step === 'slots' ? (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6 md:py-10">
          {(fieldString(datasource.appointmentTitle) || isEditing) && (
            <Text
              tag="h1"
              field={toEditableField(datasource.appointmentTitle)}
              className="text-foreground font-heading text-3xl font-semibold tracking-tight md:text-4xl"
            />
          )}
          {!fieldString(datasource.appointmentTitle) && !isEditing ? (
            <h1 className="text-foreground font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Patient Appointments
            </h1>
          ) : null}

          <EmergencyBanner field={datasource.emergencyText} isEditing={isEditing} />

          {step === 'visit-types' ? (
            <>
              {(fieldString(datasource.visitQuestion) || isEditing) && (
                <Text
                  tag="h2"
                  field={toEditableField(datasource.visitQuestion)}
                  className="text-foreground text-lg font-semibold md:text-xl"
                />
              )}
              {!fieldString(datasource.visitQuestion) && !isEditing ? (
                <h2 className="text-foreground text-lg font-semibold md:text-xl">
                  What type of visit would you like to schedule for your child?
                </h2>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2" data-testid="lcmc-appt-visit-grid">
                {visits.map((visit) => (
                  <button
                    key={visit.id}
                    type="button"
                    data-testid={`lcmc-visit-${visit.key}`}
                    className="border-border bg-card hover:border-primary/50 focus-visible:ring-ring rounded-xl border p-5 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2"
                    onClick={() => handlePickVisit(visit.key, visit.title)}
                  >
                    <div className="flex h-full flex-col gap-3">
                      {visit.titleField ? (
                        <Text
                          tag="span"
                          field={visit.titleField}
                          className="text-foreground text-base font-semibold"
                        />
                      ) : (
                        <span className="text-foreground text-base font-semibold">{visit.title}</span>
                      )}
                      {visit.descriptionField ? (
                        <Text
                          tag="span"
                          field={visit.descriptionField}
                          className="text-muted-foreground flex-1 text-sm leading-relaxed"
                        />
                      ) : (
                        <span className="text-muted-foreground flex-1 text-sm leading-relaxed">
                          {visit.description}
                        </span>
                      )}
                      <span className="border-primary text-primary mt-auto ml-auto inline-flex size-9 items-center justify-center rounded-full border">
                        <ArrowRight className="size-4" aria-hidden />
                        <span className="sr-only">Continue with {visit.title}</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 'slots' ? (
            <div className="space-y-6" data-testid="lcmc-appt-slots">
              <Button
                type="button"
                variant="ghost"
                className="text-primary px-0"
                onClick={() => setStep('visit-types')}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Back to visit types
              </Button>

              <Button
                type="button"
                variant="outline"
                className="border-primary text-primary w-full justify-start rounded-full"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                data-testid="lcmc-appt-filters"
              >
                <Filter className="size-4" aria-hidden />
                {fieldString(datasource.filtersLabel) || 'Filters'}
              </Button>

              {filtersOpen ? (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Narrow results</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 sm:grid-cols-2">
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold">Location</legend>
                      <div className="space-y-2">
                        {locations.map((clinic) => (
                          <label key={clinic} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={clinicFilters.includes(clinic)}
                              onChange={() => toggleValue(clinicFilters, clinic, setClinicFilters)}
                            />
                            {clinic}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold">Provider</legend>
                      <div className="space-y-2">
                        {providers.map((name) => (
                          <label key={name} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={providerFilters.includes(name)}
                              onChange={() => toggleValue(providerFilters, name, setProviderFilters)}
                            />
                            {name}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </CardContent>
                </Card>
              ) : null}

              {visibleDays.length === 0 ? (
                <p className="text-muted-foreground text-sm">No appointment times match these filters.</p>
              ) : (
                visibleDays.map((day) => (
                  <div key={day.dateKey} className="space-y-4" data-testid={`lcmc-day-${day.dateKey}`}>
                    <h3 className="text-foreground text-lg font-semibold">{day.header}</h3>
                    {day.rows.map((row) => (
                      <div key={row.id} className="space-y-3">
                        <div className="flex gap-3">
                          <InitialsAvatar initials={row.provider.initials} name={row.provider.name} />
                          <div>
                            <p className="text-primary font-medium underline-offset-4">{row.provider.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {row.provider.clinic}
                              <br />
                              {row.provider.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {row.slots.map((slot) => (
                            <Button
                              key={slot.id}
                              type="button"
                              variant="outline"
                              className="border-primary text-primary"
                              data-testid={`lcmc-slot-${slot.id}`}
                              onClick={() => handlePickSlot(slot.id)}
                            >
                              {slot.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}

              {!showAllDays && filtered.length > 2 ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary text-primary"
                    data-testid="lcmc-appt-show-more"
                    onClick={() => setShowAllDays(true)}
                  >
                    {fieldString(datasource.showMoreLabel) || 'Show more appointment times'}
                  </Button>
                </div>
              ) : null}

              {(fieldString(datasource.fluNote) || !isEditing) && (
                <p className="text-foreground text-sm font-semibold">
                  {toEditableField(datasource.fluNote) ? (
                    <Text field={toEditableField(datasource.fluNote)} tag="span" />
                  ) : (
                    'Note: Flu vaccine scheduling is now open.'
                  )}
                </p>
              )}

              <div className="bg-secondary/10 rounded-xl p-4 text-sm">
                {toEditableField(datasource.urgentCareBody) &&
                (fieldString(datasource.urgentCareBody) || isEditing) ? (
                  <RichText field={toEditableField(datasource.urgentCareBody)} />
                ) : (
                  <p>
                    For urgent needs, consider urgent care or the emergency department. Use our
                    symptom checker for help on where to take your child.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 'finish' && selected ? (
        <div
          className="lcmc-appt__finish bg-primary text-primary-foreground px-4 py-10 md:px-6"
          data-testid="lcmc-appt-finish"
        >
          <Card className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-lg">
            <CardHeader className="space-y-2">
              <p className="text-muted-foreground text-sm">LCMC Health · Manning Family Children&apos;s</p>
              <CardTitle className="font-heading text-3xl">
                {fieldString(datasource.finishTitle) || 'Finish Scheduling'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-secondary/10 rounded-xl p-4">
                <p className="text-primary mb-1 text-sm font-semibold">
                  {fieldString(datasource.detailsHeading) || 'Appointment details (not yet scheduled)'}
                </p>
                <p className="text-muted-foreground mb-4 text-xs">
                  This appointment time is reserved for you until {formatHoldUntil(holdUntil)}.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex gap-2 text-sm">
                    <UserRound className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{lcmcVisitDetailLine(selected.visitKey, selected.provider.name)}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Clock className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {selected.dateHeader}
                      <br />
                      {formatSlotTime(selected.start)} (15 minutes)
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Building2 className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                      {selected.provider.clinic}
                      <br />
                      {selected.provider.address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">
                    {fieldString(datasource.loginHeading) || 'Continue through My LCMC Health'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {fieldString(datasource.loginBody) ||
                      'Save time by using your My LCMC Health account to schedule this visit for yourself or someone else.'}
                  </p>
                  <Button
                    type="button"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 w-full font-semibold"
                    data-testid="lcmc-appt-login-cta"
                    onClick={() => setStep('login')}
                  >
                    {fieldString(datasource.loginCta) || 'Log in and schedule'}
                  </Button>
                </div>
                <div className="text-muted-foreground hidden items-center justify-center text-sm font-semibold md:flex">
                  OR
                </div>
                <button
                  type="button"
                  className="border-border hover:border-primary/40 flex items-center justify-between rounded-xl border p-4 text-left"
                  data-testid="lcmc-appt-guest-cta"
                  onClick={() => setStep('guest')}
                >
                  <span className="flex items-center gap-3">
                    <span className="bg-accent text-accent-foreground inline-flex size-10 items-center justify-center rounded-full">
                      <UserRound className="size-5" aria-hidden />
                    </span>
                    <span className="font-semibold">
                      {fieldString(datasource.guestCta) || 'Schedule as guest'}
                    </span>
                  </span>
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === 'login' ? (
        <div className="mx-auto max-w-md space-y-6 px-4 py-10" data-testid="lcmc-appt-login">
          <Button type="button" variant="ghost" className="text-primary px-0" onClick={() => setStep('finish')}>
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </Button>
          <h2 className="font-heading text-2xl font-semibold">Log in to My LCMC Health</h2>
          <p className="text-muted-foreground text-sm">
            Demo only — enter any email and password. This is not connected to Epic MyChart.
          </p>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              completeBooking('my-lcmc');
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="lcmc-login-email">Email</Label>
              <Input
                id="lcmc-login-email"
                type="email"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lcmc-login-password">Password</Label>
              <Input
                id="lcmc-login-password"
                type="password"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" data-testid="lcmc-appt-login-submit">
              Sign in and confirm
            </Button>
          </form>
        </div>
      ) : null}

      {step === 'guest' ? (
        <div className="mx-auto max-w-md space-y-6 px-4 py-10" data-testid="lcmc-appt-guest">
          <Button type="button" variant="ghost" className="text-primary px-0" onClick={() => setStep('finish')}>
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </Button>
          <h2 className="font-heading text-2xl font-semibold">
            {fieldString(datasource.guestHeading) || 'Schedule as guest'}
          </h2>
          <p className="text-muted-foreground text-sm">
            Tell us who this visit is for. Demo only — no medical record is created.
          </p>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              completeBooking('guest');
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lcmc-guest-first">First name</Label>
                <Input
                  id="lcmc-guest-first"
                  required
                  value={guestFirst}
                  onChange={(event) => setGuestFirst(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lcmc-guest-last">Last name</Label>
                <Input
                  id="lcmc-guest-last"
                  required
                  value={guestLast}
                  onChange={(event) => setGuestLast(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lcmc-guest-dob">Child&apos;s date of birth</Label>
              <Input
                id="lcmc-guest-dob"
                type="date"
                required
                value={guestDob}
                onChange={(event) => setGuestDob(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lcmc-guest-phone">Phone</Label>
              <Input
                id="lcmc-guest-phone"
                type="tel"
                required
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" data-testid="lcmc-appt-guest-submit">
              Confirm appointment
            </Button>
          </form>
        </div>
      ) : null}

      {step === 'confirmed' && selected ? (
        <div className="mx-auto max-w-xl space-y-6 px-4 py-10" data-testid="lcmc-appt-confirmed">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-accent mt-1 size-8 shrink-0" aria-hidden />
            <div>
              <h2 className="font-heading text-2xl font-semibold">
                {fieldString(datasource.confirmationTitle) || 'Your visit is scheduled'}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {fieldString(datasource.confirmationBody) ||
                  'This is a demo confirmation. No appointment was sent to a clinic or EHR.'}
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Confirmation {confirmCode}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <p>{lcmcVisitDetailLine(selected.visitKey, selected.provider.name)}</p>
              <p className="mt-2">
                {selected.dateHeader} · {formatSlotTime(selected.start)}
              </p>
              <p className="text-muted-foreground mt-2">
                {selected.provider.clinic}
                <br />
                {selected.provider.address}
              </p>
              <p className="mt-3">
                Booked as {bookedAs === 'guest' ? 'guest' : 'My LCMC Health'}
                {bookedAs === 'guest' && guestFirst ? ` for ${guestFirst} ${guestLast}` : ''}.
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={resetWizard} data-testid="lcmc-appt-book-another">
                Book another visit
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : null}
    </section>
  );
};

export const Default = (props: LcmcAppointmentSchedulerProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing);
  return <LcmcAppointmentSchedulerInner {...props} isEditing={isEditing} />;
};
