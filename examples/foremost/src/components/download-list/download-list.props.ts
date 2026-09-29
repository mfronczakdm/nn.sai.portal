import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface DownloadListParams {
  [key: string]: string | undefined;
}

export interface DownloadListFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  /**
   * Row source (either works):
   * - `featuredContent` / multilist-style list, or
   * - `children` on the datasource (child items with a general / external link), LinkList-style.
   * @see `download-list.fields.ts`
   */
  featuredContent?: unknown;
  children?: unknown;
  /** GraphQL query text (Sitecore GraphQL field); executed server-side via plan-assets API. */
  DownloadContent?: Field<string> | unknown;
  downloadContent?: Field<string> | unknown;
}

export type DownloadListFieldsFromLayout = {
  data: {
    datasource?: Partial<DownloadListFields>;
    externalFields?: unknown;
  };
};

export type DownloadListProps = ComponentProps & {
  params: DownloadListParams;
  fields: DownloadListFields | DownloadListFieldsFromLayout;
};
