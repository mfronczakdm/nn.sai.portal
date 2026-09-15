'use client';

import { Text as ContentSdkText, NextImage as ContentSdkImage } from '@sitecore-content-sdk/nextjs';
import { useMemo } from 'react';
import { IGQLImageField, IGQLLinkField, IGQLTextField } from 'types/igql';
import { extractImageSrc } from '@/lib/sitecore-image-field';
import { cn } from '@/lib/utils';

interface Fields {
  data: {
    datasource: {
      title: IGQLTextField;
      link: IGQLLinkField;
      children: {
        results: FeatureItemFields[];
      };
    };
  };
}

interface FeatureItemFields {
  id: string;
  image: IGQLImageField;
  heading: IGQLTextField;
}

type FeatureBannerProps = {
  params: { [key: string]: string };
  fields: Fields;
};

type FeatureItemProps = FeatureItemFields & {
  className?: string;
  imageClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
  showHeading?: boolean;
};

const FeatureItem = ({
  className,
  imageClassName = 'h-6 w-6 object-contain',
  imageWidth = 24,
  imageHeight = 24,
  showHeading = true,
  ...props
}: FeatureItemProps) => {
  const imageField = props?.image?.jsonValue;
  const resolvedSrc = extractImageSrc(imageField) || extractImageSrc(props?.image);
  const editableImageField =
    imageField && resolvedSrc && !(imageField as { value?: { src?: string } })?.value?.src
      ? ({
          ...imageField,
          value: {
            ...((imageField as { value?: object }).value || {}),
            src: resolvedSrc,
          },
        } as typeof imageField)
      : imageField;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <ContentSdkImage
        field={editableImageField}
        width={imageWidth}
        height={imageHeight}
        className={imageClassName}
      />
      {showHeading && (
        <p className="text-base text-center">
          <ContentSdkText field={props?.heading?.jsonValue} />
        </p>
      )}
    </div>
  );
};

export const Default = (props: FeatureBannerProps) => {
  const datasource = useMemo(
    () => props?.fields?.data?.datasource,
    [props?.fields?.data?.datasource]
  );

  return (
    <section className={`py-16 ${props?.params?.styles}`} data-class-change>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 py-12 border-t border-b border-border">
          <h2 className="text-2xl lg:text-5xl">
            <ContentSdkText field={datasource?.title?.jsonValue} />
          </h2>
          <div className="flex flex-wrap lg:flex-nowrap justify-center items-start gap-8">
            {datasource?.children?.results?.map((item) => (
              <FeatureItem key={item.id} {...item} />
            )) || []}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Vertical = (props: FeatureBannerProps) => {
  const datasource = useMemo(
    () => props?.fields?.data?.datasource,
    [props?.fields?.data?.datasource]
  );

  return (
    <section className={`py-16 ${props?.params?.styles}`} data-class-change>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 lg:gap-12 py-12 border-t border-b border-border">
          <h2 className="text-2xl lg:text-5xl">
            <ContentSdkText field={datasource?.title?.jsonValue} />
          </h2>
          <div className="flex flex-wrap justify-center items-start gap-8 md:gap-10 lg:gap-12">
            {datasource?.children?.results?.map((item) => (
              <FeatureItem
                key={item.id}
                {...item}
                imageClassName="h-16 w-16 object-contain sm:h-20 sm:w-20"
                imageWidth={80}
                imageHeight={80}
              />
            )) || []}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Accent = (props: FeatureBannerProps) => {
  const datasource = useMemo(
    () => props?.fields?.data?.datasource,
    [props?.fields?.data?.datasource]
  );

  return (
    <section
      className={`py-16 border-t border-b border-border ${props?.params?.styles}`}
      data-class-change
    >
      <div className="bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 py-12">
            <h2 className="text-2xl lg:text-5xl">
              <ContentSdkText field={datasource?.title?.jsonValue} />
            </h2>
            <div className="flex flex-wrap lg:flex-nowrap justify-center items-start gap-8">
              {datasource?.children?.results?.map((item) => (
                <FeatureItem key={item.id} {...item} />
              )) || []}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Images only — no section title, no item headings (graphics that already include text). */
export const ImagesOnly = (props: FeatureBannerProps) => {
  const datasource = useMemo(
    () => props?.fields?.data?.datasource,
    [props?.fields?.data?.datasource]
  );
  const items = datasource?.children?.results || [];

  return (
    <section className={cn('py-8 md:py-10', props?.params?.styles)} data-class-change>
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-nowrap items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {items.map((item) => (
            <FeatureItem
              key={item.id}
              {...item}
              showHeading={false}
              className="min-w-0 flex-1 basis-0"
              imageClassName="h-auto w-full object-contain"
              imageWidth={320}
              imageHeight={120}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
