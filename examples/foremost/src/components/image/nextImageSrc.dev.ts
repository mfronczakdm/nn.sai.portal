import { ImageField } from '@sitecore-content-sdk/nextjs';
import { getImageProps } from 'next/image';
import { ImageProps } from './image.props';

const getImageUrl = (imageField: ImageField, mode: ImageProps['page']['mode']) => {
  const src = imageField?.value?.src;

  if (!mode.isNormal && src?.startsWith('/')) {
    return `${window.location.protocol}//${window.location.hostname}${src}`;
  }

  return src ? `${src.replace('http://cm/', '/')}` : '';
};

export const nextImageSrc = (img: ImageField, page: ImageProps['page']) =>
  getImageProps({
    alt: (img.value as { alt: string }).alt,
    width: (img.value as { width: number }).width,
    height: (img.value as { height: number }).height,
    src: getImageUrl(img, page.mode),
  })?.props?.src;
