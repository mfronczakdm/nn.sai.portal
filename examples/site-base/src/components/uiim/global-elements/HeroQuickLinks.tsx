'use client';

import type { FormEvent, JSX } from 'react';
import { useMemo, useState } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { IGQLImageField, IGQLLinkField, IGQLTextField } from 'src/types/igql';

interface HeroQuickLinkItemFields {
  id: string;
  itemTitle?: IGQLTextField;
  itemImage?: IGQLImageField;
  itemLink?: IGQLLinkField;
}

interface HeroQuickLinksDatasource {
  headline?: IGQLTextField;
  backgroundImage?: IGQLImageField;
  zipLabel?: IGQLTextField;
  zipPlaceholder?: IGQLTextField;
  zipSearchLink?: IGQLLinkField;
  specialtyLabel?: IGQLTextField;
  specialtyPlaceholder?: IGQLTextField;
  specialtyOptions?: IGQLTextField;
  specialtySearchLink?: IGQLLinkField;
  children?: {
    results?: HeroQuickLinkItemFields[];
  };
}

interface HeroQuickLinksFields {
  data?: {
    datasource?: HeroQuickLinksDatasource;
  };
}

export type HeroQuickLinksProps = ComponentProps & {
  fields?: HeroQuickLinksFields;
};

const HeroQuickLinksEmpty = (): JSX.Element => <NoDataFallback componentName="HeroQuickLinks" />;

