import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import type { PortalHubModuleWire } from '@/lib/portal-hub-from-edge';

/** Minimal shapes suitable for Content SDK `Text` / `Image` / `Link` in demo mode. */
export function mockTextField(value: string): { jsonValue: Field<string> } {
  return { jsonValue: { value } as Field<string> };
}

export function mockLinkField(href: string, text?: string): { jsonValue: LinkField } {
  return {
    jsonValue: {
      value: {
        href,
        text: text ?? href,
      },
    } as LinkField,
  };
}

export function mockImageField(src: string, alt: string): { jsonValue: ImageField } {
  return {
    jsonValue: {
      value: { src, alt },
    } as ImageField,
  };
}

export function mockModule(partial: PortalHubModuleWire): PortalHubModuleWire {
  return partial;
}
