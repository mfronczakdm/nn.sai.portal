'use client';

import type { FC } from 'react';
import { Download, FileArchive, FileSpreadsheet, FileText } from 'lucide-react';
import { Link as ContentSdkLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { cn } from '@/lib/utils';

import { extractDownloadLinks, resolveDownloadListFields } from './download-list.fields';
import type { DownloadListProps } from './download-list.props';

function displayNameForLink(link: LinkField): string {
  const text = link.value?.text?.trim();
  if (text) return text;
  try {
    const href = link.value?.href;
    if (!href) return 'Download';
    const path = new URL(href, 'https://placeholder.local').pathname;
    const base = path.split('/').pop() || href;
    return decodeURIComponent(base);
  } catch {
    return link.value?.href || 'Download';
  }
}

function renderFileGlyph(href: string, className: string) {
  const lower = href.toLowerCase();
  const iconProps = { className, 'aria-hidden': true as const };
  if (lower.includes('.zip') || lower.includes('.rar') || lower.includes('.7z')) {
    return <FileArchive {...iconProps} />;
  }
  if (lower.includes('.csv') || lower.includes('.xls')) {
    return <FileSpreadsheet {...iconProps} />;
  }
  if (lower.includes('.pdf') || lower.includes('.doc')) {
    return <FileText {...iconProps} />;
  }
  return <FileText {...iconProps} />;
}

export const Default: FC<DownloadListProps> = ({ fields, page }) => {
  const resolved = resolveDownloadListFields(fields);
  const links = extractDownloadLinks(resolved.featuredContent);
  const { isEditing } = page.mode;

  if (!isEditing && links.length === 0) {
    return null;
  }

  const { title, subtitle } = resolved;

  return (
    <section
      data-component="DownloadList"
      className="w-full px-4 py-12 @container"
      aria-label={title?.value ? String(title.value) : 'Downloads'}
    >
      <div className="mx-auto max-w-2xl">
        {(title || isEditing) && title && (
          <Text
            tag="h2"
            field={title}
            className="font-heading text-foreground mb-2 text-2xl font-semibold tracking-tight @md:text-3xl"
          />
        )}
        {(subtitle || isEditing) && subtitle && (
          <Text
            tag="p"
            field={subtitle}
            className="text-muted-foreground font-body mb-8 text-base leading-relaxed"
          />
        )}

        {links.length === 0 && isEditing && (
          <p className="text-muted-foreground rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm">
            Add items to <strong>FeaturedContent</strong> (each with a general / external link) to list
            downloads here.
          </p>
        )}

        {links.length > 0 && (
          <ul className="flex flex-col gap-0 rounded-xl border border-border bg-card shadow-sm">
            {links.map((link, index) => (
              <DownloadRow
                key={`${link.value?.href ?? index}-${index}`}
                link={link}
                isFirst={index === 0}
                isLast={index === links.length - 1}
                isEditing={isEditing}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

function DownloadRow({
  link,
  isFirst,
  isLast,
  isEditing,
}: {
  link: LinkField;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
}) {
  const href = link.value?.href ?? '';
  const label = displayNameForLink(link);

  if (isEditing) {
    return (
      <li
        className={cn(
          'border-border flex items-center gap-3 border-b p-4 text-sm last:border-b-0',
          isFirst && 'rounded-t-xl',
          isLast && 'rounded-b-xl',
        )}
      >
        <span className="text-muted-foreground shrink-0">{renderFileGlyph(href, 'size-5')}</span>
        <ContentSdkLink
          field={link}
          className="text-primary font-medium underline-offset-4 hover:underline"
          prefetch={false}
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        'border-border hover:bg-muted/40 flex flex-col gap-1 border-b transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        isFirst && 'rounded-t-xl',
        isLast && 'rounded-b-xl',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 p-4 sm:py-3">
        <span className="text-muted-foreground shrink-0" aria-hidden>
          {renderFileGlyph(href, 'size-5')}
        </span>
        <span className="text-foreground truncate text-sm font-medium" title={label}>
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center px-4 pb-4 sm:px-6 sm:py-3 sm:pb-3">
        <a
          href={href}
          className="text-muted-foreground hover:text-primary focus-visible:ring-ring inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="size-4 shrink-0" aria-hidden />
          Download
        </a>
      </div>
    </li>
  );
}
