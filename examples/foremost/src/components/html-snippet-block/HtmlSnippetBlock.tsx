'use client';

import type React from 'react';
import { RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { cn } from '@/lib/utils';

import type { HtmlSnippetBlockProps } from './html-snippet-block.props';

/**
 * Renders optional title/subtitle and a rich HTML `body` (same behavior as Portal Page Detail).
 * Prefer this rendering for Sitecore-authored HTML snippets; `PortalPageDetail` is retained for compatibility.
 */
export const Default: React.FC<HtmlSnippetBlockProps> = (props) => {
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
        'html-snippet-block w-full max-w-full min-w-0 px-4 py-8 md:px-6 md:py-10',
        params?.styles,
      )}
      data-component="html-snippet-block"
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
            'html-snippet-block__body text-foreground not-prose w-full max-w-full min-w-0',
          )}
        >
          <RichText field={body} />
        </div>
      )}
    </article>
  );
};
