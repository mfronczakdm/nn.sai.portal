'use client';

import {
  Text as ContentSdkText,
  NextImage as ContentSdkImage,
  ImageField,
  Field,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import { TrackedCtaLink } from '@/components/content-sdk/TrackedCtaLink';
import { cn } from '@/lib/utils';

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Image1: ImageField;
  Image2: ImageField;
  Link1: LinkField;
  Link2: LinkField;
}

/**
 * Full-bleed hero backgrounds use `object-cover` so the image always fills the hero box.
 * Cropping is expected when the image aspect ratio differs from the rendered hero.
 *
 * Vertical band: mobile ~400–600px, laptop (md) ~500–600px, desktop (lg+) ~600–800px.
 * Next/Image `width`/`height` (e.g. 1920×1080) are intrinsic aspect hints; that resolution stays a
 * solid choice for crisp wide layouts even when the rendered hero is shorter.
 */
const HERO_BG_IMAGE_CLASS = 'h-full w-full object-cover object-center';
const HERO_BG_LAYER_CLASS = 'absolute inset-0 z-10 bg-muted';

/** Responsive hero content column / split row height band */
const HERO_CONTENT_BAND_CLASS =
  'min-h-[400px] max-h-[600px] md:min-h-[500px] md:max-h-[600px] lg:min-h-[600px] lg:max-h-[800px]';

/** Main headline scale (smaller than previous display sizes for shorter hero band) */
const HERO_TITLE_CLASS = 'text-3xl md:text-4xl lg:text-5xl';

/** Light text over dark photography. Do not use text-primary-foreground — that token is black in the default @theme. */
const HERO_TEXT_ON_DARK_IMAGE_CLASS = 'text-white [text-shadow:0_1px_8px_rgb(0_0_0_/_0.45)]';

type PageHeaderSTProps = {
  params: { [key: string]: string };
  fields: Fields;
};

/** Sitecore checkbox rendering parameters often arrive as 1 / true / yes / on (strings). */
function isCheckboxParamEnabled(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value == null) return false;
  const v = String(value).trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/**
 * Rendering parameter displayed as "Dark Image". The Sitecore field name is the typo
 * "Dark Imge" (Title = Dark Image). Also accepts DarkImage and styles class names.
 */
function isDarkImageHero(params: PageHeaderSTProps['params'] | undefined): boolean {
  if (!params) return false;
  for (const [key, value] of Object.entries(params)) {
    const normalized = key.replace(/[\s_-]/g, '').toLowerCase();
    // Field name "Dark Imge" → darkimge; Title/docs "Dark Image" → darkimage
    if ((normalized === 'darkimage' || normalized === 'darkimge') && isCheckboxParamEnabled(value)) {
      return true;
    }
  }
  const stylesBlob = [params.styles, params.Styles].filter((s) => typeof s === 'string').join(' ');
  if (stylesBlob && /dark[\s_-]*im[a]?ge/i.test(stylesBlob)) {
    return true;
  }
  return false;
}

type HeroImageLayout = 'primary' | 'both';

/**
 * Rendering parameter "Image Layout" (Styling, next to Dark Image).
 * Unset / Both Images keeps the Version1 collage. Primary Image uses Image1 only.
 */
function resolveHeroImageLayout(
  params: PageHeaderSTProps['params'] | undefined
): HeroImageLayout {
  if (!params) return 'both';
  for (const [key, value] of Object.entries(params)) {
    const normalizedKey = key.replace(/[\s_-]/g, '').toLowerCase();
    if (normalizedKey !== 'imagelayout') continue;
    const normalizedValue = String(value ?? '')
      .replace(/[\s_-]/g, '')
      .toLowerCase();
    if (normalizedValue === 'primaryimage' || normalizedValue === 'primary') return 'primary';
    if (normalizedValue === 'bothimages' || normalizedValue === 'both') return 'both';
  }
  return 'both';
}

function heroSectionProps(params: PageHeaderSTProps['params'] | undefined, extraClassName: string) {
  const darkImage = isDarkImageHero(params);
  return {
    className: cn(extraClassName, params?.styles, params?.Styles),
    'data-class-change': true,
    'data-hero-st-dark-image': darkImage ? 'true' : undefined,
  };
}

function heroEyebrowOverPhotoClass(darkImage: boolean): string {
  return cn(
    'text-xl lg:text-3xl pb-4',
    darkImage ? HERO_TEXT_ON_DARK_IMAGE_CLASS : 'text-primary'
  );
}

