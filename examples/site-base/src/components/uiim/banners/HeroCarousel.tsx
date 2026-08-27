'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';

import { cn } from '@/lib/utils';
import { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { IGQLImageField, IGQLLinkField, IGQLTextField } from 'src/types/igql';

interface HeroCarouselSlideFields {
  id: string;
  slideName?: IGQLTextField;
  description?: IGQLTextField;
  summary?: IGQLTextField;
  image?: IGQLImageField;
  backgroundImage?: IGQLImageField;
  link?: IGQLLinkField;
  isIntroSlide?: IGQLTextField;
  imageOnLeft?: IGQLTextField;
}

interface HeroCarouselFields {
  data?: {
    datasource?: {
      contactLink?: IGQLLinkField;
      children?: {
        results?: HeroCarouselSlideFields[];
      };
    };
  };
}

export type HeroCarouselProps = ComponentProps & {
  fields?: HeroCarouselFields;
};

type CarouselVariant = 'default' | 'focusProduct' | 'splitPanel' | 'version1';

function isChecked(field?: IGQLTextField | null): boolean {
  const value = field?.jsonValue?.value as unknown;
  return value === true || value === '1' || value === 'true';
}

function hasImage(field?: IGQLImageField | null): boolean {
  const value = field?.jsonValue?.value as
    | string
    | { src?: string; href?: string; url?: string }
    | undefined;
  if (!value) return false;
  if (typeof value === 'string') {
    return /src=["'][^"']+["']/i.test(value) || /^https?:\/\//i.test(value.trim());
  }
  return Boolean(value.src || value.href || value.url);
}

function hasText(field?: IGQLTextField | null): boolean {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function hasLink(field?: IGQLLinkField | null): boolean {
  const value = field?.jsonValue?.value as { href?: string; text?: string; url?: string } | undefined;
  return Boolean(value?.href || value?.url || value?.text);
}

function resolveIsIntro(
  slide: HeroCarouselSlideFields,
  index: number,
  slides: HeroCarouselSlideFields[]
): boolean {
  if (isChecked(slide.isIntroSlide)) return true;
  const anyExplicitIntro = slides.some((item) => isChecked(item.isIntroSlide));
  return !anyExplicitIntro && index === 0;
}

function shouldShowImageField(
  field: IGQLImageField | undefined,
  isEditing: boolean | undefined
): boolean {
  return Boolean(field?.jsonValue) && (hasImage(field) || Boolean(isEditing));
}

const HEIGHT =
  'min-h-[24rem] md:min-h-[30rem] lg:min-h-[35rem]';

const HeroCarouselEmpty: React.FC = () => (
  <div
    className={cn(
      'bg-primary text-primary-foreground flex w-full items-center justify-center p-8',
      HEIGHT
    )}
  >
    <p className="text-sm uppercase tracking-widest opacity-80">Add hero carousel slides</p>
  </div>
);

function useHeroCarousel(slidesLength: number, isEditing: boolean | undefined) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion || !isPlaying || isFocused || slidesLength <= 1 || isEditing) {
      return;
    }
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesLength);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, isPlaying, isFocused, slidesLength, isEditing, currentSlide]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev + 1) % slidesLength);
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev - 1 + slidesLength) % slidesLength);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        setCurrentSlide(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        setCurrentSlide(slidesLength - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slidesLength]);

  const activeIndex = slidesLength ? Math.min(currentSlide, slidesLength - 1) : 0;

  return {
    carouselRef,
    activeIndex,
    setCurrentSlide,
    setIsFocused,
    setIsPlaying,
  };
}

const VerticalDots: React.FC<{
  slides: HeroCarouselSlideFields[];
  activeIndex: number;
  onSelect: (index: number) => void;
}> = ({ slides, activeIndex, onSelect }) => {
  if (!slides.length) return null;
  return (
    <div
      className="mt-auto mb-8 flex flex-col items-center gap-3"
      role="tablist"
      aria-label="Slide selection"
    >
      {slides.map((slide, index) => {
        const selected = index === activeIndex;
        return (
          <button
            key={`dot-${slide.id || index}`}
            type="button"
            role="tab"
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={selected}
            aria-controls={`hero-carousel-slide-${index}`}
            onClick={() => onSelect(index)}
            className={cn(
              'h-2.5 w-2.5 rounded-full border border-primary-foreground transition-colors',
              selected
                ? 'bg-primary-foreground'
                : 'bg-transparent hover:bg-primary-foreground/40'
            )}
          />
        );
      })}
    </div>
  );
};

