import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

/**
 * Fields on the **Portal Page Detail** rendering (same pattern as Portal Hub / Auth Panel —
 * authored on the rendering or inherited; no separate datasource item required).
 *
 * - `title` — Single-Line Text (optional)
 * - `subtitle` — Single-Line Text (optional)
 * - `body` — Rich Text (HTML; rendered with Content SDK `RichText`)
 */
export type PortalPageDetailFields = {
  title?: Field<string>;
  subtitle?: Field<string>;
  body?: RichTextField;
};

export type PortalPageDetailProps = ComponentProps & {
  fields: PortalPageDetailFields;
};
