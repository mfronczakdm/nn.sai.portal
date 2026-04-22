import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface DownloadListParams {
  [key: string]: string | undefined;
}

export interface DownloadListFields {
  title?: Field<string>;
  subtitle?: Field<string>;
  /** Multilist / GraphQL list of items with general links — see `download-list.fields.ts`. */
  featuredContent?: unknown;
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
