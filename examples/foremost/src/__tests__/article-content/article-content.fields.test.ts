import type { Field, Page, ComponentRendering, PageMode } from '@sitecore-content-sdk/nextjs';
import { mergeArticleContentFields } from '../../components/article-content/article-content.fields';
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
  layout: { sitecore: { context: {}, route: null } },
  locale: 'en',
};

const mockRendering = { componentName: 'ArticleContent' } as ComponentRendering;

const base = (): Pick<ArticleContentProps, 'rendering' | 'params' | 'page'> => ({
  rendering: mockRendering,
  params: {},
  page: mockPage,
});

describe('mergeArticleContentFields', () => {
  it('prefers flat datasource fields over externalFields', () => {
    const merged = mergeArticleContentFields(
      {
        ...base(),
        fields: {
          pageTitle: { value: 'Datasource title' } as Field<string>,
        },
        externalFields: {
          pageTitle: { value: 'Page title' } as Field<string>,
        },
      },
      false,
    );
    expect(merged.pageTitle?.value).toBe('Datasource title');
  });

  it('uses externalFields when flat fields omit the key', () => {
    const merged = mergeArticleContentFields(
      {
        ...base(),
        fields: {},
        externalFields: {
          pageTitle: { value: 'Page only' } as Field<string>,
        },
      },
      false,
    );
    expect(merged.pageTitle?.value).toBe('Page only');
  });

  it('prefers nested datasource over nested externalFields', () => {
    const merged = mergeArticleContentFields(
      {
        ...base(),
        fields: {
          data: {
            datasource: {
              pageTitle: { jsonValue: { value: 'From datasource item' } as Field<string> },
            },
            externalFields: {
              pageTitle: { jsonValue: { value: 'From page' } as Field<string> },
            },
          },
        },
      },
      false,
    );
    expect(merged.pageTitle?.value).toBe('From datasource item');
  });

  it('maps legacy Title key to pageTitle when canonical key is absent', () => {
    const merged = mergeArticleContentFields(
      {
        ...base(),
        fields: {
          Title: { value: 'Legacy title' } as Field<string>,
        },
      },
      false,
    );
    expect(merged.pageTitle?.value).toBe('Legacy title');
  });

  it('falls back to route.fields when no other source has the key', () => {
    const merged = mergeArticleContentFields(
      {
        ...base(),
        fields: {},
        page: {
          ...mockPage,
          layout: {
            sitecore: {
              context: {},
              route: {
                fields: {
                  pageTitle: { value: 'From route' } as Field<string>,
                },
              },
            },
          },
        },
      },
      false,
    );
    expect(merged.pageTitle?.value).toBe('From route');
  });

  it('resolves ArticleBody rich text field', () => {
    const merged = mergeArticleContentFields(
      {
        ...base(),
        fields: {
          ArticleBody: { value: '<p>Body HTML</p>' } as Field<string>,
        },
      },
      false,
    );
    expect(merged.ArticleBody?.value).toBe('<p>Body HTML</p>');
  });
});
