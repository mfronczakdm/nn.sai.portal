import { createElement, type ReactElement } from 'react';

import { cn } from '@/lib/utils';
import { iconForTopic, topicLabel, type TaxonomyTopicReference } from '@/lib/taxonomy-topic';

type TopicIconChipProps = {
  topic: TaxonomyTopicReference;
  className?: string;
  size?: 'sm' | 'md';
};

export function TopicIconChip({ topic, className, size = 'md' }: TopicIconChipProps): ReactElement {
  const label = topicLabel(topic);
  const isSm = size === 'sm';

  return (
    <span
      className={cn(
        'border-border bg-background text-foreground inline-flex items-center gap-2 rounded-xl border font-medium shadow-sm',
        isSm ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        className
      )}
    >
      <span
        className={cn(
          'bg-primary/10 text-primary inline-flex items-center justify-center rounded-lg',
          isSm ? 'size-5' : 'size-7'
        )}
      >
        {createElement(iconForTopic(label), {
          className: isSm ? 'size-3' : 'size-4',
          'aria-hidden': true,
        })}
      </span>
      {label}
    </span>
  );
}
