'use client';

import { useContext, useRef } from 'react';
import { useInView } from 'framer-motion';
import NextImage, { ImageProps } from 'next/image';
import { ImageField, Image as ContentSdkImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ImageOptimizationContext } from '@/components/image/image-optimization.context';
import placeholderImageLoader from '@/utils/placeholderImageLoader';
import { hostnameMatchesImageRemotePattern, IMAGE_REMOTE_PATTERNS } from '@/config/image-config';

type Props = {
  image?: ImageField;
  className?: string;
  sizes?: string;
  priority?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const shouldOptimize = (src: string): boolean => {
  if (!src.startsWith('http')) {
    return true;
  }

  try {
    const url = new URL(src);

    return IMAGE_REMOTE_PATTERNS.some((pattern) => {
      const protocolMatch = !pattern.protocol || pattern.protocol === url.protocol.slice(0, -1);
      if (!protocolMatch) return false;

      return hostnameMatchesImageRemotePattern(url.hostname, pattern.hostname);
    });
  } catch {
    return false;
  }
};

export default function ClientImage({ image, className, sizes, priority, ...rest }: Props) {
  const { page } = useSitecore();
  const { isEditing, isPreview } = page.mode;

  const { unoptimized } = useContext(ImageOptimizationContext);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const src = image?.value?.src ?? '';
  const isSvg = (() => {
    try {
      return new URL(src).pathname.toLowerCase().endsWith('.svg');
    } catch {
      return src.includes('.svg');
    }
  })();
  const isPicsum = src.includes('picsum.photos');

  if (!isEditing && !isPreview && !src) {
    return null;
  }

  const isUnoptimized = unoptimized || isSvg || (src.startsWith('http') && !shouldOptimize(src));

  if (isEditing || isPreview || isSvg) {
    return <ContentSdkImage field={image} className={className} />;
  }

  const shouldPrioritize = priority === true;
  const imagePriority: boolean = shouldPrioritize ? true : inView;
  const imageFetchPriority: 'high' | 'low' | 'auto' = shouldPrioritize ? 'high' : 'auto';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { priority: _rp, loading: _rl, fetchPriority: _rf, wrapperClass: _wc, ...restProps } = rest;
  const imageValueProps = (image?.value as ImageProps) || {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { priority: _ivp, loading: _ivl, fetchPriority: _ivf, ...imageValueRest } = imageValueProps;

  return (
    <NextImage
      ref={ref}
      {...imageValueRest}
      className={className}
      unoptimized={isUnoptimized}
      loader={isPicsum ? placeholderImageLoader : undefined}
      placeholder="blur"
      blurDataURL={src}
      sizes={sizes}
      {...(!image?.value?.width ? { width: 16, height: 16 } : {})}
      {...restProps}
      priority={imagePriority}
      fetchPriority={imageFetchPriority}
    />
  );
}
