'use client';

import { useRouter } from 'next/navigation';
import { usePreviewSearchActions } from '@sitecore-search/react';
import { PreviewSearch } from '@sitecore-search/ui';

type SuggestionBlockProps = {
  items: Array<{ text: string }>;
  title: string;
  blockId: string;
  filterAttribute?: string;
  disabled?: boolean;
  resultsPath?: string;
  onNavigate?: () => void;
};

const SuggestionBlock = ({
  items,
  title,
  blockId,
  filterAttribute,
  disabled,
  resultsPath = '/search',
  onNavigate,
}: SuggestionBlockProps) => {
  const { onSuggestionClick } = usePreviewSearchActions();
  const router = useRouter();

  return (
    <>
      {items.length > 0 && (
        <PreviewSearch.SuggestionsGroup
          className="flex flex-1 flex-col"
          id={blockId}
          filterAttribute={filterAttribute}
        >
          <h2 className="m-2 box-border block pl-1 text-sm font-bold text-foreground">{title}</h2>
          {items.map(({ text }) => (
            <PreviewSearch.SuggestionTrigger
              className="cursor-pointer p-2 text-sm text-foreground hover:bg-background focus:bg-background focus:outline-none data-[state=active]:bg-background data-[state=active]:outline-none"
              id={text}
              key={text}
              asChild
              disabled={disabled}
            >
              <a
                href={`${resultsPath}?q=${encodeURIComponent(text)}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSuggestionClick({
                    name: blockId,
                    title,
                    value: text,
                    displayName: text,
                  });
                  onNavigate?.();
                  const sep = resultsPath.includes('?') ? '&' : '?';
                  router.push(`${resultsPath}${sep}q=${encodeURIComponent(text)}`);
                }}
              >
                {text}
              </a>
            </PreviewSearch.SuggestionTrigger>
          ))}
        </PreviewSearch.SuggestionsGroup>
      )}
    </>
  );
};

export default SuggestionBlock;
