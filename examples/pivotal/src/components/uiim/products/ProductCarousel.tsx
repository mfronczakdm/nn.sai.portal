'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  RichText as ContentSdkRichText,
  Text,
  useSitecore,
  type RichTextField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';
import { ArrowRight, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import NextImage from 'next/image';
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { extractImageSrc } from '@/lib/sitecore-image-field';
import { shouldBypassOptimizer } from '@/lib/sitecore-image-loader';
import { NoDataFallback } from '@/utils/NoDataFallback';

import type {
  ProductCarouselProductItem,
  ProductCarouselProps,
} from './product-carousel.props';

type CarouselVariant = 'default' | 'productStrip';

function textValue(field?: { value?: unknown } | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function gqlText(field?: { jsonValue?: TextField } | null): string {
  return textValue(field?.jsonValue);
}

function isChecked(field?: { jsonValue?: { value?: unknown } } | null): boolean {
  const value = field?.jsonValue?.value;
  return value === true || value === '1' || value === 'true';
}

function richPlainText(field?: RichTextField | null): string {
  if (!field?.value) return '';
  return String(field.value).replace(/<[^>]*>/g, '').trim();
}

function productHref(product: ProductCarouselProductItem): string {
  const fromUrl = product.url?.path?.trim();
  if (fromUrl) return fromUrl.startsWith('/') ? fromUrl : `/${fromUrl}`;
  const fromPath = product.path?.trim();
  if (!fromPath) return '#';
  const homeMatch = fromPath.match(/\/Home(\/.*)?$/i);
  if (homeMatch?.[1]) return homeMatch[1];
  if (homeMatch) return '/';
  return fromPath.startsWith('/') ? fromPath : `/${fromPath}`;
}

function productTitleField(product: ProductCarouselProductItem): TextField | undefined {
  const productName = product.productName?.jsonValue;
  if (textValue(productName)) return productName;
  const header = product.pageHeaderTitle?.jsonValue;
  if (textValue(header)) return header;
  const title = product.pageTitle?.jsonValue;
  if (textValue(title)) return title;
  if (product.name) return { value: product.name };
  return undefined;
}

function productImageSrc(product: ProductCarouselProductItem): string {
  return (
    extractImageSrc(product.imageUrl?.jsonValue) ||
    textValue(product.imageUrl?.jsonValue) ||
    extractImageSrc(product.imageSecondaryUrl?.jsonValue) ||
    textValue(product.imageSecondaryUrl?.jsonValue)
  );
}

function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <NextImage
      src={src}
      alt={alt}
      width={320}
      height={240}
      className={className}
      unoptimized={shouldBypassOptimizer(src)}
    />
  );
}

function DotPagination({
  count,
  selectedIndex,
  onSelect,
  tone = 'onLight',
}: {
  count: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  tone?: 'onLight' | 'onDark';
}) {
  if (count <= 1) return null;
  const onDark = tone === 'onDark';
  return (
    <div
      className="mt-8 flex items-center justify-center gap-2.5"
      role="tablist"
      aria-label="Product carousel pages"
    >
      {Array.from({ length: count }).map((_, index) => {
        const selected = index === selectedIndex;
        return (
          <button
            key={`dot-${index}`}
            type="button"
            role="tab"
            aria-label={`Go to page ${index + 1}`}
            aria-selected={selected}
            onClick={() => onSelect(index)}
            className={cn(
              'h-2.5 w-2.5 rounded-full border transition-colors',
              onDark
                ? selected
                  ? 'border-white bg-white'
                  : 'border-white/70 bg-transparent hover:bg-white/40'
                : selected
                  ? 'border-foreground bg-foreground'
                  : 'border-muted-foreground/50 bg-transparent hover:bg-muted-foreground/40'
            )}
          />
        );
      })}
    </div>
  );
}

