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
    pageShortTitle: { value: 'Insights' } as Field<string>,
    pageHeaderTitle: { value: 'Building resilient health platforms' } as Field<string>,
    pageTitle: { value: 'Building resilient health platforms' } as Field<string>,
    pageSubtitle: {
      value: 'How modern integration patterns reduce risk while improving member experience.',
    } as Field<string>,
    pageSummary: {
      value:
        'Teams often underestimate the operational cost of bespoke integrations. This article outlines a pragmatic path: clear contracts, observable pipelines, and editorial workflows that scale.',
    } as Field<string>,
  },
};

export const splitTitleProps: ArticleContentProps = {
  ...fullArticleContentProps,
  fields: {
    ...fullArticleContentProps.fields,
    pageTitle: { value: 'Technical deep dive' } as Field<string>,
  },
};

export const titleOnlyProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    pageTitle: { value: 'Article without page header title field' } as Field<string>,
    pageSummary: { value: 'Summary only with title.' } as Field<string>,
  },
};

export const pageTitleOnlyProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    pageTitle: { value: 'Section label' } as Field<string>,
    pageSummary: { value: 'Body intro without main header title.' } as Field<string>,
  },
};

/** Page-only copy via Content SDK `externalFields` (no datasource). */
export const pageViaExternalFieldsProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {},
  externalFields: {
    pageTitle: { value: 'Title from page externalFields' } as Field<string>,
    pageSummary: { value: 'Summary from page externalFields.' } as Field<string>,
  },
};

/** Page-only copy under `fields.data.externalFields` (GraphQL / PageHeader style). */
export const pageViaNestedExternalFieldsProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    data: {
      externalFields: {
        pageTitle: { jsonValue: { value: 'Title from nested externalFields' } as Field<string> },
        pageSummary: { jsonValue: { value: 'Summary from nested externalFields.' } as Field<string> },
      },
    },
  },
};

export const emptyProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {},
};
