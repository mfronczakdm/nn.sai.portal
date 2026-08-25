'use client';

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
import { Search } from 'lucide-react';
import { MiniCart } from './non-sitecore/MiniCart';
import { HeaderPreviewSearch } from './non-sitecore/HeaderPreviewSearch';
import { ComponentProps } from 'lib/component-props';
import { MobileMenuWrapper } from './MobileMenuWrapper';
import { HeaderSTAuthControls, useHeaderSTNavigationVisibility } from './HeaderSTAuthControls';
import { cn } from '@/lib/utils';

type ComponentMap = typeof import('.sitecore/component-map').default;

let cachedComponentMap: ComponentMap | undefined;

function getComponentMap(): ComponentMap {
  if (!cachedComponentMap) {
    // Defer loading the map until render time to avoid a circular import with HeaderST exports.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- break HeaderST <-> component-map cycle
    cachedComponentMap = require('.sitecore/component-map').default as ComponentMap;
  }
  return cachedComponentMap;
}
interface Fields {
  Logo: ImageField;
  SupportLink: LinkField;
  SearchLink: LinkField;
  CartLink: LinkField;
  LoginLink?: LinkField;
}

type HeaderSTProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

type HeaderSTViewProps = HeaderSTProps & {
  requireAuthForNav: boolean;
};

/** Top header row sits on light bg-background; secondary-foreground is white in PKM theme. */
const navLinkClass =
  'block p-4 font-[family-name:var(--font-body)] text-foreground font-normal hover:text-primary';

const LOGIN_REQUIRED_VARIANT_ID = '197f5333-48ff-42cf-8357-b49796219679';

