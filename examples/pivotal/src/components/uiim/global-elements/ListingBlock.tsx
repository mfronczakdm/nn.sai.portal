import type { JSX } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { IGQLImageField, IGQLLinkField, IGQLRichTextField, IGQLTextField } from 'src/types/igql';

interface ListingItemFields {
  id: string;
  itemTitle?: IGQLTextField;
  itemDate?: IGQLTextField;
  itemSummary?: IGQLRichTextField;
  itemLink?: IGQLLinkField;
  itemImage?: IGQLImageField;
}

interface ListingBlockFields {
  data?: {
    datasource?: {
      sectionTitle?: IGQLTextField;
      description?: IGQLTextField;
      viewAllLink?: IGQLLinkField;
      children?: {
        results?: ListingItemFields[];
      };
    };
  };
}

export type ListingBlockProps = ComponentProps & {
  fields?: ListingBlockFields;
};

const ListingBlockEmpty = (): JSX.Element => <NoDataFallback componentName="ListingBlock" />;

function ListingCard({
  item,
  isEditing,
}: {
  item: ListingItemFields;
  isEditing?: boolean;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
      {(item.itemImage?.jsonValue?.value?.src || isEditing) && (
        <ContentSdkImage
          field={item.itemImage?.jsonValue}
          className="mb-4 h-40 w-full rounded-xl object-cover"
        />
      )}
      {(item.itemDate?.jsonValue?.value || isEditing) && (
        <Text field={item.itemDate?.jsonValue} tag="p" className="mb-2 text-sm font-semibold text-primary" />
      )}
      {(item.itemTitle?.jsonValue?.value || isEditing) && (
        <Text field={item.itemTitle?.jsonValue} tag="h3" className="mb-2 text-lg font-bold" />
      )}
      {(item.itemSummary?.jsonValue?.value || isEditing) && (
        <ContentSdkRichText
          field={item.itemSummary?.jsonValue}
          className="mb-4 text-sm text-muted-foreground"
        />
      )}
      {(item.itemLink?.jsonValue?.value?.href || isEditing) && (
        <ContentSdkLink
          field={item.itemLink?.jsonValue ?? { value: { href: '' } }}
          className="mt-auto text-sm font-semibold text-primary"
        />
      )}
    </article>
  );
}

function ListingRow({
  item,
  isEditing,
}: {
  item: ListingItemFields;
  isEditing?: boolean;
}) {
  return (
    <li className="border-b border-border py-4">
      {(item.itemDate?.jsonValue?.value || isEditing) && (
        <Text field={item.itemDate?.jsonValue} tag="p" className="text-sm font-semibold text-primary" />
      )}
      {(item.itemTitle?.jsonValue?.value || isEditing) && (
        <Text field={item.itemTitle?.jsonValue} tag="h3" className="text-base font-semibold" />
      )}
      {(item.itemLink?.jsonValue?.value?.href || isEditing) && (
        <ContentSdkLink field={item.itemLink?.jsonValue ?? { value: { href: '' } }} className="text-sm text-primary" />
      )}
    </li>
  );
}

function ListingHeader({
  datasource,
  isEditing,
}: {
  datasource: NonNullable<ListingBlockFields['data']>['datasource'];
  isEditing?: boolean;
}) {
  if (!datasource) return null;

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.sectionTitle?.jsonValue}
            tag="h2"
            className="text-3xl font-bold text-foreground"
          />
        )}
        {(datasource.description?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.description?.jsonValue}
            tag="p"
            className="mt-2 max-w-xl text-muted-foreground"
          />
        )}
      </div>
      {(datasource.viewAllLink?.jsonValue?.value?.href || isEditing) && (
        <ContentSdkLink
          field={datasource.viewAllLink?.jsonValue ?? { value: { href: '' } }}
          className="inline-flex rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        />
      )}
    </div>
  );
}

export const Default = ({ fields, params, page }: ListingBlockProps): JSX.Element => {
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <ListingBlockEmpty />;
  }

  const items = datasource.children?.results ?? [];

  return (
    <section
      className={cn('component listing-block bg-background py-16', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto max-w-7xl px-4">
        <ListingHeader datasource={datasource} isEditing={isEditing} />
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <ListingCard key={item.id} item={item} isEditing={isEditing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const TextList = ({ fields, params, page }: ListingBlockProps): JSX.Element => {
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <ListingBlockEmpty />;
  }

  const items = datasource.children?.results ?? [];

  return (
    <section
      className={cn('component listing-block bg-background py-16', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto max-w-3xl px-4">
        <ListingHeader datasource={datasource} isEditing={isEditing} />
        <ul>
          {items.map((item) => (
            <ListingRow key={item.id} item={item} isEditing={isEditing} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export const Split = ({ fields, params, page }: ListingBlockProps): JSX.Element => {
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <ListingBlockEmpty />;
  }

  const items = datasource.children?.results ?? [];
  const listItems = items.slice(0, 3);
  const cardItems = items.slice(3);

  return (
    <section
      className={cn('component listing-block bg-background py-16', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2">
        <div>
          <ListingHeader datasource={datasource} isEditing={isEditing} />
          <ul>
            {listItems.map((item) => (
              <ListingRow key={item.id} item={item} isEditing={isEditing} />
            ))}
          </ul>
        </div>
        <div className="grid gap-4">
          {cardItems.map((item) => (
            <ListingCard key={item.id} item={item} isEditing={isEditing} />
          ))}
        </div>
      </div>
    </section>
  );
};
