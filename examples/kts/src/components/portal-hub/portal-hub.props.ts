import type { ComponentRendering, Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { PortalHubModuleWire } from '@/lib/portal-hub-from-edge';

/**
 * Sitecore-driven module row. Populated from Edge GraphQL under the configured hub item
 * (industry folder → modules). Shape matches template fields on **PortalHubModule**.
 */
export type PortalModule = PortalHubModuleWire;

export type PortalHubFields = {
  title: Field<string>;
  subtitle: Field<string>;
  /**
   * Optional root item path for GraphQL (`item(path:)`). When empty, uses rendering param
   * `hubItemPath`, env `PORTAL_HUB_ITEM_PATH`, or `/sitecore/content/sync/{site}/Data/Portal Hub`.
   */
  hubRootPath?: Field<string>;
  /** Shown when no `industryType` / query industry is resolved. */
  missingIndustryTitle?: Field<string>;
  missingIndustryDescription?: Field<string>;
  /** Shown when the industry resolves but Sitecore returns no modules. */
  emptyModulesTitle?: Field<string>;
  emptyModulesDescription?: Field<string>;
};

export type PortalHubParams = ComponentProps['params'] & {
  industryType?: string;
  hubItemPath?: string;
  /** GraphQL inline fragment names (must match Edge-exposed template type names). */
  industryTemplateType?: string;
  moduleTemplateType?: string;
};

export type PortalHubProps = ComponentProps & {
  fields: PortalHubFields;
  params: PortalHubParams;
  rendering: ComponentRendering;
};

export type PortalHubViewProps = {
  fields: PortalHubFields;
  params: PortalHubParams;
  /** Resolved Sitecore item path used for Edge GraphQL (computed on the server). */
  resolvedHubPath: string;
  initialModules: PortalHubModuleWire[];
  initialIndustryKey: string;
};
