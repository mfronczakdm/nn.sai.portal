'use client';

import type React from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
  useSitecore,
  type ImageField,
  type LinkField,
  type RichTextField,
  type Field as SitecoreField,
} from '@sitecore-content-sdk/nextjs';
import { FileText } from 'lucide-react';
import NextImage from 'next/image';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { extractImageSrc } from '@/lib/sitecore-image-field';
import { shouldBypassOptimizer } from '@/lib/sitecore-image-loader';

import type { ProductDetailFields, ProductDetailProps } from './product-detail.props';

function textValue(field?: SitecoreField<string> | null): string {
  return typeof field?.value === 'string' ? field.value.trim() : '';
}

function richHasContent(field?: RichTextField | null): boolean {
  if (!field?.value) return false;
  return field.value.replace(/<[^>]*>/g, '').trim().length > 0;
}

function linkHasHref(field?: LinkField | null): boolean {
  return Boolean(field?.value?.href);
}

function resolveProductImage(options: {
  imageField?: ImageField | null;
  urlField?: SitecoreField<string> | null;
  altFallback: string;
}): { src: string; alt: string; imageField?: ImageField } {
  const fromImage = extractImageSrc(options.imageField);
  const fromUrl = textValue(options.urlField);
  const src = fromImage || fromUrl;
  const alt =
    (typeof options.imageField?.value?.alt === 'string' && options.imageField.value.alt.trim()) ||
    options.altFallback;
  return { src, alt, imageField: options.imageField || undefined };
}

function ProductImage({
  src,
  alt,
  imageField,
  isEditing,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  imageField?: ImageField;
  isEditing: boolean;
  className?: string;
  priority?: boolean;
}) {
  // Prefer resolved public URL (Image URL fields / extractImageSrc). Sitecore Image fields with
  // external-only XML often have empty value.src in layout/Pages — ContentSdkImage then shows a grey placeholder.
  if (src) {
    return (
      <NextImage
        src={src}
        alt={alt}
        width={605}
        height={380}
        className={className}
        unoptimized={shouldBypassOptimizer(src)}
        priority={priority}
      />
    );
  }

  if (isEditing && imageField) {
    return <ContentSdkImage field={imageField} className={className} />;
  }

  return null;
}

function ProductDetailEmpty(): React.JSX.Element {
  return <NoDataFallback componentName="ProductDetail" />;
}

function RichColumn({
  title,
  field,
  isEditing,
}: {
  title: string;
  field?: RichTextField;
  isEditing: boolean;
}) {
  if ((!richHasContent(field) && !isEditing) || !field) return null;

  return (
    <section>
      <h2 className="font-heading text-primary text-sm font-semibold tracking-[0.14em] uppercase">
        {title}
      </h2>
      <div className="prose prose-neutral dark:prose-invert text-foreground mt-4 max-w-none text-base leading-relaxed">
        <ContentSdkRichText field={field} />
      </div>
    </section>
  );
}

