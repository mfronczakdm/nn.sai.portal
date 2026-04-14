import { ImageField, LinkField, Field } from '@sitecore-content-sdk/nextjs';

// Mock page data for useSitecore hook
export const mockPageData = {
  page: {
    mode: {
      isEditing: false,
    },
  },
};

export const mockPageDataEditing = {
  page: {
    mode: {
      isEditing: true,
    },
  },
};

// Mock image field data
export const mockImageField: ImageField = {
  value: {
    src: '/test-image.jpg',
    alt: 'Test Image',
    width: 800,
    height: 600,
  },
};

export const mockImageFieldWithoutAlt: ImageField = {
  value: {
    src: '/test-image.jpg',
    alt: '',
    width: 800,
    height: 600,
  },
};

export const mockImageFieldEmpty: ImageField = {
  value: undefined,
};

// Mock link field data
export const mockLinkField: LinkField = {
  value: {
    href: '/test-link',
    title: 'Test Link',
    querystring: '',
  },
};

export const mockLinkFieldEmpty: LinkField = {
  value: undefined as unknown as LinkField['value'],
};

// Mock fields data
export const mockFields = {
  Image: mockImageField,
  ImageCaption: {
    value: 'Test Image Caption',
    editable: 'Test Image Caption',
  } as Field<string>,
  TargetUrl: mockLinkField,
};

export const mockFieldsWithoutLink = {
  Image: mockImageField,
  ImageCaption: {
    value: 'Test Image Caption',
    editable: 'Test Image Caption',
  } as Field<string>,
  TargetUrl: mockLinkFieldEmpty,
};

export const mockFieldsWithEmptyImage = {
  Image: mockImageFieldEmpty,
  ImageCaption: {
    value: 'Test Image Caption',
    editable: 'Test Image Caption',
  } as Field<string>,
  TargetUrl: mockLinkField,
};

export const mockFieldsWithoutAlt = {
  Image: mockImageFieldWithoutAlt,
  ImageCaption: {
    value: 'Test Image Caption',
    editable: 'Test Image Caption',
  } as Field<string>,
  TargetUrl: mockLinkField,
};

// Mock params data
export const mockParams = {
  Styles: 'custom-image-style',
  RenderingIdentifier: 'image-rendering-id',
};

export const mockParamsWithoutStyles = {
  Styles: '',
  RenderingIdentifier: 'image-rendering-id',
};

export const mockParamsWithoutId = {
  Styles: 'custom-image-style',
  RenderingIdentifier: '',
};

// Complete props combinations
export const defaultProps = {
  params: mockParams,
  fields: mockFields,
};

export const propsWithoutStyles = {
  params: mockParamsWithoutStyles,
  fields: mockFields,
};

export const propsWithoutId = {
  params: mockParamsWithoutId,
  fields: mockFields,
};

export const propsWithoutLink = {
  params: mockParams,
  fields: mockFieldsWithoutLink,
};

export const propsWithEmptyImage = {
  params: mockParams,
  fields: mockFieldsWithEmptyImage,
};

export const propsWithoutAlt = {
  params: mockParams,
  fields: mockFieldsWithoutAlt,
};

