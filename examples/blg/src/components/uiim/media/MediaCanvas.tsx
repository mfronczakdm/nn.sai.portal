'use client';

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Field,
  Image as SitecoreImage,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  NextImage as ContentSdkImage,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { withResolvedImageSrc } from '@/lib/sitecore-image-field';
import type { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';

type JsonField<T> = { jsonValue?: T };

type MediaCanvasItem = {
  id?: string;
  image?: JsonField<ImageField>;
  video?: JsonField<LinkField>;
  tagline?: JsonField<Field<string>>;
};

type MediaCanvasDatasource = {
  title?: JsonField<Field<string>>;
  subtitle?: JsonField<Field<string>>;
  cta?: JsonField<LinkField>;
  pauseVideoLabel?: JsonField<Field<string>>;
  playVideoLabel?: JsonField<Field<string>>;
  children?: {
    results?: MediaCanvasItem[];
  };
};

export type MediaCanvasProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: MediaCanvasDatasource | null;
    };
  };
  isPageEditing?: boolean;
};

type CollageSlot = {
  top: string;
  left: string;
  width: string;
  zIndex: number;
};

/**
 * Stable collage slots (desktop). Index maps deterministically — no Math.random.
 * First five leave the center free for the headline.
 */
const COLLAGE_SLOTS: CollageSlot[] = [
  { top: '5%', left: '3%', width: '15%', zIndex: 2 },
  { top: '5%', left: '82%', width: '15%', zIndex: 2 },
  { top: '58%', left: '81%', width: '15%', zIndex: 2 },
  { top: '58%', left: '3%', width: '15%', zIndex: 2 },
  { top: '68%', left: '42%', width: '14%', zIndex: 1 },
  { top: '34%', left: '2%', width: '12%', zIndex: 1 },
  { top: '34%', left: '86%', width: '12%', zIndex: 1 },
  { top: '18%', left: '20%', width: '11%', zIndex: 1 },
];

const SLIDE_INTERVAL_MS = 7000;
const CROSSFADE_MS = 1800;

function fieldString(field?: JsonField<Field<string>> | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function linkHref(field?: JsonField<LinkField> | null): string {
  const value = field?.jsonValue?.value;
  const href = value?.href || value?.url;
  return typeof href === 'string' ? href.trim() : '';
}

function hasCta(field?: JsonField<LinkField> | null): boolean {
  const href = linkHref(field);
  return Boolean(href && href !== 'http://');
}

export function uniqueCollageSlot(index: number): CollageSlot {
  return COLLAGE_SLOTS[index % COLLAGE_SLOTS.length];
}

function itemImageField(item: MediaCanvasItem) {
  return withResolvedImageSrc(item.image) ?? item.image?.jsonValue;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  return prefersReducedMotion;
}

const MediaCanvasEmpty: React.FC = () => (
  <div className="border-border bg-muted/20 text-muted-foreground rounded-2xl border border-dashed px-6 py-12 text-center text-sm">
    Add media tiles to this canvas.
  </div>
);

const EMPTY_IMAGE_FIELD: ImageField = { value: {} };

function MediaTile({
  item,
  videosPaused,
  videoRef,
  slot,
  isEditing = false,
}: {
  item: MediaCanvasItem;
  videosPaused: boolean;
  videoRef: (el: HTMLVideoElement | null) => void;
  slot: CollageSlot;
  isEditing?: boolean;
}) {
  const imageField = itemImageField(item) ?? EMPTY_IMAGE_FIELD;
  const videoUrl = linkHref(item.video);
  const hasImage = Boolean(imageField?.value?.src);
  const tagline = fieldString(item.tagline);
  const showVideo = Boolean(videoUrl) && !isEditing;

  return (
    <article
      data-item-id={isEditing ? item.id : undefined}
      className={cn(
        'group absolute aspect-square hidden rounded-sm bg-muted shadow-sm md:block',
        isEditing ? 'pointer-events-auto overflow-visible' : 'pointer-events-none overflow-hidden'
      )}
      style={{
        top: slot.top,
        left: slot.left,
        width: slot.width,
        zIndex: isEditing ? Math.max(slot.zIndex, 10) : slot.zIndex,
      }}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={videoUrl}
          muted
          loop
          playsInline
          autoPlay={!videosPaused}
          poster={imageField?.value?.src}
        />
      ) : hasImage || isEditing ? (
        isEditing ? (
          <SitecoreImage
            field={imageField}
            className="pointer-events-auto relative z-10 h-full w-full object-cover"
          />
        ) : (
          <ContentSdkImage field={imageField} className="h-full w-full object-cover" />
        )
      ) : null}
      {(tagline || isEditing) && (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 px-2 py-1',
            isEditing ? 'pointer-events-auto bg-dark/80' : 'bg-dark/70'
          )}
        >
          <Text
            field={item.tagline?.jsonValue ?? { value: '' }}
            tag="p"
            className="text-xs text-white"
          />
        </div>
      )}
    </article>
  );
}

