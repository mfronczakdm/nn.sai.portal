import type { JSX } from 'react';
import Link from 'next/link';
import { Text, type Field } from '@sitecore-content-sdk/nextjs';
import { MapPin, Phone, Stethoscope } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';

export type PhysicianListingJsonField<T = string> = {
  jsonValue?: Field<T>;
};

export type PhysicianListingLocation = {
  id?: string;
  name?: string;
  displayName?: string;
  locationTitle?: PhysicianListingJsonField;
};

export type PhysicianListingChild = {
  id?: string;
  name?: string;
  url?: { path?: string };
  physicianFullName?: PhysicianListingJsonField;
  credentials?: PhysicianListingJsonField;
  specialty?: PhysicianListingJsonField;
  physicianPhone?: PhysicianListingJsonField;
  physicianDetailPage?: PhysicianListingJsonField<string | { href?: string; url?: string; path?: string }> & {
    targetItem?: { id?: string; name?: string; url?: { path?: string } };
  };
  servingLocations?: {
    jsonValue?: Field<string> | PhysicianListingLocation[];
    targetItems?: PhysicianListingLocation[];
  };
};

export type PhysicianListingDatasource = {
  children?: {
    results?: PhysicianListingChild[];
  };
};

export type PhysicianListingProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: PhysicianListingDatasource | null;
    };
  };
};

const PhysicianListingEmpty = (): JSX.Element => (
  <NoDataFallback componentName="PhysicianListing" />
);

function textValue(field?: PhysicianListingJsonField | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function locationName(item: PhysicianListingLocation): string {
  return textValue(item.locationTitle) || item.displayName || item.name || '';
}

function servingLocationNames(physician: PhysicianListingChild): string[] {
  const fromTargets = (physician.servingLocations?.targetItems ?? [])
    .map(locationName)
    .filter(Boolean);
  if (fromTargets.length) return fromTargets;

  const jsonValue = physician.servingLocations?.jsonValue;
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(locationName).filter(Boolean);
  }

  return [];
}

function detailHref(physician: PhysicianListingChild): string {
  const linkedPath = physician.physicianDetailPage?.targetItem?.url?.path?.trim();
  if (linkedPath) {
    return linkedPath.startsWith('/') ? linkedPath : `/${linkedPath}`;
  }

  const fromUrl = physician.url?.path?.trim();
  if (fromUrl && fromUrl.includes('/Find-a-Provider/')) {
    return fromUrl.startsWith('/') ? fromUrl : `/${fromUrl}`;
  }

  const detailValue = physician.physicianDetailPage?.jsonValue?.value;
  if (typeof detailValue === 'string') {
    const trimmed = detailValue.trim();
    if (trimmed.startsWith('/')) return trimmed;
  } else if (detailValue && typeof detailValue === 'object') {
    const href = detailValue.href || detailValue.url || detailValue.path;
    if (typeof href === 'string' && href.trim()) {
      return href.startsWith('/') ? href : `/${href}`;
    }
  }

  const segment = (physician.name || textValue(physician.physicianFullName) || '')
    .trim()
    .replace(/\s+/g, '-');
  return segment ? `/Find-a-Provider/${segment}` : '/Find-a-Provider';
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export const Default = (props: PhysicianListingProps): JSX.Element => {
  const { fields, params, page } = props;
  const isEditing = Boolean(page?.mode?.isEditing);
  const { styles, RenderingIdentifier } = params || {};
  const datasource = fields?.data?.datasource;
  const physicians = datasource?.children?.results ?? [];

  if (!datasource) {
    return <PhysicianListingEmpty />;
  }

  if (!physicians.length && !isEditing) {
    return <PhysicianListingEmpty />;
  }

  return (
    <section
      className={cn('component physician-listing @container w-full bg-background py-10', styles)}
      id={RenderingIdentifier}
      data-component="PhysicianListing"
    >
      <div className="component-content mx-auto max-w-6xl px-4 md:px-8">
        {physicians.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {physicians.map((physician, index) => {
              const name = textValue(physician.physicianFullName) || physician.name || '';
              const credentials = textValue(physician.credentials);
              const specialty = textValue(physician.specialty);
              const phone = textValue(physician.physicianPhone);
              const locations = servingLocationNames(physician);
              const href = detailHref(physician);
              if (!name && !credentials && !specialty && !isEditing) return null;

              return (
                <li key={physician.id || `${name}-${index}`}>
                  <Card className="h-full transition-colors hover:bg-muted/30">
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <div className="space-y-2">
                        {specialty && (
                          <Badge variant="secondary" className="uppercase tracking-wide">
                            {specialty}
                          </Badge>
                        )}
                        {isEditing ? (
                          <Text
                            field={physician.physicianFullName?.jsonValue}
                            tag="h2"
                            className="text-foreground text-xl font-semibold tracking-tight"
                          />
                        ) : (
                          <h2 className="text-foreground text-xl font-semibold tracking-tight">
                            <Link href={href} className="hover:underline">
                              {name}
                            </Link>
                          </h2>
                        )}
                        {(credentials || isEditing) && (
                          <Text
                            field={physician.credentials?.jsonValue}
                            tag="p"
                            className="text-muted-foreground text-sm"
                          />
                        )}
                      </div>

                      <div className="text-muted-foreground mt-auto space-y-2 text-sm">
                        {(specialty || isEditing) && (
                          <p className="flex items-start gap-2">
                            <Stethoscope aria-hidden className="mt-0.5 size-4 shrink-0" />
                            <Text field={physician.specialty?.jsonValue} tag="span" />
                          </p>
                        )}
                        {(phone || isEditing) && (
                          <p className="flex items-start gap-2">
                            <Phone aria-hidden className="mt-0.5 size-4 shrink-0" />
                            {phone && !isEditing ? (
                              <a href={telHref(phone)} className="hover:underline">
                                <Text field={physician.physicianPhone?.jsonValue} tag="span" />
                              </a>
                            ) : (
                              <Text field={physician.physicianPhone?.jsonValue} tag="span" />
                            )}
                          </p>
                        )}
                        {locations.length > 0 && (
                          <p className="flex items-start gap-2">
                            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                            <span>{locations.join(', ')}</span>
                          </p>
                        )}
                      </div>

                      {!isEditing && name && (
                        <Link
                          href={href}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          View profile
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Assign the Physicians folder as the datasource, then add or edit physician items under
            Data/Physicians.
          </p>
        )}
      </div>
    </section>
  );
};
