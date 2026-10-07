'use client';

import { useMemo, useState } from 'react';
import {
  Text as ContentSdkText,
  RichText as ContentSdkRichText,
  NextImage as ContentSdkImage,
  Image as ContentSdkEditableImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from 'shadcd/components/ui/carousel';
import { TrackedCtaLink } from '@/components/content-sdk/TrackedCtaLink';
import { withResolvedImageSrc } from '@/lib/sitecore-image-field';
import { IGQLImageField, IGQLLinkField, IGQLRichTextField, IGQLTextField } from 'types/igql';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

interface Fields {
  data: {
    datasource: {
      title?: IGQLTextField;
      description?: IGQLRichTextField;
      children: {
        results: SimplePromoFields[];
      };
    };
  };
}

interface SimplePromoFields {
  id: string;
  heading: IGQLTextField;
  description: IGQLRichTextField;
  slug?: IGQLTextField;
  Slug?: IGQLTextField;
  image: IGQLImageField;
  link: IGQLLinkField;
}

type MultiPromoProps = {
  params: { [key: string]: string };
  fields: Fields;
};

type PromoItemProps = SimplePromoFields & {
  isHorizontal?: boolean;
};

const parentBasedGridClasses =
  'grid lg:[.multipromo-2-3_&]:grid-cols-[2fr_3fr] lg:[.multipromo-3-2_&]:grid-cols-[3fr_2fr] lg:grid-cols-[1fr_1fr] gap-14';
const parentBasedGridItemClasses =
  '[.multipromo-centered_&]:items-center [.bg-gradient_&]:text-white items-start';

const getPromoSlugField = (promo: SimplePromoFields) =>
  promo.slug?.jsonValue ?? promo.Slug?.jsonValue;

const EMPTY_IMAGE_FIELD = { value: {} };

/** Pages: keep every child field in the DOM so chrome can select that datasource. */
const PromoChildEditor = ({ promo }: { promo: SimplePromoFields }) => {
  const { image, heading, description, link } = promo ?? {};
  const slugField = getPromoSlugField(promo);

  return (
    <article
      data-testid="multi-promo-child-editor"
      className="relative z-10 flex flex-col gap-4 overflow-visible rounded-2xl border border-border bg-white p-4 text-foreground shadow-sm"
    >
      <div className="relative min-h-[8rem] overflow-visible bg-neutral-200">
        <ContentSdkEditableImage
          field={withResolvedImageSrc(image) ?? EMPTY_IMAGE_FIELD}
          className="relative z-10 h-auto w-full object-cover"
        />
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium">Slug</p>
        <ContentSdkText field={slugField} />
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium">Heading</p>
        <h3 className="text-xl font-semibold">
          <ContentSdkText field={heading?.jsonValue} />
        </h3>
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium">Description</p>
        <ContentSdkRichText field={description?.jsonValue} />
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium">Link</p>
        <TrackedCtaLink field={link?.jsonValue ?? { value: { href: '' } }} className="btn btn-ghost" />
      </div>
    </article>
  );
};

const PromoItem = ({ isHorizontal, ...promo }: PromoItemProps) => {
  const { image, heading, description, link } = promo ?? {};
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary);

  if (isEditing) {
    return <PromoChildEditor promo={promo} />;
  }

  return (
    <div className={`grid gap-8 ${isHorizontal ? 'lg:grid-cols-[1fr_2fr]' : ''}`}>
      <ContentSdkImage
        field={withResolvedImageSrc(image)}
        className="w-full h-full aspect-square object-cover shadow-2xl"
      />
      <div>
        <h3 className="text-xl lg:text-2xl mb-2">
          <ContentSdkText field={heading?.jsonValue} />
        </h3>
        <p className="lg:text-lg mb-2">
          <ContentSdkRichText field={description?.jsonValue} />
        </p>
        <TrackedCtaLink field={link?.jsonValue} className="btn btn-ghost" />
      </div>
    </div>
  );
};

