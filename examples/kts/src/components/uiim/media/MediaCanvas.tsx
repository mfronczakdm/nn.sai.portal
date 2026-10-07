'use client';

import type React from 'react';
import { useMemo, useRef, useState } from 'react';
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
 * First five are non-overlapping corner/edge placements that leave the center free
 * for the headline. Extra slots stay clear of those five for larger lists.
 */
const COLLAGE_SLOTS: CollageSlot[] = [
  { top: '5%', left: '3%', width: '15%', zIndex: 2 }, // top-left
  { top: '5%', left: '82%', width: '15%', zIndex: 2 }, // top-right
  { top: '58%', left: '81%', width: '15%', zIndex: 2 }, // bottom-right
  { top: '58%', left: '3%', width: '15%', zIndex: 2 }, // bottom-left
  { top: '68%', left: '42%', width: '14%', zIndex: 1 }, // bottom-center
  { top: '34%', left: '2%', width: '12%', zIndex: 1 }, // mid-left
  { top: '34%', left: '86%', width: '12%', zIndex: 1 }, // mid-right
  { top: '18%', left: '20%', width: '11%', zIndex: 1 }, // upper inner-left
];

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

/** Unique collage slot per tile so hashed IDs cannot stack two items in one place. */
export function uniqueCollageSlot(index: number): CollageSlot {
  return COLLAGE_SLOTS[index % COLLAGE_SLOTS.length];
}

function itemImageField(item: MediaCanvasItem) {
  return withResolvedImageSrc(item.image) ?? item.image?.jsonValue;
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
        'group absolute aspect-square hidden rounded-sm bg-neutral-200 shadow-sm md:block',
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
            isEditing ? 'pointer-events-auto bg-black/55' : 'bg-black/45'
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
        'group relative aspect-square rounded-sm bg-neutral-200 shadow-sm',
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
        <div className={cn('absolute inset-x-0 bottom-0 px-2 py-1', isEditing ? 'bg-black/55' : 'bg-black/45')}>
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
  const hasVideos = useMemo(
    () => items.some((item) => Boolean(linkHref(item.video))),
    [items]
  );

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
        'relative isolate min-h-[70vh] w-full bg-white px-4 py-16 md:min-h-[85vh] md:py-24',
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

export const Default: React.FC<MediaCanvasProps> = (props) => {
  const { page } = useSitecore();
  return (
    <MediaCanvasDefault
      {...props}
      isPageEditing={Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary)}
    />
  );
};
