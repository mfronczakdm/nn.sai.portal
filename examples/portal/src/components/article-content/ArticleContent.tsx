'use client';

import type React from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';

import { cn } from '@/lib/utils';

import type { ArticleContentProps } from './article-content.props';

function hasText(field?: { value?: string | null }) {
  return Boolean(field?.value?.trim());
}

export const Default: React.FC<ArticleContentProps> = ({ fields, params, page }) => {
  const { Title, ShortTitle, HeaderTitle, Summary, Subtitle } = fields || {};
  const isEditing = page.mode.isEditing;

  const hasHeaderTitle = hasText(HeaderTitle);
  const hasTitle = hasText(Title);
  const hasShortTitle = hasText(ShortTitle);
  const hasSubtitle = hasText(Subtitle);
  const hasSummary = hasText(Summary);

  const primaryHeadline = hasHeaderTitle ? HeaderTitle : Title;
  const showSecondaryTitle =
    hasHeaderTitle && hasTitle && Title?.value?.trim() !== HeaderTitle?.value?.trim();
  const showPrimaryHeading = Boolean(primaryHeadline) && (hasText(primaryHeadline) || isEditing);

  const hasRenderableBlock =
    hasShortTitle ||
    hasHeaderTitle ||
    hasTitle ||
    hasSubtitle ||
    hasSummary ||
    isEditing;

  if (!hasRenderableBlock) {
    return null;
  }

  const headingId = 'article-content-primary-heading';

  return (
    <section
      data-component="ArticleContent"
      className={cn('@container article-content w-full', params?.styles)}
      aria-labelledby={showPrimaryHeading ? headingId : undefined}
    >
      <div className="from-background via-background to-muted/30 border-border/60 relative mx-auto max-w-3xl border-b bg-linear-to-b px-4 py-10 md:max-w-4xl md:px-8 md:py-14 lg:max-w-5xl">
        <div
          className="bg-primary/8 pointer-events-none absolute inset-x-4 top-0 h-px rounded-full md:inset-x-8"
          aria-hidden
        />

        <div className="relative space-y-6 md:space-y-8">
          {(hasShortTitle || isEditing) && ShortTitle && (
            <Text
              tag="p"
              field={ShortTitle}
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

            {showSecondaryTitle && Title && (
              <Text
                tag="h2"
                field={Title}
                className="font-heading text-muted-foreground text-balance text-xl font-normal leading-snug tracking-tight md:text-2xl"
              />
            )}

            {(hasSubtitle || isEditing) && Subtitle && (
              <Text
                tag="p"
                field={Subtitle}
                className="text-foreground/85 font-body max-w-3xl text-pretty text-lg leading-relaxed md:text-xl md:leading-relaxed"
              />
            )}
          </header>

          {(hasSummary || isEditing) && Summary && (
            <div className="border-border/50 max-w-3xl border-t pt-6 md:pt-8">
              <Text
                tag="p"
                field={Summary}
                className="text-foreground/90 font-body text-pretty whitespace-pre-wrap text-base leading-[1.75] md:text-lg md:leading-[1.7]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
