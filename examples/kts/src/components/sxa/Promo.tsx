import React, { type JSX } from 'react';
import {
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  ImageField,
  Field,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import { Button } from '@/components/ui/button';
import { TrackedCtaLink } from '@/components/content-sdk/TrackedCtaLink';
import { cn } from '@/lib/utils';

interface Fields {
  PromoIcon: ImageField;
  PromoText: Field<string>;
  PromoLink: LinkField;
  PromoLink2?: LinkField;
  PromoText2: Field<string>;
  PromoText3: Field<string>;
}

type PromoProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const PROMO_BACKGROUND_OPTIONS = ['dark', 'light', 'primary', 'secondary', 'tertiary'] as const;
type PromoBackground = (typeof PROMO_BACKGROUND_OPTIONS)[number];

type BoldPromoBackgroundTheme = {
  containerBg: string;
  textColor: string;
  richTextClasses: string;
  buttonClasses: string;
};

const boldRichTextOnDarkBg =
  '[&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:text-white [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-white [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-white [&_p]:mb-0 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-white [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-white [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:marker:text-white [&_li]:text-base [&_li]:leading-relaxed [&_li]:text-white [&_li_p]:mb-0 [&_li_p]:text-base [&_li_p]:leading-relaxed [&_li_p]:text-white';

const boldRichTextOnLightBg =
  '[&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:text-foreground [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-foreground [&_h3]:mb-4 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-foreground [&_p]:mb-0 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-foreground [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-foreground [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:marker:text-foreground [&_li]:text-base [&_li]:leading-relaxed [&_li]:text-foreground [&_li_p]:mb-0 [&_li_p]:text-base [&_li_p]:leading-relaxed [&_li_p]:text-foreground';

const boldPromoBackgroundThemes: Record<PromoBackground, BoldPromoBackgroundTheme> = {
  dark: {
    containerBg: 'bg-[#0a1a44]',
    textColor: 'text-white',
    richTextClasses: boldRichTextOnDarkBg,
    buttonClasses:
      'border-white bg-transparent text-white hover:bg-white hover:text-[#0a1a44]',
  },
  light: {
    containerBg: 'bg-background',
    textColor: 'text-foreground',
    richTextClasses: boldRichTextOnLightBg,
    buttonClasses:
      'border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground',
  },
  primary: {
    containerBg: 'bg-primary',
    textColor: 'text-primary-foreground',
    richTextClasses: boldRichTextOnDarkBg,
    buttonClasses:
      'border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary',
  },
  secondary: {
    containerBg: 'bg-secondary',
    textColor: 'text-secondary-foreground',
    richTextClasses: boldRichTextOnLightBg,
    buttonClasses:
      'border-secondary-foreground bg-transparent text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary',
  },
  tertiary: {
    containerBg: 'bg-tertiary',
    textColor: 'text-tertiary-foreground',
    richTextClasses: boldRichTextOnLightBg,
    buttonClasses:
      'border-tertiary-foreground bg-transparent text-tertiary-foreground hover:bg-tertiary-foreground hover:text-tertiary',
  },
};

const resolvePromoBackground = (
  params: { [key: string]: string },
  fallback: PromoBackground = 'dark'
): PromoBackground => {
  const value = (params.Background ?? params.background ?? fallback).toLowerCase().trim();

  return PROMO_BACKGROUND_OPTIONS.includes(value as PromoBackground)
    ? (value as PromoBackground)
    : fallback;
};

type ColumnsPromoBackgroundTheme = {
  containerBg: string;
  titleClasses: string;
  rateClasses: string;
  buttonClasses: string;
};

const columnsPromoTitleBase =
  'font-heading text-3xl leading-tight tracking-tight lg:text-4xl [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-normal [&_h1]:leading-tight [&_h1]:lg:text-4xl [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:leading-tight [&_h2]:lg:text-4xl [&_p]:font-heading [&_p]:text-3xl [&_p]:font-normal [&_p]:leading-tight [&_p]:lg:text-4xl';

const columnsPromoRateBase =
  'font-body text-center [&_h1]:font-heading [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:font-heading [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:font-heading [&_h3]:mb-4 [&_h3]:text-4xl [&_h3]:font-bold [&_p]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed';

const columnsPromoButtonBase =
  'rounded-none bg-transparent px-6 py-2 text-sm font-semibold uppercase tracking-wide';

const columnsTitleOnLight = cn(columnsPromoTitleBase, 'text-primary [&_h1]:text-primary [&_h2]:text-primary [&_p]:text-primary');
const columnsTitleOnDark = cn(columnsPromoTitleBase, 'text-white [&_h1]:text-white [&_h2]:text-white [&_p]:text-white');

const columnsRateOnLight = cn(
  columnsPromoRateBase,
  'text-foreground [&_h1]:text-primary [&_h2]:text-primary [&_h3]:text-primary [&_p]:text-muted-foreground'
);
const columnsRateOnDark = cn(
  columnsPromoRateBase,
  'text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-white/80'
);

const columnsPromoBackgroundThemes: Record<PromoBackground, ColumnsPromoBackgroundTheme> = {
  dark: {
    containerBg: 'bg-[#0a1a44]',
    titleClasses: columnsTitleOnDark,
    rateClasses: columnsRateOnDark,
    buttonClasses: cn(
      columnsPromoButtonBase,
      'border-white text-white hover:bg-white hover:text-[#0a1a44]'
    ),
  },
  light: {
    containerBg: 'bg-muted',
    titleClasses: columnsTitleOnLight,
    rateClasses: columnsRateOnLight,
    buttonClasses: cn(
      columnsPromoButtonBase,
      'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
    ),
  },
  primary: {
    containerBg: 'bg-primary',
    titleClasses: columnsTitleOnDark,
    rateClasses: columnsRateOnDark,
    buttonClasses: cn(
      columnsPromoButtonBase,
      'border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary'
    ),
  },
  secondary: {
    containerBg: 'bg-secondary',
    titleClasses: columnsTitleOnDark,
    rateClasses: columnsRateOnDark,
    buttonClasses: cn(
      columnsPromoButtonBase,
      'border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary'
    ),
  },
  tertiary: {
    containerBg: 'bg-tertiary',
    titleClasses: columnsTitleOnDark,
    rateClasses: columnsRateOnDark,
    buttonClasses: cn(
      columnsPromoButtonBase,
      'border-tertiary-foreground text-tertiary-foreground hover:bg-tertiary-foreground hover:text-tertiary'
    ),
  },
};

const splitPromoTitleClasses =
  'font-heading text-primary text-3xl leading-tight tracking-tight lg:text-4xl [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:font-normal [&_h1]:leading-tight [&_h1]:text-primary [&_h1]:lg:text-4xl [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:leading-tight [&_h2]:text-primary [&_h2]:lg:text-4xl [&_p]:font-heading [&_p]:text-3xl [&_p]:font-normal [&_p]:leading-tight [&_p]:text-primary [&_p]:lg:text-4xl';

const splitPromoBodyClasses = cn(
  'content-sdk-rich-text font-body text-foreground mt-6 max-w-prose text-base leading-relaxed',
  '[&_p]:mb-0 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-foreground [&_p+p]:mt-3',
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:space-y-3 [&_ul]:pl-6 [&_ul]:marker:text-primary',
  '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:space-y-3 [&_ol]:pl-6 [&_ol]:marker:text-primary',
  '[&_li]:text-base [&_li]:leading-relaxed [&_li]:text-foreground [&_li]:pl-1 [&_li_p]:mb-0 [&_li_p]:text-base [&_li_p]:leading-relaxed [&_li_p]:text-foreground'
);

const splitPromoCtaClasses =
  'inline-flex items-center justify-center whitespace-nowrap rounded-none bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground no-underline transition-colors hover:bg-primary-hover hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

const ColumnsPromoLayout = (props: PromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const background = resolvePromoBackground(props.params, 'light');
  const theme = columnsPromoBackgroundThemes[background];
  const { PromoText, PromoText2, PromoText3, PromoLink, PromoLink2 } = props.fields;

  return (
    <section
      data-class-change
      className={cn('component promo w-full', theme.containerBg, props.params.styles)}
      id={id ? id : undefined}
    >
      <div className="container mx-auto px-6 py-12 md:px-10 md:py-14 lg:px-12">
        <div className="grid items-center gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          <div className="flex flex-col justify-center md:pr-4">
            <ContentSdkRichText tag="div" className={theme.titleClasses} field={PromoText3} />
            <span aria-hidden="true" className="bg-accent mt-4 block h-1 w-16" />
          </div>

          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <ContentSdkRichText tag="div" className={theme.rateClasses} field={PromoText} />
            {PromoLink?.value?.href && (
              <Button variant="outline" className={theme.buttonClasses} asChild>
                <TrackedCtaLink field={PromoLink} />
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <ContentSdkRichText tag="div" className={theme.rateClasses} field={PromoText2} />
            {PromoLink2?.value?.href && (
              <Button variant="outline" className={theme.buttonClasses} asChild>
                <TrackedCtaLink field={PromoLink2} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const SplitPromoLayout = (props: PromoProps, imagePosition: 'left' | 'right'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const layoutDirection = imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse';
  const { PromoIcon, PromoText, PromoText2, PromoLink, PromoLink2 } = props.fields;

  return (
    <section
      data-class-change
      className={cn('component promo w-full bg-background', props.params.styles)}
      id={id ? id : undefined}
    >
      <div className={cn('flex flex-col items-stretch', layoutDirection)}>
        <div className="w-full md:w-1/2">
          <ContentSdkImage
            field={PromoIcon}
            className="h-full min-h-[320px] w-full object-cover md:min-h-[480px]"
          />
        </div>
        <div className="flex w-full flex-col justify-center px-8 py-10 md:w-1/2 md:px-12 md:py-14 lg:px-16 lg:py-16">
          <ContentSdkRichText tag="div" className={splitPromoTitleClasses} field={PromoText} />
          <span aria-hidden="true" className="bg-accent mt-4 block h-1 w-16" />
          <ContentSdkRichText tag="div" className={splitPromoBodyClasses} field={PromoText2} />
          <div className="mt-8 flex flex-col gap-3 self-start">
            {PromoLink?.value?.href && (
              <TrackedCtaLink field={PromoLink} className={splitPromoCtaClasses} />
            )}
            {PromoLink2?.value?.href && (
              <TrackedCtaLink field={PromoLink2} className={splitPromoCtaClasses} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const BoldPromoLayout = (props: PromoProps, imagePosition: 'left' | 'right'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const layoutDirection = imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse';
  const background = resolvePromoBackground(props.params);
  const theme = boldPromoBackgroundThemes[background];

  return (
    <section
      data-class-change
      className={`component promo w-full ${props.params.styles}`}
      id={id ? id : undefined}
    >
      <div className={cn('flex flex-col items-stretch', layoutDirection, theme.containerBg)}>
        <div className="w-full md:w-[42%] lg:w-[40%]">
          <ContentSdkImage
            field={props.fields.PromoIcon}
            className="h-full min-h-[280px] w-full object-cover md:min-h-[420px]"
          />
        </div>
        <div
          className={cn(
            'flex w-full flex-col justify-center overflow-visible px-8 py-10 md:w-[58%] md:px-12 md:py-14 lg:px-16 lg:py-20',
            theme.textColor
          )}
        >
          <ContentSdkRichText
            tag="div"
            className={theme.richTextClasses}
            field={props.fields.PromoText}
          />
          <ContentSdkRichText
            tag="div"
            className={cn('mt-10 md:mt-12', theme.richTextClasses)}
            field={props.fields.PromoText2}
          />
          <Button
            variant="outline"
            className={cn(
              'mt-10 self-start px-6 py-2 font-semibold uppercase tracking-wide',
              theme.buttonClasses
            )}
            asChild
          >
            <TrackedCtaLink field={props.fields.PromoLink} />
          </Button>
        </div>
      </div>
    </section>
  );
};

const PromoDefaultComponent = (props: PromoProps): JSX.Element => (
  <div className={`component promo ${props.params.styles}`}>
    <div className="component-content">
      <span className="is-empty-hint">Promo</span>
    </div>
  </div>
);

export const Default = (props: PromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  if (props.fields) {
    return (
      <div
        data-class-change
        className={`component promo flex-1 shadow-lg pointer mb-5 lg:mb-0 ${props.params.styles}`}
        id={id ? id : undefined}
      >
        <div className="flex flex-col items-start justify-end h-full">
          <ContentSdkImage field={props.fields.PromoIcon} className="w-full h-auto object-cover" />
          <div className="flex-1 relative pt-4 px-6">
            <ContentSdkRichText
              tag="div"
              className="inline-block text-base font-bold px-2 py-1 mb-4 bg-[#ffb900]"
              field={props.fields.PromoText3}
            />
            <ContentSdkRichText
              tag="h2"
              className="text-3xl font-bold mb-4"
              field={props.fields.PromoText}
            />
            <ContentSdkRichText
              tag="div"
              className="text-base mb-4"
              field={props.fields.PromoText2}
            />
          </div>
          <Button
            variant="default"
            className="font-bold py-1 px-3 mx-6 mb-4 mt-auto relative b-0"
            asChild
          >
            <TrackedCtaLink field={props.fields.PromoLink} />
          </Button>
        </div>
      </div>
    );
  }

  return <PromoDefaultComponent {...props} />;
};

export const CenteredCard = (props: PromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  if (props.fields) {
    return (
      <div
        data-class-change
        className={`component promo flex-1 w-full shadow-lg pointer mb-5 lg:mb-0 align-stretch ${props.params.styles}`}
        id={id ? id : undefined}
      >
        <div className="flex flex-col items-start justify-end">
          <ContentSdkImage field={props.fields.PromoIcon} className="w-full h-auto object-cover" />
          <div className="flex-1 relative pt-4 px-4 w-full justify-center text-center">
            <ContentSdkRichText
              tag="h2"
              className="text-4xl font-bold mb-4"
              field={props.fields.PromoText}
            />
            <ContentSdkRichText tag="div" className="mb-4" field={props.fields.PromoText2} />
          </div>
          <Button
            variant="link"
            size="lg"
            className="font-bold text-xl text-center w-full py-1 px-3 ml-4 mb-4 relative b-0"
            asChild
          >
            <TrackedCtaLink field={props.fields.PromoLink} />
          </Button>
        </div>
      </div>
    );
  }

  return <PromoDefaultComponent {...props} />;
};

export const BoldLeft = (props: PromoProps): JSX.Element => {
  if (props.fields) {
    return BoldPromoLayout(props, 'left');
  }

  return <PromoDefaultComponent {...props} />;
};

export const BoldRight = (props: PromoProps): JSX.Element => {
  if (props.fields) {
    return BoldPromoLayout(props, 'right');
  }

  return <PromoDefaultComponent {...props} />;
};

export const Left = (props: PromoProps): JSX.Element => {
  if (props.fields) {
    return SplitPromoLayout(props, 'left');
  }

  return <PromoDefaultComponent {...props} />;
};

export const Right = (props: PromoProps): JSX.Element => {
  if (props.fields) {
    return SplitPromoLayout(props, 'right');
  }

  return <PromoDefaultComponent {...props} />;
};

export const Columns = (props: PromoProps): JSX.Element => {
  if (props.fields) {
    return ColumnsPromoLayout(props);
  }

  return <PromoDefaultComponent {...props} />;
};
