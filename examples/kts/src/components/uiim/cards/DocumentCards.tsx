'use client';

import type React from 'react';
import { useMemo } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
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

import { TrackedCtaLink } from '@/components/content-sdk/TrackedCtaLink';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { shouldBypassNextImageOptimizer, withResolvedImageSrc } from '@/lib/sitecore-image-field';
import type { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';

type JsonField<T> = { jsonValue?: T };

type DocumentCardItem = {
  id?: string;
  cardTitle?: JsonField<Field<string>>;
  cardSummary?: JsonField<Field<string>>;
  previewImage?: JsonField<ImageField>;
  documentLink?: JsonField<LinkField>;
  fileType?: JsonField<Field<string>>;
  fileSize?: JsonField<Field<string>>;
  publishedDate?: JsonField<Field<string>>;
  practiceArea?: JsonField<Field<string>>;
  downloadLabel?: JsonField<Field<string>>;
};

type DocumentCardsDatasource = {
  sectionTitle?: JsonField<Field<string>>;
  sectionIntro?: JsonField<Field<string>>;
  children?: {
    results?: DocumentCardItem[];
  };
};

export type DocumentCardsProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: DocumentCardsDatasource | null;
    };
  };
};

const EMPTY_IMAGE_FIELD: ImageField = { value: {} };
const EMPTY_LINK_FIELD: LinkField = { value: { href: '' } };

function fieldString(field?: JsonField<Field<string>> | null): string {
  const value = field?.jsonValue?.value;
  return typeof value === 'string' ? value.trim() : '';
}

function linkHref(field?: JsonField<LinkField> | null): string {
  const value = field?.jsonValue?.value;
  const href = value?.href || value?.url;
  return typeof href === 'string' ? href.trim() : '';
}

function hasLink(field?: JsonField<LinkField> | null): boolean {
  const href = linkHref(field);
  return Boolean(href && href !== 'http://');
}

