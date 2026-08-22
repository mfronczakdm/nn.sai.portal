'use client';

import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
  useSitecore,
  type Field as SitecoreField,
  type ImageField,
  type LinkField,
  type RichTextField,
} from '@sitecore-content-sdk/nextjs';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileText,
  Headphones,
  Mail,
  MapPin,
  Mic2,
  Newspaper,
  Phone,
  Presentation,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type { BioDetailFields, BioDetailProps } from './bio-detail.props';
import { resolveBioHeadshotSrc } from './bio-headshots';
import {
  relatedContentBadge,
  resolveBioRelatedContent,
  type BioRelatedContentItem,
  type BioRelatedContentProfile,
  type BioRelatedContentType,
} from './bio-related-content';

type TaxonomyLike = {
  id?: string;
  displayName?: string;
  name?: string;
  fields?: {
    Title?: SitecoreField<string>;
  };
};

function textValue(field?: SitecoreField<string> | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function richHasContent(field?: RichTextField | null): boolean {
  if (!field?.value) return false;
  return field.value.replace(/<[^>]*>/g, '').trim().length > 0;
}

function resolveTaxonomy(raw: unknown): TaxonomyLike[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as TaxonomyLike[];
  return [];
}

function taxonomyLabel(item: TaxonomyLike): string {
  return textValue(item.fields?.Title) || item.displayName || item.name || '';
}

function officeLabel(office: BioDetailFields['Office']): string {
  if (!office) return '';
  if (typeof office === 'object' && 'displayName' in office && office.displayName) {
    return String(office.displayName);
  }
  if (typeof office === 'object' && 'name' in office && office.name) {
    return String(office.name);
  }
  if (typeof office === 'object' && 'value' in office && typeof office.value === 'string') {
    return office.value;
  }
  return '';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function TaxonomyList({
  label,
  items,
}: {
  label: string;
  items: TaxonomyLike[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="font-heading text-foreground text-sm font-semibold tracking-wide uppercase">
        {label}
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => {
          const text = taxonomyLabel(item);
          if (!text) return null;
          return (
            <li
              key={item.id || text}
              className="border-border bg-muted/30 text-foreground rounded-md border px-2.5 py-1 text-sm"
            >
              {text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RichSection({
  title,
  field,
  isEditing,
}: {
  title: string;
  field?: RichTextField;
  isEditing: boolean;
}) {
  if (!richHasContent(field) && !isEditing) return null;
  return (
    <section className="mt-10">
      <h2 className="font-heading text-foreground text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="prose prose-neutral dark:prose-invert text-foreground mt-4 max-w-none text-base leading-relaxed">
        <ContentSdkRichText field={field} />
      </div>
    </section>
  );
}

const RELATED_TYPE_ICON: Record<BioRelatedContentType, LucideIcon> = {
  blog: Newspaper,
  webinar: CalendarDays,
  podcast: Mic2,
  cle: Headphones,
  alert: FileText,
  guide: BookOpen,
  'white-paper': BookOpen,
  presentation: Presentation,
};

function RelatedContentCard({ item }: { item: BioRelatedContentItem }) {
  const Icon = RELATED_TYPE_ICON[item.type];
  const badge = relatedContentBadge(item);

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'group border-border bg-card flex h-full flex-col gap-3 rounded-2xl border p-5',
          'shadow-sm ring-1 ring-black/3 transition-all duration-200',
          'hover:border-primary/30 hover:shadow-md dark:ring-white/5'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold tracking-wide uppercase">
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {badge}
          </span>
          {item.dateLabel ? (
            <span className="text-muted-foreground text-xs">{item.dateLabel}</span>
          ) : null}
        </div>
        <h3 className="font-heading text-foreground text-base leading-snug font-semibold tracking-tight group-hover:text-primary">
          {item.title}
        </h3>
        <p className="text-muted-foreground flex-1 text-sm leading-relaxed">{item.description}</p>
        <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
          Open
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </Link>
    </li>
  );
}

function RelatedContentSection({ profile }: { profile: BioRelatedContentProfile }) {
  if (!profile.items.length) return null;

  return (
    <section
      aria-labelledby="bio-related-content-heading"
      className="border-border border-t"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-2xl">
          <h2
            id="bio-related-content-heading"
            className="font-heading text-foreground text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {profile.sectionTitle}
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed sm:text-lg">
            {profile.sectionIntro}
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profile.items.map((item) => (
            <RelatedContentCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export const Default: React.FC<BioDetailProps> = (props) => {
  const { fields: propFields, params, isPageEditing: propEditing } = props;
  const { page } = useSitecore();
  const isEditing = propEditing ?? page.mode.isEditing;

  const routeFields = (page?.layout?.sitecore?.route?.fields ?? {}) as BioDetailFields;
  const fields: BioDetailFields = {
    ...routeFields,
    ...(propFields ?? {}),
  };

  const fullName = textValue(fields.FullName);
  const jobTitle = textValue(fields.JobTitle);
  const summary = textValue(fields.Summary);
  const email = textValue(fields.Email);
  const phone = textValue(fields.Phone);
  const office = officeLabel(fields.Office);
  const routeName = page?.layout?.sitecore?.route?.name ?? '';
  const headshotResolved = resolveBioHeadshotSrc({
    itemName: routeName,
    displayName: fullName || routeName,
    headshotField: fields.Headshot,
  });
  const headshotSrc = headshotResolved.src;
  const headshotAlt = headshotResolved.alt;
  const bypassOptimizer =
    headshotSrc.includes('images.unsplash.com') || headshotSrc.includes('sitecoresandbox.cloud');
  const linkedIn = fields.LinkedIn as LinkField | undefined;

  const practiceAreas = resolveTaxonomy(fields.PracticeAreas);
  const industries = resolveTaxonomy(fields.Industries);
  const barAdmissions = resolveTaxonomy(fields.BarAdmissions);
  const languages = resolveTaxonomy(fields.Languages);
  const education = resolveTaxonomy(fields.Education);
  const awards = resolveTaxonomy(fields.Awards);
  const relatedContent = resolveBioRelatedContent(routeName);

  const hasProfile = Boolean(fullName || jobTitle || summary || isEditing);

  if (!hasProfile && !richHasContent(fields.Biography) && !isEditing) {
    return <NoDataFallback componentName="BioDetail" />;
  }

  const sectionId = params?.RenderingIdentifier || 'bio-detail';

  return (
    <article
      id={sectionId}
      data-component="BioDetail"
      className={cn('@container bg-background text-foreground', params?.styles)}
    >
      <div className="border-border border-b">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:py-14">
          <div className="flex flex-col items-start gap-4">
            <div className="bg-muted text-muted-foreground relative flex size-36 items-center justify-center overflow-hidden rounded-2xl text-2xl font-semibold tracking-wide sm:size-44">
              {headshotSrc ? (
                <Image
                  src={headshotSrc}
                  alt={headshotAlt || fullName || 'Attorney headshot'}
                  fill
                  sizes="176px"
                  className="object-cover"
                  unoptimized={bypassOptimizer}
                />
              ) : isEditing && fields.Headshot ? (
                <ContentSdkImage
                  field={fields.Headshot as ImageField}
                  className="size-full object-cover"
                />
              ) : (
                <span aria-hidden>{initials(fullName || 'LA')}</span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            {(fullName || isEditing) && (
              <Text
                tag="h1"
                field={fields.FullName}
                className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
              />
            )}
            {(jobTitle || isEditing) && (
              <Text
                tag="p"
                field={fields.JobTitle}
                className="text-muted-foreground mt-2 text-lg sm:text-xl"
              />
            )}

            <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {office && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  {office}
                </span>
              )}
              {(phone || isEditing) && (
                <a
                  href={phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined}
                  className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="size-3.5 shrink-0" aria-hidden />
                  <Text field={fields.Phone} />
                </a>
              )}
              {(email || isEditing) && (
                <a
                  href={email ? `mailto:${email}` : undefined}
                  className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  <Text field={fields.Email} />
                </a>
              )}
            </div>

            {(summary || isEditing) && (
              <Text
                tag="p"
                field={fields.Summary}
                className="text-foreground/90 mt-6 max-w-3xl text-pretty text-base leading-relaxed sm:text-lg"
              />
            )}

            {linkedIn && (linkedIn.value?.href || isEditing) && (
              <div className="mt-5">
                <ContentSdkLink
                  field={linkedIn}
                  className="text-primary hover:text-primary/80 text-sm font-medium underline-offset-4 hover:underline"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14 lg:px-8 lg:py-14">
        <div className="min-w-0">
          <RichSection title="Biography" field={fields.Biography} isEditing={isEditing} />
          <RichSection
            title="Representative Matters"
            field={fields.RepresentativeMatters}
            isEditing={isEditing}
          />
          <RichSection
            title="Community Involvement"
            field={fields.CommunityInvolvement}
            isEditing={isEditing}
          />
        </div>

        <aside className="border-border bg-muted/15 h-fit rounded-2xl border p-5 lg:sticky lg:top-24">
          <h2 className="font-heading text-foreground text-lg font-semibold tracking-tight">
            Expertise
          </h2>
          <div className="mt-5 space-y-6">
            <TaxonomyList label="Practice areas" items={practiceAreas} />
            <TaxonomyList label="Industries" items={industries} />
            <TaxonomyList label="Bar admissions" items={barAdmissions} />
            <TaxonomyList label="Education" items={education} />
            <TaxonomyList label="Languages" items={languages} />
            <TaxonomyList label="Awards" items={awards} />
            {practiceAreas.length === 0 &&
              industries.length === 0 &&
              barAdmissions.length === 0 &&
              education.length === 0 &&
              languages.length === 0 &&
              awards.length === 0 &&
              isEditing && (
                <p className="text-muted-foreground text-sm">
                  Add taxonomy multilists on this Bio page to populate expertise.
                </p>
              )}
            {relatedContent && relatedContent.items.length > 0 ? (
              <div className="border-border border-t pt-6">
                <h3 className="font-heading text-foreground text-sm font-semibold tracking-wide uppercase">
                  Featured content
                </h3>
                <ul className="mt-3 space-y-2">
                  {relatedContent.items.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-foreground hover:text-primary group flex items-start gap-2 text-sm leading-snug transition-colors"
                      >
                        <ArrowUpRight
                          className="text-muted-foreground mt-0.5 size-3.5 shrink-0 group-hover:text-primary"
                          aria-hidden
                        />
                        <span>
                          <span className="text-muted-foreground block text-[10px] font-semibold tracking-wide uppercase">
                            {relatedContentBadge(item)}
                          </span>
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {relatedContent ? <RelatedContentSection profile={relatedContent} /> : null}
    </article>
  );
};
