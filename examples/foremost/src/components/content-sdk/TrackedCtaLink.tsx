'use client';

import { forwardRef, type ComponentPropsWithoutRef, type MouseEventHandler } from 'react';
import {
  Link as ContentSdkLink,
  type LinkField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';

import { trackCdpLinkClickEvent } from '@/lib/cdp-link-click-event';

type ContentSdkLinkProps = ComponentPropsWithoutRef<typeof ContentSdkLink>;

export type TrackedCtaLinkProps = Omit<ContentSdkLinkProps, 'field'> & {
  field: LinkField;
};

export const TrackedCtaLink = forwardRef<HTMLAnchorElement, TrackedCtaLinkProps>(
  function TrackedCtaLink({ field, onClick, ...props }, ref) {
    const { page } = useSitecore();
    const { isEditing, isPreview } = page.mode;

    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
      onClick?.(event);
      if (event.defaultPrevented || isEditing || isPreview) return;

      void trackCdpLinkClickEvent(field?.value?.text);
    };

    return <ContentSdkLink ref={ref} field={field} onClick={handleClick} {...props} />;
  }
);

TrackedCtaLink.displayName = 'TrackedCtaLink';