export function formatSitecoreDate(value?: string): string {
  if (!value) return '';
  const compact = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (compact) {
    const year = Number(compact[1]);
    const month = Number(compact[2]) - 1;
    const day = Number(compact[3]);
    return new Date(year, month, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isPdfDocument(item: DocumentCardItem): boolean {
  const fileType = fieldString(item.fileType).toLowerCase();
  if (fileType.includes('pdf')) return true;
  return /\.pdf($|\?)/i.test(linkHref(item.documentLink));
}

function itemImageField(item: DocumentCardItem): ImageField {
  return withResolvedImageSrc(item.previewImage) ?? item.previewImage?.jsonValue ?? EMPTY_IMAGE_FIELD;
}

function previewSrc(item: DocumentCardItem): string {
  const src = itemImageField(item)?.value?.src;
  return typeof src === 'string' ? src.trim() : '';
}

function pdfFrameSrc(href: string): string {
  const hashIndex = href.indexOf('#');
  const base = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  return `${base}#toolbar=0&navpanes=0&view=FitH`;
}

function EditorFieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-xs font-medium">{children}</p>;
}

function DocumentEditableImage({
  item,
  className,
}: {
  item: DocumentCardItem;
  className?: string;
}) {
  const imageField = withResolvedImageSrc(item.previewImage) ?? EMPTY_IMAGE_FIELD;

  return (
    <div className={cn('relative overflow-visible bg-neutral-200', className)}>
      <SitecoreImage field={imageField} className="relative z-10 h-full w-full object-cover" />
    </div>
  );
}

function DocumentEditableLink({ item }: { item: DocumentCardItem }) {
  return (
    <div className="space-y-0.5">
      <EditorFieldLabel>Document link</EditorFieldLabel>
      <TrackedCtaLink
        field={item.documentLink?.jsonValue ?? EMPTY_LINK_FIELD}
        className="text-primary line-clamp-2 text-xs underline"
      />
    </div>
  );
}

/** Compact grid card editor — Default variant in Pages. */
function DocumentGridCardEditor({ item }: { item: DocumentCardItem }) {
  return (
    <article
      data-testid="document-card-child-editor"
      data-editor-layout="grid"
      className="border-border overflow-visible rounded-xl border bg-white p-3 shadow-sm"
    >
      <DocumentEditableImage item={item} className="mb-3 aspect-[4/3] max-h-36 w-full rounded-md" />
      <DocumentEditableLink item={item} />
      <div className="mt-2 space-y-1">
        <DocumentMeta item={item} isEditing />
        <Text
          field={item.cardTitle?.jsonValue}
          tag="h3"
          className="font-heading text-base font-normal leading-snug"
        />
        <Text
          field={item.cardSummary?.jsonValue}
          tag="p"
          className="text-muted-foreground line-clamp-2 text-xs leading-relaxed"
        />
      </div>
    </article>
  );
}

/** Featured split editor — Spotlight variant in Pages. */
function DocumentFeaturedEditor({ item }: { item: DocumentCardItem }) {
  return (
    <article
      data-testid="document-card-child-editor"
      data-editor-layout="featured"
      className="border-border overflow-visible rounded-2xl border bg-white shadow-sm md:grid md:grid-cols-12"
    >
      <DocumentEditableImage
        item={item}
        className="md:col-span-5 aspect-[4/3] rounded-t-2xl md:aspect-auto md:min-h-[14rem] md:rounded-l-2xl md:rounded-tr-none"
      />
      <div className="space-y-3 p-4 md:col-span-7 md:p-6">
        <DocumentEditableLink item={item} />
        <DocumentMeta item={item} isEditing />
        <Text
          field={item.cardTitle?.jsonValue}
          tag="h3"
          className="font-heading text-2xl font-normal tracking-tight md:text-3xl"
        />
        <Text
          field={item.cardSummary?.jsonValue}
          tag="p"
          className="text-muted-foreground line-clamp-3 text-sm leading-relaxed"
        />
        <Text field={item.downloadLabel?.jsonValue} tag="p" className="text-xs font-medium" />
      </div>
    </article>
  );
}

/** Compact row editor — Spotlight supporting rows and CompactRows in Pages. */
function DocumentRowEditor({
  item,
  dense = false,
}: {
  item: DocumentCardItem;
  dense?: boolean;
}) {
  return (
    <article
      data-testid="document-card-child-editor"
      data-editor-layout={dense ? 'row-dense' : 'row'}
      className={cn(
        'border-border overflow-visible rounded-lg border bg-white p-3',
        dense
          ? 'grid gap-3 md:grid-cols-[4rem_1fr] md:items-center'
          : 'flex flex-col gap-3 sm:flex-row sm:items-start'
      )}
    >
      <DocumentEditableImage
        item={item}
        className={cn(
          'shrink-0 rounded-md',
          dense ? 'size-16' : 'aspect-[4/3] w-full sm:h-20 sm:w-24 sm:aspect-auto'
        )}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <DocumentEditableLink item={item} />
        <DocumentMeta item={item} isEditing />
        <Text
          field={item.cardTitle?.jsonValue}
          tag={dense ? 'h3' : 'h4'}
          className="font-heading text-base font-normal"
        />
        <Text
          field={item.cardSummary?.jsonValue}
          tag="p"
          className="text-muted-foreground line-clamp-2 text-xs leading-relaxed"
        />
      </div>
    </article>
  );
}

const DocumentCardsEmpty: React.FC = () => (
  <div className="border-border bg-muted/20 text-muted-foreground rounded-2xl border border-dashed px-6 py-12 text-center text-sm">
    Add Document Card items under this datasource to preview and download Content Hub PDFs.
  </div>
);

function DocumentMeta({
  item,
  isEditing,
  className,
}: {
  item: DocumentCardItem;
  isEditing: boolean;
  className?: string;
}) {
  const fileType = fieldString(item.fileType);
  const fileSize = fieldString(item.fileSize);
  const practiceArea = fieldString(item.practiceArea);
  const published = formatSitecoreDate(fieldString(item.publishedDate));

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {(fileType || isEditing) && (
        <Badge variant="default" className="rounded-sm tracking-wide uppercase">
          <Text field={item.fileType?.jsonValue} tag="span" />
        </Badge>
      )}
      {(practiceArea || isEditing) && (
        <Badge variant="outline" className="rounded-sm">
          <Text field={item.practiceArea?.jsonValue} tag="span" />
        </Badge>
      )}
      {(published || isEditing) && (
        <span className="text-muted-foreground text-xs">
          {isEditing ? <Text field={item.publishedDate?.jsonValue} tag="span" /> : published}
        </span>
      )}
      {(fileSize || isEditing) && (
        <span className="text-muted-foreground text-xs">
          <Text field={item.fileSize?.jsonValue} tag="span" />
        </span>
      )}
    </div>
  );
}

function DocumentPreview({
  item,
  className,
  framed = false,
}: {
  item: DocumentCardItem;
  className?: string;
  framed?: boolean;
}) {
  const liveImageField = itemImageField(item);
  const src = previewSrc(item);
  const href = linkHref(item.documentLink);
  const showPdfFrame = !src && Boolean(href) && isPdfDocument(item);
  const title = fieldString(item.cardTitle) || 'Document preview';

  return (
    <div
      className={cn(
        'bg-muted relative overflow-hidden',
        framed ? 'aspect-[3/4]' : 'aspect-[4/3]',
        className
      )}
    >
      {src ? (
        <ContentSdkImage
          field={liveImageField}
          className="h-full w-full object-cover"
          unoptimized={shouldBypassNextImageOptimizer(src)}
        />
      ) : showPdfFrame ? (
        <iframe
          src={pdfFrameSrc(href)}
          title={title}
          className="pointer-events-none absolute inset-0 h-[140%] w-full origin-top scale-[0.72]"
          loading="lazy"
          tabIndex={-1}
        />
      ) : (
        <DocumentFilePlaceholder item={item} />
      )}
    </div>
  );
}

function DocumentFilePlaceholder({ item }: { item: DocumentCardItem }) {
  const content = (
    <>
      <FileText className="size-10 opacity-80" aria-hidden />
      <span className="font-heading text-sm tracking-[0.2em] uppercase">
        {fieldString(item.fileType) || 'PDF'}
      </span>
    </>
  );
  const className =
    'flex h-full min-h-40 flex-col items-center justify-center gap-3 bg-neutral-950 px-6 text-white';

  if (hasLink(item.documentLink)) {
    return (
      <ContentSdkLink field={item.documentLink?.jsonValue ?? EMPTY_LINK_FIELD} className={className}>
        {content}
      </ContentSdkLink>
    );
  }

  return <div className={className}>{content}</div>;
}

function DocumentFileIcon({ item }: { item: DocumentCardItem }) {
  const className =
    'bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-md';
  const icon = <FileText className="size-5" aria-hidden />;

  if (hasLink(item.documentLink)) {
    return (
      <ContentSdkLink field={item.documentLink?.jsonValue ?? EMPTY_LINK_FIELD} className={className}>
        {icon}
      </ContentSdkLink>
    );
  }

  return <div className={className}>{icon}</div>;
}

function DocumentActions({
  item,
  compact = false,
}: {
  item: DocumentCardItem;
  compact?: boolean;
}) {
  const href = linkHref(item.documentLink);
  const title = fieldString(item.cardTitle) || 'Document';
  const canPreview = Boolean(href) && isPdfDocument(item);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', compact && 'justify-end')}>
      {canPreview && (
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size={compact ? 'sm' : 'default'}>
              <Eye aria-hidden />
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] w-[min(96vw,72rem)] max-w-none gap-3 p-4 sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading pr-8 text-left text-xl font-normal">
                {title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                In-browser preview of {title}
              </DialogDescription>
            </DialogHeader>
            <iframe
              src={pdfFrameSrc(href)}
              title={`${title} preview`}
              className="bg-muted h-[min(72vh,48rem)] w-full rounded-lg border"
            />
          </DialogContent>
        </Dialog>
      )}
      {hasLink(item.documentLink) && (
        <Button asChild size={compact ? 'sm' : 'default'}>
          <ContentSdkLink field={item.documentLink?.jsonValue ?? EMPTY_LINK_FIELD}>
            <Download aria-hidden />
            {fieldString(item.downloadLabel) && (
              <Text field={item.downloadLabel?.jsonValue} tag="span" />
            )}
          </ContentSdkLink>
        </Button>
      )}
    </div>
  );
}

