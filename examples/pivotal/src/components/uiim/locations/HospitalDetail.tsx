import type { JSX } from 'react';
import {
  RichText as ContentSdkRichText,
  Text,
  type Field,
  type RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { Car, Clock, MapPin, Phone, Stethoscope, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';

export type HospitalDetailLinkedItem = {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: {
    ServiceTitle?: Field<string>;
    ServiceShortDescription?: Field<string>;
    PhysicianFullName?: Field<string>;
    Credentials?: Field<string>;
    Specialty?: Field<string>;
  };
};

export interface HospitalDetailFields {
  LocationTitle?: Field<string>;
  LocationShortName?: Field<string>;
  LocationDescription?: RichTextField;
  StreetAddress?: Field<string>;
  City?: Field<string>;
  State?: Field<string>;
  PostalCode?: Field<string>;
  PhoneNumber?: Field<string>;
  HoursText?: Field<string>;
  ParkingInfo?: Field<string>;
  VisitorInfo?: RichTextField;
  LocationType?: Field<string>;
  HasEmergencyDepartment?: Field<boolean | string>;
  OfferedServices?: HospitalDetailLinkedItem[] | Field<string>;
  LocationPhysicians?: HospitalDetailLinkedItem[] | Field<string>;
}

export type HospitalDetailProps = ComponentProps & {
  fields?: HospitalDetailFields;
};

const HospitalDetailEmpty = (): JSX.Element => <NoDataFallback componentName="HospitalDetail" />;

function textValue(field?: Field<string> | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function richHasContent(field?: RichTextField | null): boolean {
  if (!field?.value) return false;
  return field.value.replace(/<[^>]*>/g, '').trim().length > 0;
}

function isCheckboxChecked(field?: Field<boolean | string> | null): boolean {
  const value = field?.value;
  return value === true || value === '1' || value === 'true';
}

function linkedItems(
  field?: HospitalDetailLinkedItem[] | Field<string> | null
): HospitalDetailLinkedItem[] {
  if (Array.isArray(field)) {
    return field.filter(Boolean);
  }
  return [];
}

function linkedItemTitle(item: HospitalDetailLinkedItem, fallbackField?: Field<string>): string {
  const fromField = textValue(fallbackField);
  if (fromField) return fromField;
  return (item.displayName || item.name || '').trim();
}

export const Default = (props: HospitalDetailProps): JSX.Element => {
  const { fields, params, page } = props;
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier } = params || {};

  if (!fields) {
    return <HospitalDetailEmpty />;
  }

  const title = textValue(fields.LocationTitle);
  const shortName = textValue(fields.LocationShortName);
  const locationType = textValue(fields.LocationType);
  const street = textValue(fields.StreetAddress);
  const city = textValue(fields.City);
  const state = textValue(fields.State);
  const postalCode = textValue(fields.PostalCode);
  const phone = textValue(fields.PhoneNumber);
  const hours = textValue(fields.HoursText);
  const parking = textValue(fields.ParkingInfo);
  const hasEmergency = isCheckboxChecked(fields.HasEmergencyDepartment);
  const services = linkedItems(fields.OfferedServices);
  const physicians = linkedItems(fields.LocationPhysicians);
  const cityLine = [city, state].filter(Boolean).join(', ');
  const addressLine = [cityLine, postalCode].filter(Boolean).join(' ');
  const hasAddress = Boolean(street || addressLine);
  const hasContent = Boolean(
    title ||
      shortName ||
      street ||
      phone ||
      hours ||
      richHasContent(fields.LocationDescription) ||
      services.length ||
      physicians.length
  );

  if (!hasContent && !isEditing) {
    return <HospitalDetailEmpty />;
  }

  return (
    <section
      className={cn('component hospital-detail @container w-full bg-background py-10', styles)}
      id={RenderingIdentifier}
      data-component="HospitalDetail"
    >
      <div className="component-content mx-auto max-w-6xl px-4 md:px-8">
        <header className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(locationType || isEditing) && (
              <Badge variant="secondary" className="uppercase tracking-wide">
                {isEditing ? (
                  <Text field={fields.LocationType} tag="span" />
                ) : (
                  locationType
                )}
              </Badge>
            )}
            {hasEmergency && (
              <Badge variant="destructive" data-testid="hospital-detail-er-badge">
                Emergency department
              </Badge>
            )}
            {isEditing && !hasEmergency && (
              <Badge variant="outline">Emergency department (unchecked)</Badge>
            )}
          </div>
          {(title || isEditing) && (
            <Text
              field={fields.LocationTitle}
              tag="h1"
              className="text-foreground text-4xl font-bold tracking-tight md:text-5xl"
            />
          )}
          {(shortName || isEditing) && (
            <Text
              field={fields.LocationShortName}
              tag="p"
              className="text-muted-foreground text-lg"
            />
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
          <div className="space-y-6">
            {(richHasContent(fields.LocationDescription) || isEditing) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">About this location</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-neutral text-foreground max-w-none">
                  <ContentSdkRichText field={fields.LocationDescription} />
                </CardContent>
              </Card>
            )}

            {(parking || isEditing || richHasContent(fields.VisitorInfo)) && (
              <div className="grid gap-6 md:grid-cols-2">
                {(parking || isEditing) && (
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                      <Car aria-hidden className="size-5 shrink-0" />
                      <CardTitle className="text-lg">Parking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text
                        field={fields.ParkingInfo}
                        tag="p"
                        className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed"
                      />
                    </CardContent>
                  </Card>
                )}
                {(richHasContent(fields.VisitorInfo) || isEditing) && (
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                      <Users aria-hidden className="size-5 shrink-0" />
                      <CardTitle className="text-lg">Visitor information</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-neutral text-muted-foreground max-w-none text-sm">
                      <ContentSdkRichText field={fields.VisitorInfo} />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl">Location details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {(hasAddress || isEditing) && (
                <div className="flex items-start gap-3">
                  <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
                  <address className="text-foreground not-italic">
                    {(street || isEditing) && (
                      <Text field={fields.StreetAddress} tag="div" />
                    )}
                    <div className="flex flex-wrap gap-x-1">
                      {(city || isEditing) && <Text field={fields.City} tag="span" />}
                      {(city || state) && !isEditing && state ? <span>,</span> : null}
                      {(state || isEditing) && <Text field={fields.State} tag="span" />}
                      {(postalCode || isEditing) && (
                        <Text field={fields.PostalCode} tag="span" />
                      )}
                    </div>
                  </address>
                </div>
              )}
              {(phone || isEditing) && (
                <div className="flex items-start gap-3">
                  <Phone aria-hidden className="mt-0.5 size-5 shrink-0" />
                  {phone && !isEditing ? (
                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
                      <Text field={fields.PhoneNumber} tag="span" />
                    </a>
                  ) : (
                    <Text field={fields.PhoneNumber} tag="span" />
                  )}
                </div>
              )}
              {(hours || isEditing) && (
                <div className="flex items-start gap-3">
                  <Clock aria-hidden className="mt-0.5 size-5 shrink-0" />
                  <Text
                    field={fields.HoursText}
                    tag="p"
                    className="whitespace-pre-line text-sm leading-relaxed"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {(services.length > 0 || isEditing) && (
          <section className="mt-10">
            <h2 className="text-foreground mb-4 flex items-center gap-2 text-2xl font-bold">
              <Stethoscope aria-hidden className="size-6" />
              Services offered
            </h2>
            {services.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {services.map((service, index) => {
                  const name = linkedItemTitle(service, service.fields?.ServiceTitle);
                  if (!name) return null;
                  return (
                    <li key={service.id || `${name}-${index}`}>
                      <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                        {name}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Use the field editor on this datasource to manage offered services.
              </p>
            )}
          </section>
        )}

        {(physicians.length > 0 || isEditing) && (
          <section className="mt-10">
            <h2 className="text-foreground mb-4 flex items-center gap-2 text-2xl font-bold">
              <Users aria-hidden className="size-6" />
              Physicians
            </h2>
            {physicians.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {physicians.map((physician, index) => {
                  const name = linkedItemTitle(physician, physician.fields?.PhysicianFullName);
                  const credentials = textValue(physician.fields?.Credentials);
                  const specialty = textValue(physician.fields?.Specialty);
                  if (!name && !credentials && !specialty) return null;
                  return (
                    <li key={physician.id || `${name}-${index}`}>
                      <Card>
                        <CardContent className="p-4">
                          {name && <p className="text-foreground font-semibold">{name}</p>}
                          {credentials && (
                            <p className="text-muted-foreground text-sm">{credentials}</p>
                          )}
                          {specialty && (
                            <p className="text-foreground mt-1 text-sm">{specialty}</p>
                          )}
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Use the field editor on this datasource to manage physicians serving this location.
              </p>
            )}
          </section>
        )}
      </div>
    </section>
  );
};
