'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Download, FileArchive, FileSpreadsheet, FileText } from 'lucide-react';
import { Link as ContentSdkLink, Text } from '@sitecore-content-sdk/nextjs';
import type { LinkField } from '@sitecore-content-sdk/nextjs';

import { cn } from '@/lib/utils';

import {
  extractDownloadLinks,
  extractGraphqlQueryFromDownloadContentField,
  resolveDownloadListFields,
} from './download-list.fields';
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

type PlanAssetsApiResponse = { fileNames?: string[] };

export const Default: FC<DownloadListProps> = ({ fields, page }) => {
  const resolved = resolveDownloadListFields(fields);
  const links = extractDownloadLinks(resolved.featuredContent);
  const { isEditing } = page.mode;

  const downloadGraphqlQuery =
    extractGraphqlQueryFromDownloadContentField(resolved.DownloadContent) ??
    extractGraphqlQueryFromDownloadContentField(resolved.downloadContent);

  const [planAssetFileNames, setPlanAssetFileNames] = useState<string[]>([]);
  const [planAssetsFailed, setPlanAssetsFailed] = useState(false);
  const [planAssetsFetched, setPlanAssetsFetched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!downloadGraphqlQuery) {
      setPlanAssetFileNames([]);
      setPlanAssetsFailed(false);
      setPlanAssetsFetched(true);
      return () => {
        cancelled = true;
      };
    }

    setPlanAssetsFetched(false);
    fetch('/api/download-list/plan-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: downloadGraphqlQuery }),
    })
      .then(async (r) => {
        const json = (await r.json()) as PlanAssetsApiResponse;
        if (!r.ok) throw new Error('plan-assets');
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        const names = json.fileNames;
        setPlanAssetFileNames(Array.isArray(names) ? names : []);
        setPlanAssetsFailed(false);
      })
      .catch(() => {
        if (!cancelled) {
          setPlanAssetFileNames([]);
          setPlanAssetsFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setPlanAssetsFetched(true);
      });
    return () => {
      cancelled = true;
    };
  }, [downloadGraphqlQuery]);

  const hasPlanAssets = planAssetFileNames.length > 0;

  if (!isEditing && links.length === 0 && planAssetsFetched && !hasPlanAssets) {
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

        {!planAssetsFetched && links.length === 0 && !isEditing && (
          <p className="text-muted-foreground mb-4 text-sm">Loading plan documents…</p>
        )}

        {links.length === 0 && !hasPlanAssets && planAssetsFetched && isEditing && (
          <p className="text-muted-foreground rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm">
            Add <strong>child items</strong> under this Download List (each with a general / external link),
            or use <strong>FeaturedContent</strong>, to list downloads here.
          </p>
        )}

        {planAssetsFailed && isEditing && (
          <p className="text-muted-foreground mb-4 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm">
            Plan asset GraphQL failed. Check the <strong>DownloadContent</strong> query, set{' '}
            <code className="text-xs">BCBS_GRAPHQL_ENDPOINT</code> and <code className="text-xs">BCBS_GRAPHQL_TOKEN</code>{' '}
            on the server, and review logs.
          </p>
        )}

        {hasPlanAssets && (
          <ul
            className="mb-8 flex flex-col gap-0 rounded-xl border border-border bg-card shadow-sm"
            aria-label="Plan documents from directory"
          >
            {planAssetFileNames.map((fileName, index) => (
              <PlanAssetFileNameRow
                key={fileName}
                fileName={fileName}
                isFirst={index === 0}
                isLast={index === planAssetFileNames.length - 1}
              />
            ))}
          </ul>
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

function PlanAssetFileNameRow({
  fileName,
  isFirst,
  isLast,
}: {
  fileName: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <li
      className={cn(
        'border-border flex items-center gap-3 border-b p-4 text-sm last:border-b-0',
        isFirst && 'rounded-t-xl',
        isLast && 'rounded-b-xl',
      )}
    >
      <span className="text-muted-foreground shrink-0" aria-hidden>
        {renderFileGlyph(fileName, 'size-5')}
      </span>
      <span className="text-foreground min-w-0 flex-1 font-medium">{fileName}</span>
    </li>
  );
}

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