function MediaTileStacked({
  item,
  videosPaused,
  isEditing = false,
}: {
  item: MediaCanvasItem;
  videosPaused: boolean;
  isEditing?: boolean;
}) {
  const imageField = itemImageField(item) ?? EMPTY_IMAGE_FIELD;
  const videoUrl = linkHref(item.video);
  const hasImage = Boolean(imageField?.value?.src);
  const tagline = fieldString(item.tagline);
  const showVideo = Boolean(videoUrl) && !isEditing;

  return (
    <article
      data-item-id={isEditing ? item.id : undefined}
      className={cn(
        'group relative aspect-square rounded-sm bg-muted shadow-sm',
        isEditing ? 'overflow-visible' : 'overflow-hidden'
      )}
    >
      {showVideo ? (
        <video
          className="h-full w-full object-cover"
          src={videoUrl}
          muted
          loop
          playsInline
          autoPlay={!videosPaused}
          poster={imageField?.value?.src}
        />
      ) : hasImage || isEditing ? (
        isEditing ? (
          <SitecoreImage
            field={imageField}
            className="pointer-events-auto relative z-10 h-full w-full object-cover"
          />
        ) : (
          <ContentSdkImage field={imageField} className="h-full w-full object-cover" />
        )
      ) : null}
      {(tagline || isEditing) && (
        <div className={cn('absolute inset-x-0 bottom-0 px-2 py-1', isEditing ? 'bg-dark/80' : 'bg-dark/70')}>
          <Text
            field={item.tagline?.jsonValue ?? { value: '' }}
            tag="p"
            className="text-xs text-white"
          />
        </div>
      )}
    </article>
  );
}

function SearchOverlay({
  datasource,
  isEditing,
}: {
  datasource: MediaCanvasDatasource;
  isEditing: boolean;
}) {
  const searchHref = linkHref(datasource.cta) || '/Search Results';
  const title = fieldString(datasource.title);
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (isEditing) {
      event.preventDefault();
      return;
    }
    if (!query.trim()) return;
    const url = new URL(searchHref, window.location.origin);
    url.searchParams.set('q', query.trim());
    window.location.assign(url.pathname + url.search);
    event.preventDefault();
  };

  return (
    <form
      action={searchHref}
      method="get"
      onSubmit={handleSubmit}
      className="relative z-20 mx-auto flex w-full max-w-xl flex-col items-center px-6 text-center"
      role="search"
    >
      {(title || isEditing) && (
        <Text
          field={datasource.title?.jsonValue ?? { value: '' }}
          tag="h1"
          className="font-serif text-[clamp(1.75rem,4vw,3.25rem)] font-normal italic leading-tight tracking-tight text-white"
        />
      )}
      <div className="mt-4 flex w-full max-w-lg items-end gap-3">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="media-canvas-search" className="sr-only">
            {title || 'Search'}
          </label>
          <input
            id="media-canvas-search"
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            className="w-full border-0 border-b border-white bg-transparent px-0 py-2 text-base text-white caret-white outline-none ring-0 placeholder:text-white/70 focus-visible:border-white"
          />
        </div>
        <button
          type="submit"
          className="inline-flex size-10 shrink-0 items-center justify-center bg-white text-[var(--color-primary)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Search"
        >
          <Search className="size-5" strokeWidth={2} />
        </button>
      </div>
      {isEditing && (
        <div className="mt-6">
          <ContentSdkLink
            field={datasource.cta?.jsonValue ?? { value: { href: '' } }}
            className="text-sm text-white underline underline-offset-4"
          />
        </div>
      )}
    </form>
  );
}

