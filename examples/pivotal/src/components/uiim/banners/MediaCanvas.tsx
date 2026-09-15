import type { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { IGQLImageField, IGQLLinkField, IGQLTextField } from 'src/types/igql';

import {
  collageShapeClass,
  collageSlotClass,
  planCollageShapes,
  stableShuffle,
} from '@/lib/media-canvas-layout';

interface MediaCanvasItemFields {
  id: string;
  itemImage?: IGQLImageField;
}

interface MediaCanvasFields {
  data?: {
    datasource?: {
      canvasTitle?: IGQLTextField;
      canvasSubtitle?: IGQLTextField;
      primaryLink?: IGQLLinkField;
      children?: {
        results?: MediaCanvasItemFields[];
      };
    };
  };
}

export type MediaCanvasProps = ComponentProps & {
  fields?: MediaCanvasFields;
};

const MediaCanvasEmpty = (): JSX.Element => <NoDataFallback componentName="MediaCanvas" />;

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

function MediaCanvasCopy({
  fields,
  isEditing,
  collage,
}: {
  fields: NonNullable<MediaCanvasFields['data']>['datasource'];
  isEditing: boolean;
  collage: boolean;
}): JSX.Element {
  const title = fields?.canvasTitle;
  const subtitle = fields?.canvasSubtitle;
  const link = fields?.primaryLink;

  return (
    <div className={cn('flex flex-col justify-center', collage ? 'max-w-xl' : 'max-w-lg')}>
      {(hasText(title) || isEditing) && (
        <Text
          field={title?.jsonValue}
          tag="h2"
          className={cn(
            'text-3xl font-bold tracking-wide text-primary md:text-5xl lg:text-6xl',
            collage && 'uppercase'
          )}
        />
      )}
      {(hasText(subtitle) || isEditing) && (
        <Text
          field={subtitle?.jsonValue}
          tag="p"
          className="mt-4 text-base text-primary md:text-lg"
        />
      )}
      {(hasLink(link) || isEditing) && (
        <ContentSdkLink
          field={link?.jsonValue ?? { value: { href: '' } }}
          className="btn btn-primary mt-8 inline-flex w-fit rounded-none px-6 py-3 text-sm font-bold uppercase tracking-wide"
        />
      )}
    </div>
  );
}

function DefaultMedia({
  items,
  isEditing,
}: {
  items: MediaCanvasItemFields[];
  isEditing: boolean;
}): JSX.Element | null {
  const visible = items.filter((item) => hasImage(item.itemImage) || isEditing);
  if (!visible.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3" data-media-layout="grid">
      {visible.map((item) => (
        <div key={item.id} className="aspect-[4/3] overflow-hidden bg-muted">
          <ContentSdkImage
            field={item.itemImage?.jsonValue}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function OvalCollageMedia({
  items,
  isEditing,
}: {
  items: MediaCanvasItemFields[];
  isEditing: boolean;
}): JSX.Element | null {
  const withImage = items.filter((item) => hasImage(item.itemImage) || isEditing);
  const ordered = stableShuffle(withImage);
  if (!ordered.length) return null;

  const shapes = planCollageShapes(ordered.length);

  return (
    <div
      className="relative grid h-[22rem] grid-cols-6 grid-rows-6 gap-3 md:h-[28rem] lg:h-[32rem]"
      data-media-layout="oval-collage"
      data-image-count={ordered.length}
    >
      {ordered.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'overflow-hidden',
            collageSlotClass(ordered.length, index),
            collageShapeClass(shapes[index] || 'circle')
          )}
          data-shape={shapes[index] || 'circle'}
        >
          <ContentSdkImage
            field={item.itemImage?.jsonValue}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function MediaCanvasLayout({
  fields,
  params,
  page,
  collage,
}: MediaCanvasProps & { collage: boolean }): JSX.Element {
  const isEditing = Boolean(page?.mode?.isEditing);
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <MediaCanvasEmpty />;
  }

  const children = datasource.children?.results || [];

  return (
    <section
      className={cn(
        'component media-canvas py-16',
        collage ? 'bg-secondary' : 'bg-background',
        params?.styles
      )}
      id={params?.RenderingIdentifier}
      data-variant={collage ? 'OvalCollage' : 'Default'}
    >
      <div className="component-content mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
        <MediaCanvasCopy fields={datasource} isEditing={isEditing} collage={collage} />
        {collage ? (
          <OvalCollageMedia items={children} isEditing={isEditing} />
        ) : (
          <DefaultMedia items={children} isEditing={isEditing} />
        )}
      </div>
    </section>
  );
}

export const Default = (props: MediaCanvasProps): JSX.Element => (
  <MediaCanvasLayout {...props} collage={false} />
);

export const OvalCollage = (props: MediaCanvasProps): JSX.Element => (
  <MediaCanvasLayout {...props} collage />
);
