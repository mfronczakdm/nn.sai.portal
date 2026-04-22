import type { Field, Page, ComponentRendering, PageMode } from '@sitecore-content-sdk/nextjs';
import type { ArticleContentProps } from '../../components/article-content/article-content.props';

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

const mockRendering: ComponentRendering = {
  componentName: 'ArticleContent',
} as ComponentRendering;

export const fullArticleContentProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    ShortTitle: { value: 'Insights' } as Field<string>,
    HeaderTitle: { value: 'Building resilient health platforms' } as Field<string>,
    Title: { value: 'Building resilient health platforms' } as Field<string>,
    Subtitle: { value: 'How modern integration patterns reduce risk while improving member experience.' } as Field<string>,
    Summary: {
      value:
        'Teams often underestimate the operational cost of bespoke integrations. This article outlines a pragmatic path: clear contracts, observable pipelines, and editorial workflows that scale.',
    } as Field<string>,
  },
};

export const splitTitleProps: ArticleContentProps = {
  ...fullArticleContentProps,
  fields: {
    ...fullArticleContentProps.fields,
    Title: { value: 'Technical deep dive' } as Field<string>,
  },
};

export const titleOnlyProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    Title: { value: 'Article without header title field' } as Field<string>,
    Summary: { value: 'Summary only with title.' } as Field<string>,
  },
};

export const emptyProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {},
};
