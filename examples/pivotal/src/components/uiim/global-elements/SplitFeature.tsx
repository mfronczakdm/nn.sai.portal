import type { JSX } from 'react';
import {
  Field,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  RichTextField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

interface SplitFeatureFields {
  EyebrowText?: Field<string>;
  SectionTitle?: Field<string>;
  Description?: RichTextField;
  FeatureImage?: ImageField;
  PrimaryLink?: LinkField;
  SecondaryLink?: LinkField;
}

export type SplitFeatureProps = ComponentProps & {
  fields?: SplitFeatureFields;
};

const SplitFeatureEmpty = (): JSX.Element => <NoDataFallback componentName="SplitFeature" />;

function SplitFeatureLayout({
  fields,
  params,
  page,
  imageLeft,
}: SplitFeatureProps & { imageLeft: boolean }): JSX.Element {
  const isEditing = page?.mode?.isEditing;

  if (!fields) {
    return <SplitFeatureEmpty />;
  }

  return (
    <section
      className={cn('component split-feature bg-background py-16', params?.styles)}
      id={params?.RenderingIdentifier}
    >
      <div className="component-content mx-auto grid max-w-7xl items-center gap-10 px-4 md:grid-cols-2">
        <div className={cn(imageLeft ? 'md:order-2' : 'md:order-1')}>
          {(fields.EyebrowText?.value || isEditing) && (
            <Text
              field={fields.EyebrowText}
              tag="p"
              className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary"
            />
          )}
          {(fields.SectionTitle?.value || isEditing) && (
            <Text
              field={fields.SectionTitle}
              tag="h2"
              className="mb-4 text-3xl font-bold text-foreground md:text-5xl"
            />
          )}
          {(fields.Description?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Description}
              className="mb-6 text-base text-muted-foreground"
            />
          )}
          <div className="flex flex-wrap gap-3">
            {(fields.PrimaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.PrimaryLink ?? { value: { href: '' } }}
                className="inline-flex rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              />
            )}
            {(fields.SecondaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.SecondaryLink ?? { value: { href: '' } }}
                className="inline-flex rounded-md border border-border px-5 py-2 text-sm font-semibold"
              />
            )}
          </div>
        </div>
        {(fields.FeatureImage?.value?.src || isEditing) && (
          <div className={cn(imageLeft ? 'md:order-1' : 'md:order-2')}>
            <ContentSdkImage
              field={fields.FeatureImage}
              className="h-auto w-full rounded-2xl object-cover shadow-sm"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export const Default = (props: SplitFeatureProps): JSX.Element => (
  <SplitFeatureLayout {...props} imageLeft={false} />
);

export const ImageLeft = (props: SplitFeatureProps): JSX.Element => (
  <SplitFeatureLayout {...props} imageLeft />
);
