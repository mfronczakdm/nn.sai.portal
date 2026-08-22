'use client';

import { JSX, Suspense } from 'react';
import { ComponentProps } from 'lib/component-props';
import { useSearchParams } from 'next/navigation';
import SearchResultsWidget from '@/lib/sitecore-search/SearchResultsComponent';
import QuestionsAnswers from '@/lib/sitecore-search/QuestionsAnswers';
import { SEARCH_WIDGET_ID } from '@/lib/search-customizations';

export type SitecoreSearchResultsProps = ComponentProps & {
  params: { [key: string]: string };
};

/**
 * Full-page Sitecore Search (legacy SDK) results + Q&A.
 * Place on a search results page (e.g. /search) and link HeaderST SearchLink there.
 * Named SitecoreSearchResults to avoid clashing with the mock search-results/SearchResults demo component.
 *
 * Widget helpers live under src/lib/sitecore-search/ so they are not auto-registered in the component map.
 */
const SitecoreSearchResultsInner = (props: SitecoreSearchResultsProps): JSX.Element => {
  const sxaStyles = `${props.params?.styles || ''}`;
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  return (
    <div key={query} className={`${sxaStyles}`}>
      <QuestionsAnswers
        key={`${query}-questions`}
        rfkId="rfkid_qa"
        defaultKeyphrase={query}
        defaultRelatedQuestions={3}
      />
      <SearchResultsWidget rfkId={SEARCH_WIDGET_ID} defaultKeyphrase={query} />
    </div>
  );
};

export const SitecoreSearchResults = (props: SitecoreSearchResultsProps): JSX.Element => {
  return (
    <Suspense fallback={null}>
      <SitecoreSearchResultsInner {...props} />
    </Suspense>
  );
};

export const Default = SitecoreSearchResults;