const HorizontalDots: React.FC<{
  slides: HeroCarouselSlideFields[];
  activeIndex: number;
  onSelect: (index: number) => void;
  tone?: 'onDark' | 'onMixed';
}> = ({ slides, activeIndex, onSelect, tone = 'onDark' }) => {
  if (!slides.length) return null;
  const onMixed = tone === 'onMixed';
  return (
    <div
      className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2.5 px-4"
      role="tablist"
      aria-label="Slide selection"
    >
      {slides.map((slide, index) => {
        const selected = index === activeIndex;
        return (
          <button
            key={`dot-${slide.id || index}`}
            type="button"
            role="tab"
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={selected}
            aria-controls={`hero-carousel-slide-${index}`}
            onClick={() => onSelect(index)}
            className={cn(
              'h-2.5 w-2.5 rounded-full border transition-colors',
              onMixed
                ? selected
                  ? 'border-foreground bg-foreground'
                  : 'border-foreground/70 bg-transparent hover:bg-foreground/40'
                : selected
                  ? 'border-primary-foreground bg-primary-foreground'
                  : 'border-primary-foreground bg-transparent hover:bg-primary-foreground/50'
            )}
          />
        );
      })}
    </div>
  );
};

const HorizontalDashes: React.FC<{
  slides: HeroCarouselSlideFields[];
  activeIndex: number;
  onSelect: (index: number) => void;
}> = ({ slides, activeIndex, onSelect }) => {
  if (!slides.length) return null;
  return (
    <div
      className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-3 px-4"
      role="tablist"
      aria-label="Slide selection"
    >
      {slides.map((slide, index) => {
        const selected = index === activeIndex;
        return (
          <button
            key={`dash-${slide.id || index}`}
            type="button"
            role="tab"
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={selected}
            aria-controls={`hero-carousel-slide-${index}`}
            onClick={() => onSelect(index)}
            className={cn(
              'h-0.5 rounded-none border-0 transition-all',
              selected
                ? 'w-10 bg-primary-foreground'
                : 'w-6 bg-primary-foreground/50 hover:bg-primary-foreground/80'
            )}
          />
        );
      })}
    </div>
  );
};

