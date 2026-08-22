import type React from 'react';
import {
  Field,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  NextImage as ContentSdkImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { FileText } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ComponentProps } from '@/lib/component-props';
import { withResolvedImageSrc } from '@/lib/sitecore-image-field';
import { NoDataFallback } from '@/utils/NoDataFallback';

type JsonField<T> = { jsonValue?: T };

type AccentToken = 'teal' | 'navy' | 'maroon' | 'green' | 'purple';
type ImagePlacement = 'top' | 'left' | 'right';
type TileSpan = 'tall' | 'wide';

type InsightsMosaicItem = {
  id?: string;
  tileTitle?: JsonField<Field<string>>;
  tileImage?: JsonField<ImageField>;
  tileLink?: JsonField<LinkField>;
  tileTag?: JsonField<Field<string>>;
  tileNumber?: JsonField<Field<string>>;
  accentColor?: JsonField<Field<string>>;
  imagePlacement?: JsonField<Field<string>>;
  tileSpan?: JsonField<Field<string>>;
};

type InsightsMosaicDatasource = {
  sectionTitle?: JsonField<Field<string>>;
  viewAllLink?: JsonField<LinkField>;
  children?: {
    results?: InsightsMosaicItem[];
  };
};

export type InsightsMosaicProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: InsightsMosaicDatasource | null;
    };
  };
  isPageEditing?: boolean;
};

const ACCENT_VARS: Record<AccentToken, string> = {
  teal: 'var(--insights-mosaic-teal, #0a7a7a)',
  navy: 'var(--insights-mosaic-navy, #0a2048)',
  maroon: 'var(--insights-mosaic-maroon, #8f2433)',
  green: 'var(--insights-mosaic-green, #2f5d3a)',
  purple: 'var(--insights-mosaic-purple, #5a3d6e)',
};

const ACCENT_FOREGROUND_VARS: Record<AccentToken, string> = {
  teal: 'var(--insights-mosaic-teal-foreground, #ffffff)',
  navy: 'var(--insights-mosaic-navy-foreground, #ffffff)',
  maroon: 'var(--insights-mosaic-maroon-foreground, #ffffff)',
  green: 'var(--insights-mosaic-green-foreground, #ffffff)',
  purple: 'var(--insights-mosaic-purple-foreground, #ffffff)',
};

function fieldString(field?: JsonField<Field<string>> | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function linkHref(field?: JsonField<LinkField> | null): string {
  const value = field?.jsonValue?.value;
  const href = value?.href || value?.url;
  return typeof href === 'string' ? href.trim() : '';
}

function resolveAccent(raw: string): string {
  const token = raw.toLowerCase() as AccentToken;
  if (token in ACCENT_VARS) return ACCENT_VARS[token];
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
  return ACCENT_VARS.navy;
}

function resolveAccentForeground(raw: string): string {
  const token = raw.toLowerCase() as AccentToken;
  if (token in ACCENT_FOREGROUND_VARS) return ACCENT_FOREGROUND_VARS[token];
  return 'var(--insights-mosaic-foreground, #ffffff)';
}

function resolvePlacement(raw: string): ImagePlacement {
  const value = raw.toLowerCase();
  if (value === 'top' || value === 'right' || value === 'left') return value;
  return 'left';
}

function resolveSpan(raw: string): TileSpan {
  return raw.toLowerCase() === 'tall' ? 'tall' : 'wide';
}

function formatTileNumber(raw: string, index: number): string {
  if (raw) return raw.padStart(2, '0').slice(-2);
  return String(index + 1).padStart(2, '0');
}

const InsightsMosaicEmpty: React.FC = () => (
  <NoDataFallback componentName="InsightsMosaic" />
);

function InsightsMosaicTile({
  item,
  index,
  isEditing,
}: {
  item: InsightsMosaicItem;
  index: number;
  isEditing: boolean;
}) {
  const title = fieldString(item.tileTitle);
  const tag = fieldString(item.tileTag);
  const number = formatTileNumber(fieldString(item.tileNumber), index);
  const accent = resolveAccent(fieldString(item.accentColor));
  const accentForeground = resolveAccentForeground(fieldString(item.accentColor));
  const placement = resolvePlacement(fieldString(item.imagePlacement));
  const span = resolveSpan(fieldString(item.tileSpan));
  const href = linkHref(item.tileLink);
  const imageField = withResolvedImageSrc(item.tileImage) ?? item.tileImage?.jsonValue;
  const hasImage = Boolean(imageField?.value?.src);
  const showImage = hasImage || isEditing;
  const showTitle = Boolean(title) || isEditing;
  const showTag = Boolean(tag) || isEditing;
  const isVertical = placement === 'top';

  const numberPosition =
    placement === 'right'
      ? 'top-3 right-4 md:top-5 md:right-6'
      : placement === 'top'
        ? 'bottom-3 left-4 md:bottom-5 md:left-6'
        : 'top-3 left-4 md:top-5 md:left-6';

  const spanClass =
    span === 'tall'
      ? 'col-span-2 row-span-2 min-h-[28rem] md:min-h-[36rem]'
      : 'col-span-2 row-span-1 min-h-[14rem] md:min-h-[18rem]';

  const tile = (
    <article
      data-item-id={isEditing ? item.id : undefined}
      className={cn(
        'insights-mosaic-tile group relative flex h-full min-h-0 w-full overflow-hidden',
        isVertical ? 'flex-col' : placement === 'right' ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'relative min-h-0 overflow-hidden bg-[var(--insights-mosaic-navy,#0a2048)]',
          isVertical ? 'h-1/2 w-full' : 'h-full w-1/2'
        )}
      >
        {showImage && (
          <ContentSdkImage
            field={imageField}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute z-10 font-light tracking-tight text-transparent',
            'text-[4.5rem] leading-none md:text-[7rem] lg:text-[8.5rem]',
            numberPosition
          )}
          style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.92)' }}
        >
          {number}
        </span>
      </div>

      <div
        className={cn(
          'insights-mosaic-tile-copy flex min-h-0 flex-col justify-between gap-6 p-5 md:p-7',
          isVertical ? 'h-1/2 w-full' : 'h-full w-1/2'
        )}
        style={{ backgroundColor: accent, color: accentForeground }}
      >
        {showTitle && (
          <Text
            tag="h3"
            field={item.tileTitle?.jsonValue}
            className="font-heading text-pretty text-xl font-medium leading-snug tracking-tight md:text-2xl lg:text-[1.65rem]"
          />
        )}
        {showTag && (
          <p className="mt-auto flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em]">
            <FileText className="size-3.5 shrink-0" aria-hidden="true" />
            <Text field={item.tileTag?.jsonValue} tag="span" />
          </p>
        )}
      </div>
    </article>
  );

  if (href && !isEditing && item.tileLink?.jsonValue) {
    return (
      <ContentSdkLink
        field={item.tileLink.jsonValue}
        className={cn('insights-mosaic-tile-link block h-full no-underline', spanClass)}
      >
        {tile}
      </ContentSdkLink>
    );
  }

  return <div className={spanClass}>{tile}</div>;
}

