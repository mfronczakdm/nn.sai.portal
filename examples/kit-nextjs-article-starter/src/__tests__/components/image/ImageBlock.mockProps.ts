import { Field, ImageField, ComponentRendering, Page, PageMode } from '@sitecore-content-sdk/nextjs';
import { ImageProps } from '@/components/image/image.props';

// Mock image fields
export const mockImageField: ImageField = {
  value: {
    src: '/images/sample-image.jpg',
    alt: 'Sample Image',
    width: 800,
    height: 600,
  },
};

export const mockImageFieldWithoutAlt: ImageField = {
  value: {
    src: '/images/sample-image-no-alt.jpg',
    alt: '',
    width: 1200,
    height: 800,
  },
};

export const mockImageFieldLarge: ImageField = {
  value: {
    src: '/images/large-image.jpg',
    alt: 'Large Image',
    width: 1920,
    height: 1080,
  },
};

// Mock caption field
export const mockCaptionField: Field<string> = {
  value: 'This is a beautiful image caption',
};

export const mockEmptyCaptionField: Field<string> = {
  value: '',
};

// Complete fields data
export const mockFields = {
  image: mockImageField,
  caption: mockCaptionField,
};

export const mockFieldsWithoutCaption = {
  image: mockImageField,
};

export const mockFieldsWithEmptyCaption = {
  image: mockImageField,
  caption: mockEmptyCaptionField,
};

export const mockFieldsWithoutAlt = {
  image: mockImageFieldWithoutAlt,
  caption: mockCaptionField,
};

export const mockFieldsLargeImage = {
  image: mockImageFieldLarge,
  caption: mockCaptionField,
};

// Mock params
export const mockParams = {
  styles: 'custom-image-style',
  RenderingIdentifier: 'image-rendering-id',
};

export const mockParamsWithoutStyles = {
  RenderingIdentifier: 'image-rendering-id',
};

// Mock rendering
const mockRendering: ComponentRendering = {
  componentName: 'Image',
};

// Mock page
const mockPage: Page = {
  mode: {
    isEditing: false,
    isPreview: false,
    isNormal: true,
    name: 'normal' as PageMode['name'],
    designLibrary: { isVariantGeneration: false },
    isDesignLibrary: false,
  },
  layout: {
    sitecore: {
      context: {},
      route: null,
    },
  },
  locale: 'en',
};

// Complete props combinations
export const defaultProps: ImageProps = {
  params: mockParams,
  fields: mockFields,
  rendering: mockRendering,
  page: mockPage,
};

export const propsWithoutCaption: ImageProps = {
  params: mockParams,
  fields: mockFieldsWithoutCaption,
  rendering: mockRendering,
  page: mockPage,
};

export const propsWithEmptyCaption: ImageProps = {
  params: mockParams,
  fields: mockFieldsWithEmptyCaption,
  rendering: mockRendering,
  page: mockPage,
};

export const propsWithoutAlt: ImageProps = {
  params: mockParams,
  fields: mockFieldsWithoutAlt,
  rendering: mockRendering,
  page: mockPage,
};

export const propsWithLargeImage: ImageProps = {
  params: mockParams,
  fields: mockFieldsLargeImage,
  rendering: mockRendering,
  page: mockPage,
};

export const propsWithoutStyles: ImageProps = {
  params: mockParamsWithoutStyles,
  fields: mockFields,
  rendering: mockRendering,
  page: mockPage,
};

export const propsWithoutFields: ImageProps = {
  params: mockParams,
  fields: undefined as unknown as ImageProps['fields'],
  rendering: mockRendering,
  page: mockPage,
};