/* Version1 — Amkor: full-bleed photo, right-aligned white headline, navy CTA, dash ticks */
const Version1Slide: React.FC<{
  slide: HeroCarouselSlideFields;
  index: number;
  slides: HeroCarouselSlideFields[];
  isActive: boolean;
  isEditing: boolean | undefined;
}> = ({ slide, index, slides, isActive, isEditing }) => {
  const imageField = slide.image?.jsonValue;
  const backgroundField = slide.backgroundImage?.jsonValue;
  const fullBleed = shouldShowImageField(slide.image, isEditing)
    ? imageField
    : shouldShowImageField(slide.backgroundImage, isEditing)
      ? backgroundField
      : undefined;

  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-700',
        isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
      )}
      aria-hidden={!isActive}
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${slides.length}`}
      role="group"
      id={`hero-carousel-slide-${index}`}
    >
      <div className="absolute inset-0 bg-primary">
        {fullBleed && <ContentSdkImage field={fullBleed} className="h-full w-full object-cover" />}
        <div
          className="pointer-events-none absolute inset-0 bg-[var(--color-overlay)]"
          aria-hidden="true"
        />
      </div>

      <div
        className={cn(
          'relative z-10 flex h-full items-center justify-end px-6 py-12 md:px-12 lg:px-20',
          HEIGHT
        )}
      >
        <div className="pointer-events-auto max-w-xl text-right text-primary-foreground">
          {(hasText(slide.slideName) || isEditing) && (
            <h2
              className="text-3xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-[56px]"
              style={{ fontFamily: 'var(--brand-heading-font)' }}
            >
              <Text field={slide.slideName?.jsonValue} />
            </h2>
          )}
          {(hasText(slide.description) || isEditing) && (
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/90 md:text-lg">
              <Text field={slide.description?.jsonValue} />
            </p>
          )}
          {(hasLink(slide.link) || isEditing) && slide.link?.jsonValue && (
            <div className="mt-8 flex justify-end">
              <ContentSdkLink
                field={slide.link.jsonValue}
                className="inline-flex items-center bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary-hover"
                prefetch={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DefaultSlide: React.FC<{
  slide: HeroCarouselSlideFields;
  index: number;
  slides: HeroCarouselSlideFields[];
  isActive: boolean;
  isEditing: boolean | undefined;
}> = ({ slide, index, slides, isActive, isEditing }) => {
  const intro = resolveIsIntro(slide, index, slides);
  const imageField = slide.image?.jsonValue;
  const backgroundField = slide.backgroundImage?.jsonValue;
  // Default: full-bleed uses Image; BackgroundImage is a fallback when Image is empty.
  const fullBleed = shouldShowImageField(slide.image, isEditing)
    ? imageField
    : shouldShowImageField(slide.backgroundImage, isEditing)
      ? backgroundField
      : undefined;
  const showFullBleed = !intro && Boolean(fullBleed);

  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-700',
        isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
      )}
      aria-hidden={!isActive}
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${slides.length}`}
      role="group"
      id={`hero-carousel-slide-${index}`}
    >
      <div className={cn('absolute inset-0', intro ? 'bg-primary' : 'bg-muted')}>
        {intro && (
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 70%, black) 0%, transparent 42%, transparent 58%, color-mix(in oklab, var(--color-primary) 55%, black) 100%)',
              clipPath:
                'polygon(0 0, 18% 0, 0 55%, 0 100%, 22% 100%, 0 40%, 100% 100%, 100% 60%, 78% 100%, 100% 100%, 100% 0, 82% 0, 100% 45%)',
            }}
            aria-hidden="true"
          />
        )}
        {showFullBleed && fullBleed && (
          <ContentSdkImage field={fullBleed} className="h-full w-full object-cover" />
        )}
      </div>

      {intro && (
        <div
          className={cn(
            'relative z-10 flex h-full items-center justify-center px-6 py-12 pr-16 text-center text-primary-foreground md:py-14 md:pr-20',
            HEIGHT
          )}
        >
          <div className="mx-auto max-w-4xl">
            {(hasText(slide.slideName) || isEditing) && (
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                <Text field={slide.slideName?.jsonValue} />
              </h1>
            )}
            {(hasText(slide.description) || isEditing) && (
              <p className="mt-3 text-lg font-light md:mt-4 md:text-2xl">
                <Text field={slide.description?.jsonValue} />
              </p>
            )}
            {(hasText(slide.summary) || isEditing) && (
              <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] md:mt-10 md:text-sm">
                <Text field={slide.summary?.jsonValue} />
              </p>
            )}
          </div>
        </div>
      )}

      {!intro && (
        <div
          className={cn(
            'pointer-events-none relative z-10 flex h-full items-stretch px-4 py-8 pr-16 md:px-8 md:py-10 md:pr-20 lg:px-12',
            HEIGHT
          )}
        >
          <div className="pointer-events-auto bg-primary text-primary-foreground flex w-full max-w-md flex-col justify-between p-8 shadow-none md:max-w-lg md:p-10 lg:max-w-xl">
            <div>
              {(hasText(slide.slideName) || isEditing) && (
                <h2 className="text-2xl font-semibold uppercase tracking-wide md:text-3xl lg:text-4xl">
                  <Text field={slide.slideName?.jsonValue} />
                </h2>
              )}
              {(hasText(slide.description) || isEditing) && (
                <p className="mt-6 text-sm leading-relaxed md:text-base">
                  <Text field={slide.description?.jsonValue} />
                </p>
              )}
              {(hasText(slide.summary) || isEditing) && (
                <p className="mt-4 text-xs uppercase tracking-widest opacity-90">
                  <Text field={slide.summary?.jsonValue} />
                </p>
              )}
            </div>
            {(hasLink(slide.link) || isEditing) && slide.link?.jsonValue && (
              <div className="mt-10">
                <ContentSdkLink
                  field={slide.link.jsonValue}
                  className="inline-flex items-center border border-primary-foreground px-5 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
                  prefetch={false}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FocusProductSlide: React.FC<{
  slide: HeroCarouselSlideFields;
  index: number;
  slides: HeroCarouselSlideFields[];
  isActive: boolean;
  isEditing: boolean | undefined;
}> = ({ slide, index, slides, isActive, isEditing }) => {
  const backgroundField = slide.backgroundImage?.jsonValue;
  const productField = slide.image?.jsonValue;
  const showBackground = shouldShowImageField(slide.backgroundImage, isEditing);
  const showProduct = shouldShowImageField(slide.image, isEditing);

  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-700',
        isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
      )}
      aria-hidden={!isActive}
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${slides.length}`}
      role="group"
      id={`hero-carousel-slide-${index}`}
    >
      {/* Theme-token backdrop: dark surface when no photo, otherwise BackgroundImage + readable overlay */}
      <div className="absolute inset-0 bg-dark">
        {showBackground && backgroundField && (
          <ContentSdkImage field={backgroundField} className="h-full w-full object-cover" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[var(--color-overlay)]" aria-hidden="true" />
      </div>

      <div
        className={cn(
          'relative z-10 grid h-full grid-cols-1 items-center gap-8 px-6 py-12 pb-14 md:grid-cols-2 md:gap-10 md:px-10 md:py-14 lg:px-16',
          HEIGHT
        )}
      >
        <div className="text-dark-foreground max-w-xl">
          {(hasText(slide.slideName) || isEditing) && (
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              <Text field={slide.slideName?.jsonValue} />
            </h2>
          )}
          {(hasText(slide.description) || isEditing) && (
            <p className="mt-4 text-base leading-relaxed text-dark-foreground/90 md:text-lg">
              <Text field={slide.description?.jsonValue} />
            </p>
          )}
          {(hasText(slide.summary) || isEditing) && (
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-dark-foreground/80">
              <Text field={slide.summary?.jsonValue} />
            </p>
          )}
          {(hasLink(slide.link) || isEditing) && slide.link?.jsonValue && (
            <div className="mt-8">
              <ContentSdkLink
                field={slide.link.jsonValue}
                className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
                prefetch={false}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center md:justify-end">
          {(showProduct || isEditing) && productField ? (
            <div className="w-full max-w-md lg:max-w-lg">
              <ContentSdkImage
                field={productField}
                className="mx-auto h-auto max-h-[16rem] w-full object-contain md:max-h-[20rem] lg:max-h-[24rem]"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const SplitPanelSlide: React.FC<{
  slide: HeroCarouselSlideFields;
  index: number;
  slides: HeroCarouselSlideFields[];
  isActive: boolean;
  isEditing: boolean | undefined;
}> = ({ slide, index, slides, isActive, isEditing }) => {
  const imageOnLeft = isChecked(slide.imageOnLeft);
  // SplitPanel: Image is the large split photo; BackgroundImage is fallback only.
  const splitImageField = shouldShowImageField(slide.image, isEditing)
    ? slide.image?.jsonValue
    : shouldShowImageField(slide.backgroundImage, isEditing)
      ? slide.backgroundImage?.jsonValue
      : undefined;
  const showSplitImage = Boolean(splitImageField);

  const contentPanel = (
    <div className="bg-background text-foreground flex h-full flex-col justify-center px-6 py-10 md:px-8 md:py-12 lg:px-10">
      {(hasText(slide.summary) || isEditing) && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">
          <Text field={slide.summary?.jsonValue} />
        </p>
      )}
      {(hasText(slide.slideName) || isEditing) && (
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
          <Text field={slide.slideName?.jsonValue} />
        </h2>
      )}
      {(hasText(slide.description) || isEditing) && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/85 md:text-base">
          <Text field={slide.description?.jsonValue} />
        </p>
      )}
      {(hasLink(slide.link) || isEditing) && slide.link?.jsonValue && (
        <div className="mt-8">
          <ContentSdkLink
            field={slide.link.jsonValue}
            className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
            prefetch={false}
          />
        </div>
      )}
    </div>
  );

  const imagePanel = (
    <div className="bg-muted relative h-full min-h-[14rem] md:min-h-0">
      {showSplitImage && splitImageField ? (
        <ContentSdkImage field={splitImageField} className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-700',
        isActive ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none'
      )}
      aria-hidden={!isActive}
      aria-roledescription="slide"
      aria-label={`Slide ${index + 1} of ${slides.length}`}
      role="group"
      id={`hero-carousel-slide-${index}`}
    >
      <div
        className={cn(
          'grid h-full grid-cols-1',
          HEIGHT,
          imageOnLeft
            ? 'md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'
            : 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]'
        )}
      >
        {imageOnLeft ? (
          <>
            {imagePanel}
            {contentPanel}
          </>
        ) : (
          <>
            {contentPanel}
            {imagePanel}
          </>
        )}
      </div>
    </div>
  );
};

const HeroCarouselBase: React.FC<HeroCarouselProps & { variant: CarouselVariant }> = ({
  fields,
  params,
  variant,
}) => {
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  const slides = datasource?.children?.results ?? [];
  const contactLink = datasource?.contactLink;

  const { carouselRef, activeIndex, setCurrentSlide, setIsFocused, setIsPlaying } = useHeroCarousel(
    slides.length,
    isEditing
  );

  const id = params?.RenderingIdentifier;
  const styles = cn(
    'component hero-carousel relative w-full',
    variant === 'focusProduct' && 'hero-carousel--focus-product',
    variant === 'splitPanel' && 'hero-carousel--split-panel',
    variant === 'version1' && 'hero-carousel--version1',
    params?.styles
  );

  if (!datasource) {
    return <NoDataFallback componentName="HeroCarousel" />;
  }

  if (!slides.length && !isEditing) {
    return <HeroCarouselEmpty />;
  }

  const activeSlide = slides[activeIndex];
  const isIntro =
    variant === 'default' && activeSlide
      ? resolveIsIntro(activeSlide, activeIndex, slides)
      : false;

  const renderSlide = (slide: HeroCarouselSlideFields, index: number) => {
    const shared = {
      slide,
      index,
      slides,
      isActive: index === activeIndex,
      isEditing,
    };
    if (variant === 'focusProduct') {
      return <FocusProductSlide key={slide.id || `slide-${index}`} {...shared} />;
    }
    if (variant === 'splitPanel') {
      return <SplitPanelSlide key={slide.id || `slide-${index}`} {...shared} />;
    }
    if (variant === 'version1') {
      return <Version1Slide key={slide.id || `slide-${index}`} {...shared} />;
    }
    return <DefaultSlide key={slide.id || `slide-${index}`} {...shared} />;
  };

  return (
    <section
      ref={carouselRef}
      id={id}
      className={styles}
      data-class-change
      aria-roledescription="carousel"
      aria-label="Hero carousel"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className={cn('relative w-full overflow-hidden', HEIGHT)}>
        {slides.map((slide, index) => renderSlide(slide, index))}

        {variant === 'default' && (
          <div className="absolute inset-y-0 right-0 z-20 flex w-12 flex-col items-center bg-primary/95 text-primary-foreground md:w-14">
            {(hasLink(contactLink) || isEditing) && contactLink?.jsonValue && (
              <ContentSdkLink
                field={contactLink.jsonValue}
                className="mt-4 flex h-40 w-full items-center justify-center bg-primary text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary-hover"
                prefetch={false}
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              />
            )}
            <VerticalDots
              slides={slides}
              activeIndex={activeIndex}
              onSelect={setCurrentSlide}
            />
          </div>
        )}

        {variant === 'focusProduct' && (
          <HorizontalDots
            slides={slides}
            activeIndex={activeIndex}
            onSelect={setCurrentSlide}
          />
        )}

        {variant === 'splitPanel' && (
          <HorizontalDots
            slides={slides}
            activeIndex={activeIndex}
            onSelect={setCurrentSlide}
            tone="onMixed"
          />
        )}

        {variant === 'version1' && (
          <HorizontalDashes
            slides={slides}
            activeIndex={activeIndex}
            onSelect={setCurrentSlide}
          />
        )}
      </div>

      <div className="sr-only" aria-live="polite">
        {variant === 'splitPanel'
          ? 'Split panel slide'
          : isIntro
            ? 'Brand introduction slide'
            : 'Product slide'}{' '}
        {activeIndex + 1} of {slides.length || 0}
      </div>
    </section>
  );
};

export const Default: React.FC<HeroCarouselProps> = (props) => (
  <HeroCarouselBase {...props} variant="default" />
);

export const FocusProduct: React.FC<HeroCarouselProps> = (props) => (
  <HeroCarouselBase {...props} variant="focusProduct" />
);

export const SplitPanel: React.FC<HeroCarouselProps> = (props) => (
  <HeroCarouselBase {...props} variant="splitPanel" />
);

export const Version1: React.FC<HeroCarouselProps> = (props) => (
  <HeroCarouselBase {...props} variant="version1" />
);