function InsightsMosaicView({
  fields,
  params,
  page,
}: InsightsMosaicProps): React.JSX.Element {
  const isEditing = Boolean(page?.mode?.isEditing);
  const datasource = fields?.data?.datasource;
  const items = datasource?.children?.results ?? [];
  const title = fieldString(datasource?.sectionTitle);
  const viewAllHref = linkHref(datasource?.viewAllLink);
  const showTitle = Boolean(title) || isEditing;
  const showViewAll = Boolean(viewAllHref) || isEditing;

  if (!datasource) {
    return <InsightsMosaicEmpty />;
  }

  return (
    <section
      className={cn('component insights-mosaic w-full', params?.styles)}
      id={params?.RenderingIdentifier || 'insights-mosaic'}
    >
      <div
        className="insights-mosaic-band"
        style={{
          backgroundColor: 'var(--insights-mosaic-band, var(--brand-primary, #002c5f))',
          color: 'var(--insights-mosaic-band-foreground, #ffffff)',
        }}
      >
        <div className="mx-auto max-w-[92rem] px-4 py-14 sm:px-6 md:px-10 md:py-20">
          {showTitle && (
            <Text
              tag="h2"
              field={datasource.sectionTitle?.jsonValue}
              className="font-heading text-pretty text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
            />
          )}

          {items.length > 0 ? (
            <div className="mt-10 grid auto-rows-fr grid-cols-2 gap-0 md:grid-cols-4 [grid-auto-flow:dense]">
              {items.map((item, index) => (
                <InsightsMosaicTile
                  key={item.id || index}
                  item={item}
                  index={index}
                  isEditing={isEditing}
                />
              ))}
            </div>
          ) : (
            isEditing && (
              <p className="mt-10 text-sm opacity-70">Add insight tiles as child items.</p>
            )
          )}

          {showViewAll && datasource.viewAllLink?.jsonValue && (
            <div className="mt-10 flex justify-center">
              <ContentSdkLink
                field={datasource.viewAllLink.jsonValue}
                className="inline-flex items-center border border-current px-6 py-2.5 text-sm font-medium tracking-wide no-underline transition-colors hover:bg-[var(--insights-mosaic-band-foreground,#ffffff)] hover:text-[var(--insights-mosaic-band,#002c5f)]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* Default — BLG Latest Insights numbered masonry / bento grid */
export const Default: React.FC<InsightsMosaicProps> = (props) => {
  if (!props.fields?.data?.datasource) {
    return <InsightsMosaicEmpty />;
  }
  return <InsightsMosaicView {...props} />;
};

/* LatestInsights — Pages-facing alias of the screenshot layout */
export const LatestInsights: React.FC<InsightsMosaicProps> = (props) => {
  return <Default {...props} />;
};