function HighlightsCard({
  product,
  ctaLabelField,
  isEditing,
}: {
  product: ProductCarouselProductItem;
  ctaLabelField?: TextField;
  isEditing: boolean;
}) {
  const titleField = productTitleField(product);
  const titleText = textValue(titleField) || product.name || 'Product';
  const categoryField = product.categoryLabel?.jsonValue;
  const descriptionField = product.description?.jsonValue;
  const imageSrc = productImageSrc(product);
  const href = productHref(product);
  const ctaText = textValue(ctaLabelField) || 'Learn More';

  return (
    <article className="bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-2xl border border-border shadow-sm">
      <div className="bg-muted/20 flex aspect-[4/3] items-center justify-center p-4">
        {imageSrc ? (
          <ProductImage
            src={imageSrc}
            alt={titleText}
            className="h-full max-h-40 w-full object-contain"
          />
        ) : (
          <div className="text-muted-foreground text-xs uppercase tracking-widest">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-4 text-center">
        {(gqlText(product.categoryLabel) || isEditing) && categoryField && (
          <Text
            tag="p"
            field={categoryField}
            className="text-muted-foreground mb-2 text-xs font-medium tracking-[0.14em] uppercase"
          />
        )}
        {(titleText || isEditing) && titleField && (
          <Text
            tag="h3"
            field={titleField}
            className="font-heading text-foreground text-lg font-semibold tracking-tight"
          />
        )}
        {(richPlainText(descriptionField) || isEditing) && descriptionField && (
          <div className="text-muted-foreground mt-3 line-clamp-4 text-sm leading-relaxed">
            <ContentSdkRichText field={descriptionField} />
          </div>
        )}
        <div className="mt-auto w-full pt-6">
          <Link
            href={href}
            className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex w-full items-center justify-center px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase transition-colors"
            prefetch={false}
          >
            {ctaLabelField ? <Text field={ctaLabelField} /> : ctaText}
          </Link>
        </div>
      </div>
    </article>
  );
}

function StripCard({
  product,
  ctaLabelField,
  showOptionsHint,
  isEditing,
}: {
  product: ProductCarouselProductItem;
  ctaLabelField?: TextField;
  showOptionsHint: boolean;
  isEditing: boolean;
}) {
  const titleField = productTitleField(product);
  const titleText = textValue(titleField) || product.name || 'Product';
  const imageSrc = productImageSrc(product);
  const href = productHref(product);
  const ctaText = textValue(ctaLabelField) || 'More Information';

  return (
    <article className="flex h-full flex-col items-center px-2 text-center">
      <div className="flex aspect-[4/3] w-full items-center justify-center">
        {imageSrc ? (
          <ProductImage
            src={imageSrc}
            alt={titleText}
            className="h-full max-h-44 w-full object-contain"
          />
        ) : (
          <div className="text-muted-foreground text-xs uppercase tracking-widest">No image</div>
        )}
      </div>
      {(titleText || isEditing) && titleField && (
        <Text
          tag="h3"
          field={titleField}
          className="font-heading text-primary mt-4 text-base font-semibold leading-snug tracking-tight md:text-lg"
        />
      )}
      {showOptionsHint && (
        <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs">
          <Info className="size-3.5 shrink-0" aria-hidden />
          <span>More options available</span>
        </p>
      )}
      <div className="mt-auto w-full pt-5">
        <Link
          href={href}
          className="bg-dark text-dark-foreground hover:bg-dark-hover inline-flex w-full items-center justify-center px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase transition-colors"
          prefetch={false}
        >
          {ctaLabelField ? <Text field={ctaLabelField} /> : ctaText}
        </Link>
      </div>
    </article>
  );
}

const ProductCarouselEmpty: React.FC = () => (
  <div className="bg-muted text-muted-foreground flex w-full items-center justify-center p-10">
    <p className="text-sm uppercase tracking-widest">Select products for this carousel</p>
  </div>
);

const ProductCarouselBase: React.FC<ProductCarouselProps & { variant: CarouselVariant }> = ({
  fields,
  params,
  variant,
  isPageEditing: propEditing,
}) => {
  const { page } = useSitecore();
  const isEditing = propEditing ?? page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  const products = datasource?.products?.targetItems ?? [];
  const titleField = datasource?.title?.jsonValue;
  const ctaLabelField = datasource?.ctaLabel?.jsonValue;
  const backgroundUrl = gqlText(datasource?.backgroundImageUrl);
  const showOptionsHint = isChecked(datasource?.showOptionsHint);
  const isDefault = variant === 'default';

  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnapCount, setScrollSnapCount] = useState(0);

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
    setScrollSnapCount(embla.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onSelect]);

  const id = params?.RenderingIdentifier;
  const styles = cn(
    'component product-carousel relative w-full',
    isDefault ? 'product-carousel--highlights' : 'product-carousel--product-strip',
    params?.styles
  );

  if (!datasource) {
    return <NoDataFallback componentName="ProductCarousel" />;
  }

  if (!products.length && !isEditing) {
    return <ProductCarouselEmpty />;
  }

  return (
    <section
      id={id}
      data-component="ProductCarousel"
      data-variant={variant}
      className={styles}
      aria-roledescription="carousel"
      aria-label={gqlText(datasource.title) || 'Product carousel'}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          isDefault ? 'py-12 md:py-16' : 'bg-background py-10 md:py-14'
        )}
      >
        {isDefault && backgroundUrl && (
          <>
            <div
              className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundUrl})`,
                filter: 'blur(8px)',
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[var(--color-overlay)]"
              aria-hidden
            />
          </>
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {(gqlText(datasource.title) || isEditing) && titleField && (
            <Text
              tag="h2"
              field={titleField}
              className={cn(
                'font-heading mb-8 text-center text-2xl font-semibold tracking-tight md:mb-10 md:text-3xl',
                isDefault && backgroundUrl ? 'text-white' : 'text-foreground'
              )}
            />
          )}

          {!isDefault && (
            <div className="border-border mb-8 border-b md:mb-10" aria-hidden />
          )}

          <div className="relative px-10 md:px-12">
            <Carousel
              setApi={setApi}
              opts={{
                align: 'start',
                loop: false,
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {products.map((product, index) => (
                  <CarouselItem
                    key={product.id || `product-${index}`}
                    className={cn(
                      'pl-4 md:pl-6',
                      isDefault
                        ? 'basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4'
                        : 'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
                    )}
                  >
                    {isDefault ? (
                      <HighlightsCard
                        product={product}
                        ctaLabelField={ctaLabelField}
                        isEditing={Boolean(isEditing)}
                      />
                    ) : (
                      <StripCard
                        product={product}
                        ctaLabelField={ctaLabelField}
                        showOptionsHint={showOptionsHint}
                        isEditing={Boolean(isEditing)}
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {scrollSnapCount > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous products"
                  disabled={selectedIndex <= 0}
                  onClick={() => api?.scrollPrev()}
                  className={cn(
                    'absolute top-1/2 left-0 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border transition-colors disabled:opacity-40',
                    isDefault && backgroundUrl
                      ? 'border-white/40 bg-white/80 text-foreground hover:bg-white'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  )}
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next products"
                  disabled={selectedIndex >= scrollSnapCount - 1}
                  onClick={() => api?.scrollNext()}
                  className={cn(
                    'absolute top-1/2 right-0 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border transition-colors disabled:opacity-40',
                    isDefault && backgroundUrl
                      ? 'border-white/40 bg-white/80 text-foreground hover:bg-white'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  )}
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
          </div>

          {isDefault && (
            <DotPagination
              count={scrollSnapCount}
              selectedIndex={selectedIndex}
              onSelect={(index) => api?.scrollTo(index)}
              tone={backgroundUrl ? 'onDark' : 'onLight'}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export const Default: React.FC<ProductCarouselProps> = (props) => (
  <ProductCarouselBase {...props} variant="default" />
);

export const ProductStrip: React.FC<ProductCarouselProps> = (props) => (
  <ProductCarouselBase {...props} variant="productStrip" />
);

function SpotlightCard({
  product,
  ctaLabelField,
  isEditing,
}: {
  product: ProductCarouselProductItem;
  ctaLabelField?: TextField;
  isEditing: boolean;
}) {
  const titleField = productTitleField(product);
  const titleText = textValue(titleField) || product.name || 'Product';
  const categoryField = product.categoryLabel?.jsonValue;
  const descriptionField = product.description?.jsonValue;
  const imageSrc = productImageSrc(product);
  const href = productHref(product);
  const ctaText = textValue(ctaLabelField) || 'View product';

  return (
    <article className="group bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <Link
        href={href}
        prefetch={false}
        className="bg-muted/30 relative block aspect-[5/4] overflow-hidden"
        aria-label={titleText}
      >
        {imageSrc ? (
          <ProductImage
            src={imageSrc}
            alt={titleText}
            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs uppercase tracking-widest">
            No image
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent"
          aria-hidden
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        {(gqlText(product.categoryLabel) || isEditing) && categoryField && (
          <Text
            tag="span"
            field={categoryField}
            className="bg-primary/10 text-primary inline-flex w-fit rounded-full px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] uppercase"
          />
        )}

        {(titleText || isEditing) && titleField && (
          <Text
            tag="h3"
            field={titleField}
            className="font-heading text-foreground line-clamp-2 text-lg font-semibold tracking-tight md:text-xl"
          />
        )}

        {(richPlainText(descriptionField) || isEditing) && descriptionField && (
          <div className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            <ContentSdkRichText field={descriptionField} />
          </div>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={href}
            prefetch={false}
            className="text-primary hover:text-primary-hover inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            {ctaLabelField ? <Text field={ctaLabelField} /> : ctaText}
            <ArrowRight
              className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CarouselNavButtons({
  canScrollPrev,
  canScrollNext,
  onPrev,
  onNext,
  className,
}: {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        aria-label="Previous products"
        disabled={!canScrollPrev}
        onClick={onPrev}
        className="border-border bg-background text-foreground hover:bg-muted flex size-10 items-center justify-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Next products"
        disabled={!canScrollNext}
        onClick={onNext}
        className="border-border bg-background text-foreground hover:bg-muted flex size-10 items-center justify-center rounded-full border shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}

/** Editorial product rail — peek carousel, category pills, inline CTA, scroll progress. */
export const Spotlight: React.FC<ProductCarouselProps> = ({
  fields,
  params,
  isPageEditing: propEditing,
}) => {
  const { page } = useSitecore();
  const isEditing = propEditing ?? page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  const products = datasource?.products?.targetItems ?? [];
  const titleField = datasource?.title?.jsonValue;
  const ctaLabelField = datasource?.ctaLabel?.jsonValue;

  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnapCount, setScrollSnapCount] = useState(0);

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
    setScrollSnapCount(embla.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onSelect]);

  const id = params?.RenderingIdentifier;
  const canScrollPrev = selectedIndex > 0;
  const canScrollNext = scrollSnapCount > 0 && selectedIndex < scrollSnapCount - 1;
  const progress =
    scrollSnapCount > 1 ? ((selectedIndex + 1) / scrollSnapCount) * 100 : 100;

  if (!datasource) {
    return <NoDataFallback componentName="ProductCarousel" />;
  }

  if (!products.length && !isEditing) {
    return <ProductCarouselEmpty />;
  }

  return (
    <section
      id={id}
      data-component="ProductCarousel"
      data-variant="spotlight"
      className={cn('component product-carousel product-carousel--spotlight relative w-full', params?.styles)}
      aria-roledescription="carousel"
      aria-label={gqlText(datasource.title) || 'Product carousel'}
    >
      <div className="from-muted/40 to-background relative overflow-hidden bg-gradient-to-b py-12 md:py-16">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {(gqlText(datasource.title) || isEditing) && titleField && (
                <Text
                  tag="h2"
                  field={titleField}
                  className="font-heading text-foreground text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl"
                />
              )}
            </div>

            {scrollSnapCount > 1 && (
              <CarouselNavButtons
                canScrollPrev={canScrollPrev}
                canScrollNext={canScrollNext}
                onPrev={() => api?.scrollPrev()}
                onNext={() => api?.scrollNext()}
                className="hidden shrink-0 md:flex"
              />
            )}
          </div>

          <Carousel
            setApi={setApi}
            opts={{
              align: 'start',
              loop: false,
              slidesToScroll: 1,
              containScroll: 'trimSnaps',
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {products.map((product, index) => (
                <CarouselItem
                  key={product.id || `product-${index}`}
                  className="basis-[85%] pl-4 sm:basis-[55%] md:basis-[42%] md:pl-6 lg:basis-[32%] xl:basis-[28%]"
                >
                  <SpotlightCard
                    product={product}
                    ctaLabelField={ctaLabelField}
                    isEditing={Boolean(isEditing)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {scrollSnapCount > 1 && (
            <>
              <CarouselNavButtons
                canScrollPrev={canScrollPrev}
                canScrollNext={canScrollNext}
                onPrev={() => api?.scrollPrev()}
                onNext={() => api?.scrollNext()}
                className="mt-6 justify-center md:hidden"
              />

              <div className="mt-6 md:mt-8">
                <div
                  className="bg-muted h-1 w-full overflow-hidden rounded-full"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  aria-label="Carousel progress"
                >
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-muted-foreground mt-2 text-center text-xs tabular-nums md:text-right">
                  {selectedIndex + 1} / {scrollSnapCount}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
