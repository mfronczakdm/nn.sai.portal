import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { extractDownloadLinks, resolveDownloadListFields } from '@/components/download-list/download-list.fields';

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
