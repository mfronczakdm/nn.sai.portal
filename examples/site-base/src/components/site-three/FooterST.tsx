import {
  faFacebook,
  faInstagram,
  faLinkedinIn,
  faWeixin,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
  Link as ContentSdkLink,
  Field,
  RichTextField,
  LinkField,
  AppPlaceholder,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import componentMap from '.sitecore/component-map';

const AMKOR_FOOTER_LOGO_URL =
  'https://amkormarcomexternal.blob.core.windows.net/amkordotcom/theme-assets/Amkor-blue.svg';
const AMKOR_NEWSLETTER_URL =
  'https://visitor.r20.constantcontact.com/manage/optin?v=001fZs43j3E8SVFbyBsCWPGq1XvKIOhyGm2rDxZDWdmUW40duxo8nHIkw98Pky2aqq9amoOlfg6EMNmSXGzzzumNI_mJt15bvs6ls7XfanXMOCMk5_TL9dU7g%3D%3D';

const version1ExtraSocialLinks = [
  {
    href: 'https://amkor.com/amkor-wechat/',
    label: 'Visit us on WEChat',
    icon: faWeixin,
    width: 20,
    height: 20,
  },
  {
    href: 'https://www.youtube.com/user/AmkorTechnology',
    label: 'Visit us on YouTube',
    icon: faYoutube,
    width: 22,
    height: 22,
  },
  {
    href: 'https://twitter.com/AmkorTechnology',
    label: 'Visit us on Twitter',
    icon: faXTwitter,
    width: 20,
    height: 20,
  },
] as const;

const version1FieldSocialLinks = [
  {
    fieldKey: 'InstagramLink' as const,
    label: 'Visit us on Instagram',
    icon: faInstagram,
    width: 22,
    height: 22,
  },
  {
    fieldKey: 'FacebookLink' as const,
    label: 'Visit us on Facebook',
    icon: faFacebook,
    width: 20,
    height: 20,
  },
  {
    fieldKey: 'LinkedinLink' as const,
    label: 'Visit us on LinkedIn',
    icon: faLinkedinIn,
    width: 24,
    height: 24,
  },
] as const;

interface Fields {
  Title: Field<string>;
  CopyrightText: RichTextField;
  FacebookLink: LinkField;
  InstagramLink: LinkField;
  LinkedinLink: LinkField;
}

type FooterSTProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

/** Returns true if the link field has a valid href (not a placeholder like # or http://#). */
function hasValidLink(field: LinkField | undefined): boolean {
  const href = field?.value?.href;
  return !!(href && href !== '#' && !href.startsWith('http://#'));
}

const SocialIconLink = ({
  href,
  label,
  icon,
  width,
  height,
}: {
  href: string;
  label: string;
  icon: typeof faFacebook;
  width: number;
  height: number;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--color-footer-foreground,#fff)] transition-opacity hover:opacity-80"
  >
    <FontAwesomeIcon icon={icon} width={width} height={height} />
  </a>
);

const SocialFieldLink = ({
  field,
  label,
  icon,
  width,
  height,
}: {
  field: LinkField | undefined;
  label: string;
  icon: typeof faFacebook;
  width: number;
  height: number;
}) =>
  hasValidLink(field) ? (
    <ContentSdkLink
      field={field}
      prefetch={false}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--color-footer-foreground,#fff)] transition-opacity hover:opacity-80"
    >
      <FontAwesomeIcon icon={icon} width={width} height={height} />
    </ContentSdkLink>
  ) : (
    <span
      role="img"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--color-footer-foreground,#fff)]"
    >
      <FontAwesomeIcon icon={icon} width={width} height={height} />
    </span>
  );

const SocialLinks = ({ fields }: { fields: Fields }) => (
  <div className="flex justify-center gap-4">
    {hasValidLink(fields?.FacebookLink) ? (
      <ContentSdkLink
        field={fields?.FacebookLink}
        prefetch={false}
        aria-label="Facebook"
      >
        <FontAwesomeIcon icon={faFacebook} width={20} height={20} />
      </ContentSdkLink>
    ) : (
      <span role="img" aria-label="Facebook">
        <FontAwesomeIcon icon={faFacebook} width={20} height={20} />
      </span>
    )}
    {hasValidLink(fields?.InstagramLink) ? (
      <ContentSdkLink
        field={fields?.InstagramLink}
        prefetch={false}
        aria-label="Instagram"
      >
        <FontAwesomeIcon icon={faInstagram} width={22} height={22} />
      </ContentSdkLink>
    ) : (
      <span role="img" aria-label="Instagram">
        <FontAwesomeIcon icon={faInstagram} width={22} height={22} />
      </span>
    )}
    {hasValidLink(fields?.LinkedinLink) ? (
      <ContentSdkLink
        field={fields?.LinkedinLink}
        prefetch={false}
        aria-label="LinkedIn"
      >
        <FontAwesomeIcon icon={faLinkedinIn} width={24} height={24} />
      </ContentSdkLink>
    ) : (
      <span role="img" aria-label="LinkedIn">
        <FontAwesomeIcon icon={faLinkedinIn} width={24} height={24} />
      </span>
    )}
  </div>
);

const Version1SocialLinks = ({ fields }: { fields: Fields }) => (
  <div
    data-footer-st-social
    className="flex flex-wrap items-center justify-start gap-2 sm:gap-3 lg:justify-end"
  >
    <SocialIconLink {...version1ExtraSocialLinks[0]} />
    <SocialFieldLink field={fields?.InstagramLink} {...version1FieldSocialLinks[0]} />
    <SocialIconLink {...version1ExtraSocialLinks[1]} />
    <SocialFieldLink field={fields?.FacebookLink} {...version1FieldSocialLinks[1]} />
    <SocialIconLink {...version1ExtraSocialLinks[2]} />
    <SocialFieldLink field={fields?.LinkedinLink} {...version1FieldSocialLinks[2]} />
  </div>
);

/* Version1 — Amkor two-row footer: logo + newsletter + social, then copyright + legal links. */
export const Version1 = (props: FooterSTProps) => {
  const placeholderId = props.params.DynamicPlaceholderId;
  const newsletterHeading = String(props.fields?.Title?.value ?? '').trim() || 'Connect with us';

  return (
    <footer
      className={cn(
        'bg-[var(--color-footer-background,var(--color-primary))] text-[color:var(--color-footer-foreground,#fff)]',
        props.params.styles
      )}
      data-class-change
      data-footer-st-layout="version1"
    >
      <div data-footer-st-row="top" className="border-b border-white/15">
        <div className="container mx-auto px-4 py-8 lg:py-10">
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            <div className="md:col-span-12 lg:col-span-2" data-footer-st-logo>
              <Link href="/" prefetch={false} aria-label="Link to Home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={AMKOR_FOOTER_LOGO_URL}
                  alt="Amkor Technology Logo"
                  className="h-10 w-auto max-w-[9rem]"
                />
              </Link>
            </div>
            <div className="md:col-span-12 lg:col-span-6" data-footer-st-newsletter>
              <a
                href={AMKOR_NEWSLETTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Link to E-mail Updates"
                className="inline-block text-[color:var(--color-footer-foreground,#fff)] no-underline transition-opacity hover:opacity-85"
              >
                <span className="block text-lg font-semibold leading-snug">{newsletterHeading}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[color:var(--color-footer-mid,#677385)]">
                  Sign up for email updates from Amkor
                </span>
              </a>
            </div>
            <div className="md:col-span-12 lg:col-span-4">
              <Version1SocialLinks fields={props.fields} />
            </div>
          </div>
        </div>
      </div>
      <div data-footer-st-row="bottom" className="py-4 lg:py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              data-footer-st-copyright
              className="text-sm text-[color:var(--color-footer-foreground,#fff)] [&_p]:m-0"
            >
              <ContentSdkRichText field={props.fields?.CopyrightText} />
            </div>
            <div
              data-footer-st-legal
              className="with-separators text-sm text-[color:var(--color-footer-foreground,#fff)]"
            >
              <AppPlaceholder
                name={`footer-primary-links-${placeholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
              <AppPlaceholder
                name={`footer-secondary-links-${placeholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Default = (props: FooterSTProps) => {
  return (
    <section
      className={`relative bg-primary pt-16 lg:pt-30 pb-8 ${props.params.styles}`}
      data-class-change
    >
      <div className="container mx-auto px-4">
        <h2 className="text-4xl lg:text-7xl mb-10 lg:mb-20">
          <ContentSdkText field={props.fields?.Title} />
        </h2>
        <div className="max-w-5xl mx-auto mb-6 lg:mb-12 font-(family-name:--font-heading) text-2xl">
          <AppPlaceholder
            name={`footer-primary-links-${props.params.DynamicPlaceholderId}`}
            rendering={props.rendering}
            page={props.page}
            componentMap={componentMap}
          />
        </div>
        <div className="max-w-5xl mx-auto font-(family-name:--font-accent) font-medium">
          <AppPlaceholder
            name={`footer-secondary-links-${props.params.DynamicPlaceholderId}`}
            rendering={props.rendering}
            page={props.page}
            componentMap={componentMap}
          />
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 items-center lg:flex-row lg:justify-between">
          <SocialLinks fields={props.fields} />
          <div>
            <ContentSdkRichText field={props.fields?.CopyrightText} />
          </div>
        </div>
      </div>
    </section>
  );
};

export const LogoLeft = (props: FooterSTProps) => {
  return (
    <section
      className={`relative bg-primary pt-16 lg:pt-30 ${props.params.styles}`}
      data-class-change
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2">
          <h2 className="text-4xl lg:text-7xl mb-10 lg:mb-0">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div className="lg:flex justify-end items-start gap-12">
            <div className="mb-6 lg:mb-0 font-(family-name:--font-heading) text-2xl">
              <AppPlaceholder
                name={`footer-primary-links-${props.params.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </div>
            <div className="font-(family-name:--font-accent) font-medium">
              <AppPlaceholder
                name={`footer-secondary-links-${props.params.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center lg:flex-row lg:justify-between mt-8">
          <SocialLinks fields={props.fields} />
          <div>
            <ContentSdkRichText field={props.fields?.CopyrightText} />
          </div>
        </div>
      </div>
    </section>
  );
};

export const LogoRight = (props: FooterSTProps) => {
  return (
    <section
      className={`relative bg-primary pb-8 ${props.params.styles}`}
      data-class-change
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2">
          <h2 className="lg:order-2 text-4xl lg:text-7xl mb-10 lg:mb-0 lg:text-right">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div className="lg:flex items-start gap-12">
            <div className="mb-6 lg:mb-0 font-(family-name:--font-heading) text-2xl">
              <AppPlaceholder
                name={`footer-primary-links-${props.params.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </div>
            <div className="font-(family-name:--font-accent) font-medium">
              <AppPlaceholder
                name={`footer-secondary-links-${props.params.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center lg:flex-row lg:justify-between mt-8">
          <SocialLinks fields={props.fields} />
          <div>
            <ContentSdkRichText field={props.fields?.CopyrightText} />
          </div>
        </div>
      </div>
    </section>
  );
};

export const Centered = (props: FooterSTProps) => {
  return (
    <section
      className={`relative bg-primary py-8 lg:py-20 ${props.params.styles}`}
      data-class-change
    >
      <div className="relative container mx-auto px-4 z-20">
        <div className="grid lg:grid-cols-3 lg:gap-4">
          <h2 className="text-4xl lg:text-5xl mb-10 lg:mb-0">
            <ContentSdkText field={props.fields?.Title} />
          </h2>
          <div>
            <div className="mb-6 lg:mb-12 font-(family-name:--font-heading) text-2xl">
              <AppPlaceholder
                name={`footer-primary-links-${props.params.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </div>
            <div className="font-(family-name:--font-accent) font-medium">
              <AppPlaceholder
                name={`footer-secondary-links-${props.params.DynamicPlaceholderId}`}
                rendering={props.rendering}
                page={props.page}
                componentMap={componentMap}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center lg:items-end lg:self-end mt-8">
            <SocialLinks fields={props.fields} />
            <div>
              <ContentSdkRichText field={props.fields.CopyrightText} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
