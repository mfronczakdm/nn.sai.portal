import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

/**
 * Datasource item fields (template **Portal Page Detail** in Sitecore).
 *
 * Recommended field types:
 * - `title` — Single-Line Text
 * - `subtitle` — Single-Line Text (optional)
 * - `body` — Rich Text (HTML authored in Sitecore; rendered via Content SDK `RichText`)
 */
export type PortalPageDetailDatasource = {
  title?: { jsonValue?: Field<string> };
  subtitle?: { jsonValue?: Field<string> };
  body?: { jsonValue?: Field<string> };
};

export type PortalPageDetailProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: PortalPageDetailDatasource;
    };
  };
};