function heroTitleOverPhotoClass(darkImage: boolean): string {
  return cn(HERO_TITLE_CLASS, darkImage && HERO_TEXT_ON_DARK_IMAGE_CLASS);
}

export const Default = (props: PageHeaderSTProps) => {
  const darkImage = isDarkImageHero(props.params);
  return (
    <section
      {...heroSectionProps(
        props.params,
        'relative flex items-center border-8 lg:border-16 border-background'
      )}
    >
      <div className={HERO_BG_LAYER_CLASS}>
        <ContentSdkImage
          field={props?.fields?.Image1}
          width={1920}
          height={1080}
          priority={true}
          fetchPriority="high"
          className={HERO_BG_IMAGE_CLASS}
        />
      </div>
        <div className="relative z-20 mx-auto w-full lg:container lg:flex">
          <div
            className={`flex flex-col justify-center px-4 py-8 lg:w-2/3 lg:p-8 ${HERO_CONTENT_BAND_CLASS}`}
          >
            <div className="lg:max-w-3xl">
              <h1 className={heroEyebrowOverPhotoClass(darkImage)}>
                <ContentSdkText field={props?.fields?.Eyebrow} />
              </h1>
              <h1 className={heroTitleOverPhotoClass(darkImage)}>
                <ContentSdkText field={props?.fields?.Title} />
              </h1>
              <div className="mt-8">
                <TrackedCtaLink
                  field={props?.fields?.Link1}
                  prefetch={false}
                  className="btn btn-primary mr-4"
                />
                <TrackedCtaLink
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
  const darkImage = isDarkImageHero(props.params);
  return (
    <section
      {...heroSectionProps(
        props.params,
        'relative flex items-center border-8 lg:border-16 border-background'
      )}
    >
      <div className={HERO_BG_LAYER_CLASS}>
        <ContentSdkImage
          field={props?.fields?.Image1}
          width={1920}
          height={1080}
          priority={true}
          fetchPriority="high"
          className={HERO_BG_IMAGE_CLASS}
        />
      </div>
      <div className="relative z-20 mx-auto w-full lg:container lg:flex lg:flex-row-reverse">
        <div
          className={`flex flex-col justify-center px-4 py-8 lg:w-2/3 lg:p-8 ${HERO_CONTENT_BAND_CLASS}`}
        >
          <div className="lg:max-w-3xl lg:ml-auto text-right">
            <h1 className={heroEyebrowOverPhotoClass(darkImage)}>
              <ContentSdkText field={props?.fields?.Eyebrow} />
            </h1>
            <h1 className={heroTitleOverPhotoClass(darkImage)}>
              <ContentSdkText field={props?.fields?.Title} />
            </h1>
            <div className="mt-8">
              <TrackedCtaLink
                field={props?.fields?.Link1}
                prefetch={false}
                className="btn btn-primary mr-4"
              />
              <TrackedCtaLink
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
  const darkImage = isDarkImageHero(props.params);
  return (
    <section
      {...heroSectionProps(
        props.params,
        'relative flex items-center border-8 lg:border-16 border-background'
      )}
    >
      <div className={HERO_BG_LAYER_CLASS}>
        <ContentSdkImage
          field={props?.fields?.Image1}
          width={1920}
          height={1080}
          priority={true}
          fetchPriority="high"
          className={HERO_BG_IMAGE_CLASS}
        />
      </div>
      <div className="relative z-20 mx-auto w-full lg:container lg:flex">
        <div
          className={`lg:relative lg:left-1/6 flex flex-col justify-center px-4 py-8 lg:w-2/3 lg:p-8 ${HERO_CONTENT_BAND_CLASS}`}
        >
          <div className="lg:max-w-3xl lg:mx-auto text-center">
            <h1 className={heroEyebrowOverPhotoClass(darkImage)}>
              <ContentSdkText field={props?.fields?.Eyebrow} />
            </h1>
            <h1 className={heroTitleOverPhotoClass(darkImage)}>
              <ContentSdkText field={props?.fields?.Title} />
            </h1>
            <div className="mt-8">
              <TrackedCtaLink
                field={props?.fields?.Link1}
                prefetch={false}
                className="btn btn-primary mr-4"
              />
              <TrackedCtaLink
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
      <div className={`flex flex-col lg:flex-row ${HERO_CONTENT_BAND_CLASS}`}>
        <div className="p-8 lg:basis-full lg:self-center lg:p-14">
          <h1 className="text-xl lg:text-3xl pb-4">
            <ContentSdkText field={props?.fields?.Eyebrow} />
          </h1>
          <h1 className={HERO_TITLE_CLASS}>
            <ContentSdkText field={props?.fields?.Title} />
          </h1>
          <div className="mt-8">
            <TrackedCtaLink
              field={props?.fields?.Link1}
              prefetch={false}
              className="btn btn-secondary mr-4"
            />
            <TrackedCtaLink
              field={props?.fields?.Link2}
              prefetch={false}
              className="btn btn-secondary"
            />
          </div>
        </div>
        <div className="relative aspect-3/2 min-h-[16rem] w-full bg-muted lg:basis-full lg:aspect-auto lg:min-h-0">
          <ContentSdkImage
            field={props?.fields?.Image1}
            width={1920}
            height={1080}
            priority={true}
            fetchPriority="high"
            className={`absolute inset-0 ${HERO_BG_IMAGE_CLASS}`}
          />
        </div>
      </div>
    </section>
  );
};

export const Stacked = (props: PageHeaderSTProps) => {

  return (
    <section
      className={`relative flex flex-col bg-primary lg:flex-row lg:items-center lg:bg-transparent ${HERO_CONTENT_BAND_CLASS} ${props?.params?.styles || ''}`}
      data-class-change
    >
      <div className="container px-4 mx-auto">
        <div className="relative lg:w-1/2 px-6 py-12 bg-primary z-20">
          <h1 className="text-xl lg:text-3xl pb-4">
            <ContentSdkText field={props?.fields?.Eyebrow} />
          </h1>
          <h1 className={HERO_TITLE_CLASS}>
            <ContentSdkText field={props?.fields?.Title} />
          </h1>
          <div className="mt-8">
            <TrackedCtaLink
              field={props?.fields?.Link1}
              prefetch={false}
              className="btn btn-secondary mr-4"
            />
            <TrackedCtaLink
              field={props?.fields?.Link2}
              prefetch={false}
              className="btn btn-secondary"
            />
          </div>
        </div>
      </div>
      <div className="relative aspect-3/2 lg:absolute lg:aspect-auto inset-0 flex z-10 bg-muted">
        <div className="relative w-1/3">
          <ContentSdkImage
            field={props?.fields?.Image2}
            width={1920}
            height={1080}
            className={`absolute inset-0 ${HERO_BG_IMAGE_CLASS}`}
          />
        </div>
        <div className="relative w-2/3">
          <ContentSdkImage
            field={props?.fields?.Image1}
            width={1920}
            height={1080}
            className={`absolute inset-0 z-10 ${HERO_BG_IMAGE_CLASS}`}
          />
        </div>
      </div>
    </section>
  );
};

function hasImageSrc(field?: ImageField): boolean {
  return Boolean(field?.value?.src);
}

/** Rectangular earth-tone mosaic with white gutters — not MediaCanvas ovals. */
function CollageMosaicBackdrop() {
  return (
    <div
      aria-hidden="true"
      data-hero-st-collage-mosaic=""
      className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1.5 rounded-none bg-[var(--color-hero-surface,var(--color-background))]"
    >
      <div className="col-span-6 row-span-2 rounded-none bg-[var(--color-hero-headline)]" />
      <div className="col-span-2 row-span-4 rounded-none bg-[var(--color-primary)]" />
      <div className="col-span-2 row-span-2 rounded-none bg-[var(--color-accent)]" />
      <div className="col-span-2 row-span-2 rounded-none bg-[color-mix(in_srgb,var(--color-primary)_50%,white)]" />
      <div className="col-span-2 row-span-2 rounded-none bg-[color-mix(in_srgb,var(--color-hero-headline)_75%,var(--color-accent))]" />
      <div className="col-span-2 row-span-2 rounded-none bg-[color-mix(in_srgb,var(--color-accent)_70%,black)]" />
    </div>
  );
}

/* Version1 — Atlanta Apparel collage-left / copy-right. Default and other exports are unchanged.
   Image Layout rendering param: Primary Image = Image1 only; Both Images (default) = collage. */
export const Version1 = (props: PageHeaderSTProps) => {
  const portraitOrComposite = props?.fields?.Image1;
  const mosaicImage = props?.fields?.Image2;
  const imageLayout = resolveHeroImageLayout(props.params);
  const usePrimaryOnly = imageLayout === 'primary';
  const hasMosaicImage = !usePrimaryOnly && hasImageSrc(mosaicImage);

  return (
    <section
      {...heroSectionProps(
        props.params,
        'hero-st-version1 relative bg-[var(--color-hero-surface,var(--color-light))]'
      )}
      data-hero-st-variant="Version1"
      data-hero-st-image-layout={imageLayout}
    >
      <div className="mx-auto grid w-full lg:grid-cols-2 lg:items-stretch">
        <div className="relative min-h-[340px] w-full p-2 md:min-h-[480px] lg:min-h-[560px] lg:p-3">
          <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-none">
            {!usePrimaryOnly && <CollageMosaicBackdrop />}
            {hasMosaicImage && (
              <ContentSdkImage
                field={mosaicImage}
                width={1200}
                height={1200}
                className="absolute inset-0 z-[1] h-full w-full rounded-none object-cover object-center"
              />
            )}
            <div
              className={cn(
                'absolute z-[2]',
                hasMosaicImage
                  ? 'inset-x-[10%] bottom-0 top-[16%] flex items-end justify-center'
                  : 'inset-0'
              )}
            >
              <ContentSdkImage
                field={portraitOrComposite}
                width={1200}
                height={1400}
                priority={true}
                fetchPriority="high"
                className={
                  hasMosaicImage
                    ? 'h-full w-auto max-w-[78%] object-contain object-bottom'
                    : 'h-full w-full rounded-none object-cover object-center'
                }
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center px-6 py-10 md:px-10 lg:px-14 lg:py-16 xl:pr-28">
          <div className="max-w-xl">
            <h1
              className="max-w-[11ch] text-[clamp(2.35rem,4.6vw,4.35rem)] font-black uppercase leading-[0.92] tracking-tight text-[var(--color-hero-headline)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <ContentSdkText field={props?.fields?.Title} />
            </h1>
            <p
              className="mt-5 text-base font-medium normal-case tracking-normal text-[var(--color-foreground)] md:text-lg"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <ContentSdkText field={props?.fields?.Eyebrow} />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedCtaLink
                field={props?.fields?.Link1}
                prefetch={false}
                className="btn btn-primary rounded-none px-6 py-3 text-sm font-bold uppercase tracking-wide"
              />
              <TrackedCtaLink
                field={props?.fields?.Link2}
                prefetch={false}
                className="btn btn-secondary rounded-none px-6 py-3 text-sm font-bold uppercase tracking-wide"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* Version2 — Full-bleed Image1 background with overlaid copy. */
export const Version2 = (props: PageHeaderSTProps) => {
  const darkImage = isDarkImageHero(props.params);

  return (
    <section
      {...heroSectionProps(
        props.params,
        'hero-st-version2 relative flex items-center'
      )}
      data-hero-st-variant="Version2"
    >
      <div className={HERO_BG_LAYER_CLASS}>
        <ContentSdkImage
          field={props?.fields?.Image1}
          width={1920}
          height={1080}
          priority={true}
          fetchPriority="high"
          className={HERO_BG_IMAGE_CLASS}
        />
      </div>
      <div className="relative z-20 mx-auto w-full lg:container lg:flex">
        <div
          className={`flex flex-col justify-center px-6 py-10 md:px-10 lg:w-2/3 lg:px-14 lg:py-16 ${HERO_CONTENT_BAND_CLASS}`}
        >
          <div className="max-w-xl">
            <h1
              className={cn(
                'max-w-[11ch] text-[clamp(2.35rem,4.6vw,4.35rem)] font-black uppercase leading-[0.92] tracking-tight',
                darkImage ? HERO_TEXT_ON_DARK_IMAGE_CLASS : 'text-[var(--color-hero-headline)]'
              )}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <ContentSdkText field={props?.fields?.Title} />
            </h1>
            <p
              className={cn(
                'mt-5 text-base font-medium normal-case tracking-normal md:text-lg',
                darkImage ? HERO_TEXT_ON_DARK_IMAGE_CLASS : 'text-[var(--color-foreground)]'
              )}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <ContentSdkText field={props?.fields?.Eyebrow} />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackedCtaLink
                field={props?.fields?.Link1}
                prefetch={false}
                className="btn btn-primary rounded-none px-6 py-3 text-sm font-bold uppercase tracking-wide"
              />
              <TrackedCtaLink
                field={props?.fields?.Link2}
                prefetch={false}
                className="btn btn-secondary rounded-none px-6 py-3 text-sm font-bold uppercase tracking-wide"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
