import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  LinkField,
  ImageField,
  AppPlaceholder,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { MiniCart } from './non-sitecore/MiniCart';
import { SearchBox } from './non-sitecore/SearchBox';
import { DemoUserSwitcher } from './non-sitecore/DemoUserSwitcher';
import { ComponentProps } from 'lib/component-props';
import componentMap from '.sitecore/component-map';
import { MobileMenuWrapper } from './MobileMenuWrapper';
import { cn } from '@/lib/utils';

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

const navLinkClass = 'block p-4 font-[family-name:var(--font-body)] text-secondary-foreground font-normal';

/** Sitecore checkbox / string params for rendering parameter ReverseTheme */
function isReverseThemeParam(value: string | undefined): boolean {
  if (value == null || typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'reversetheme';
}

export const Default = (props: HeaderSTProps) => {
  const { fields, params } = props;
  const isReverseTheme = isReverseThemeParam(params?.ReverseTheme);

  return (
    <section
      className={cn(
        'sticky top-0 z-30 w-full min-w-0 border-b border-border/30 bg-background shadow-sm',
        params?.styles
      )}
      data-class-change
    >
      <div
        className="flex w-full min-w-0 flex-col [.partial-editing-mode_&]:flex-col-reverse"
        role="navigation"
        aria-label="Site header"
      >
        {/* Row 1: full-bleed background; content constrained to max width */}
        <div className="w-full min-w-0">
          <div className="mx-auto flex w-full max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
          <Link
            href="/"
            className="relative z-10 flex shrink-0 grow-0 items-center justify-center self-stretch px-1 py-2 sm:px-2 lg:px-3 lg:py-3"
            prefetch={false}
          >
            <ContentSdkImage
              field={props.fields?.Logo}
              className="h-14 w-auto max-w-[min(100%,300px)] object-contain sm:h-16 sm:max-w-[min(100%,380px)] lg:h-20 lg:max-w-[min(100%,460px)]"
            />
          </Link>

          <ul className="flex min-h-[3.5rem] list-none flex-row items-center justify-end gap-0 p-0 lg:min-h-[4.5rem]">
            <li className="hidden items-center px-2 lg:flex">
              <DemoUserSwitcher />
            </li>
            <li className="hidden lg:block">
              <ContentSdkLink field={fields?.SupportLink} prefetch={false} className={navLinkClass} />
            </li>
            <li className="mr-auto lg:mr-0">
              {params.showSearchBox ? (
                <SearchBox searchLink={fields?.SearchLink} />
              ) : (
                <ContentSdkLink field={fields?.SearchLink} prefetch={false} className={navLinkClass} />
              )}
            </li>
            <MobileMenuWrapper>
              <div className="flex h-full w-full flex-col">
                <div className="flex flex-1 items-center justify-center">
                  <ul className="flex w-full flex-col bg-background text-center">
                    <AppPlaceholder
                      name={`header-navigation-${params?.DynamicPlaceholderId}`}
                      rendering={props.rendering}
                      page={props.page}
                      componentMap={componentMap}
                    />
                  </ul>
                </div>
                <div className="w-full">
                  <hr className="w-full border-border" />
                  <ul className="text-center">
                    <li>
                      <ContentSdkLink field={fields?.SupportLink} prefetch={false} className={navLinkClass} />
                    </li>
                  </ul>
                </div>
              </div>
            </MobileMenuWrapper>
            <li>
              {params.showMiniCart ? (
                <MiniCart cartLink={fields?.CartLink} />
              ) : (
                <ContentSdkLink
                  field={fields?.CartLink}
                  prefetch={false}
                  className="block p-4 text-secondary-foreground"
                >
                  <FontAwesomeIcon icon={faShoppingCart} width={24} height={24} />
                </ContentSdkLink>
              )}
            </li>
          </ul>
          </div>
        </div>

        {/* Row 2: full-bleed bar (e.g. dark reverse theme); nav content aligned with row 1 */}
        <div
          className={cn(
            'hidden w-full min-w-0 border-t border-border/30 lg:block',
            isReverseTheme
              ? 'bg-primary text-primary-foreground [&_a]:!text-primary-foreground [&_button]:!text-primary-foreground [&_a:hover]:opacity-90 [&_button:hover]:opacity-90'
              : 'bg-transparent'
          )}
          data-header-st-nav-row={isReverseTheme ? 'reverse' : undefined}
        >
          <div className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8">
            <ul
              className={cn(
                'm-0 flex list-none flex-row items-center justify-start gap-0 p-0 text-left [.partial-editing-mode_&]:!flex-col',
                'min-h-0 py-1 lg:min-h-[3rem] lg:py-2'
              )}
            >
              <AppPlaceholder
                name={`header-navigation-${params?.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