function parseSpecialtyOptions(value?: string | number): string[] {
  if (!value) {
    return [];
  }

  return String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function appendQuery(href: string, params: Record<string, string>): string {
  const url = new URL(href, typeof window === 'undefined' ? 'https://example.com' : window.location.origin);
  Object.entries(params).forEach(([key, val]) => {
    if (val) {
      url.searchParams.set(key, val);
    }
  });
  if (href.startsWith('/')) {
    return `${url.pathname}${url.search}${url.hash}`;
  }
  return url.toString();
}

function SearchGlyph(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function HeroQuickLinksLayout({ fields, params, page }: HeroQuickLinksProps): JSX.Element {
  const isEditing = Boolean(page?.mode?.isEditing);
  const datasource = fields?.data?.datasource;
  const [zipCode, setZipCode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const specialties = useMemo(
    () => parseSpecialtyOptions(datasource?.specialtyOptions?.jsonValue?.value),
    [datasource?.specialtyOptions?.jsonValue?.value]
  );

  if (!datasource) {
    return <HeroQuickLinksEmpty />;
  }

  const items = datasource.children?.results ?? [];
  const zipHref = datasource.zipSearchLink?.jsonValue?.value?.href ?? '';
  const specialtyHref = datasource.specialtySearchLink?.jsonValue?.value?.href ?? '';
  const zipPlaceholder = String(datasource.zipPlaceholder?.jsonValue?.value ?? '');
  const specialtyPlaceholder = String(datasource.specialtyPlaceholder?.jsonValue?.value ?? '');

  const handleZipSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing || !zipHref) {
      return;
    }
    window.location.assign(appendQuery(zipHref, { zip: zipCode }));
  };

  const handleSpecialtySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing || !specialtyHref) {
      return;
    }
    window.location.assign(appendQuery(specialtyHref, { specialty }));
  };

  return (
    <section
      className={cn('component hero-quick-links relative overflow-hidden', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="relative min-h-[28rem] bg-[#3d4a45] md:min-h-[32rem]">
        {(datasource.backgroundImage?.jsonValue?.value?.src || isEditing) && (
          <ContentSdkImage
            field={datasource.backgroundImage?.jsonValue}
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2f3c38]/95 via-[#2f3c38]/80 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-28 pt-12 md:px-8 md:pt-16">
          {(datasource.headline?.jsonValue?.value || isEditing) && (
            <Text
              field={datasource.headline?.jsonValue}
              tag="h1"
              className="max-w-xl font-serif text-4xl font-bold leading-tight text-white md:text-5xl"
            />
          )}
          <div className="mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
            <form className="space-y-2" onSubmit={handleZipSearch}>
              {(datasource.zipLabel?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.zipLabel?.jsonValue}
                  tag="p"
                  className="text-sm font-semibold text-white"
                />
              )}
              {(datasource.zipPlaceholder?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.zipPlaceholder?.jsonValue}
                  tag="span"
                  className={cn('block text-xs text-white/70', !isEditing && 'sr-only')}
                />
              )}
              <div className="flex overflow-hidden rounded-sm bg-white">
                <label className="sr-only" htmlFor="hero-quick-links-zip">
                  ZIP code
                </label>
                <input
                  id="hero-quick-links-zip"
                  name="zip"
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  placeholder={zipPlaceholder}
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-foreground outline-none"
                />
                <button
                  type="submit"
                  className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#c4d82d] text-[#1f2f2c]"
                  aria-label="Search by ZIP code"
                >
                  <SearchGlyph />
                </button>
              </div>
              {(datasource.zipSearchLink?.jsonValue?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={datasource.zipSearchLink?.jsonValue ?? { value: { href: '' } }}
                  className={cn(
                    'text-xs font-medium text-white underline-offset-4 hover:underline',
                    !isEditing && 'sr-only'
                  )}
                />
              )}
            </form>
            <form className="space-y-2" onSubmit={handleSpecialtySearch}>
              {(datasource.specialtyLabel?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.specialtyLabel?.jsonValue}
                  tag="p"
                  className="text-sm font-semibold text-white"
                />
              )}
              {(datasource.specialtyPlaceholder?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.specialtyPlaceholder?.jsonValue}
                  tag="span"
                  className={cn('block text-xs text-white/70', !isEditing && 'sr-only')}
                />
              )}
              {(datasource.specialtyOptions?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.specialtyOptions?.jsonValue}
                  tag="span"
                  className={cn('block whitespace-pre-line text-xs text-white/70', !isEditing && 'sr-only')}
                />
              )}
              <div className="flex overflow-hidden rounded-sm bg-white">
                <label className="sr-only" htmlFor="hero-quick-links-specialty">
                  Specialty
                </label>
                <select
                  id="hero-quick-links-specialty"
                  name="specialty"
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                  className="min-w-0 flex-1 bg-white px-4 py-3 text-sm text-foreground outline-none"
                >
                  <option value="">{specialtyPlaceholder || 'Select a specialty'}</option>
                  {specialties.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#c4d82d] text-[#1f2f2c]"
                  aria-label="Search by specialty"
                >
                  <SearchGlyph />
                </button>
              </div>
              {(datasource.specialtySearchLink?.jsonValue?.value?.href || isEditing) && (
                <ContentSdkLink
                  field={datasource.specialtySearchLink?.jsonValue ?? { value: { href: '' } }}
                  className={cn(
                    'text-xs font-medium text-white underline-offset-4 hover:underline',
                    !isEditing && 'sr-only'
                  )}
                />
              )}
            </form>
          </div>
        </div>
      </div>
      <div className="relative z-20 mx-auto -mt-16 max-w-7xl px-4 md:px-8">
        <div className="rounded-tr-[3rem] bg-white px-4 py-6 shadow-md md:px-8">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const hasImage = Boolean(item.itemImage?.jsonValue?.value?.src);
              const hasTitle = Boolean(item.itemTitle?.jsonValue?.value);
              const hasLink = Boolean(item.itemLink?.jsonValue?.value?.href);

              if (!hasImage && !hasTitle && !hasLink && !isEditing) {
                return null;
              }

              return (
                <li key={item.id} className="flex items-center gap-4">
                  {(hasImage || isEditing) && (
                    <ContentSdkImage
                      field={item.itemImage?.jsonValue}
                      className="h-12 w-12 shrink-0 object-contain"
                    />
                  )}
                  <div className="min-w-0">
                    {(hasTitle || isEditing) && (
                      <Text
                        field={item.itemTitle?.jsonValue}
                        tag="p"
                        className="text-sm font-semibold leading-snug text-foreground"
                      />
                    )}
                    {(hasLink || isEditing) && (
                      <ContentSdkLink
                        field={item.itemLink?.jsonValue ?? { value: { href: '' } }}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export const Default = (props: HeroQuickLinksProps): JSX.Element => (
  <HeroQuickLinksLayout {...props} />
);
