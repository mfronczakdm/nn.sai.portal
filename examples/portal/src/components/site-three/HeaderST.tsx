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
import { SearchResults } from '@/components/search-results/SearchResults';

import { MiniCart } from './non-sitecore/MiniCart';
import { ComponentProps } from 'lib/component-props';
import componentMap from '.sitecore/component-map';
import { MobileMenuWrapper } from './MobileMenuWrapper';

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

export const Default = (props: HeaderSTProps) => {
  const { fields } = props;

  return (
    <section
      className={`sticky top-0 z-30 w-full border-b border-border/30 bg-background shadow-sm ${props.params?.styles ?? ''}`}
      data-class-change
    >
      <div className="mx-auto flex w-full max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <Link
          href="/"
          className="relative z-10 flex shrink-0 grow-0 items-center justify-center self-stretch px-1 py-2 sm:px-2 lg:px-3 lg:py-3"
          prefetch={false}
        >
          <ContentSdkImage
            field={props.fields?.Logo}
            className="h-14 w-auto object-contain sm:h-16 lg:h-20 max-w-[min(100%,300px)] sm:max-w-[min(100%,380px)] lg:max-w-[min(100%,460px)]"
          />
        </Link>

        <div
          className="relative flex min-h-[3.5rem] grow [.partial-editing-mode_&]:flex-col-reverse lg:min-h-[4.5rem] lg:max-w-7xl lg:flex-1 lg:items-center lg:justify-between lg:gap-10 lg:px-4"
          role="navigation"
        >
          <ul className="hidden lg:flex flex-row lg:[.partial-editing-mode_&]:!flex-col text-left">
            <AppPlaceholder
              name={`header-navigation-${props.params?.DynamicPlaceholderId}`}
              rendering={props.rendering}
              page={props.page}
              componentMap={componentMap}
            />
          </ul>
          <div className="basis-full lg:basis-auto lg:ml-auto">
            <ul className="flex">
              <li className="hidden lg:block">
                <ContentSdkLink
                  field={fields?.SupportLink}
                  prefetch={false}
                  className={navLinkClass}
                />
              </li>
              <li className="mr-auto lg:mr-0">
                {props.params.showSearchBox ? (
                  <SearchResults triggerClassName={navLinkClass} triggerLabel={fields?.SearchLink?.value?.text || 'Search'} />
                ) : (
                  <ContentSdkLink
                    field={fields?.SearchLink}
                    prefetch={false}
                    className={navLinkClass}
                  />
                )}
              </li>
              <MobileMenuWrapper>
                <div className="lg:hidden flex flex-col w-full h-full">
                  <div className="flex-1 flex items-center justify-center">
                    <ul className="flex flex-col text-center bg-background">
                      <AppPlaceholder
                        name={`header-navigation-${props.params?.DynamicPlaceholderId}`}
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
              <li>
                {props.params.showMiniCart ? (
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
      </div>
    </section>
  );
};
