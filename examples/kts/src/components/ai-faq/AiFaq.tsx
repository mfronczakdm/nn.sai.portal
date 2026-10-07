'use client';

import type React from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { TopicIconChip } from '@/components/taxonomy/TopicIconChip';
import { resolveTopicList } from '@/lib/taxonomy-topic';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type { AiFaqProps } from './ai-faq.props';

const AiFaqEmpty: React.FC = () => (
  <div className="border-border bg-muted/30 text-muted-foreground rounded-2xl border border-dashed p-6 text-sm">
    AiFaq has no Question or Answer content yet. Select an AIFAQ datasource to edit.
  </div>
);

/**
 * Progressive Claims Advisor Q&A — editable Multi-Line Question and Answer from AIFAQ,
 * with LOB / Peril Type taxonomy chips when selected.
 */
export const Default: React.FC<AiFaqProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  if (!fields) {
    return <NoDataFallback componentName="AiFaq" />;
  }

  const { Question, Answer } = fields;
  const lob = resolveTopicList(fields as Record<string, unknown>, ['LOB', 'lob']);
  const perilTypes = resolveTopicList(fields as Record<string, unknown>, [
    'Peril Type',
    'perilType',
    'PerilType',
  ]);
  const hasQuestion = Boolean(Question?.value?.trim());
  const hasAnswer = Boolean(Answer?.value?.trim());
  const hasTopics = lob.length > 0 || perilTypes.length > 0;

  if (!hasQuestion && !hasAnswer && !isEditing) {
    return <AiFaqEmpty />;
  }

  const id = params?.RenderingIdentifier;

  return (
    <article
      id={id || undefined}
      className={cn(
        'ai-faq @container border-border bg-card text-card-foreground relative rounded-2xl border shadow-sm',
        params?.styles
      )}
      data-component="AiFaq"
    >
      <div
        className="from-primary/80 absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b to-transparent"
        aria-hidden
      />
      <div className="flex flex-col gap-3 px-6 py-5 pl-7 sm:px-8 sm:pl-9">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Question & answer
          </p>
          {hasTopics && (
            <div className="flex flex-wrap justify-end gap-1.5" aria-label="Applies to">
              {lob.map((topic) => (
                <TopicIconChip key={topic.id || topic.name} topic={topic} size="sm" />
              ))}
              {perilTypes.map((topic) => (
                <TopicIconChip key={topic.id || topic.name} topic={topic} size="sm" />
              ))}
            </div>
          )}
        </div>
        {(hasQuestion || isEditing) && (
          <Text
            tag="h2"
            field={Question}
            className="text-foreground text-balance text-xl font-semibold tracking-tight sm:text-2xl"
          />
        )}
        {(hasAnswer || isEditing) && (
          <Text
            tag="div"
            field={Answer}
            className="text-muted-foreground whitespace-pre-wrap text-pretty text-base leading-relaxed"
          />
        )}
        {isEditing && !hasTopics && (
          <p className="text-muted-foreground text-xs">
            Select LOB and Peril Type topics on this FAQ item to show applicability chips.
          </p>
        )}
      </div>
    </article>
  );
};
