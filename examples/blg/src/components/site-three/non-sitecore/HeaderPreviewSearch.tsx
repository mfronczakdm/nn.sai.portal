'use client';

import { LinkField } from '@sitecore-content-sdk/nextjs';
import PreviewSearch from '@/lib/sitecore-search/PreviewSearch';
import { SearchBox } from '@/components/site-three/non-sitecore/SearchBox';
import { isSitecoreSearchConfigured, PREVIEW_WIDGET_ID } from '@/lib/search-customizations';

type HeaderPreviewSearchProps = {
  searchLink?: LinkField;
};

/**
 * Header search slot: Sitecore Search PreviewSearch when legacy SDK env is configured,
 * otherwise the existing client-side SearchBox fallback.
 */
export function HeaderPreviewSearch({ searchLink }: HeaderPreviewSearchProps) {
  const resultsPath = searchLink?.value?.href || '/search';
  const configured = isSitecoreSearchConfigured();

  if (!configured) {
    return <SearchBox searchLink={searchLink as LinkField} />;
  }

  return (
    <div className="flex min-w-[14rem] flex-1 items-center px-2 py-2 lg:min-w-[20rem] lg:max-w-xl">
      <PreviewSearch rfkId={PREVIEW_WIDGET_ID} resultsPath={resultsPath} />
    </div>
  );
}
