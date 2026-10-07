'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Facebook, Linkedin, Twitter, Link, Check, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text, DateField } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { ArticleHeaderProps } from './article-header.props';
import { Badge } from '@/components/ui/badge';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { Button } from '@/components/ui/button';
import { FloatingDock } from '@/components/floating-dock/floating-dock.dev';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useTranslations } from 'next-intl';
import { dictionaryKeys } from '@/variables/dictionary';
import { formatDateInUTC } from '@/utils/date-utils';
import { Default as Icon } from '@/components/icon/Icon';
import { StructuredData } from '@/components/structured-data/StructuredData';
import { generateArticleSchema, generatePersonSchema } from '@/lib/structured-data/schema';
import { normalizeImageFieldSrc, unwrapImageField } from '@/lib/sitecore-image-field';
import { resolveArticleHeaderFields } from './article-header.fields';

export const Default: React.FC<ArticleHeaderProps> = ({ fields, externalFields, page }) => {
  const { imageRequired, eyebrowOptional } = resolveArticleHeaderFields(fields);
  const heroImage = normalizeImageFieldSrc(unwrapImageField(imageRequired));
  const { pageHeaderTitle, pageReadTime, pageDisplayDate, pageAuthor } = externalFields || {};
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState(false);
  const [forceCollapse] = useState(true);
  const copyNotificationRef = useRef<HTMLDivElement>(null);
  const isPageEditing = page.mode.isEditing;
  const t = useTranslations();
  const dictionary = {
    ARTICLE_HEADER_BACKTONEWS: t(dictionaryKeys.ARTICLE_HEADER_BACKTONEWS),
    ARTICLE_HEADER_AUTHOR_LABEL: t(dictionaryKeys.ARTICLE_HEADER_AUTHOR_LABEL),
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!headerRef.current) return;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const rect = headerRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (fields) {
    const parallaxStyle = heroImage?.value?.src
      ? {
          transform: prefersReducedMotion
            ? 'none'
            : `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
          transition: prefersReducedMotion ? 'none' : 'transform 200ms ease-out',
        }
      : {};

    const handleShare = (platform: string) => {
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      let shareUrl = '';

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${title}&body=${url}`;
          window.location.href = shareUrl;
          return;
        case 'copy':
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
              toast({
                title: 'Link copied!',
                description: 'The link has been copied to your clipboard.',
                duration: 3000,
              });

              setCopySuccess(true);

              if (copyNotificationRef.current) {
                copyNotificationRef.current.textContent = 'Link copied to clipboard';
              }
            })
            .catch((err) => {
              console.error('Failed to copy: ', err);
              toast({
                title: 'Copy failed',
                description: 'Could not copy the link to clipboard.',
                variant: 'destructive',
              });
            });
          return;
      }

      window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const links = [
      {
        title: 'Share on Facebook',
        icon: (
          <Facebook className="h-full w-full text-white dark:text-neutral-300" aria-hidden="true" />
        ),
        href: '#',
        onClick: () => handleShare('facebook'),
        ariaLabel: 'Share on Facebook',
      },
      {
        title: 'Share on Twitter',
        icon: (
          <Twitter className="h-full w-full text-white dark:text-neutral-300" aria-hidden="true" />
        ),
        href: '#',
        onClick: () => handleShare('twitter'),
        ariaLabel: 'Share on Twitter',
      },
      {
        title: 'Share on LinkedIn',
        icon: (
          <Linkedin className="h-full w-full text-white dark:text-neutral-300" aria-hidden="true" />
        ),
        href: '#',
        onClick: () => handleShare('linkedin'),
        ariaLabel: 'Share on LinkedIn',
      },
      {
        title: 'Share via Email',
        icon: (
          <Mail className="h-full w-full text-white dark:text-neutral-300" aria-hidden="true" />
        ),
        href: '#',
        onClick: () => handleShare('email'),
        ariaLabel: 'Share via Email',
      },
      {
        title: 'Copy Link',
        icon: copySuccess ? (
          <Check className="h-full w-full text-green-500 dark:text-green-400" aria-hidden="true" />
        ) : (
          <Link className="h-full w-full text-white dark:text-neutral-300" aria-hidden="true" />
        ),
        href: '#',
        onClick: () => handleShare('copy'),
        ariaLabel: copySuccess ? 'Link copied' : 'Copy link',
      },
    ];

    const authorPerson = pageAuthor?.value;
    const authorName =
      authorPerson?.personFirstName?.value && authorPerson?.personLastName?.value
        ? `${authorPerson.personFirstName.value} ${authorPerson.personLastName.value}`.trim()
        : '';

    const articleSchema = pageHeaderTitle?.value
      ? generateArticleSchema({
          headline: pageHeaderTitle.value,
          description: pageHeaderTitle.value,
          image: heroImage?.value?.src ? [heroImage.value.src] : undefined,
          datePublished: pageDisplayDate?.value
            ? new Date(String(pageDisplayDate.value)).toISOString()
            : undefined,
          dateModified: pageDisplayDate?.value
            ? new Date(String(pageDisplayDate.value)).toISOString()
            : undefined,
          author: authorName
            ? {
                name: authorName,
                image: authorPerson?.personProfileImage?.value?.src,
                jobTitle: authorPerson?.personJobTitle?.value,
              }
            : undefined,
          publisher: {
            name: 'SYNC',
          },
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        })
      : null;

    const personSchema =
      authorPerson && authorName
        ? generatePersonSchema({
            name: authorName,
            jobTitle: authorPerson.personJobTitle?.value,
            image: authorPerson.personProfileImage?.value?.src,
          })
        : null;

    const publishedDateISO = pageDisplayDate?.value
      ? new Date(String(pageDisplayDate.value)).toISOString()
      : undefined;

    const titleText = pageHeaderTitle?.value || 'Article header image';

    return (
      <>
        {articleSchema && <StructuredData id="article-schema" data={articleSchema} />}
        {personSchema && <StructuredData id="author-person-schema" data={personSchema} />}
        <header
          className={cn('@container article-header relative mb-[86px] overflow-hidden')}
          ref={headerRef}
        >
          <article itemScope={true} itemType="https://schema.org/Article">
            <div className="relative z-0 h-[auto] overflow-hidden bg-black">
              <div
                className="z-5 absolute inset-0 h-[120%] w-[120%] bg-cover bg-center opacity-70 transition-transform duration-200 ease-out"
                style={parallaxStyle}
              >
                <ImageWrapper
                  image={heroImage}
                  alt={titleText}
                  className="h-full w-full object-cover"
                  wrapperClass="relative h-full w-full"
                  width={1920}
                  height={1080}
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  ref={imageRef}
                />
              </div>
              <div className="absolute inset-0 backdrop-blur-md"></div>
              <div
                data-component="white-bar"
                className="@xs:h-[125px] @sm:h-[150px] @md:h-[140px] @lg:h-[90px] @xl:h-[180px] absolute bottom-0 h-[90px] w-full  bg-white"
              ></div>

              <div className="z-10 @md:pb-0 relative mx-auto flex h-full flex-col justify-between gap-12 p-0 pb-6 pt-[120px]">
                <div className="flex flex-col">
                  <Button
                    className="absolute left-0 top-[41px] mb-8 inline-flex items-center text-white transition-colors hover:text-white"
                    variant="link"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.back();
                    }}
                  >
                    <Icon iconName="arrow-left" className="ml-2" />
                    {!dictionary.ARTICLE_HEADER_BACKTONEWS && isPageEditing ? (
                      <div
                        className="relative rounded-2xl border border-red-400 bg-red-100 px-3 py-2 text-red-700"
                        role="alert"
                      >
                        <span className="block sm:inline">
                          Dictionary Entry is Missing for {dictionaryKeys.ARTICLE_HEADER_BACKTONEWS}
                        </span>
                      </div>
                    ) : (
                      dictionary.ARTICLE_HEADER_BACKTONEWS
                    )}
                  </Button>
                  {(eyebrowOptional?.value || isPageEditing) && eyebrowOptional && (
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent font-body mx-auto  mb-4 inline-block text-[14px] font-medium tracking-tighter">
                      <Text field={eyebrowOptional} />
                    </Badge>
                  )}
                  <Text
                    tag="h1"
                    className="@md:text-[62px] @md:mb-0 font-heading line-height-[69px] mx-auto max-w-4xl text-pretty px-6 text-center text-4xl font-normal tracking-tighter text-white"
                    field={pageHeaderTitle}
                  />
                  {(pageReadTime?.value || pageDisplayDate?.value || isPageEditing) && (
                    <div className="@md:flex-row @xl:px-8 mb-8 flex flex-col items-center justify-center space-x-2 px-4 text-center text-sm text-white subpixel-antialiased">
                      {(pageReadTime?.value || isPageEditing) && pageReadTime && (
                        <Text
                          tag="span"
                          field={pageReadTime}
                          className="@md:inline-block block text-pretty"
                        />
                      )}
                      {((pageReadTime?.value && pageDisplayDate?.value) || isPageEditing) && (
                        <span className="@md:inline-block hidden text-pretty">•</span>
                      )}
                      {pageDisplayDate?.value && (
                        <time
                          dateTime={publishedDateISO}
                          itemProp="datePublished"
                          className="@md:inline-block block text-pretty"
                        >
                          <DateField
                            tag="span"
                            field={pageDisplayDate}
                            render={(date) => formatDateInUTC(String(date))}
                          />
                        </time>
                      )}
                    </div>
                  )}
                </div>
                <div className="@lg:grid @lg:max-w-screen-3xl @lg:mx-auto @lg:w-full @lg:gap-8 @lg:grid-cols-12 mx-6 mb-auto grid grid-cols-2 items-start justify-between">
                  <div className="@lg:col-span-3 @lg:justify-end @lg:pt-4 @lg:h-[250px] @lg:items-start col-span-1 flex h-[auto] flex-wrap items-center justify-center gap-4 p-6 subpixel-antialiased">
                    {authorPerson && (
                      <div className="grid gap-y-3">
                        <p className="flex min-h-10 flex-col justify-center text-sm text-white">
                          {dictionary.ARTICLE_HEADER_AUTHOR_LABEL}
                        </p>
                        <Avatar>
                          <AvatarImage
                            src={authorPerson.personProfileImage?.value?.src}
                            alt={`${authorPerson.personFirstName?.value} ${authorPerson.personLastName?.value}`}
                          />
                          <AvatarFallback>{`${authorPerson.personFirstName?.value} ${authorPerson.personLastName?.value}`}</AvatarFallback>
                        </Avatar>
                        <div className="relative">
                          <p className="text-pretty font-medium text-white">
                            {authorPerson.personFirstName?.value} {authorPerson.personLastName?.value}
                          </p>
                          {authorPerson.personJobTitle && (
                            <Text tag="p" field={authorPerson.personJobTitle} className="text-pretty text-sm text-white" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="@lg:hidden col-span-1 flex h-[auto] items-center justify-center gap-4 p-6">
                    <p className="@lg:mb-2 m-0 flex items-center justify-center text-pretty text-sm font-medium text-white subpixel-antialiased">
                      Share
                    </p>
                    <FloatingDock items={links} forceCollapse={forceCollapse} />
                  </div>

                  <figure className="@lg:col-span-6 relative z-10 col-span-2 mx-auto flex aspect-[16/9] w-full max-w-[800px] justify-center overflow-hidden rounded-[24px]">
                    <ImageWrapper
                      image={heroImage}
                      alt={titleText}
                      className="h-full w-full object-cover "
                      wrapperClass="relative h-full w-full"
                      width={1920}
                      height={1080}
                      priority
                      sizes="(max-width: 768px) 100vw, 800px"
                      ref={imageRef}
                    />
                  </figure>

                  <div className="@lg:col-span-3 @lg:justify-start @lg:pt-4 @lg:h-[250px] @lg:items-start @lg:flex hidden h-[auto] items-center justify-center gap-4 p-6">
                    <p className="@lg:mt-2 m-0 mb-2 flex items-center justify-center text-pretty text-sm font-medium text-white subpixel-antialiased">
                      Share
                    </p>
                    <FloatingDock items={links} forceCollapse={forceCollapse} />
                  </div>
                </div>
              </div>
            </div>
            <div ref={copyNotificationRef} className="sr-only" aria-live="polite"></div>
          </article>
        </header>
        <Toaster />
      </>
    );
  }

  return <NoDataFallback componentName="ArticleHeader" />;
};
