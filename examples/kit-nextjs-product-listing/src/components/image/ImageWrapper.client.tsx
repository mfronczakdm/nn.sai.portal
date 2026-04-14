'use client';

import { useContext, useRef } from 'react';
import { useInView } from 'framer-motion';
import NextImage, { ImageProps } from 'next/image';
import { ImageField, Image as ContentSdkImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ImageOptimizationContext } from '@/components/image/image-optimization.context';
import placeholderImageLoader from '@/utils/placeholderImageLoader';

type Props = {
  image?: ImageField;
  className?: string;
  sizes?: string;
  priority?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export default function ClientImage({ image, className, sizes, priority, ...rest }: Props) {
  const { page } = useSitecore();
  const { isEditing, isPreview } = page.mode;

  const { unoptimized } = useContext(ImageOptimizationContext);
  const ref = useRef(null);
  // Only use inView hook for non-priority images to avoid unnecessary re-renders for LCP images
  const inView = useInView(ref, { once: true });

  const src = image?.value?.src ?? '';
  const isSvg = src.endsWith('.svg');
  const isPicsum = src.includes('picsum.photos');

  // Return null if not in editing/preview mode and no image source
  if (!isEditing && !isPreview && !src) {
    return null;
  }

  const isUnoptimized =
    unoptimized ||
    isSvg ||
    (src.startsWith('https://') &&
      typeof window !== 'undefined' &&
      !src.includes(window.location.hostname));

  if (isEditing || isPreview || isSvg) {
    return <ContentSdkImage field={image} className={className} />;
  }

  // For priority images (LCP), use priority prop, otherwise use inView for lazy loading
  const shouldPrioritize = priority === true;
  const imagePriority: boolean = shouldPrioritize ? true : inView;
  // Set fetchPriority="high" for LCP images to reduce resource load delay
  const imageFetchPriority: 'high' | 'low' | 'auto' = shouldPrioritize ? 'high' : 'auto';

  // Extract priority, loading, and fetchPriority from rest and image.value to avoid conflicts
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { priority: _restPriority, loading: _restLoading, fetchPriority: _restFetchPriority, ...restProps } = rest;
  const imageValueProps = (image?.value as ImageProps) || {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { priority: _imageValuePriority, loading: _imageValueLoading, fetchPriority: _imageValueFetchPriority, ...imageValueRest } = imageValueProps;

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
      {...(!image?.value?.width && isSvg ? { width: 16, height: 16 } : {})}
      {...restProps}
      priority={imagePriority}
      fetchPriority={imageFetchPriority}
    />
  );
}
