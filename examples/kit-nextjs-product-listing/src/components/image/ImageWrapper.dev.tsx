import type React from 'react';
import { cn } from '@/lib/utils';
import { ImageField } from '@sitecore-content-sdk/nextjs';
import ClientImage from './ImageWrapper.client';

type ImageWrapperProps = {
  image?: ImageField;
  className?: string;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  alt?: string;
  wrapperClass?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const Default: React.FC<ImageWrapperProps> = (props) => {
  const { image, wrapperClass } = props;

  if (!image?.value?.src) {
    return null;
  }

  return (
    <div className={cn('image-container', wrapperClass)}>
      <ClientImage {...props} />
    </div>
  );
};
