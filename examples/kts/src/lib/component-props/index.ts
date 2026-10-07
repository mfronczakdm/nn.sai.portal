import { ComponentParams, ComponentRendering, Page } from '@sitecore-content-sdk/nextjs';

export type ComponentProps = {
  rendering: ComponentRendering;
  params: ComponentParams & {
    RenderingIdentifier?: string;
    styles?: string;
    EnabledPlaceholders?: string;
  };
  page: Page;
};

export type ComponentWithContextProps = ComponentProps & {
  page: Page;
};
