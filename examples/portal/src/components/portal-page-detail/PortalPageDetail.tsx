'use client';

import type React from 'react';
import { RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type { PortalPageDetailProps } from './portal-page-detail.props';

/**
 * Demo-friendly detail block: title, subtitle, and HTML body from a datasource item.
 * Assign a datasource on the rendering in Experience Editor.
 */
export const Default: React.FC<PortalPageDetailProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const datasource = fields?.data?.datasource;
  if (!datasource) {
    return <NoDataFallback componentName="Portal Page Detail" />;
  }

  const { title, subtitle, body } = datasource;

  const hasTitle = Boolean(title?.jsonValue?.value?.trim());
  const hasSubtitle = Boolean(subtitle?.jsonValue?.value?.trim());
  const hasBody = Boolean(body?.jsonValue?.value?.trim());

  return (
    <article
      className={cn(
        'portal-page-detail mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10',
        params?.styles,
      )}
      data-component="portal-page-detail"
    >
      {(hasTitle || isEditing) && (
        <Text
          tag="h1"
          className="font-heading text-foreground mb-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl"
          field={title?.jsonValue}
        />
      )}
      {(hasSubtitle || isEditing) && (
        <Text
          tag="p"
          className="text-muted-foreground mb-8 text-pretty text-lg md:text-xl"
          field={subtitle?.jsonValue}
        />
      )}
      {(hasBody || isEditing) && (
        <div
          className={cn(
            'portal-page-detail__body text-foreground prose prose-neutral max-w-none dark:prose-invert',
            'prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary',
          )}
        >
          <RichText field={body?.jsonValue} />
        </div>
      )}
    </article>
  );
};
