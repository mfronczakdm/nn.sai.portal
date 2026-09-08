import type { JSX } from 'react';
import {
  RichText as ContentSdkRichText,
  Text,
  type Field,
  type RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { MapPin, Phone, Stethoscope, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
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
  const hasContent = Boolean(
    fullName || credentials || specialty || phone || richHasContent(fields.PhysicianBio) || locations.length
  );

  if (!hasContent && !isEditing) {
    return <PhysicianDetailEmpty />;
  }

  return (
    <section
      className={cn('component physician-detail @container w-full bg-background py-10', styles)}
      id={RenderingIdentifier}
      data-component="PhysicianDetail"
    >
      <div className="component-content mx-auto max-w-6xl px-4 md:px-8">
        <header className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(specialty || isEditing) && (
              <Badge variant="secondary" className="uppercase tracking-wide">
                {isEditing ? <Text field={fields.Specialty} tag="span" /> : specialty}
              </Badge>
            )}
          </div>
          {(fullName || isEditing) && (
            <Text
              field={fields.PhysicianFullName}
              tag="h1"
              className="text-foreground text-4xl font-bold tracking-tight md:text-5xl"
            />
          )}
          {(credentials || isEditing) && (
            <Text field={fields.Credentials} tag="p" className="text-muted-foreground text-lg" />
          )}
        </header>

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
              Locations served
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
