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

interface IconLinkItemFields {
  id: string;
  itemTitle?: IGQLTextField;
  itemImage?: IGQLImageField;
  itemLink?: IGQLLinkField;
}

interface IconLinkBarFields {
  data?: {
    datasource?: {
      sectionTitle?: IGQLTextField;
      sectionDescription?: IGQLTextField;
      searchLink?: IGQLLinkField;
      children?: {
        results?: IconLinkItemFields[];
      };
    };
  };
}

export type IconLinkBarProps = ComponentProps & {
  fields?: IconLinkBarFields;
};

const IconLinkBarEmpty = (): JSX.Element => <NoDataFallback componentName="IconLinkBar" />;

function IconLinkItem({
  item,
  isEditing,
  imageClassName,
}: {
  item: IconLinkItemFields;
  isEditing?: boolean;
  imageClassName: string;
}) {
  const hasImage = Boolean(item.itemImage?.jsonValue?.value?.src);
  const hasTitle = Boolean(item.itemTitle?.jsonValue?.value);
  const hasLink = Boolean(item.itemLink?.jsonValue?.value?.href);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {(hasImage || isEditing) && (
        <ContentSdkImage field={item.itemImage?.jsonValue} className={imageClassName} />
      )}
      {(hasTitle || isEditing) && (
        <Text field={item.itemTitle?.jsonValue} tag="p" className="text-sm font-semibold" />
      )}
      {(hasLink || isEditing) && (
        <ContentSdkLink
          field={item.itemLink?.jsonValue ?? { value: { href: '' } }}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        />
      )}
    </div>
  );
}

function IconLinkBarLayout({
  fields,
  params,
  page,
  variant,
}: IconLinkBarProps & { variant: 'default' | 'dark' | 'circle' }): JSX.Element {
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <IconLinkBarEmpty />;
  }

  const items = datasource.children?.results ?? [];
  const isDark = variant === 'dark';
  const imageClass =
    variant === 'circle'
      ? 'h-24 w-24 rounded-full object-cover'
      : 'h-12 w-12 object-contain';

  return (
    <section
      className={cn(
        'component icon-link-bar',
        params?.styles,
        isDark ? 'bg-primary py-16 text-primary-foreground' : 'bg-background py-10'
      )}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto max-w-7xl px-4">
        {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.sectionTitle?.jsonValue}
            tag="h2"
            className={cn(
              'mb-3 text-center text-2xl font-bold md:text-4xl',
              isDark && 'text-primary-foreground'
            )}
          />
        )}
        {(datasource.sectionDescription?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.sectionDescription?.jsonValue}
            tag="p"
            className={cn(
              'mx-auto mb-6 max-w-2xl text-center text-base',
              isDark ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          />
        )}
        {(datasource.searchLink?.jsonValue?.value?.href || isEditing) && (
          <div className="mb-10 flex justify-center">
            <ContentSdkLink
              field={datasource.searchLink?.jsonValue ?? { value: { href: '' } }}
              className={cn(
                'inline-flex min-w-72 items-center justify-center rounded-md border px-6 py-3 text-sm',
                isDark
                  ? 'border-primary-foreground/40 bg-background text-foreground'
                  : 'border-border bg-muted'
              )}
            />
          </div>
        )}
        <div
          className={cn(
            'grid gap-8',
            variant === 'circle'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-4'
          )}
        >
          {items.map((item) => (
            <IconLinkItem
              key={item.id}
              item={item}
              isEditing={isEditing}
              imageClassName={imageClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export const Default = (props: IconLinkBarProps): JSX.Element => (
  <IconLinkBarLayout {...props} variant="default" />
);

export const DarkBand = (props: IconLinkBarProps): JSX.Element => (
  <IconLinkBarLayout {...props} variant="dark" />
);

export const CircleGrid = (props: IconLinkBarProps): JSX.Element => (
  <IconLinkBarLayout {...props} variant="circle" />
);
