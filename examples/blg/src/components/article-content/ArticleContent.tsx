'use client';

import type React from 'react';
import Image from 'next/image';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';

import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { blogImageFallback } from '@/components/uiim/insights/blog-listing.taxonomy';
import { cn } from '@/lib/utils';
import {
  extractImageSrc,
  normalizeImageFieldSrc,
  unwrapImageField,
} from '@/lib/sitecore-image-field';

import { mergeArticleContentFields } from './article-content.fields';
import type { ArticleContentProps } from './article-content.props';

function hasText(field?: { value?: string | null }) {
  return Boolean(field?.value?.trim());
}

function hasRichText(field?: { value?: string | null }) {
  return Boolean(field?.value?.trim());
}

export const Default: React.FC<ArticleContentProps> = (props) => {
  const { params, page } = props;
  const isEditing = page.mode.isEditing;
  const { pageTitle, pageShortTitle, pageHeaderTitle, pageSummary, pageSubtitle, ArticleBody } =
    mergeArticleContentFields(props, isEditing);

  const hasPageHeaderTitle = hasText(pageHeaderTitle);
  const hasPageTitle = hasText(pageTitle);
  const hasPageShortTitle = hasText(pageShortTitle);
  const hasPageSubtitle = hasText(pageSubtitle);
  const hasPageSummary = hasText(pageSummary);
  const hasArticleBody = Boolean(ArticleBody?.value?.trim());

  const primaryHeadline = hasPageHeaderTitle ? pageHeaderTitle : pageTitle;
  const showSecondaryPageTitle =
    hasPageHeaderTitle &&
    hasPageTitle &&
    pageTitle?.value?.trim() !== pageHeaderTitle?.value?.trim();
  const showPrimaryHeading = Boolean(primaryHeadline) && (hasText(primaryHeadline) || isEditing);
  const showPageShortTitleSlot = Boolean(pageShortTitle) && (hasPageShortTitle || isEditing);

  const hasRenderableBlock =
    hasPageShortTitle ||
    hasPageHeaderTitle ||
    hasPageTitle ||
    hasPageSubtitle ||
    hasPageSummary ||
    hasArticleBody ||
    isEditing;

  if (!hasRenderableBlock) {
    return null;
  }

  const headingId = 'article-content-primary-heading';
  const pageShortTitleId = 'article-content-page-short-title';

  const labelledBy =
    showPrimaryHeading ? headingId : showPageShortTitleSlot ? pageShortTitleId : undefined;

  return (
    <section
      data-component="ArticleContent"
      className={cn('@container article-content w-full', params?.styles)}
      aria-labelledby={labelledBy}
    >
      <div className="from-background via-background to-muted/30 border-border/60 relative mx-auto max-w-3xl border-b bg-linear-to-b px-4 py-10 md:max-w-4xl md:px-8 md:py-14 lg:max-w-5xl">
        <div
          className="bg-primary/8 pointer-events-none absolute inset-x-4 top-0 h-px rounded-full md:inset-x-8"
          aria-hidden
        />

        <div className="relative space-y-6 md:space-y-8">
          {showPageShortTitleSlot && pageShortTitle && (
            <Text
              id={pageShortTitleId}
              tag="p"
              field={pageShortTitle}
              className="text-primary font-body text-sm font-medium tracking-wide md:text-base"
            />
          )}

          <header className="space-y-4 md:space-y-5">
            {showPrimaryHeading && primaryHeadline && (
              <Text
                id={headingId}
                tag="h1"
                field={primaryHeadline}
                className="font-heading text-foreground text-balance text-3xl font-normal leading-[1.12] tracking-tight md:text-5xl md:leading-[1.08] lg:text-[3.25rem]"
              />
            )}

            {showSecondaryPageTitle && pageTitle && (
              <Text
                tag="h2"
                field={pageTitle}
                className="font-heading text-muted-foreground text-balance text-xl font-normal leading-snug tracking-tight md:text-2xl"
              />
            )}

            {(hasPageSubtitle || isEditing) && pageSubtitle && (
              <Text
                tag="p"
                field={pageSubtitle}
                className="text-foreground/85 font-body max-w-3xl text-pretty text-lg leading-relaxed md:text-xl md:leading-relaxed"
              />
            )}
          </header>

          {(hasPageSummary || isEditing) && pageSummary && (
            <div className="border-border/50 max-w-3xl border-t pt-6 md:pt-8">
              <Text
                tag="p"
                field={pageSummary}
                className="text-foreground/90 font-body text-pretty whitespace-pre-wrap text-base leading-[1.75] md:text-lg md:leading-[1.7]"
              />
            </div>
          )}

          {(hasArticleBody || isEditing) && ArticleBody && (
            <div
              className={cn(
                'article-content__body text-foreground not-prose w-full max-w-3xl min-w-0',
                (hasPageSummary || isEditing) && pageSummary && 'pt-6 md:pt-8',
              )}
            >
              <RichText field={ArticleBody} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const ServicePageVariant: React.FC<ArticleContentProps> = (props) => {
  const { params, page } = props;
  const isEditing = page.mode.isEditing;
  const { pageHeaderTitle, pageSummary, pageSubtitle } = mergeArticleContentFields(props, isEditing);

  const hasPageHeaderTitle = hasText(pageHeaderTitle);
  const hasPageSubtitle = hasText(pageSubtitle);
  const hasPageSummary = hasText(pageSummary);

  const hasRenderableBlock = hasPageHeaderTitle || hasPageSubtitle || hasPageSummary || isEditing;

  if (!hasRenderableBlock) {
    return null;
  }

  const headingId = 'article-content-service-page-heading';

  return (
    <section
      data-component="ArticleContent"
      data-variant="ServicePageVariant"
      className={cn('@container article-content w-full bg-background', params?.styles)}
      aria-labelledby={hasPageHeaderTitle || isEditing ? headingId : undefined}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-14 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12 xl:gap-20">
          {(hasPageHeaderTitle || isEditing) && pageHeaderTitle && (
            <div className="lg:w-[38%] lg:shrink-0">
              <Text
                id={headingId}
                tag="h2"
                field={pageHeaderTitle}
                className="font-heading text-primary text-balance text-3xl font-bold uppercase leading-[1.1] tracking-tight md:text-4xl lg:text-[2.75rem]"
              />
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-4 lg:w-[62%] lg:gap-5">
            {(hasPageSubtitle || isEditing) && pageSubtitle && (
              <Text
                tag="p"
                field={pageSubtitle}
                className="font-heading text-primary text-pretty text-base font-bold uppercase leading-snug tracking-wide md:text-lg lg:text-xl"
              />
            )}

            {(hasPageSummary || isEditing) && pageSummary && (
              <Text
                tag="p"
                field={pageSummary}
                className="text-foreground/80 font-body text-pretty text-base leading-relaxed md:text-[1.0625rem] md:leading-[1.75]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Blog / insight article layout — content-first, professional, minimal.
 * Reading column: titles → optional summary → quiet featured image → body.
 * Image sits between intro and Detail (not a full-bleed hero).
 */
export const kmpage: React.FC<ArticleContentProps> = (props) => {
  const { params, page } = props;
  const isEditing = page.mode.isEditing;
  const {
    pageTitle,
    pageShortTitle,
    pageHeaderTitle,
    pageSummary,
    pageSubtitle,
    Detail,
    image: rawImage,
  } = mergeArticleContentFields(props, isEditing);

  const image = normalizeImageFieldSrc(unwrapImageField(rawImage));
  const routeName = page?.layout?.sitecore?.route?.name ?? '';
  const fromSitecore = extractImageSrc(image) || extractImageSrc(rawImage);
  const fallback = blogImageFallback(routeName);
  const featuredSrc = fromSitecore || fallback?.src || '';
  const featuredAlt =
    (typeof image?.value?.alt === 'string' && image.value.alt.trim()) ||
    fallback?.alt ||
    pageHeaderTitle?.value ||
    pageTitle?.value ||
    'Article image';
  const hasFeaturedImage = Boolean(featuredSrc);
  const useNextImage =
    featuredSrc.includes('images.unsplash.com') || featuredSrc.includes('sitecoresandbox.cloud');

  const hasPageHeaderTitle = hasText(pageHeaderTitle);
  const hasPageTitle = hasText(pageTitle);
  const hasPageShortTitle = hasText(pageShortTitle);
  const hasPageSubtitle = hasText(pageSubtitle);
  const hasPageSummary = hasText(pageSummary);
  const hasDetail = hasRichText(Detail as { value?: string | null });

  const primaryHeadline = hasPageHeaderTitle ? pageHeaderTitle : pageTitle;
  const showSecondaryPageTitle =
    hasPageHeaderTitle &&
    hasPageTitle &&
    pageTitle?.value?.trim() !== pageHeaderTitle?.value?.trim();
  const showPrimaryHeading = Boolean(primaryHeadline) && (hasText(primaryHeadline) || isEditing);

  const hasRenderableBlock =
    hasFeaturedImage ||
    hasPageShortTitle ||
    hasPageHeaderTitle ||
    hasPageTitle ||
    hasPageSubtitle ||
    hasPageSummary ||
    hasDetail ||
    isEditing;

  if (!hasRenderableBlock) {
    return null;
  }

  const headingId = 'article-content-kmpage-heading';

  return (
    <article
      data-component="ArticleContent"
      data-variant="kmpage"
      className={cn(
        '@container article-content article-content--kmpage w-full bg-background',
        params?.styles,
      )}
      aria-labelledby={showPrimaryHeading ? headingId : undefined}
    >
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16 lg:py-20">
        <div className="space-y-6 md:space-y-8">
          {(hasPageShortTitle || isEditing) && pageShortTitle && (
            <Text
              tag="p"
              field={pageShortTitle}
              className="text-primary font-body text-xs font-semibold uppercase tracking-[0.14em] md:text-sm"
            />
          )}

          <header className="space-y-3 md:space-y-4">
            {showPrimaryHeading && primaryHeadline && (
              <Text
                id={headingId}
                tag="h1"
                field={primaryHeadline}
                className="font-heading text-foreground text-balance text-3xl font-semibold leading-[1.15] tracking-tight md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]"
              />
            )}

            {showSecondaryPageTitle && pageTitle && (
              <Text
                tag="p"
                field={pageTitle}
                className="font-body text-muted-foreground text-base font-normal md:text-lg"
              />
            )}

            {(hasPageSubtitle || isEditing) && pageSubtitle && (
              <Text
                tag="p"
                field={pageSubtitle}
                className="text-foreground/80 font-body max-w-2xl text-pretty text-lg leading-relaxed md:text-xl"
              />
            )}
          </header>

          {(hasPageSummary || isEditing) && pageSummary && (
            <Text
              tag="p"
              field={pageSummary}
              className="text-muted-foreground font-body border-border/60 max-w-2xl border-t pt-6 text-pretty whitespace-pre-wrap text-base leading-relaxed md:pt-8 md:text-[1.0625rem] md:leading-[1.7]"
            />
          )}

          {/* Featured image: between intro and body — restrained, in-column, no hero treatment */}
          {(hasFeaturedImage || isEditing) && (
            <figure className="border-border/50 pt-2 md:pt-4">
              <div className="bg-muted relative aspect-2/1 w-full overflow-hidden">
                {featuredSrc && useNextImage ? (
                  <Image
                    src={featuredSrc}
                    alt={featuredAlt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                    unoptimized
                  />
                ) : image?.value?.src ? (
                  <ImageWrapper
                    image={image}
                    priority
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="absolute inset-0 h-full w-full object-cover"
                    wrapperClass="absolute inset-0 h-full w-full"
                    alt={featuredAlt}
                  />
                ) : isEditing ? (
                  <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                    Add page image
                  </div>
                ) : null}
              </div>
            </figure>
          )}

          {(hasDetail || isEditing) && Detail && (
            <div
              className={cn(
                'article-content__detail content-sdk-rich-text text-foreground not-prose w-full min-w-0',
                'font-body text-base leading-[1.75] md:text-[1.0625rem] md:leading-[1.75]',
                '[&_h2]:font-heading [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight',
                '[&_h3]:font-heading [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold',
                '[&_p]:mb-4 [&_p]:text-pretty',
                '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6',
                '[&_li]:mb-1.5 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline',
                '[&_strong]:font-semibold [&_strong]:text-foreground',
              )}
            >
              <RichText field={Detail} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
