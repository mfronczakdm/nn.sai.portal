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

interface LinkColumnItemFields {
  id: string;
  itemTitle?: IGQLTextField;
  itemLink?: IGQLLinkField;
}

interface LinkColumnsBandFields {
  data?: {
    datasource?: {
      sectionTitle?: IGQLTextField;
      centerImage?: IGQLImageField;
      primaryLink?: IGQLLinkField;
      children?: {
        results?: LinkColumnItemFields[];
      };
    };
  };
}

export type LinkColumnsBandProps = ComponentProps & {
  fields?: LinkColumnsBandFields;
};

const LinkColumnsBandEmpty = (): JSX.Element => <NoDataFallback componentName="LinkColumnsBand" />;

function splitColumns(items: LinkColumnItemFields[]) {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}

function LinkList({
  items,
  isEditing,
}: {
  items: LinkColumnItemFields[];
  isEditing?: boolean;
}) {
  return (
    <ul className="space-y-3 text-center md:text-left">
      {items.map((item) => (
        <li key={item.id}>
          {(item.itemLink?.jsonValue?.value?.href || isEditing) && (
            <ContentSdkLink
              field={item.itemLink?.jsonValue ?? { value: { href: '' } }}
              className="text-base text-primary-foreground underline-offset-4 hover:underline"
            />
          )}
          {!item.itemLink?.jsonValue?.value?.href && (item.itemTitle?.jsonValue?.value || isEditing) && (
            <Text field={item.itemTitle?.jsonValue} tag="span" className="text-base" />
          )}
        </li>
      ))}
    </ul>
  );
}

export const Default = ({ fields, params, page }: LinkColumnsBandProps): JSX.Element => {
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <LinkColumnsBandEmpty />;
  }

  const items = datasource.children?.results ?? [];
  const [left, right] = splitColumns(items);
  const hasCenterImage = Boolean(datasource.centerImage?.jsonValue?.value?.src);

  return (
    <section
      className={cn('component link-columns-band bg-primary py-16 text-primary-foreground', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto max-w-6xl px-4">
        {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.sectionTitle?.jsonValue}
            tag="h2"
            className="mb-12 text-center text-3xl font-semibold md:text-5xl"
          />
        )}
        <div
          className={cn(
            'grid items-center gap-10',
            hasCenterImage || isEditing ? 'md:grid-cols-3' : 'md:grid-cols-2'
          )}
        >
          <LinkList items={left} isEditing={isEditing} />
          {(hasCenterImage || isEditing) && (
            <div className="flex justify-center">
              <ContentSdkImage
                field={datasource.centerImage?.jsonValue}
                className="max-h-48 w-auto object-contain"
              />
            </div>
          )}
          <LinkList items={right} isEditing={isEditing} />
        </div>
        {(datasource.primaryLink?.jsonValue?.value?.href || isEditing) && (
          <div className="mt-10 flex justify-center">
            <ContentSdkLink
              field={datasource.primaryLink?.jsonValue ?? { value: { href: '' } }}
              className="inline-flex rounded-md border border-primary-foreground px-6 py-2 text-sm font-semibold"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export const TwoColumn = ({ fields, params, page }: LinkColumnsBandProps): JSX.Element => {
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <LinkColumnsBandEmpty />;
  }

  const items = datasource.children?.results ?? [];
  const [left, right] = splitColumns(items);

  return (
    <section
      className={cn('component link-columns-band bg-primary py-16 text-primary-foreground', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto max-w-5xl px-4">
        {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.sectionTitle?.jsonValue}
            tag="h2"
            className="mb-12 text-center text-3xl font-semibold md:text-5xl"
          />
        )}
        <div className="grid gap-10 md:grid-cols-2">
          <LinkList items={left} isEditing={isEditing} />
          <LinkList items={right} isEditing={isEditing} />
        </div>
      </div>
    </section>
  );
};
