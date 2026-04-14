import { ComponentParams, ComponentRendering, Page, NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';

export type ComponentProps = {
  rendering: ComponentRendering;
  params: ComponentParams & {
    RenderingIdentifier?: string;
    styles?: string;
    EnabledPlaceholders?: string;
  };
  page: Page;
  componentMap: Map<string, NextjsContentSdkComponent>;
};

export type ComponentWithContextProps = ComponentProps & {
  page: Page;
};
