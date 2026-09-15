import type { LinkField } from '@sitecore-content-sdk/nextjs';

import {
  extractDownloadLinks,
  extractGraphqlQueryFromDownloadContentField,
  resolveDownloadListFields,
} from '@/components/download-list/download-list.fields';

const link = (href: string, text?: string): LinkField =>
  ({
    value: { href, text: text ?? '', linktype: 'external' },
  }) as LinkField;

describe('resolveDownloadListFields', () => {
  it('merges datasource with flat fields', () => {
    const resolved = resolveDownloadListFields({
      data: {
        datasource: {
          Title: { value: 'From DS' },
          FeaturedContent: {
            results: [{ field: { link: link('https://x.com/a.pdf', 'Doc A') } }],
          },
        },
        externalFields: {},
      },
    });
    expect(resolved.title).toEqual({ value: 'From DS' });
    expect(extractDownloadLinks(resolved.featuredContent)).toHaveLength(1);
  });

  it('uses datasource children when FeaturedContent is absent (LinkList-style)', () => {
    const resolved = resolveDownloadListFields({
      data: {
        datasource: {
          Title: { value: 'Downloads' },
          children: {
            results: [{ field: { link: link('https://x.com/b.pdf', 'Doc B') } }],
          },
        },
        externalFields: {},
      },
    });
    expect(extractDownloadLinks(resolved.featuredContent)).toHaveLength(1);
    expect(extractDownloadLinks(resolved.featuredContent)[0].value?.href).toBe('https://x.com/b.pdf');
  });

  it('prefers FeaturedContent over children when both are present', () => {
    const resolved = resolveDownloadListFields({
      data: {
        datasource: {
          FeaturedContent: {
            results: [{ field: { link: link('https://featured.only/file.pdf') } }],
          },
          children: {
            results: [{ field: { link: link('https://child.ignored/file.pdf') } }],
          },
        },
        externalFields: {},
      },
    });
    expect(extractDownloadLinks(resolved.featuredContent)[0].value?.href).toBe(
      'https://featured.only/file.pdf',
    );
  });

  it('prefers flat title over datasource', () => {
    const resolved = resolveDownloadListFields({
      data: {
        datasource: { Title: { value: 'DS' } },
        externalFields: {},
      },
      title: { value: 'Flat' },
    });
    expect(resolved.title).toEqual({ value: 'Flat' });
  });

  it('resolves DownloadContent from datasource', () => {
    const q = 'query Q { x { fileName } }';
    const resolved = resolveDownloadListFields({
      data: {
        datasource: { DownloadContent: { value: q } },
        externalFields: {},
      },
    });
    expect(extractGraphqlQueryFromDownloadContentField(resolved.DownloadContent)).toBe(q);
  });
});

describe('extractGraphqlQueryFromDownloadContentField', () => {
  it('reads Field value and jsonValue', () => {
    expect(extractGraphqlQueryFromDownloadContentField({ value: '  query { a }  ' })).toBe('query { a }');
    expect(
      extractGraphqlQueryFromDownloadContentField({
        jsonValue: { value: 'query { b }' },
      }),
    ).toBe('query { b }');
  });

  it('returns undefined for empty', () => {
    expect(extractGraphqlQueryFromDownloadContentField({ value: '   ' })).toBeUndefined();
    expect(extractGraphqlQueryFromDownloadContentField(null)).toBeUndefined();
  });
});

describe('extractDownloadLinks', () => {
  it('reads LinkList-style results', () => {
    const raw = {
      results: [{ field: { link: link('https://cdn.example.com/file.csv', 'Sheet') } }],
    };
    expect(extractDownloadLinks(raw)).toHaveLength(1);
    expect(extractDownloadLinks(raw)[0].value?.href).toBe('https://cdn.example.com/file.csv');
  });

  it('reads fields.Link on items', () => {
    const raw = {
      results: [{ fields: { Link: link('https://example.com/z.zip') } }],
    };
    expect(extractDownloadLinks(raw)[0].value?.href).toBe('https://example.com/z.zip');
  });

  it('unwraps jsonValue on link', () => {
    const raw = {
      results: [{ link: { jsonValue: link('https://example.com/doc.pdf', 'PDF') } }],
    };
    expect(extractDownloadLinks(raw)).toHaveLength(1);
  });
});
