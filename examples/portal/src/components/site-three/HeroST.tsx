'use client';

import {
  Text as ContentSdkText,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  ImageField,
  Field,
  LinkField,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Image1: ImageField;
  Image2: ImageField;
  Link1: LinkField;
  Link2: LinkField;
}

type PageHeaderSTProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: PageHeaderSTProps) => {
  return (
    <section
      className={`relative flex items-center border-8 lg:border-16 border-background ${props?.params?.styles || ''}`}
      data-class-change
    >
      <div className="absolute inset-0 z-10">
        <ContentSdkImage
          field={props?.fields?.Image1}
          width={1920}
          height={1080}
          priority={true}
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>
        <div className="relative z-20 mx-auto w-full lg:container lg:flex">
          <div className="flex min-h-[24rem] flex-col justify-center px-4 py-8 lg:min-h-[50rem] lg:w-2/3 lg:p-8">
            <div className="lg:max-w-3xl">
              <h1 className="text-primary text-xl lg:text-3xl pb-4">
                <ContentSdkText field={props?.fields?.Eyebrow} />
              </h1>
              <h1 className="text-4xl lg:text-7xl">
                <ContentSdkText field={props?.fields?.Title} />
              </h1>
              <div className="mt-8">
                <ContentSdkLink
                  field={props?.fields?.Link1}
                  prefetch={false}
                  className="btn btn-primary mr-4"
                />
                <ContentSdkLink
                  field={props?.fields?.Link2}
                  prefetch={false}
                  className="btn btn-secondary"
                />
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};

export const Right = (props: PageHeaderSTProps) => {
  return (
    <section
      className={`relative flex items-center border-8 lg:border-16 border-background ${props?.params?.styles || ''}`}
      data-class-change
    >
      <div className="absolute inset-0 z-10">
        <ContentSdkImage
          field={props?.fields?.Image1}
          width={1920}
          height={1080}
          priority={true}
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-20 mx-auto w-full lg:container lg:flex lg:flex-row-reverse">
        <div className="flex min-h-[24rem] flex-col justify-center px-4 py-8 lg:min-h-[50rem] lg:w-2/3 lg:p-8">
          <div className="lg:max-w-3xl lg:ml-auto text-right">
            <h1 className="text-primary text-xl lg:text-3xl pb-4">
              <ContentSdkText field={props?.fields?.Eyebrow} />
            </h1>
            <h1 className="text-4xl lg:text-7xl">
              <ContentSdkText field={props?.fields?.Title} />
            </h1>
            <div className="mt-8">
              <ContentSdkLink
                field={props?.fields?.Link1}
                prefetch={false}
                className="btn btn-primary mr-4"
              />
              <ContentSdkLink
                field={props?.fields?.Link2}
                prefetch={false}
                className="btn btn-secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Centered = (props: PageHeaderSTProps) => {
  return (
    <section
      className={`relative flex items-center border-8 lg:border-16 border-background ${props?.params?.styles || ''}`}
      data-class-change
    >
      <div className="absolute inset-0 z-10">
        <ContentSdkImage
          field={props?.fields?.Image1}
          width={1920}
          height={1080}
          priority={true}
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-20 mx-auto w-full lg:container lg:flex">
        <div className="lg:relative lg:left-1/6 flex min-h-[24rem] flex-col justify-center px-4 py-8 lg:min-h-[50rem] lg:w-2/3 lg:p-8">
          <div className="lg:max-w-3xl lg:mx-auto text-center">
            <h1 className="text-primary text-xl lg:text-3xl pb-4">
              <ContentSdkText field={props?.fields?.Eyebrow} />
            </h1>
            <h1 className="text-4xl lg:text-7xl">
              <ContentSdkText field={props?.fields?.Title} />
            </h1>
            <div className="mt-8">
              <ContentSdkLink
                field={props?.fields?.Link1}
                prefetch={false}
                className="btn btn-primary mr-4"
              />
              <ContentSdkLink
                field={props?.fields?.Link2}
                prefetch={false}
                className="btn btn-secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SplitScreen = (props: PageHeaderSTProps) => {

  return (
    <section
      className={`relative bg-primary border-8 lg:border-16 border-background ${props?.params?.styles || ''}`}
      data-class-change
    >
      <div className="flex flex-col lg:flex-row lg:min-h-[50rem]">
        <div className="p-8 lg:basis-full lg:self-center lg:p-14">
          <h1 className="text-xl lg:text-3xl pb-4">
            <ContentSdkText field={props?.fields?.Eyebrow} />
          </h1>
          <h1 className="text-4xl lg:text-6xl">
            <ContentSdkText field={props?.fields?.Title} />
          </h1>
          <div className="mt-8">
            <ContentSdkLink
              field={props?.fields?.Link1}
              prefetch={false}
              className="btn btn-secondary mr-4"
            />
            <ContentSdkLink
              field={props?.fields?.Link2}
              prefetch={false}
              className="btn btn-secondary"
            />
          </div>
        </div>
        <div className="relative aspect-3/2 min-h-[16rem] w-full lg:basis-full lg:aspect-auto lg:min-h-0">
          <ContentSdkImage
            field={props?.fields?.Image1}
            width={1920}
            height={1080}
            priority={true}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export const Stacked = (props: PageHeaderSTProps) => {

  return (
    <section
      className={`relative flex flex-col bg-primary lg:flex-row lg:items-center lg:min-h-[50rem] lg:bg-transparent ${props?.params?.styles || ''}`}
      data-class-change
    >
      <div className="container px-4 mx-auto">
        <div className="relative lg:w-1/2 px-6 py-12 bg-primary z-20">
          <h1 className="text-xl lg:text-3xl pb-4">
            <ContentSdkText field={props?.fields?.Eyebrow} />
          </h1>
          <h1 className="text-4xl lg:text-6xl">
            <ContentSdkText field={props?.fields?.Title} />
          </h1>
          <div className="mt-8">
            <ContentSdkLink
              field={props?.fields?.Link1}
              prefetch={false}
              className="btn btn-secondary mr-4"
            />
            <ContentSdkLink
              field={props?.fields?.Link2}
              prefetch={false}
              className="btn btn-secondary"
            />
          </div>
        </div>
      </div>
      <div className="relative aspect-3/2 lg:absolute lg:aspect-auto inset-0 flex z-10">
        <div className="relative w-1/3">
          <ContentSdkImage
            field={props?.fields?.Image2}
            width={1920}
            height={1080}
            className="absolute w-full h-full inset-0 object-cover"
          />
        </div>
        <div className="relative w-2/3">
          <ContentSdkImage
            field={props?.fields?.Image1}
            width={1920}
            height={1080}
            className="absolute inset-0 z-10 h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};
