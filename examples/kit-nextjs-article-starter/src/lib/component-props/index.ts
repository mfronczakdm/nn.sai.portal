import { ComponentParams, ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

/**
 * Shared component props
 */
export type ComponentProps = {
  rendering: ComponentRendering;
  params: ComponentParams;
  page: Page;
};

export type ComponentWithContextProps = ComponentProps & {
  page: Page;
};