export const Default: React.FC<ProductDetailProps> = (props) => {
  const { fields: propFields, params, isPageEditing: propEditing } = props;
  const { page } = useSitecore();
  const isEditing = propEditing ?? page.mode.isEditing;

  const routeFields = (page?.layout?.sitecore?.route?.fields ?? {}) as ProductDetailFields;
  const fields: ProductDetailFields = {
    ...routeFields,
    ...(propFields ?? {}),
  };

  const titleField = fields.ProductName?.value
    ? fields.ProductName
    : fields.pageHeaderTitle?.value
      ? fields.pageHeaderTitle
      : fields.pageTitle;
  const titleText = textValue(titleField);
  const productId = textValue(fields.ProductID);
  const productSku = textValue(fields.ProductSKU);
  const categoryLabel = textValue(fields.CategoryLabel);
  const descriptionField = richHasContent(fields.Description)
    ? fields.Description
    : fields.Detail;
  const specSheet = fields.SpecSheetLink;

  const primaryImage = resolveProductImage({
    imageField: fields.image,
    urlField: fields.ImageUrl,
    altFallback: titleText || 'Product image',
  });
  const secondaryImage = resolveProductImage({
    imageField: fields.ImageSecondary,
    urlField: fields.ImageSecondaryUrl,
    altFallback: `${titleText || 'Product'} alternate view`,
  });

  const hasContent =
    Boolean(titleText) ||
    Boolean(productId) ||
    Boolean(productSku) ||
    Boolean(categoryLabel) ||
    richHasContent(descriptionField) ||
    richHasContent(fields.TechnicalData) ||
    richHasContent(fields.StylesAvailable) ||
    richHasContent(fields.Benefits) ||
    Boolean(primaryImage.src) ||
    Boolean(secondaryImage.src) ||
    linkHasHref(specSheet);

  if (!hasContent && !isEditing) {
    return <ProductDetailEmpty />;
  }

  const sectionId = params?.RenderingIdentifier || 'product-detail';
  const showPrimary =
    Boolean(primaryImage.src) || (isEditing && Boolean(primaryImage.imageField));
  const showSecondary =
    Boolean(secondaryImage.src) || (isEditing && Boolean(secondaryImage.imageField));

  return (
    <article
      id={sectionId}
      data-component="ProductDetail"
      className={cn('@container bg-background text-foreground', params?.styles)}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
          <div className="min-w-0">
            {(categoryLabel || isEditing) && (
              <Text
                tag="p"
                field={fields.CategoryLabel}
                className="text-muted-foreground mb-3 text-sm font-medium tracking-wide uppercase"
              />
            )}

            {(titleText || isEditing) && titleField && (
              <Text
                tag="h1"
                field={titleField}
                className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
              />
            )}

            {(productId || productSku || isEditing) && (
              <p className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {(productId || isEditing) && fields.ProductID && (
                  <span>
                    <span className="font-medium tracking-wide uppercase">ID </span>
                    <Text tag="span" field={fields.ProductID} />
                  </span>
                )}
                {(productSku || isEditing) && fields.ProductSKU && (
                  <span>
                    <span className="font-medium tracking-wide uppercase">SKU </span>
                    <Text tag="span" field={fields.ProductSKU} />
                  </span>
                )}
              </p>
            )}

            {(linkHasHref(specSheet) || isEditing) && specSheet && (
              <div className="mt-5">
                <ContentSdkLink
                  field={specSheet}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
                >
                  <FileText className="size-4 shrink-0" aria-hidden />
                  <span>{specSheet.value?.text || 'Print a Spec Sheet'}</span>
                </ContentSdkLink>
              </div>
            )}

            {(richHasContent(descriptionField) || isEditing) && descriptionField && (
              <div className="prose prose-neutral dark:prose-invert text-foreground mt-8 max-w-none text-base leading-relaxed sm:text-lg">
                <ContentSdkRichText field={descriptionField} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {showPrimary && (
              <div className="bg-muted/30 overflow-hidden rounded-2xl border border-border">
                <ProductImage
                  src={primaryImage.src}
                  alt={primaryImage.alt}
                  imageField={primaryImage.imageField}
                  isEditing={Boolean(isEditing)}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            )}
            {showSecondary && (
              <div className="bg-muted/20 max-w-[12rem] overflow-hidden rounded-xl border border-border">
                <ProductImage
                  src={secondaryImage.src}
                  alt={secondaryImage.alt}
                  imageField={secondaryImage.imageField}
                  isEditing={Boolean(isEditing)}
                  className="h-auto w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-border pt-10 lg:mt-16 lg:grid-cols-2 lg:gap-14 lg:pt-14">
          <div className="space-y-10">
            <RichColumn title="Technical Data" field={fields.TechnicalData} isEditing={isEditing} />
            <RichColumn
              title="Styles Available"
              field={fields.StylesAvailable}
              isEditing={isEditing}
            />
          </div>
          <RichColumn title="Benefits" field={fields.Benefits} isEditing={isEditing} />
        </div>
      </div>
    </article>
  );
};
