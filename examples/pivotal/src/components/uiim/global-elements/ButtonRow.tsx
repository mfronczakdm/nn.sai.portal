import type { JSX } from 'react';
import { Link as ContentSdkLink, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { IGQLLinkField, IGQLTextField } from 'src/types/igql';

interface ButtonRowItemFields {
  id: string;
  itemLink?: IGQLLinkField;
}

interface ButtonRowFields {
  data?: {
    datasource?: {
      sectionTitle?: IGQLTextField;
      description?: IGQLTextField;
      children?: {
        results?: ButtonRowItemFields[];
      };
    };
  };
}

export type ButtonRowProps = ComponentProps & {
  fields?: ButtonRowFields;
};

const ButtonRowEmpty = (): JSX.Element => <NoDataFallback componentName="ButtonRow" />;

function ButtonRowLayout({
  fields,
  params,
  page,
  dark,
}: ButtonRowProps & { dark: boolean }): JSX.Element {
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;

  if (!datasource) {
    return <ButtonRowEmpty />;
  }

  const items = datasource.children?.results ?? [];

  return (
    <section
      className={cn(
        'component button-row py-14',
        dark ? 'bg-primary text-primary-foreground' : 'bg-background',
        params?.styles
      )}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto max-w-6xl px-4 text-center">
        {(datasource.sectionTitle?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.sectionTitle?.jsonValue}
            tag="h2"
            className="mb-3 text-2xl font-bold uppercase tracking-wide md:text-4xl"
          />
        )}
        {(datasource.description?.jsonValue?.value || isEditing) && (
          <Text
            field={datasource.description?.jsonValue}
            tag="p"
            className={cn('mx-auto mb-8 max-w-2xl text-base', dark && 'text-primary-foreground/80')}
          />
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item) =>
            item.itemLink?.jsonValue?.value?.href || isEditing ? (
              <ContentSdkLink
                key={item.id}
                field={item.itemLink?.jsonValue ?? { value: { href: '' } }}
                className={cn(
                  'inline-flex rounded-md border px-5 py-2 text-sm font-semibold uppercase tracking-wide',
                  dark
                    ? 'border-primary-foreground text-primary-foreground'
                    : 'border-foreground text-foreground'
                )}
              />
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}

export const Default = (props: ButtonRowProps): JSX.Element => (
  <ButtonRowLayout {...props} dark={false} />
);

export const DarkGhost = (props: ButtonRowProps): JSX.Element => (
  <ButtonRowLayout {...props} dark />
);
