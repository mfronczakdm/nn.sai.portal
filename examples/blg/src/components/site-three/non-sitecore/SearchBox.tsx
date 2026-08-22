'use client';

import { Link as ContentSdkLink, LinkField } from '@sitecore-content-sdk/nextjs';
import { Search } from 'lucide-react';
import { useToggleWithClickOutside } from '@/hooks/useToggleWithClickOutside';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

const DICTIONARY_KEYS = {
  SEARCH_GO_LABEL: 'Go',
  SEARCH_GO_DESCRIPTIVE: 'Go_To_Search_Results',
  SEARCH_LABEL: 'Search',
  SEARCH_INPUT_PLACEHOLDER: 'Search_Input_Placeholder',
};

const SEARCH_GO_ARIA_LABEL = 'Go to search results';

/** Returns true if href is a valid URL (not a placeholder like # or http://#). */
function hasValidHref(href: string | undefined): boolean {
  if (!href || href === '#' || href.startsWith('http://#')) return false;
  return true;
}

const triggerClassName = cn(
  'inline-flex items-center gap-2 p-4 font-[family-name:var(--font-body)] font-normal',
  // PKM --secondary-foreground is white (for on-primary surfaces); header is light — use foreground.
  'text-foreground hover:text-primary'
);

export const SearchBox = ({ searchLink }: { searchLink: LinkField }) => {
  const t = useTranslations();
  const { isVisible, setIsVisible, ref } = useToggleWithClickOutside<HTMLDivElement>(false);
  const [searchTerm, setSearchTerm] = useState('');

  const searchBaseHref = searchLink?.value?.href;
  const hasValidSearchLink = hasValidHref(searchBaseHref);
  const searchLabel =
    searchLink?.value?.text?.trim() || t(DICTIONARY_KEYS.SEARCH_LABEL) || 'Search';

  const buildSearchUrl = (): string | null => {
    if (!hasValidSearchLink) return null;
    try {
      const url = new URL(searchBaseHref!, window.location.origin);
      if (searchTerm.trim()) {
        url.searchParams.set('q', searchTerm.trim());
      } else {
        url.searchParams.delete('q');
      }
      return url.toString();
    } catch {
      return searchTerm.trim()
        ? `${searchBaseHref}?q=${encodeURIComponent(searchTerm.trim())}`
        : (searchBaseHref ?? null);
    }
  };

  const searchUrl = buildSearchUrl();

  const triggerContent = (
    <>
      <Search className="size-5 shrink-0" strokeWidth={2} aria-hidden />
      <span>{searchLabel}</span>
    </>
  );

  return (
    // Do not add `relative` here — the panel uses lg:absolute and must size to the
    // sticky header (full width), not this narrow trigger wrapper.
    <div ref={ref}>
      {hasValidSearchLink ? (
        <ContentSdkLink
          field={searchLink}
          prefetch={false}
          className={triggerClassName}
          onClick={(e) => {
            e.preventDefault();
            setIsVisible(!isVisible);
          }}
        >
          {triggerContent}
        </ContentSdkLink>
      ) : (
        <button
          type="button"
          className={cn(triggerClassName, 'w-full text-left')}
          onClick={() => setIsVisible(!isVisible)}
          aria-label={searchLabel}
          aria-expanded={isVisible}
        >
          {triggerContent}
        </button>
      )}

      <div
        className={cn(
          // Mobile: viewport-fixed full bleed. Desktop: absolute to sticky header section.
          'fixed inset-x-0 top-14 z-40 lg:absolute lg:inset-x-0 lg:top-full',
          'h-[calc(100vh-3.5rem)] lg:h-auto overflow-auto',
          isVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 lg:translate-y-2 pointer-events-none',
          'bg-background text-foreground shadow-lg transition-all duration-300 ease-in-out',
          'border-b border-border'
        )}
      >
        <div className="mx-auto w-full max-w-[100rem] px-4 pt-18 pb-8 sm:px-6 lg:px-8 lg:pt-8">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            {t(DICTIONARY_KEYS.SEARCH_LABEL) || 'Search'}
          </h2>
          <div className="flex min-w-0 gap-4">
            <input
              type="text"
              placeholder={t(DICTIONARY_KEYS.SEARCH_INPUT_PLACEHOLDER) || 'Type to search...'}
              className="text-foreground placeholder:text-muted-foreground min-w-0 w-full border-b border-border bg-transparent px-3 py-2 focus:border-primary focus-visible:outline-0"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchUrl) {
                  window.location.href = searchUrl;
                }
              }}
            />
            {searchUrl ? (
              <Link
                href={searchUrl}
                prefetch={false}
                className="btn btn-primary btn-sharp shrink-0 whitespace-nowrap"
                aria-label={t(DICTIONARY_KEYS.SEARCH_GO_DESCRIPTIVE) || SEARCH_GO_ARIA_LABEL}
              >
                {t(DICTIONARY_KEYS.SEARCH_GO_DESCRIPTIVE) ||
                  t(DICTIONARY_KEYS.SEARCH_GO_LABEL) ||
                  SEARCH_GO_ARIA_LABEL}
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sharp shrink-0 whitespace-nowrap"
                aria-label={t(DICTIONARY_KEYS.SEARCH_GO_DESCRIPTIVE) || SEARCH_GO_ARIA_LABEL}
                onClick={() => {
                  if (searchTerm.trim() && searchBaseHref) {
                    try {
                      const url = new URL(searchBaseHref, window.location.origin);
                      url.searchParams.set('q', searchTerm.trim());
                      window.location.href = url.toString();
                    } catch {
                      // no-op if URL invalid
                    }
                  }
                }}
              >
                {t(DICTIONARY_KEYS.SEARCH_GO_DESCRIPTIVE) ||
                  t(DICTIONARY_KEYS.SEARCH_GO_LABEL) ||
                  SEARCH_GO_ARIA_LABEL}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
