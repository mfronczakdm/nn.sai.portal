'use client';

import type React from 'react';
import { Link, RichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';

import { TopicIconChip } from '@/components/taxonomy/TopicIconChip';
import { resolveTopicList } from '@/lib/taxonomy-topic';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type { KnowledeVariantProps } from './knowlede-variant.props';

function resolveSourceDocument(fields: KnowledeVariantProps['fields']): LinkField | undefined {
  if (!fields) return undefined;
  return fields.sourceDocument ?? fields.SourceDocument ?? fields['Source Document'];
}

function hasLink(field?: LinkField): boolean {
  return Boolean(field?.value?.href?.trim() || field?.value?.id || field?.value?.text?.trim());
}

/** Turn a Sitecore internal href into breadcrumb segments. */
function breadcrumbSegments(href?: string): string[] {
  if (!href?.trim()) return [];
  const path = href
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/+/, '');
  return path
    .split('/')
    .map((part) => {
      try {
        return decodeURIComponent(part.trim());
      } catch {
        return part.trim();
      }
    })
    .filter(Boolean);
}

type SourceBreadcrumbProps = {
  field: LinkField;
};

function SourceBreadcrumb({ field }: SourceBreadcrumbProps): React.ReactElement {
  const href = field.value?.href?.trim() || '';
  const segments = breadcrumbSegments(href);
  const fallbackLabel = field.value?.text?.trim() || 'Source Knowledge Article';

  if (segments.length === 0) {
    return (
      <Link
        field={field}
        className="text-primary text-sm font-medium underline-offset-4 hover:underline"
      />
    );
  }

  return (
    <Link
      field={field}
      className="text-foreground hover:text-primary group inline-flex max-w-full flex-wrap items-center gap-x-1 gap-y-0.5 text-sm no-underline"
    >
      <span className="sr-only">{fallbackLabel}</span>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <span key={`${segment}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                className="text-muted-foreground/70 size-3.5 shrink-0"
                aria-hidden
              />
            )}
            <span
              className={cn(
                isLast
                  ? 'text-primary font-semibold group-hover:underline'
                  : 'text-muted-foreground font-medium'
              )}
            >
              {segment}
            </span>
          </span>
        );
      })}
    </Link>
  );
}

/**
 * KnowledgeChunks datasource — Source Document breadcrumb + LOB/Peril chips above Content.
 */
export const Default: React.FC<KnowledeVariantProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  if (!fields) {
    return <NoDataFallback componentName="KnowledeVariant" />;
  }

  const { Content } = fields;
  const sourceDocument = resolveSourceDocument(fields);
  const lob = resolveTopicList(fields as Record<string, unknown>, [
    'SourceDocumentLOB',
    'sourceDocumentLOB',
  ]);
  const perils = resolveTopicList(fields as Record<string, unknown>, [
    'SourceDocumentPerils',
    'sourceDocumentPerils',
  ]);

  const hasContent = Boolean(Content?.value?.trim());
  const hasSource = hasLink(sourceDocument);
  const hasTopics = lob.length > 0 || perils.length > 0;

  if (!hasContent && !hasSource && !isEditing) {
    return <NoDataFallback componentName="KnowledeVariant" />;
  }

  return (
    <article
      className={cn(
        'knowlede-variant @container border-border bg-card text-card-foreground overflow-hidden rounded-2xl border shadow-sm',
        params?.styles
      )}
      data-component="KnowledeVariant"
    >
      {(hasSource || hasTopics || isEditing) && (
        <header className="border-border/80 bg-muted/20 flex flex-col gap-4 border-b px-5 py-4 sm:px-6 sm:py-5">
          {(hasSource || isEditing) && (
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                Source document
              </span>
              {sourceDocument ? (
                <SourceBreadcrumb field={sourceDocument} />
              ) : (
                <span className="text-muted-foreground text-sm">
                  Select a source Knowledge Article
                </span>
              )}
            </div>
          )}

          {(hasTopics || isEditing) && (
            <div className="border-primary/25 bg-background rounded-xl border-2 border-dashed p-3 sm:p-3.5">
              <p className="text-muted-foreground mb-2.5 text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                Inherited LOB &amp; perils
              </p>
              {hasTopics ? (
                <div className="flex flex-wrap gap-2" aria-label="Source document topics">
                  {lob.map((topic) => (
                    <TopicIconChip
                      key={topic.id || topic.name}
                      topic={topic}
                      size="sm"
                      className="border-primary/40 bg-primary/5 shadow-none ring-1 ring-primary/15"
                    />
                  ))}
                  {perils.map((topic) => (
                    <TopicIconChip
                      key={topic.id || topic.name}
                      topic={topic}
                      size="sm"
                      className="border-primary/40 bg-primary/5 shadow-none ring-1 ring-primary/15"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Select Source Document LOB and Perils to show topic chips.
                </p>
              )}
            </div>
          )}
        </header>
      )}

      {(hasContent || isEditing) && (
        <div className="px-5 py-6 sm:px-6 sm:py-8">
          <RichText
            field={Content}
            className="knowlede-variant__content prose prose-neutral text-foreground max-w-none text-pretty leading-relaxed"
          />
        </div>
      )}
    </article>
  );
};