function isTruthyParam(value: string | undefined): boolean {
  if (value == null || typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/** Headless variant can surface as params.FieldNames (name or variant definition GUID). */
function isLoginRequiredVariant(props: HeaderSTProps): boolean {
  const fieldNames =
    props.params?.FieldNames ??
    (props.rendering as { params?: { FieldNames?: string } } | undefined)?.params?.FieldNames;
  if (fieldNames == null || typeof fieldNames !== 'string') {
    return false;
  }
  const normalized = fieldNames.replace(/[{}]/g, '').trim().toLowerCase();
  return normalized === 'loginrequired' || normalized === LOGIN_REQUIRED_VARIANT_ID;
}

function resolveRequireAuthForNav(props: HeaderSTProps, fromLoginRequiredExport: boolean): boolean {
  if (fromLoginRequiredExport) {
    return true;
  }
  return (
    isLoginRequiredVariant(props) ||
    isTruthyParam(props.params?.RequireAuthForNav) ||
    isTruthyParam(props.params?.requireAuthForNav)
  );
}
/** Sitecore checkbox / string params for rendering parameter ReverseTheme */
function isReverseThemeParam(value: string | undefined): boolean {
  if (value == null || typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'reversetheme';
}

const HeaderSTView = (props: HeaderSTViewProps) => {
  const { fields, params, requireAuthForNav } = props;
  const isReverseTheme = isReverseThemeParam(params?.ReverseTheme);
  const showNavigation = useHeaderSTNavigationVisibility(requireAuthForNav);
  const componentMap = getComponentMap();

  return (
    <section
      className={cn(
        // relative: SearchBox/MiniCart panels use lg:absolute and must span this full-width header
        'relative sticky top-0 z-30 w-full min-w-0 border-b border-border/30 bg-background shadow-sm',
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
              <li className="hidden lg:block">
                <ContentSdkLink field={fields?.SupportLink} prefetch={false} className={navLinkClass} />
              </li>
              <li className="mr-auto flex min-w-0 flex-1 justify-end lg:mr-0 lg:justify-center lg:px-4">
                {params.showSearchBox ? (
                  <HeaderPreviewSearch searchLink={fields?.SearchLink} />
                ) : (
                  <ContentSdkLink field={fields?.SearchLink} prefetch={false} className={navLinkClass} />
                )}
              </li>
              <HeaderSTAuthControls
                loginLink={fields?.LoginLink}
                postLogoutRedirect={params?.postLogoutRedirect}
              />
              {showNavigation ? (
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
                          <ContentSdkLink
                            field={fields?.SupportLink}
                            prefetch={false}
                            className={navLinkClass}
                          />
                        </li>
                      </ul>
                    </div>
                  </div>
                </MobileMenuWrapper>
              ) : null}
              {!isTruthyParam(params?.HideCart) ? (
              <li>
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
              </li>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Row 2: full-bleed bar (e.g. dark reverse theme); nav content aligned with row 1 */}
        {showNavigation ? (
          <div
            className={cn(
              'hidden w-full min-w-0 border-t border-border/30 lg:block',
              isReverseTheme ? 'bg-primary' : 'bg-transparent'
            )}
            data-header-st-nav-row={isReverseTheme ? 'reverse' : undefined}
          >
            <div className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8">
              <ul
                className={cn(
                  'm-0 flex list-none flex-row items-center justify-start gap-0 p-0 text-left [.partial-editing-mode_&]:!flex-col',
                  'min-h-0 py-1 lg:min-h-[3rem] lg:py-2',
                  isReverseTheme &&
                    'text-primary-foreground [&>li>a]:!text-primary-foreground [&>li>a:hover]:opacity-90'
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
        ) : null}
      </div>
    </section>
  );
};

export const Default = (props: HeaderSTProps) => (
  <HeaderSTView {...props} requireAuthForNav={resolveRequireAuthForNav(props, false)} />
);

export const LoginRequired = (props: HeaderSTProps) => (
  <HeaderSTView {...props} requireAuthForNav={resolveRequireAuthForNav(props, true)} />
);

const version1UtilityLinkClass =
  'block px-3 py-2 font-[family-name:var(--font-body)] text-xs font-normal text-background/90 hover:text-background';

/* Version1 — inverted two-row header: utilities on top, MENU + search + logo-right below. */
const HeaderSTVersion1View = (props: HeaderSTViewProps) => {
  const { fields, params, requireAuthForNav } = props;
  const showNavigation = useHeaderSTNavigationVisibility(requireAuthForNav);
  const componentMap = getComponentMap();
  const hideCart = isTruthyParam(params?.HideCart);

  return (
    <section
      className={cn(
        'relative sticky top-0 z-30 w-full min-w-0 bg-foreground text-background shadow-sm',
        params?.styles
      )}
      data-class-change
      data-header-st-layout="version1"
    >
      <div className="flex w-full min-w-0 flex-col" role="navigation" aria-label="Site header">
        <div className="w-full min-w-0 border-b border-background/10 bg-black/25">
          <div className="mx-auto flex w-full max-w-[100rem] items-center justify-end gap-4 px-4 py-1 sm:px-6 lg:px-8">
            <ul className="flex list-none flex-row items-center justify-end gap-1 p-0">
              <li className="hidden lg:block">
                <ContentSdkLink
                  field={fields?.SupportLink}
                  prefetch={false}
                  className={version1UtilityLinkClass}
                />
              </li>
              <HeaderSTAuthControls
                loginLink={fields?.LoginLink}
                postLogoutRedirect={params?.postLogoutRedirect}
                linkClassName="p-2 text-background/90 hover:text-background hover:opacity-100"
              />
              {!hideCart ? (
                <li>
                  {params.showMiniCart ? (
                    <MiniCart cartLink={fields?.CartLink} />
                  ) : (
                    <ContentSdkLink
                      field={fields?.CartLink}
                      prefetch={false}
                      className="block p-2 text-background hover:opacity-80"
                    >
                      <FontAwesomeIcon icon={faShoppingCart} width={20} height={20} />
                    </ContentSdkLink>
                  )}
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="w-full min-w-0">
          <ul className="mx-auto flex w-full max-w-[100rem] list-none items-stretch p-0">
            {showNavigation ? (
              <MobileMenuWrapper
                alwaysVisible
                label="MENU"
                buttonClassName="bg-black/20 text-background hover:bg-black/30"
                panelClassName="top-[7.25rem] h-[calc(100vh-7.25rem)]"
              >
                <div className="flex h-full w-full flex-col">
                  <div className="flex flex-1 items-center justify-center">
                    <ul className="flex w-full flex-col bg-background text-center text-foreground">
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
                        <ContentSdkLink
                          field={fields?.SupportLink}
                          prefetch={false}
                          className={navLinkClass}
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </MobileMenuWrapper>
            ) : null}

            <li className="flex min-w-0 flex-1 items-center px-4 sm:px-6">
              {params.showSearchBox ? (
                <HeaderPreviewSearch
                  searchLink={fields?.SearchLink}
                  appearance="bar"
                  className="w-full min-w-0"
                />
              ) : (
                <ContentSdkLink
                  field={fields?.SearchLink}
                  prefetch={false}
                  className="block py-3 text-sm uppercase tracking-[0.28em] text-background/50 hover:text-background/80"
                />
              )}
            </li>

            <li className="flex shrink-0 self-stretch">
              <Link
                href="/"
                className="relative z-10 flex items-center justify-center px-4 py-3 sm:px-6 lg:px-8"
                prefetch={false}
              >
                <ContentSdkImage
                  field={props.fields?.Logo}
                  className="h-10 w-auto max-w-[min(100%,220px)] object-contain object-right sm:h-12 sm:max-w-[min(100%,280px)] lg:h-14 lg:max-w-[min(100%,320px)]"
                />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export const Version1 = (props: HeaderSTProps) => (
  <HeaderSTVersion1View {...props} requireAuthForNav={resolveRequireAuthForNav(props, false)} />
);

const version2NavLinkClass =
  'block px-3 py-2 font-[family-name:var(--font-body)] text-sm font-semibold text-foreground hover:text-primary';

/* Version2 — dark utility row; white main row with logo left, inline nav, search icon. */
const HeaderSTVersion2View = (props: HeaderSTViewProps) => {
  const { fields, params, requireAuthForNav } = props;
  const showNavigation = useHeaderSTNavigationVisibility(requireAuthForNav);
  const componentMap = getComponentMap();
  const hideCart = isTruthyParam(params?.HideCart);

  const searchControl = params.showSearchBox ? (
    <HeaderPreviewSearch searchLink={fields?.SearchLink} className="min-w-0" />
  ) : (
    <ContentSdkLink
      field={fields?.SearchLink}
      prefetch={false}
      className="flex h-10 w-10 items-center justify-center bg-muted text-foreground hover:bg-muted/80"
    >
      <Search className="h-5 w-5" strokeWidth={2} aria-hidden />
      <span className="sr-only">{fields?.SearchLink?.value?.text || 'Search'}</span>
    </ContentSdkLink>
  );

  return (
    <section
      className={cn(
        'relative sticky top-0 z-30 w-full min-w-0 border-b border-border/30 bg-background shadow-sm',
        params?.styles
      )}
      data-class-change
      data-header-st-layout="version2"
    >
      <div className="flex w-full min-w-0 flex-col" role="navigation" aria-label="Site header">
        <div className="w-full min-w-0 bg-foreground text-background">
          <div className="mx-auto flex w-full max-w-[100rem] items-center justify-end gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <ul className="flex list-none flex-row items-center justify-end gap-2 p-0">
              <li className="hidden lg:block">
                <ContentSdkLink
                  field={fields?.SupportLink}
                  prefetch={false}
                  className="inline-flex items-center rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:opacity-90"
                />
              </li>
              <HeaderSTAuthControls
                loginLink={fields?.LoginLink}
                postLogoutRedirect={params?.postLogoutRedirect}
                linkAppearance="text"
                linkClassName="px-2 py-1 text-sm font-medium text-background hover:text-background/80 hover:opacity-100"
              />
              {!hideCart ? (
                <li>
                  {params.showMiniCart ? (
                    <MiniCart cartLink={fields?.CartLink} />
                  ) : (
                    <ContentSdkLink
                      field={fields?.CartLink}
                      prefetch={false}
                      className="block p-2 text-background hover:opacity-80"
                    >
                      <FontAwesomeIcon icon={faShoppingCart} width={20} height={20} />
                    </ContentSdkLink>
                  )}
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="w-full min-w-0 bg-background">
          <div className="mx-auto flex w-full max-w-[100rem] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-8">
            <Link
              href="/"
              className="relative z-10 flex shrink-0 items-center self-stretch"
              prefetch={false}
            >
              <ContentSdkImage
                field={props.fields?.Logo}
                className="h-10 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-12 sm:max-w-[min(100%,280px)] lg:h-[3.25rem] lg:max-w-[min(100%,320px)]"
              />
            </Link>

            {showNavigation ? (
              <ul
                className={cn(
                  'm-0 hidden min-w-0 flex-1 list-none flex-row items-center justify-end gap-1 p-0 text-left lg:flex',
                  '[.partial-editing-mode_&]:!flex [.partial-editing-mode_&]:!flex-col'
                )}
              >
                <AppPlaceholder
                  name={`header-navigation-${params?.DynamicPlaceholderId}`}
                  rendering={props.rendering}
                  page={props.page}
                  componentMap={componentMap}
                />
              </ul>
            ) : (
              <div className="hidden min-w-0 flex-1 lg:block" />
            )}

            <ul className="ml-auto flex list-none flex-row items-center gap-2 p-0 lg:ml-0">
              <li>{searchControl}</li>
              {showNavigation ? (
                <MobileMenuWrapper panelClassName="top-[6.75rem] h-[calc(100vh-6.75rem)]">
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
                          <ContentSdkLink
                            field={fields?.SupportLink}
                            prefetch={false}
                            className={version2NavLinkClass}
                          />
                        </li>
                      </ul>
                    </div>
                  </div>
                </MobileMenuWrapper>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Version2 = (props: HeaderSTProps) => (
  <HeaderSTVersion2View {...props} requireAuthForNav={resolveRequireAuthForNav(props, false)} />
);

const version3UtilityLinkClass =
  'block px-2 py-1 font-[family-name:var(--font-body)] text-xs font-medium text-primary hover:underline';

const version3NavLinkClass =
  'block px-3 py-1.5 font-[family-name:var(--font-body)] text-sm font-semibold text-foreground hover:text-primary';

/* Version3 — single white bar; logo left; two stacked nav rows; muted search bar right. */
const HeaderSTVersion3View = (props: HeaderSTViewProps) => {
  const { fields, params, requireAuthForNav } = props;
  const showNavigation = useHeaderSTNavigationVisibility(requireAuthForNav);
  const componentMap = getComponentMap();
  const hideCart = isTruthyParam(params?.HideCart);
  const isReverseTheme = isReverseThemeParam(params?.ReverseTheme);

  const searchControl = params.showSearchBox ? (
    <HeaderPreviewSearch
      searchLink={fields?.SearchLink}
      appearance="contained"
      className="min-w-0"
    />
  ) : (
    <ContentSdkLink
      field={fields?.SearchLink}
      prefetch={false}
      className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:text-primary"
    >
      <Search className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span>{fields?.SearchLink?.value?.text || 'Search'}</span>
    </ContentSdkLink>
  );

  return (
    <section
      className={cn(
        'relative sticky top-0 z-30 w-full min-w-0 border-b border-border/30 bg-background shadow-sm',
        params?.styles
      )}
      data-class-change
      data-header-st-layout="version3"
    >
      <div className="flex w-full min-w-0 flex-col" role="navigation" aria-label="Site header">
        <div className="w-full min-w-0 bg-background">
          <div className="mx-auto flex w-full max-w-[100rem] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-8">
            <Link
              href="/"
              className="relative z-10 flex shrink-0 items-center self-stretch"
              prefetch={false}
            >
              <ContentSdkImage
                field={props.fields?.Logo}
                className="h-11 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-12 sm:max-w-[min(100%,280px)] lg:h-14 lg:max-w-[min(100%,320px)]"
              />
            </Link>

            <div className="ml-auto flex min-w-0 items-center gap-3 lg:gap-6">
              {showNavigation ? (
                <div className="hidden min-w-0 flex-col items-end justify-center gap-1 lg:flex">
                  <ul className="m-0 flex list-none flex-row items-center justify-end gap-3 p-0">
                    <li>
                      <ContentSdkLink
                        field={fields?.SupportLink}
                        prefetch={false}
                        className={version3UtilityLinkClass}
                      />
                    </li>
                    <HeaderSTAuthControls
                      loginLink={fields?.LoginLink}
                      postLogoutRedirect={params?.postLogoutRedirect}
                      linkAppearance="text"
                      className="hidden lg:block"
                      linkClassName="p-0 text-xs font-medium text-primary hover:underline hover:opacity-100"
                    />
                  </ul>
                  <ul
                    className={cn(
                      'm-0 flex list-none flex-row items-center justify-end gap-1 p-0 text-left',
                      '[.partial-editing-mode_&]:!flex-col',
                      isReverseTheme &&
                        'rounded-md bg-primary px-2 text-primary-foreground [&>li>a]:!text-primary-foreground [&>li>a:hover]:opacity-90'
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
              ) : null}

              <ul className="flex list-none flex-row items-center gap-2 p-0">
                <li className="flex items-center">{searchControl}</li>
                {!hideCart ? (
                  <li>
                    {params.showMiniCart ? (
                      <MiniCart cartLink={fields?.CartLink} />
                    ) : (
                      <ContentSdkLink
                        field={fields?.CartLink}
                        prefetch={false}
                        className="block p-2 text-foreground hover:text-primary"
                      >
                        <FontAwesomeIcon icon={faShoppingCart} width={20} height={20} />
                      </ContentSdkLink>
                    )}
                  </li>
                ) : null}
                {showNavigation ? (
                  <MobileMenuWrapper panelClassName="top-[5.5rem] h-[calc(100vh-5.5rem)]">
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
                            <ContentSdkLink
                              field={fields?.SupportLink}
                              prefetch={false}
                              className={version3NavLinkClass}
                            />
                          </li>
                        </ul>
                      </div>
                    </div>
                  </MobileMenuWrapper>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Version3 = (props: HeaderSTProps) => (
  <HeaderSTVersion3View {...props} requireAuthForNav={resolveRequireAuthForNav(props, false)} />
);
