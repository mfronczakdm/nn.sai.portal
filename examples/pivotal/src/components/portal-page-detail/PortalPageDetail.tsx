'use client';

import type React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

import type { PortalPageDetailProps } from './portal-page-detail.props';

/** Site-root portal hub path — matches PortalHub module links (`/portal/account`, etc.). */
const PORTAL_HUB_HREF = '/portal';

type PortalDetailNavigationProps = {
  currentPageLabel: string;
  isEditing: boolean;
};

function PortalDetailNavigation({
  currentPageLabel,
  isEditing,
}: PortalDetailNavigationProps): React.ReactElement {
  const showCurrentPage = Boolean(currentPageLabel) || isEditing;
  const currentLabel = currentPageLabel || (isEditing ? 'Current page' : '');

  return (
    <div className="portal-page-detail__nav mb-6 space-y-3" data-portal-detail-nav>
      <Link
        href={PORTAL_HUB_HREF}
        prefetch={false}
        className="text-primary hover:text-primary/90 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        <span>Back to Portal</span>
      </Link>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={PORTAL_HUB_HREF} prefetch={false}>
                Portal
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {showCurrentPage ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

/**
 * Detail block: optional title/subtitle and rich HTML `body`, using the same flat `fields`
 * contract as Portal Hub (fields live on the rendering, not `fields.data.datasource`).
 */
export const Default: React.FC<PortalPageDetailProps> = (props) => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const title = fields?.title;
  const subtitle = fields?.subtitle;
  const body = fields?.body;

  const route = page.layout?.sitecore?.route;
  const routeTitle =
    (route?.displayName as string | undefined) || (route?.name as string | undefined) || '';

  const hasTitle = Boolean(title?.value?.trim());
  const hasSubtitle = Boolean(subtitle?.value?.trim());
  const hasBody = Boolean(body?.value?.trim());

  const currentPageLabel = title?.value?.trim() || routeTitle;

  return (
    <article
      className={cn(
        // Full width of the Sitecore placeholder so embedded layout HTML (e.g. flex dashboards) is not
        // squeezed or offset; use params.styles from CM if you need a max-width text column.
        'portal-page-detail w-full max-w-full min-w-0 px-4 py-8 md:px-6 md:py-10',
        params?.styles,
      )}
      data-component="portal-page-detail"
    >
      <PortalDetailNavigation currentPageLabel={currentPageLabel} isEditing={isEditing} />
      {(hasTitle || isEditing) && (
        <Text
          tag="h1"
          className="font-heading text-foreground mb-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl"
          field={title}
        />
      )}
      {(hasSubtitle || isEditing) && (
        <Text
          tag="p"
          className="text-muted-foreground mb-8 text-pretty text-lg md:text-xl"
          field={subtitle}
        />
      )}
      {(hasBody || isEditing) && (
        <div
          className={cn(
            // not-prose: avoid typography plugin rules on nested flex/grid (common cause of drift in RTE HTML).
            'portal-page-detail__body text-foreground not-prose w-full max-w-full min-w-0',
          )}
        >
          <RichText field={body} />
        </div>
      )}
    </article>
  );
};