/** Default-variant card: McKinsey-style hover (white surface, dark text, blue chevron). */
const DefaultPromoCard = ({ promo }: { promo: SimplePromoFields }) => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary);
  const { image, heading, description, link } = promo ?? {};
  const linkField = link?.jsonValue;

  if (isEditing) {
    return <PromoChildEditor promo={promo} />;
  }

  const cardClassName = cn(
    'group flex h-full flex-col p-5 no-underline transition-colors duration-300',
    // White hover surface always uses dark type (McKinsey-style), independent of theme foreground
    'hover:bg-white hover:text-neutral-950'
  );

  const content = (
    <>
      <ContentSdkImage
        field={withResolvedImageSrc(image)}
        className="mb-5 aspect-[4/3] w-full object-cover"
      />
      <h3 className="mb-3 flex items-center gap-1 text-xl font-semibold lg:text-2xl">
        <ContentSdkText field={heading?.jsonValue} />
        <ChevronRight
          aria-hidden
          className="size-5 shrink-0 transition-colors duration-300 group-hover:text-primary"
        />
      </h3>
      <div className="text-sm leading-relaxed lg:text-base">
        <ContentSdkRichText field={description?.jsonValue} />
      </div>
    </>
  );

  if (linkField) {
    return (
      <TrackedCtaLink field={linkField} className={cardClassName}>
        {content}
      </TrackedCtaLink>
    );
  }

  return <div className={cardClassName}>{content}</div>;
};