function CarouselSlide({
  item,
  isActive,
  isEditing,
  reducedMotion,
}: {
  item: MediaCanvasItem;
  isActive: boolean;
  isEditing: boolean;
  reducedMotion: boolean;
}) {
  const imageField = itemImageField(item) ?? EMPTY_IMAGE_FIELD;
  const videoUrl = linkHref(item.video);
  const hasImage = Boolean(imageField?.value?.src);
  const showVideo = Boolean(videoUrl) && !isEditing;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && !reducedMotion) {
      void video.play();
    } else {
      video.pause();
    }
  }, [isActive, reducedMotion]);

  return (
    <div
      data-item-id={isEditing ? item.id : undefined}
      className={cn(
        'absolute inset-0',
        reducedMotion ? (isActive ? 'opacity-100' : 'hidden') : 'transition-opacity ease-in-out',
        !reducedMotion && (isActive ? 'opacity-100' : 'opacity-0')
      )}
      style={reducedMotion ? undefined : { transitionDuration: `${CROSSFADE_MS}ms` }}
      aria-hidden={!isActive}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          muted
          loop
          playsInline
          autoPlay={isActive && !reducedMotion}
          poster={imageField?.value?.src}
        />
      ) : hasImage || isEditing ? (
        isEditing ? (
          <SitecoreImage field={imageField} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <ContentSdkImage field={imageField} className="absolute inset-0 h-full w-full object-cover" />
        )
      ) : (
        <div className="bg-dark absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

const MediaCanvasDefault: React.FC<MediaCanvasProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = Boolean(
    props.isPageEditing || page?.mode?.isEditing || page?.mode?.isDesignLibrary
  );
  const datasource = fields?.data?.datasource;
  const [videosPaused, setVideosPaused] = useState(false);
  const videoEls = useRef<HTMLVideoElement[]>([]);

  const items = datasource?.children?.results ?? [];
  const hasVideos = useMemo(() => items.some((item) => Boolean(linkHref(item.video))), [items]);

  if (!datasource) {
    return <NoDataFallback componentName="MediaCanvas" />;
  }

  const pauseLabel = fieldString(datasource.pauseVideoLabel) || 'Pause video';
  const playLabel = fieldString(datasource.playVideoLabel) || 'Play video';

  const handleToggleVideos = () => {
    const nextPaused = !videosPaused;
    setVideosPaused(nextPaused);
    videoEls.current.forEach((video) => {
      if (!video) return;
      if (nextPaused) {
        video.pause();
      } else {
        void video.play();
      }
    });
  };

  const assignVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
    if (el) {
      videoEls.current[index] = el;
    }
  };

  return (
    <section
      className={cn(
        'relative isolate min-h-[70vh] w-full bg-background px-4 py-16 md:min-h-[85vh] md:py-24',
        isEditing ? 'overflow-visible' : 'overflow-hidden',
        params?.styles
      )}
      id={params?.RenderingIdentifier}
    >
      {items.length === 0 && isEditing ? <MediaCanvasEmpty /> : null}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {items.map((item, index) => (
          <MediaTile
            key={item.id || `media-tile-${index}`}
            item={item}
            videosPaused={videosPaused}
            videoRef={assignVideoRef(index)}
            slot={uniqueCollageSlot(index)}
            isEditing={isEditing}
          />
        ))}
      </div>
      <div className="mx-auto mb-8 grid max-w-5xl grid-cols-2 gap-3 md:hidden">
        {items.map((item, index) => (
          <MediaTileStacked
            key={`mobile-${item.id || index}`}
            item={item}
            videosPaused={videosPaused}
            isEditing={isEditing}
          />
        ))}
      </div>

      <div className="relative z-20 mx-auto flex max-w-3xl flex-col items-center text-center">
        <div>
          {(fieldString(datasource.title) || isEditing) && (
            <Text
              field={datasource.title?.jsonValue}
              tag="h1"
              className="font-serif text-4xl font-normal tracking-tight text-primary md:text-6xl lg:text-7xl"
            />
          )}
          {(fieldString(datasource.subtitle) || isEditing) && (
            <Text
              field={datasource.subtitle?.jsonValue}
              tag="p"
              className="text-muted-foreground mt-4 max-w-xl text-base md:text-lg"
            />
          )}
          {(hasCta(datasource.cta) || isEditing) && (
            <div className="mt-6">
              <Button asChild variant="link" className="text-primary">
                <ContentSdkLink field={datasource.cta?.jsonValue ?? { value: { href: '' } }} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {(hasVideos || isEditing) && (
        <div
          className={cn(
            'relative z-20 mt-10 flex justify-end',
            !isEditing && 'md:absolute md:bottom-8 md:right-8 md:mt-0'
          )}
        >
          <button
            type="button"
            onClick={handleToggleVideos}
            className="text-primary text-sm underline underline-offset-4"
            aria-pressed={videosPaused}
          >
            {isEditing ? (
              <span className="flex flex-col items-end gap-1">
                <Text field={datasource.pauseVideoLabel?.jsonValue} tag="span" />
                <Text field={datasource.playVideoLabel?.jsonValue} tag="span" />
              </span>
            ) : (
              <span>{videosPaused ? playLabel : pauseLabel}</span>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

/* Carousel variant — BLG homepage hero: full-bleed morphing media + search overlay */
const MediaCanvasCarousel: React.FC<MediaCanvasProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = Boolean(
    props.isPageEditing || page?.mode?.isEditing || page?.mode?.isDesignLibrary
  );
  const datasource = fields?.data?.datasource;
  const items = datasource?.children?.results ?? [];
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isEditing || prefersReducedMotion || items.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isEditing, items.length, prefersReducedMotion]);

  if (!datasource) {
    return <NoDataFallback componentName="MediaCanvas" />;
  }

  const visibleIndex = prefersReducedMotion || isEditing ? 0 : activeIndex;

  return (
    <section
      className={cn(
        'relative isolate w-full bg-dark text-white',
        isEditing ? 'min-h-[70vh] overflow-visible' : 'h-[100svh] min-h-[32rem] overflow-hidden',
        params?.styles
      )}
      id={params?.RenderingIdentifier}
      aria-roledescription="carousel"
    >
      <div className="absolute inset-0">
        {items.length === 0 ? (
          <div className="bg-dark h-full w-full" />
        ) : (
          items.map((item, index) => (
            <CarouselSlide
              key={item.id || `media-slide-${index}`}
              item={item}
              isActive={index === visibleIndex}
              isEditing={isEditing}
              reducedMotion={prefersReducedMotion || isEditing}
            />
          ))
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-[var(--color-overlay)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--color-dark)]"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-20 flex h-full min-h-[inherit] items-center justify-center">
        <SearchOverlay datasource={datasource} isEditing={isEditing} />
      </div>

      {isEditing && (
        <div className="relative z-20 mx-auto grid max-w-5xl grid-cols-2 gap-3 px-4 pb-10 md:grid-cols-3">
          {items.length === 0 ? <MediaCanvasEmpty /> : null}
          {items.map((item, index) => (
            <MediaTileStacked
              key={`edit-${item.id || index}`}
              item={item}
              videosPaused
              isEditing
            />
          ))}
        </div>
      )}
    </section>
  );
};

export const Default: React.FC<MediaCanvasProps> = (props) => {
  const { page } = useSitecore();
  return (
    <MediaCanvasDefault
      {...props}
      isPageEditing={Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary)}
    />
  );
};

export const Carousel: React.FC<MediaCanvasProps> = (props) => {
  const { page } = useSitecore();
  return (
    <MediaCanvasCarousel
      {...props}
      isPageEditing={Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary)}
    />
  );
};
