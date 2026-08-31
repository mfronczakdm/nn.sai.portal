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

export const servicePageVariantProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    pageHeaderTitle: { value: 'Modular Construction' } as Field<string>,
    pageSubtitle: {
      value: 'Build faster with more control over schedule, labor, and quality',
    } as Field<string>,
    pageSummary: {
      value:
        'Move critical work offsite into a controlled environment, so site work and home construction can happen at the same time. The result is reduced cycle time, fewer weather-related disruptions, and improved quality control.',
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
        pageSummary: {
          jsonValue: { value: 'Summary from nested externalFields.' } as Field<string>,
        },
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

/** Page image resolved from `page.layout.sitecore.route.fields` as a normal jsonValue shape. */
export const routeImageProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: {
    ...mockPage,
    layout: {
      sitecore: {
        context: {},
        route: {
          name: 'About Us',
          placeholders: {},
          fields: {
            pageHeaderTitle: { value: 'About Us' } as Field<string>,
            pageSummary: {
              value: 'Global semiconductor packaging and test services.',
            } as Field<string>,
            image: {
              value: {
                src: 'https://images.unsplash.com/photo-amkor-about?w=1600',
                alt: 'Amkor facility',
              },
            },
          },
        },
      },
    },
  } as unknown as Page,
  fields: {},
};

/**
 * External-URL Image XML: Sitecore Edge returns an empty jsonValue, so only the raw
 * `value` string carries `src`/`alt` (the amkor page shape).
 */
export const externalXmlImageProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    pageHeaderTitle: { value: 'About Us' } as Field<string>,
    pageSummary: { value: 'Global semiconductor packaging and test services.' } as Field<string>,
    image: {
      value:
        '<image src="https://amkormarcomexternal.blob.core.windows.net/amkordotcom/Amkor-logo.jpg" alt="Amkor Technology" />',
    },
  } as unknown as ArticleContentProps['fields'],
};

/** Copy present, page image field entirely absent. */
export const noImageFieldProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    pageHeaderTitle: { value: 'About Us' } as Field<string>,
    pageSummary: { value: 'Global semiconductor packaging and test services.' } as Field<string>,
  },
};

/** Progressive KM employee portal page — all kmpage fields populated. */
export const kmpageProps: ArticleContentProps = {
  rendering: mockRendering,
  params: {},
  page: mockPage,
  fields: {
    pageShortTitle: { value: 'Claims' } as Field<string>,
    pageHeaderTitle: { value: 'Claims Knowledge Base' } as Field<string>,
    pageTitle: { value: 'Claim Intake & Standards' } as Field<string>,
    pageSubtitle: {
      value: 'Guidance for Progressive claims associates handling commercial lines intake.',
    } as Field<string>,
    pageSummary: {
      value:
        'Shared internal standards for commercial lines claim intake, documentation, and handoff.',
    } as Field<string>,
    Detail: {
      value:
        '<p>Progressive Claims Knowledge Base for associates covering intake checklists, quality standards, and escalation paths.</p>',
    } as Field<string>,
    image: {
      value: {
        src: 'https://mrfbasech.sitecoresandbox.cloud/api/public/content/89538338843c4f9ebab1c4128e14a6ff?v=09cbf09d',
        alt: 'Claims knowledge banner',
        width: '3400',
        height: '1158',
      },
    },
  },
};