function DocumentCardsHeader({
  datasource,
  isEditing,
}: {
  datasource?: DocumentCardsDatasource | null;
  isEditing: boolean;
}) {
  const title = fieldString(datasource?.sectionTitle);
  const intro = fieldString(datasource?.sectionIntro);

  if (!title && !intro && !isEditing) return null;

  return (
    <header className="mb-10 max-w-3xl">
      {(title || isEditing) && (
        <Text
          field={datasource?.sectionTitle?.jsonValue}
          tag="h2"
          className="font-heading text-3xl font-normal tracking-tight md:text-4xl"
        />
      )}
      {(intro || isEditing) && (
        <Text
          field={datasource?.sectionIntro?.jsonValue}
          tag="p"
          className="text-muted-foreground mt-3 text-base md:text-lg"
        />
      )}
    </header>
  );
}

function DocumentGridCard({ item }: { item: DocumentCardItem }) {
  return (
    <Card className="border-border/80 hover:border-border group flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-lg">
      <DocumentPreview item={item} framed />
      <CardHeader className="space-y-3 pb-3">
        <DocumentMeta item={item} isEditing={false} />
        {fieldString(item.cardTitle) && (
          <Text
            field={item.cardTitle?.jsonValue}
            tag="h3"
            className="font-heading text-xl font-normal leading-snug"
          />
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {fieldString(item.cardSummary) && (
          <Text
            field={item.cardSummary?.jsonValue}
            tag="p"
            className="text-muted-foreground line-clamp-3 text-sm leading-relaxed"
          />
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        <DocumentActions item={item} />
      </CardFooter>
    </Card>
  );
}

function DocumentCardsShell({
  props,
  isEditing,
  variant,
  children,
}: {
  props: DocumentCardsProps;
  isEditing: boolean;
  variant: 'default' | 'spotlight' | 'compact-rows';
  children: React.ReactNode;
}) {
  const { fields, params } = props;
  const datasource = fields?.data?.datasource;
  const items = datasource?.children?.results ?? [];

  return (
    <section
      data-variant={variant}
      className={cn(
        'component document-cards px-4 py-12 md:py-16',
        variant === 'spotlight' && 'document-cards--spotlight',
        variant === 'compact-rows' && 'document-cards--compact-rows',
        params?.styles
      )}
      id={params?.RenderingIdentifier}
    >
      <div className="mx-auto max-w-7xl">
        <DocumentCardsHeader datasource={datasource} isEditing={isEditing} />
        {items.length === 0 ? <DocumentCardsEmpty /> : children}
      </div>
    </section>
  );
}

function DocumentCardsEditorList({ items }: { items: DocumentCardItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <DocumentGridCardEditor key={item.id || `document-editor-${index}`} item={item} />
      ))}
    </div>
  );
}

function DocumentSpotlightEditorList({ items }: { items: DocumentCardItem[] }) {
  const [featured, ...rest] = items;

  return (
    <>
      {featured ? <DocumentFeaturedEditor item={featured} /> : null}
      {rest.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {rest.map((item, index) => (
            <li key={item.id || `document-spotlight-editor-${index}`}>
              <DocumentRowEditor item={item} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function DocumentCompactRowsEditorList({ items }: { items: DocumentCardItem[] }) {
  return (
    <ul className="divide-y overflow-visible rounded-2xl border">
      {items.map((item, index) => (
        <li key={item.id || `document-row-editor-${index}`} className="p-2">
          <DocumentRowEditor item={item} dense />
        </li>
      ))}
    </ul>
  );
}

export const Default: React.FC<DocumentCardsProps> = (props) => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary);
  const datasource = useMemo(
    () => props.fields?.data?.datasource,
    [props.fields?.data?.datasource]
  );
  const items = useMemo(
    () => datasource?.children?.results?.filter(Boolean) ?? [],
    [datasource?.children?.results]
  );

  if (props.fields) {
    return (
      <DocumentCardsShell props={props} isEditing={isEditing} variant="default">
        {isEditing ? (
          <DocumentCardsEditorList items={items} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <DocumentGridCard key={item.id || `document-card-${index}`} item={item} />
            ))}
          </div>
        )}
      </DocumentCardsShell>
    );
  }

  return <NoDataFallback componentName="DocumentCards" />;
};

export const Spotlight: React.FC<DocumentCardsProps> = (props) => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary);
  const datasource = useMemo(
    () => props.fields?.data?.datasource,
    [props.fields?.data?.datasource]
  );
  const items = useMemo(
    () => datasource?.children?.results?.filter(Boolean) ?? [],
    [datasource?.children?.results]
  );
  const [featured, ...rest] = items;

  if (props.fields) {
    return (
      <DocumentCardsShell props={props} isEditing={isEditing} variant="spotlight">
        {isEditing ? (
          <DocumentSpotlightEditorList items={items} />
        ) : (
          <>
            {featured ? (
              <article className="border-border overflow-hidden rounded-2xl border shadow-sm md:grid md:grid-cols-12">
                <DocumentPreview
                  item={featured}
                  className="md:col-span-7 md:aspect-auto md:min-h-[28rem]"
                />
                <div className="flex flex-col justify-center gap-5 p-6 md:col-span-5 md:p-10">
                  <DocumentMeta item={featured} isEditing={false} />
                  {fieldString(featured.cardTitle) && (
                    <Text
                      field={featured.cardTitle?.jsonValue}
                      tag="h3"
                      className="font-heading text-3xl font-normal tracking-tight md:text-4xl"
                    />
                  )}
                  {fieldString(featured.cardSummary) && (
                    <Text
                      field={featured.cardSummary?.jsonValue}
                      tag="p"
                      className="text-muted-foreground text-base leading-relaxed"
                    />
                  )}
                  <DocumentActions item={featured} />
                </div>
              </article>
            ) : null}
            {rest.length > 0 && (
              <ul className="mt-8 divide-y overflow-hidden rounded-2xl border">
                {rest.map((item, index) => (
                  <li
                    key={item.id || `document-spotlight-${index}`}
                    className="hover:bg-muted/30 flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center"
                  >
                    <DocumentPreview
                      item={item}
                      className="aspect-[4/3] w-full shrink-0 sm:h-24 sm:w-20 sm:aspect-auto"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <DocumentMeta item={item} isEditing={false} />
                      {fieldString(item.cardTitle) && (
                        <Text
                          field={item.cardTitle?.jsonValue}
                          tag="h4"
                          className="font-heading text-lg font-normal"
                        />
                      )}
                      {fieldString(item.cardSummary) && (
                        <Text
                          field={item.cardSummary?.jsonValue}
                          tag="p"
                          className="text-muted-foreground line-clamp-2 text-sm"
                        />
                      )}
                    </div>
                    <DocumentActions item={item} compact />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </DocumentCardsShell>
    );
  }

  return <NoDataFallback componentName="DocumentCards" />;
};

export const CompactRows: React.FC<DocumentCardsProps> = (props) => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing || page?.mode?.isDesignLibrary);
  const datasource = useMemo(
    () => props.fields?.data?.datasource,
    [props.fields?.data?.datasource]
  );
  const items = useMemo(
    () => datasource?.children?.results?.filter(Boolean) ?? [],
    [datasource?.children?.results]
  );

  if (props.fields) {
    return (
      <DocumentCardsShell props={props} isEditing={isEditing} variant="compact-rows">
        {isEditing ? (
          <DocumentCompactRowsEditorList items={items} />
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border">
            {items.map((item, index) => (
              <li
                key={item.id || `document-row-${index}`}
                className="hover:bg-muted/30 grid gap-4 p-4 transition-colors md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <DocumentFileIcon item={item} />
                <div className="min-w-0 space-y-1">
                  {fieldString(item.cardTitle) && (
                    <Text
                      field={item.cardTitle?.jsonValue}
                      tag="h3"
                      className="font-heading truncate text-lg font-normal"
                    />
                  )}
                  {fieldString(item.cardSummary) && (
                    <Text
                      field={item.cardSummary?.jsonValue}
                      tag="p"
                      className="text-muted-foreground line-clamp-1 text-sm"
                    />
                  )}
                  <DocumentMeta item={item} isEditing={false} />
                </div>
                <DocumentActions item={item} compact />
              </li>
            ))}
          </ul>
        )}
      </DocumentCardsShell>
    );
  }

  return <NoDataFallback componentName="DocumentCards" />;
};
