'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import NextImage, { ImageProps } from 'next/image';
import { ImageField, Image as ContentSdkImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ImageOptimizationContext } from '@/components/image/image-optimization.context';
import placeholderImageLoader from '@/utils/placeholderImageLoader';

/**
 * Hosts allowed by Next.js `remotePatterns` — keep optimized instead of forcing `unoptimized`.
 * Aligns with kit-nextjs-article-starter plus sandbox / PoC hosts.
 */
function isAllowedRemoteImageHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return (
      /^edge/.test(hostname) ||
      /^xmc-/.test(hostname) ||
      hostname.endsWith('.sitecore-staging.cloud') ||
      hostname.endsWith('.sitecorecloud.io') ||
      hostname.endsWith('.sitecoresandbox.cloud')
    );
  } catch {
    return false;
  }
}

type Props = {
  image?: ImageField;
  className?: string;
  sizes?: string;
  priority?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

/** Clone and drop keys we set explicitly on NextImage (avoids unused destructure bindings). */
function peelRestForNextImage(rest: Record<string, unknown>): {
  restWithoutBlur: Record<string, unknown>;
  blurDataURLRest: unknown;
} {
  const restWithoutBlur = { ...rest };
  const blurDataURLRest = restWithoutBlur.blurDataURL;
  delete restWithoutBlur.priority;
  delete restWithoutBlur.loading;
  delete restWithoutBlur.fetchPriority;
  delete restWithoutBlur.blurDataURL;
  return { restWithoutBlur, blurDataURLRest };
}

function peelValueForNextImage(value: Record<string, unknown>): Record<string, unknown> {
  const imageValueRest = { ...value };
  delete imageValueRest.priority;
  delete imageValueRest.loading;
  delete imageValueRest.fetchPriority;
  delete imageValueRest.src;
  delete imageValueRest.alt;
  return imageValueRest;
}

export default function ClientImage({ image, className, sizes, priority, ...rest }: Props) {
  const { page } = useSitecore();
  const { isEditing, isPreview } = page.mode;

  const { unoptimized } = useContext(ImageOptimizationContext);
  const ref = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only use inView hook for non-priority images to avoid unnecessary re-renders for LCP images
  const inView = useInView(ref, { once: true });

  const src = image?.value?.src ?? '';
  const isSvg = src.endsWith('.svg');
  const isPicsum = src.includes('picsum.photos');

  // Return null if not in editing/preview mode and no image source
  if (!isEditing && !isPreview && !src) {
    return null;
  }

  const isExternalNotAllowed =
    src.startsWith('https://') &&
    isClient &&
    !src.includes(typeof window !== 'undefined' ? window.location.hostname : '') &&
    !isAllowedRemoteImageHost(src);

  const isUnoptimized = unoptimized || isSvg || isExternalNotAllowed;

  if (isEditing || isPreview || isSvg) {
    return <ContentSdkImage field={image} className={className} />;
  }

  // For priority images (LCP), use priority prop, otherwise use inView for lazy loading
  const shouldPrioritize = priority === true;
  const imagePriority: boolean = shouldPrioritize ? true : inView;
  // Set fetchPriority="high" for LCP images to reduce resource load delay
  const imageFetchPriority: 'high' | 'low' | 'auto' = shouldPrioritize ? 'high' : 'auto';

  const { restWithoutBlur, blurDataURLRest } = peelRestForNextImage(rest as Record<string, unknown>);
  const imageValueRest = peelValueForNextImage((image?.value as ImageProps) || ({} as ImageProps));

  // Next.js only accepts a tiny data URL for blur placeholders — never pass the image `src` here.
  const useBlurPlaceholder =
    typeof blurDataURLRest === 'string' && blurDataURLRest.startsWith('data:image');

  const altFromRest =
    typeof restWithoutBlur.alt === 'string' ? restWithoutBlur.alt.trim() : '';
  const altText = altFromRest || String(image?.value?.alt ?? '');

  return (
    <NextImage
      ref={ref}
      {...(imageValueRest as Partial<ImageProps>)}
      className={className}
      unoptimized={isUnoptimized}
      loader={isPicsum ? placeholderImageLoader : undefined}
      {...(useBlurPlaceholder
        ? { placeholder: 'blur' as const, blurDataURL: blurDataURLRest as string }
        : {})}
      sizes={sizes}
      {...(!image?.value?.width && isSvg ? { width: 16, height: 16 } : {})}
      {...(restWithoutBlur as Partial<ImageProps>)}
      src={src}
      alt={altText}
      priority={imagePriority}
      fetchPriority={imageFetchPriority}
    />
  );
}
