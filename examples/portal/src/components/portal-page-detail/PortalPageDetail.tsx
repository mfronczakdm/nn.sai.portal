'use client';

import type React from 'react';
import { RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { cn } from '@/lib/utils';

import type { PortalPageDetailProps } from './portal-page-detail.props';

/**
 * Detail block: optional title/subtitle and rich HTML `body`, using the same flat `fields`
 * contract as Portal Hub (fields live on the rendering, not `fields.data.datasource`).
 */
export const Default: React.FC<PortalPageDetailProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const title = fields?.title;
  const subtitle = fields?.subtitle;
  const body = fields?.body;

  const hasTitle = Boolean(title?.value?.trim());
  const hasSubtitle = Boolean(subtitle?.value?.trim());
  const hasBody = Boolean(body?.value?.trim());

  return (
    <article
      className={cn(
        // Full width of the Sitecore placeholder so embedded layout HTML (e.g. flex dashboards) is not
        // squeezed or offset; use params.styles from CM if you need a max-width text column.
        'portal-page-detail w-full max-w-full min-w-0 px-4 py-8 md:px-6 md:py-10',
        params?.styles,
      )}
      data-component="portal-page-detail"
    >
      {(hasTitle || isEditing) && (
        <Text
          tag="h1"
          className="font-heading text-foreground mb-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl"
          field={title}
        />
      )}
      {(hasSubtitle || isEditing) && (
        <Text
          tag="p"
          className="text-muted-foreground mb-8 text-pretty text-lg md:text-xl"
          field={subtitle}
        />
      )}
      {(hasBody || isEditing) && (
        <div
          className={cn(
            // not-prose: avoid typography plugin rules on nested flex/grid (common cause of drift in RTE HTML).
            'portal-page-detail__body text-foreground not-prose w-full max-w-full min-w-0',
          )}
        >
          <RichText field={body} />
        </div>
      )}
    </article>
  );
};
