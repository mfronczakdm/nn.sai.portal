'use client';

import type { ChangeEvent, SyntheticEvent } from 'react';
import { useCallback, useState } from 'react';
import type { PreviewSearchInitialState } from '@sitecore-search/react';
import { WidgetDataType, usePreviewSearch, widget } from '@sitecore-search/react';
import { ArticleCard, PreviewSearch } from '@sitecore-search/ui';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Spinner from './Spinner';
import SuggestionBlock from './SuggestionBlock';
import { PREVIEW_WIDGET_ID, DEFAULT_IMG_URL } from '@/lib/search-customizations';
import { useSearchTracking, type Events } from '@/hooks/useSearchTracking';
import { cn } from '@/lib/utils';

const SEARCH_SOURCE = process.env.NEXT_PUBLIC_SEARCH_SOURCE || '';

type ArticleModel = {
  id: string;
  title?: string;
  image_url?: string;
  url: string;
  source_id?: string;
  name?: string;
};

type PreviewSearchComponentProps = {
  defaultItemsPerPage?: number;
  /** Results page path (from HeaderST SearchLink), default `/search`. */
  resultsPath?: string;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
};

type InitialState = PreviewSearchInitialState<'itemsPerPage' | 'suggestionsList'>;

function buildResultsUrl(resultsPath: string, query: string): string {
  const base = resultsPath || '/search';
  try {
    const url = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (query.trim()) {
      url.searchParams.set('q', query.trim());
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return query.trim() ? `${base}?q=${encodeURIComponent(query.trim())}` : base;
  }
}

export const PreviewSearchComponent = ({
  defaultItemsPerPage = 6,
  resultsPath = '/search',
  className,
  inputClassName,
  placeholder = 'Search the Knowledge Base...',
}: PreviewSearchComponentProps) => {
  const router = useRouter();
  const { handleSearch } = useSearchTracking();
  const [isOpen, setIsOpen] = useState(false);

  const {
    actions: { onKeyphraseChange },
    queryResult,
    queryResult: {
      isFetching,
      isLoading,
      data: { suggestion: { title_context_aware: articleSuggestions = [] } = {} } = {},
    },
  } = usePreviewSearch<ArticleModel, InitialState>({
    state: {
      suggestionsList: [{ suggestion: 'title_context_aware', max: 6 }],
      itemsPerPage: defaultItemsPerPage,
    },
    query: (query): void => {
      if (SEARCH_SOURCE.trim()) {
        SEARCH_SOURCE.split('|').forEach((source) => {
          query.getRequest().addSource(source.trim());
        });
      }
    },
  });

  const loading = isLoading || isFetching;

  const keyphraseHandler = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onKeyphraseChange({ keyphrase: event.target.value });
      setIsOpen(true);
    },
    [onKeyphraseChange]
  );

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    setIsOpen(false);
    const form = e.target as HTMLFormElement;
    const target = form.query as HTMLInputElement;
    router.push(buildResultsUrl(resultsPath, target.value));
    target.value = '';
  };

  return (
    <div className={cn('relative w-full min-w-[12rem] max-w-xl', className)}>
      <PreviewSearch.Root>
        <form onSubmit={handleSubmit} className="w-full">
          <PreviewSearch.Input
            name="query"
            className={cn(
              'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground',
              'placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
              inputClassName
            )}
            onChange={keyphraseHandler}
            onFocus={() => setIsOpen(true)}
            autoComplete="off"
            placeholder={placeholder}
            aria-label={placeholder}
          />
        </form>

        {isOpen && (
          <PreviewSearch.Content
            className={cn(
              'absolute left-0 right-0 z-50 mt-1 flex max-h-[min(400px,70vh)] w-full justify-center overflow-hidden',
              'rounded-xl border border-border bg-muted pt-0 shadow-lg'
            )}
          >
            <Spinner loading={loading} />

            {!loading && (
              <React.Fragment key="preview-body">
                {articleSuggestions.length > 0 && (
                  <PreviewSearch.Suggestions className="box-border block w-40 shrink-0 list-none border-r border-border bg-muted/80 text-sm sm:w-48">
                    <SuggestionBlock
                      blockId="title_context_aware"
                      items={articleSuggestions}
                      title="Suggestions"
                      resultsPath={resultsPath}
                      onNavigate={() => setIsOpen(false)}
                    />
                  </PreviewSearch.Suggestions>
                )}

                <PreviewSearch.Results defaultQueryResult={queryResult}>
                  {({ isFetching: isResultsFetching, data: { content: articles = [] } = {} }) => (
                    <PreviewSearch.Items
                      data-loading={isResultsFetching}
                      className="relative flex min-h-[8rem] flex-[3] overflow-y-auto bg-background data-[loading=false]:m-0 data-[loading=false]:grid data-[loading=false]:list-none data-[loading=false]:grid-cols-1 data-[loading=false]:gap-2 data-[loading=false]:p-2 sm:data-[loading=false]:grid-cols-2 lg:data-[loading=false]:grid-cols-3"
                    >
                      <Spinner loading={isResultsFetching} />

                      {!isResultsFetching &&
                        articles.map((article, index) => {
                          const imageUrl = article.image_url?.trim() || DEFAULT_IMG_URL;
                          const label = article.name || article.title || 'Result';
                          return (
                            <PreviewSearch.Item key={article.id} asChild>
                              <PreviewSearch.ItemLink
                                onClick={(e) =>
                                  handleSearch(e, {
                                    url: article.url,
                                    widgetId: PREVIEW_WIDGET_ID,
                                    entityType: 'content',
                                    events: ['EntityPageView', 'PreviewSearchClickEvent'] as Events[],
                                    entityId: article.id,
                                    itemIndex: index,
                                  })
                                }
                                href={article.url}
                                className="box-border flex w-full text-foreground no-underline focus:shadow-md"
                              >
                                <ArticleCard.Root className="block w-full cursor-pointer rounded-lg border border-border p-2 text-left shadow-sm transition-shadow hover:shadow-md">
                                  <div className="relative mb-2 flex h-16 items-center justify-center overflow-hidden rounded-md bg-muted">
                                    <Image
                                      src={imageUrl}
                                      className="block h-auto max-h-full w-auto max-w-full object-contain"
                                      alt=""
                                      width={200}
                                      height={100}
                                      unoptimized
                                    />
                                  </div>
                                  <ArticleCard.Title className="m-0 line-clamp-2 text-xs font-medium">
                                    {label}
                                  </ArticleCard.Title>
                                </ArticleCard.Root>
                              </PreviewSearch.ItemLink>
                            </PreviewSearch.Item>
                          );
                        })}
                    </PreviewSearch.Items>
                  )}
                </PreviewSearch.Results>
              </React.Fragment>
            )}
          </PreviewSearch.Content>
        )}
      </PreviewSearch.Root>
    </div>
  );
};

const PreviewSearchWidget = widget(
  PreviewSearchComponent,
  WidgetDataType.PREVIEW_SEARCH,
  'content'
);

export default PreviewSearchWidget;
