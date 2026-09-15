import {
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
  Image as ContentSdkImage,
  ImageField,
  Field,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Body: RichTextField;
  Image1: ImageField;
  Image2: ImageField;
  Image3: ImageField;
}

type ImageBannerProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: ImageBannerProps) => {
  return (
    <section className={`relative py-16 ${props.params?.styles || ''}`} data-class-change>
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-5xl mb-6">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div className="text-lg">
            <ContentSdkRichText field={props.fields?.Body} />
          </div>
        </div>
      </div>
      <div className="container mx-auto sm:px-4">
        <div className="grid grid-cols-3 items-center mt-16">
          <div className="aspect-11/10">
            <ContentSdkImage
              field={props.fields?.Image1}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl -rotate-4 hover:rotate-4 translate-x-4 lg:translate-x-8 transition-transform"
            />
          </div>
          <div className="aspect-9/10">
            <ContentSdkImage
              field={props.fields?.Image2}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-0 hover:rotate-4 transition-transform"
            />
          </div>
          <div className="aspect-11/10">
            <ContentSdkImage
              field={props.fields?.Image3}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-4 hover:-rotate-4 -translate-x-4 lg:-translate-x-8 transition-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export const Grid = (props: ImageBannerProps) => {
  return (
    <section className={`relative py-16 ${props.params?.styles || ''}`} data-class-change>
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-5xl mb-6">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div className="text-lg">
            <ContentSdkRichText field={props.fields?.Body} />
          </div>
        </div>

        <div className="grid grid-cols-16 mt-16">
          <div className="aspect-8/3 col-span-9">
            <ContentSdkImage
              field={props.fields?.Image1}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-0 hover:rotate-4 transition-transform"
            />
          </div>
          <div className="col-span-7 row-span-2">
            <ContentSdkImage
              field={props.fields?.Image2}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-0 hover:rotate-4 transition-transform"
            />
          </div>
          <div className="aspect-4/3 col-span-9">
            <ContentSdkImage
              field={props.fields?.Image3}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-0 hover:-rotate-4 transition-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export const FullWidthRow = (props: ImageBannerProps) => {
  return (
    <section className={`relative py-16 ${props.params?.styles || ''}`} data-class-change>
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-5xl mb-6">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div className="text-lg">
            <ContentSdkRichText field={props.fields?.Body} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-24 mt-16">
        <div className="col-span-7 h-64 lg:h-84">
          <ContentSdkImage
            field={props.fields?.Image1}
            width={1920}
            height={1080}
            className="w-full h-full object-cover shadow-2xl rotate-0 hover:-rotate-4 transition-transform"
          />
        </div>
        <div className="col-span-10 h-64 lg:h-84">
          <ContentSdkImage
            field={props.fields?.Image2}
            width={1920}
            height={1080}
            className="w-full h-full object-cover shadow-2xl rotate-0 hover:rotate-4 transition-transform"
          />
        </div>
        <div className="col-span-7 h-64 lg:h-84">
          <ContentSdkImage
            field={props.fields?.Image3}
            width={1920}
            height={1080}
            className="w-full h-full object-cover shadow-2xl rotate-0 hover:-rotate-4 transition-transform"
          />
        </div>
      </div>
    </section>
  );
};

export const SingleRowGrid = (props: ImageBannerProps) => {
  return (
    <section className={`relative py-16 ${props.params?.styles || ''}`} data-class-change>
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-5xl mb-6">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div className="text-lg">
            <ContentSdkRichText field={props.fields?.Body} />
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 mt-16">
          <div className="col-span-3 h-64 lg:h-84 mt-10">
            <ContentSdkImage
              field={props.fields?.Image1}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-0 hover:rotate-4 transition-transform"
            />
          </div>
          <div className="col-span-4 h-64 lg:h-84">
            <ContentSdkImage
              field={props.fields?.Image2}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-0 hover:rotate-4 transition-transform"
            />
          </div>
          <div className="col-span-3 h-64 lg:h-84 mt-10">
            <ContentSdkImage
              field={props.fields?.Image3}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-0 hover:-rotate-4 transition-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/* Version1 — Amkor: centered heading, single full-width map, legend in Body */
export const Version1 = (props: ImageBannerProps) => {
  return (
    <section
      className={`relative bg-background py-16 ${props.params?.styles || ''}`}
      data-class-change
      data-testid="image-banner-version1"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="mb-10 text-3xl font-semibold text-primary lg:text-5xl"
            style={{ fontFamily: 'var(--brand-heading-font)' }}
          >
            <ContentSdkText field={props.fields?.Title} />
          </h2>
        </div>
        <div className="mx-auto max-w-6xl">
          <ContentSdkImage
            field={props.fields?.Image1}
            width={1600}
            height={800}
            className="h-auto w-full object-contain"
          />
        </div>
        <div className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted-foreground lg:text-base">
          <ContentSdkRichText field={props.fields?.Body} />
        </div>
      </div>
    </section>
  );
};

export const Stacked = (props: ImageBannerProps) => {
  return (
    <section className={`relative py-16 ${props.params?.styles || ''}`} data-class-change>
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-5xl mb-6">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div className="text-lg">
            <ContentSdkRichText field={props.fields?.Body} />
          </div>
        </div>
      </div>
      <div className="container mx-auto sm:px-4">
        <div className="grid grid-cols-12 items-center gap-y-4 sm:gap-y-8 md:gap-y-10 lg:gap-y-16 mt-16">
          <div className="col-span-5 aspect-square">
            <ContentSdkImage
              field={props.fields?.Image1}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl -rotate-1 hover:rotate-4 translate-x-1 transition-transform"
            />
          </div>
          <div className="col-span-6 col-start-7 aspect-square">
            <ContentSdkImage
              field={props.fields?.Image2}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl rotate-4 hover:-rotate-4 -translate-x-4 transition-transform"
            />
          </div>
          <div className="col-span-7 col-start-3 aspect-square">
            <ContentSdkImage
              field={props.fields?.Image3}
              width={1920}
              height={1080}
              className="w-full h-full object-cover shadow-2xl -rotate-3 hover:rotate-3 transition-transform"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
