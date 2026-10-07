'use client';

import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  AppPlaceholder,
  useSitecore,
  LinkField,
  ImageField,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { useEffect, useId } from 'react';
import { MiniCart } from './non-sitecore/MiniCart';
import { HeaderPreviewSearch } from './non-sitecore/HeaderPreviewSearch';
import { DemoUserSwitcher } from './non-sitecore/DemoUserSwitcher';
import { ComponentProps } from 'lib/component-props';
import componentMap from '.sitecore/component-map';
import { cn } from '@/lib/utils';
import { useToggleWithClickOutside } from '@/hooks/useToggleWithClickOutside';

interface Fields {
  Logo: ImageField;
  SupportLink: LinkField;
  SearchLink: LinkField;
  CartLink: LinkField;
}

type HeaderSTProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

const overlayNavClass =
  'm-0 flex w-full list-none flex-col gap-0 p-0 text-left [&>li>a]:block [&>li>a]:px-1 [&>li>a]:py-3 [&>li>a]:font-[family-name:var(--font-body)] [&>li>a]:text-lg [&>li>a]:font-medium [&>li>a]:text-foreground [&>li>a:hover]:text-primary';

/**
 * Cooley-style collapsed header: logo left, utilities + hamburger right.
 * Primary nav lives in a full-viewport overlay instead of a desktop link row.
 */
export function HeaderSTHamburger(props: HeaderSTProps) {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing);
  const menuId = useId();
  const { isVisible, setIsVisible, ref } = useToggleWithClickOutside<HTMLElement>(false);

  const isOpen = isEditing || isVisible;

  useEffect(() => {
    if (isEditing || !isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isEditing, isOpen]);

  const handleToggle = () => {
    if (isEditing) return;
    setIsVisible((open) => !open);
  };

  return (
    <section
      ref={ref}
      className={cn(
        'relative sticky top-0 z-30 w-full min-w-0 border-b border-border/30 bg-background shadow-sm',
        params?.styles
      )}
      data-class-change
      data-header-st-variant="hamburger"
    >
      <div className="w-full min-w-0" role="navigation" aria-label="Site header">
        <div className="relative z-50 mx-auto flex w-full max-w-[100rem] items-center justify-between gap-4 bg-background px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="relative z-10 flex shrink-0 grow-0 items-center justify-center self-stretch px-1 py-2 sm:px-2 lg:px-3 lg:py-3"
            prefetch={false}
          >
            <ContentSdkImage
              field={fields?.Logo}
              className="h-14 w-auto max-w-[min(100%,300px)] object-contain sm:h-16 sm:max-w-[min(100%,380px)] lg:h-20 lg:max-w-[min(100%,460px)]"
            />
          </Link>

          <div className="flex min-h-[3.5rem] items-center justify-end gap-1 lg:min-h-[4.5rem]">
            {params.showSearchBox ? (
              <HeaderPreviewSearch searchLink={fields?.SearchLink} />
            ) : (
              <ContentSdkLink
                field={fields?.SearchLink}
                prefetch={false}
                className="block p-4 font-[family-name:var(--font-body)] text-foreground font-normal hover:text-primary"
              />
            )}
            {params.showMiniCart ? (
              <MiniCart cartLink={fields?.CartLink} />
            ) : (
              <ContentSdkLink
                field={fields?.CartLink}
                prefetch={false}
                className="block p-4 text-foreground hover:text-primary"
              >
                <FontAwesomeIcon icon={faShoppingCart} width={24} height={24} />
              </ContentSdkLink>
            )}
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center text-foreground hover:text-primary"
              onClick={handleToggle}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls={menuId}
            >
              <span className="relative h-4 w-5" aria-hidden="true">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-0.5 w-full origin-top-right bg-current transition-transform duration-300 ease-in-out',
                    isOpen && '-rotate-45'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current transition-all duration-300 ease-in-out',
                    isOpen && 'opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-0.5 w-full origin-bottom-right bg-current transition-transform duration-300 ease-in-out',
                    isOpen && 'rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id={menuId}
          role="dialog"
          aria-modal={!isEditing}
          aria-label="Site menu"
          hidden={!isOpen}
          className={cn(
            'fixed inset-0 z-40 overflow-auto bg-background pt-[5.5rem] transition-opacity duration-300 ease-in-out sm:pt-24',
            isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
            <ul className={overlayNavClass}>
              <AppPlaceholder
                name={`header-navigation-${params?.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </ul>
            <div className="border-t border-border pt-6">
              <ul className={overlayNavClass}>
                <li>
                  <ContentSdkLink
                    field={fields?.SupportLink}
                    prefetch={false}
                    className="block py-3 font-[family-name:var(--font-body)] text-lg font-medium text-foreground hover:text-primary"
                  />
                </li>
                <li className="py-3">
                  <DemoUserSwitcher />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