export const Default = (props: MultiPromoProps) => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary);
  const datasource = useMemo(
    () => props.fields?.data?.datasource,
    [props.fields?.data?.datasource]
  );

  const promos = useMemo(
    () => datasource?.children?.results?.filter(Boolean) ?? [],
    [datasource?.children?.results]
  );

  if (props.fields) {
    return (
      <section className={`relative ${props.params?.styles || ''}`} data-class-change>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-2xl lg:text-5xl">
              <ContentSdkText field={datasource?.title?.jsonValue} />
            </h2>
            <div className="text-lg">
              <ContentSdkRichText field={datasource?.description?.jsonValue} />
            </div>
          </div>

          {promos.length > 0 && (
            isEditing ? (
              <div className="relative mt-12 grid gap-4">
                {promos.map((promo) => (
                  <PromoChildEditor key={promo.id} promo={promo} />
                ))}
              </div>
            ) : (
            <div className="relative mt-12 px-0 sm:px-12">
              <Carousel
                opts={{ align: 'start', loop: false }}
                className="w-full"
                data-testid="multi-promo-carousel"
              >
                <CarouselContent className="-ml-4">
                  {promos.map((promo) => (
                    <CarouselItem
                      key={promo.id}
                      className="basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
                      data-testid="multi-promo-carousel-item"
                    >
                      <DefaultPromoCard promo={promo} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  className="disabled:hidden left-0 h-10 w-10 border-0 bg-secondary text-secondary-foreground hover:bg-secondary-hover sm:left-2"
                  data-testid="multi-promo-carousel-prev"
                />
                <CarouselNext
                  className="disabled:hidden right-0 h-10 w-10 border-0 bg-secondary text-secondary-foreground hover:bg-secondary-hover sm:right-2"
                  data-testid="multi-promo-carousel-next"
                />
              </Carousel>
            </div>
            )
          )}
        </div>
      </section>
    );
  }
  return <NoDataFallback componentName="MultiPromo" />;
};

export const Stacked = (props: MultiPromoProps) => {
  const datasource = useMemo(
    () => props.fields?.data?.datasource,
    [props.fields?.data?.datasource]
  );

  if (props.fields) {
    return (
      <section
        className={`relative ${props.params?.styles || ''} overflow-hidden`}
        data-class-change
      >
        <span className="absolute top-1/3 left-1/3 [.multipromo-3-2_&]:-left-1/3 w-screen h-64 bg-primary opacity-50 blur-[400px] -rotate-15 [.multipromo-3-2_&]:rotate-15 z-0"></span>
        <div className="relative container mx-auto px-4 py-16 z-10">
          <div className={`${parentBasedGridClasses}`}>
            <div className="lg:[.multipromo-3-2_&]:col-start-1 lg:[.multipromo-2-3_&]:col-start-2 lg:col-start-2 [.multipromo-2-3_&]:text-right">
              <h2 className="mb-6 text-2xl lg:text-5xl">
                <ContentSdkText field={datasource?.title?.jsonValue} />
              </h2>
              <div className="text-lg">
                <ContentSdkRichText field={datasource?.description?.jsonValue} />
              </div>
            </div>
          </div>
          <div className={`${parentBasedGridClasses} ${parentBasedGridItemClasses} mt-30`}>
            {datasource?.children?.results?.filter(Boolean).map((promo) => {
              return (
                <div
                  key={promo?.id}
                  className="lg:odd:-mt-8 lg:[.multipromo-3-2_&]:even:-mt-8 lg:[.multipromo-3-2_&]:odd:mt-0"
                >
                  <PromoItem {...promo} />
                </div>
              );
            }) || null}
          </div>
        </div>
      </section>
    );
  }
  return <NoDataFallback componentName="MultiPromo" />;
};

export const SingleColumn = (props: MultiPromoProps) => {
  const datasource = useMemo(
    () => props.fields?.data?.datasource,
    [props.fields?.data?.datasource]
  );

  if (props.fields) {
    return (
      <section className={`relative ${props.params?.styles || ''}`} data-class-change>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mb-16">
            <h2 className="mb-6 text-2xl lg:text-5xl">
              <ContentSdkText field={datasource?.title?.jsonValue} />
            </h2>
            <div className="text-lg">
              <ContentSdkRichText field={datasource?.description?.jsonValue} />
            </div>
          </div>
          <div className="grid gap-14">
            {datasource?.children?.results?.filter(Boolean).map((promo) => {
              return <PromoItem key={promo?.id} {...promo} isHorizontal />;
            }) || null}
          </div>
        </div>
      </section>
    );
  }
  return <NoDataFallback componentName="MultiPromo" />;
};

const SideTabsPromoPanel = ({
  promo,
  tabId,
  panelId,
  isEditing,
}: {
  promo: SimplePromoFields;
  tabId: string;
  panelId: string;
  isEditing: boolean;
}) => {
  const { image, heading, description, link } = promo ?? {};
  const headingField = heading?.jsonValue;
  const descriptionField = description?.jsonValue;
  const imageField = withResolvedImageSrc(image);
  const linkField = link?.jsonValue;

  return (
    <>
      <div className="relative min-h-[280px] overflow-hidden bg-background sm:min-h-[360px] lg:min-h-[420px]">
        {(imageField?.value?.src || isEditing) && imageField && (
          <ContentSdkEditableImage
            field={imageField}
            className="h-full min-h-[280px] w-full object-cover object-center sm:min-h-[360px] lg:min-h-[420px]"
          />
        )}
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId}
        className="bg-primary text-primary-foreground relative flex min-h-[280px] flex-col justify-center px-6 py-8 sm:min-h-[360px] sm:px-10 lg:min-h-[420px] lg:px-12"
      >
        {(headingField?.value || isEditing) && headingField && (
          <h3 className="text-accent font-heading mb-4 text-pretty text-2xl leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            <ContentSdkText field={headingField} />
          </h3>
        )}
        {(descriptionField?.value || isEditing) && descriptionField && (
          <div className="font-body mb-6 max-w-prose text-base leading-relaxed text-white/95 sm:text-lg">
            <ContentSdkRichText field={descriptionField} />
          </div>
        )}
        {(linkField?.value?.href || isEditing) && linkField && (
          <TrackedCtaLink
            field={linkField}
            className="font-body inline-flex w-fit items-center border border-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
          />
        )}
      </div>
    </>
  );
};

export const SideTabs = (props: MultiPromoProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const promos = useMemo(
    () => props.fields?.data?.datasource?.children?.results?.filter(Boolean) ?? [],
    [props.fields?.data?.datasource?.children?.results]
  );

  if (props.fields) {
    return (
      <section
        className={cn('multi-promo-side-tabs relative w-full', props.params?.styles || '')}
        data-class-change
      >
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="border-border overflow-hidden rounded-none border shadow-sm lg:grid lg:grid-cols-[minmax(0,20fr)_minmax(0,3fr)]">
            <div className="min-w-0">
              {promos.map((promo, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={promo.id}
                    data-promo-panel
                    data-active={isActive}
                    hidden={!isActive}
                    className="grid grid-cols-1 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:items-stretch"
                  >
                    <SideTabsPromoPanel
                      promo={promo}
                      tabId={`multi-promo-side-tab-${promo.id}`}
                      panelId={`multi-promo-side-tab-panel-${promo.id}`}
                      isEditing={isEditing}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className="border-border flex flex-col border-t lg:border-t-0 lg:border-l"
              role="tablist"
              aria-label="Promotions"
            >
              {promos.map((promo, index) => {
                const isActive = index === activeIndex;
                const tabLabel = getPromoSlugField(promo);

                return (
                  <button
                    key={promo.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`multi-promo-side-tab-panel-${promo.id}`}
                    id={`multi-promo-side-tab-${promo.id}`}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'font-body relative flex min-h-[4.5rem] flex-1 items-center border-b border-border px-4 py-3 text-left text-sm font-semibold leading-snug transition-colors last:border-b-0 sm:px-5 sm:text-base',
                      isActive
                        ? 'bg-accent text-primary z-10'
                        : 'bg-background text-primary hover:bg-muted/40'
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="border-r-accent absolute left-0 top-1/2 hidden h-0 w-0 -translate-x-full -translate-y-1/2 border-y-[0.75rem] border-r-[0.75rem] border-y-transparent lg:block"
                      />
                    )}
                    {tabLabel ? (
                      <ContentSdkText field={tabLabel} />
                    ) : (
                      <span>{`Promotion ${index + 1}`}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <NoDataFallback componentName="MultiPromo" />;
};

const TopTabsPromoPanel = ({
  promo,
  tabId,
  panelId,
  isEditing,
  showImage = true,
}: {
  promo: SimplePromoFields;
  tabId: string;
  panelId: string;
  isEditing: boolean;
  showImage?: boolean;
}) => {
  const { image, heading, description, link } = promo ?? {};
  const headingField = heading?.jsonValue;
  const descriptionField = description?.jsonValue;
  const imageField = withResolvedImageSrc(image);
  const linkField = link?.jsonValue;

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      className="bg-background px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12"
    >
      {showImage && (imageField?.value?.src || isEditing) && imageField && (
        <div className="mb-8 overflow-hidden">
          <ContentSdkEditableImage
            field={imageField}
            className="h-auto max-h-[320px] w-full object-cover object-center"
          />
        </div>
      )}
      {(headingField?.value || isEditing) && headingField && (
        <h3 className="font-heading text-primary mb-6 text-pretty text-2xl leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          <ContentSdkText field={headingField} />
        </h3>
      )}
      {(descriptionField?.value || isEditing) && descriptionField && (
        <div className="font-body text-foreground max-w-prose text-base leading-relaxed sm:text-lg [&_p+p]:mt-4 [&_p]:mb-0 [&_strong]:font-semibold">
          <ContentSdkRichText field={descriptionField} />
        </div>
      )}
      {(linkField?.value?.href || isEditing) && linkField && (
        <div className="mt-8">
          <TrackedCtaLink
            field={linkField}
            className="font-body inline-flex w-fit items-center bg-primary px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover"
          />
        </div>
      )}
    </div>
  );
};

const TopTabsLayout = ({
  props,
  showImage,
  layoutClass,
}: {
  props: MultiPromoProps;
  showImage: boolean;
  layoutClass: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const promos = useMemo(
    () => props.fields?.data?.datasource?.children?.results?.filter(Boolean) ?? [],
    [props.fields?.data?.datasource?.children?.results]
  );

  if (props.fields) {
    return (
      <section
        className={cn(layoutClass, 'relative w-full', props.params?.styles || '')}
        data-class-change
      >
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="border-border overflow-hidden rounded-none border shadow-sm">
            <div
              className="border-border flex flex-wrap border-b"
              role="tablist"
              aria-label="Promotions"
            >
              {promos.map((promo, index) => {
                const isActive = index === activeIndex;
                const tabLabel = getPromoSlugField(promo);

                return (
                  <button
                    key={promo.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`multi-promo-top-tab-panel-${promo.id}`}
                    id={`multi-promo-top-tab-${promo.id}`}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'font-body relative flex min-h-[4.5rem] flex-1 items-center justify-center border-r border-border px-4 py-4 text-center text-xs font-bold uppercase leading-snug tracking-wide transition-colors last:border-r-0 sm:min-h-[5rem] sm:px-6 sm:text-sm',
                      isActive
                        ? 'bg-primary text-primary-foreground z-10 border-r-primary'
                        : 'bg-background text-primary hover:bg-muted/40'
                    )}
                  >
                    {tabLabel ? (
                      <ContentSdkText field={tabLabel} />
                    ) : (
                      <span>{`Promotion ${index + 1}`}</span>
                    )}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="border-t-primary absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-x-[0.65rem] border-t-[0.65rem] border-x-transparent"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="min-w-0">
              {promos.map((promo, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={promo.id}
                    data-promo-panel
                    data-active={isActive}
                    hidden={!isActive}
                  >
                    <TopTabsPromoPanel
                      promo={promo}
                      tabId={`multi-promo-top-tab-${promo.id}`}
                      panelId={`multi-promo-top-tab-panel-${promo.id}`}
                      isEditing={isEditing}
                      showImage={showImage}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <NoDataFallback componentName="MultiPromo" />;
};

export const TopTabs = (props: MultiPromoProps) =>
  TopTabsLayout({ props, showImage: true, layoutClass: 'multi-promo-top-tabs' });

export const TopTabsNoImage = (props: MultiPromoProps) =>
  TopTabsLayout({ props, showImage: false, layoutClass: 'multi-promo-top-tabs-no-image' });
