import type { JSX } from 'react';
import Link from 'next/link';
import {
  RichText as ContentSdkRichText,
  Text,
  type Field,
  type ImageField,
  type RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { Calendar, MapPin, Phone, Stethoscope, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
import { buildLcmcPhysicianAppointmentHref } from '@/lib/lcmc-appointment-pack';
import { resolveLcmcPhysicianPhoto } from '@/lib/lcmc-physician-photos';
import { NoDataFallback } from '@/utils/NoDataFallback';

export type PhysicianDetailLinkedItem = {
  id?: string;
  name?: string;
  displayName?: string;
  url?: string | { path?: string };
  fields?: {
    LocationTitle?: Field<string>;
    LocationShortName?: Field<string>;
    LocationType?: Field<string>;
    LandingPage?: Field<string> | { value?: { href?: string; url?: string } };
  };
};

export interface PhysicianDetailFields {
  PhysicianFullName?: Field<string>;
  Credentials?: Field<string>;
  Specialty?: Field<string>;
  PhysicianPhone?: Field<string>;
  PhysicianBio?: RichTextField;
  ServingLocations?: PhysicianDetailLinkedItem[] | Field<string>;
  PhysicianDetailPage?: Field<string>;
  PhysicianPhoto?: ImageField;
  Headshot?: ImageField;
  Image?: ImageField;
}

export type PhysicianDetailProps = ComponentProps & {
  fields?: PhysicianDetailFields;
};

const PhysicianDetailEmpty = (): JSX.Element => <NoDataFallback componentName="PhysicianDetail" />;

function textValue(field?: Field<string> | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function richHasContent(field?: RichTextField | null): boolean {
  if (!field?.value) return false;
  return field.value.replace(/<[^>]*>/g, '').trim().length > 0;
}

function linkedItems(
  field?: PhysicianDetailLinkedItem[] | Field<string> | null
): PhysicianDetailLinkedItem[] {
  if (Array.isArray(field)) {
    return field.filter(Boolean);
  }
  return [];
}

function linkedItemTitle(item: PhysicianDetailLinkedItem, fallbackField?: Field<string>): string {
  const fromField = textValue(fallbackField);
  if (fromField) return fromField;
  return (item.displayName || item.name || '').trim();
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function splitSpecialties(specialty: string): string[] {
  return specialty
    .split(/\s*(?:\/|,|;|\||\band\b)\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function firstImageField(fields: PhysicianDetailFields): ImageField | undefined {
  return fields.PhysicianPhoto || fields.Headshot || fields.Image;
}

export const Default = (props: PhysicianDetailProps): JSX.Element => {
  const { fields, params, page } = props;
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier } = params || {};

  if (!fields) {
    return <PhysicianDetailEmpty />;
  }

  const fullName = textValue(fields.PhysicianFullName);
  const credentials = textValue(fields.Credentials);
  const specialty = textValue(fields.Specialty);
  const phone = textValue(fields.PhysicianPhone);
  const locations = linkedItems(fields.ServingLocations);
  const locationNames = locations
    .map((location) => linkedItemTitle(location, location.fields?.LocationTitle))
    .filter(Boolean);
  const specialtyLabels = splitSpecialties(specialty);
  const primarySpecialty = specialtyLabels[0] || specialty;
  const additionalSpecialties = specialtyLabels.slice(1);
  const credentialsAlreadyInName = Boolean(
    credentials && fullName && new RegExp(`\\b${credentials.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i').test(fullName)
  );
  const photo = resolveLcmcPhysicianPhoto({
    fullName,
    imageField: firstImageField(fields),
  });
  const bookHref = buildLcmcPhysicianAppointmentHref({
    fullName,
    credentials,
    specialty: primarySpecialty,
    location: locationNames[0],
  });
  const hasContent = Boolean(
    fullName || credentials || specialty || phone || richHasContent(fields.PhysicianBio) || locations.length
  );

  if (!hasContent && !isEditing) {
    return <PhysicianDetailEmpty />;
  }

  return (
    <section
      className={cn('component physician-detail @container w-full bg-background', styles)}
      id={RenderingIdentifier}
      data-component="PhysicianDetail"
    >
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:gap-10 md:px-8 md:py-10">
          <figure className="bg-primary-foreground/10 mx-auto w-40 shrink-0 overflow-hidden rounded-lg shadow-md md:mx-0 md:w-52">
            {/* Local public files + optional Sitecore/external src; img avoids next/image loader gaps. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              data-testid="physician-detail-photo"
              className="aspect-[4/5] h-auto w-full object-cover object-top"
            />
          </figure>

          <div className="min-w-0 flex-1 space-y-4 text-center md:text-left">
            {(fullName || isEditing) && (
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                <Text field={fields.PhysicianFullName} tag="span" />
                {(credentials || isEditing) && !credentialsAlreadyInName && (
                  <>
                    <span aria-hidden>, </span>
                    <Text
                      field={fields.Credentials}
                      tag="span"
                      className="font-light"
                    />
                  </>
                )}
              </h1>
            )}

            <ul className="space-y-1 text-sm md:text-base">
              {(primarySpecialty || isEditing) && (
                <li className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2">
                  <strong className="font-semibold">Primary Specialty:</strong>
                  {isEditing ? (
                    <Text field={fields.Specialty} tag="span" />
                  ) : (
                    <span>{primarySpecialty}</span>
                  )}
                </li>
              )}
              {additionalSpecialties.map((label) => (
                <li
                  key={label}
                  className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2"
                >
                  <strong className="font-semibold">Additional Specialty:</strong>
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <Link
              href={bookHref}
              data-testid="physician-detail-book-cta"
              className="physician-detail__book-cta inline-flex items-center justify-center gap-2 rounded-default border border-white bg-white px-6 py-3 text-sm font-semibold text-primary no-underline shadow-sm transition-colors hover:border-white hover:bg-muted hover:text-primary focus:bg-muted focus:text-primary focus-visible:bg-muted focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <Calendar aria-hidden className="size-4 shrink-0" />
              Book an appointment now
            </Link>
          </div>
        </div>
      </header>

      <div className="component-content mx-auto max-w-6xl px-4 py-10 md:px-8">
        {locationNames.length > 0 && (
          <p className="text-foreground mb-8 text-base" data-testid="physician-detail-affiliations">
            <strong className="mr-2 font-semibold">Hospital Affiliations</strong>
            {locationNames.join(', ')}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.9fr)]">
          <div className="space-y-6">
            {(richHasContent(fields.PhysicianBio) || isEditing) && (
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                  <UserRound aria-hidden className="size-5 shrink-0" />
                  <CardTitle className="text-xl">About this physician</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-neutral text-foreground max-w-none">
                  <ContentSdkRichText field={fields.PhysicianBio} />
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {(specialty || isEditing) && (
                <div className="flex items-start gap-3">
                  <Stethoscope aria-hidden className="mt-0.5 size-5 shrink-0" />
                  <Text field={fields.Specialty} tag="p" className="text-sm leading-relaxed" />
                </div>
              )}
              {(phone || isEditing) && (
                <div className="flex items-start gap-3">
                  <Phone aria-hidden className="mt-0.5 size-5 shrink-0" />
                  {phone && !isEditing ? (
                    <a href={telHref(phone)} className="hover:underline">
                      <Text field={fields.PhysicianPhone} tag="span" />
                    </a>
                  ) : (
                    <Text field={fields.PhysicianPhone} tag="span" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {(locations.length > 0 || isEditing) && (
          <section className="mt-10">
            <h2 className="text-foreground mb-4 flex items-center gap-2 text-2xl font-bold">
              <MapPin aria-hidden className="size-6" />
              Location Information
            </h2>
            {locations.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {locations.map((location, index) => {
                  const name = linkedItemTitle(location, location.fields?.LocationTitle);
                  const shortName = textValue(location.fields?.LocationShortName);
                  const locationType = textValue(location.fields?.LocationType);
                  if (!name && !shortName) return null;
                  return (
                    <li key={location.id || `${name}-${index}`}>
                      <Card>
                        <CardContent className="p-4">
                          {name && <p className="text-foreground font-semibold">{name}</p>}
                          {shortName && shortName !== name && (
                            <p className="text-muted-foreground text-sm">{shortName}</p>
                          )}
                          {locationType && (
                            <Badge variant="outline" className="mt-2">
                              {locationType}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Use the field editor on this datasource to manage hospitals and clinics this physician
                serves.
              </p>
            )}
          </section>
        )}
      </div>
    </section>
  );
};
