'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PortalHubModuleWire } from '@/lib/portal-hub-from-edge';
import { normalizeIndustryKey } from '@/lib/portal-hub-utils';

import type { PortalHubViewProps } from './portal-hub.props';

function ModuleCard({
  module,
  index,
  isEditing,
}: {
  module: PortalHubModuleWire;
  index: number;
  isEditing: boolean;
}): React.ReactElement {
  const titleField = module.title?.jsonValue;
  const descriptionField = module.description?.jsonValue;
  const iconField = module.icon?.jsonValue;
  const linkField = module.link?.jsonValue;
  const ctaField = module.ctaText?.jsonValue;
  const href = linkField?.value?.href?.trim();
  const linkTextFallback = linkField?.value?.text;

  return (
    <Card
      className="flex h-full flex-col border-border/80 shadow-sm transition-shadow hover:shadow-md"
      data-portal-hub-module
      data-module-index={index}
    >
      <CardHeader className="space-y-3">
        {iconField ? (
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
            <ContentSdkImage field={iconField} className="max-h-10 max-w-10 object-contain" />
          </div>
        ) : null}
        <CardTitle className="text-lg font-semibold leading-tight">
          {(titleField?.value || isEditing) && <Text field={titleField} tag="span" />}
        </CardTitle>
        {(descriptionField?.value || isEditing) && (
          <CardDescription className="text-muted-foreground text-sm leading-relaxed">
            <Text field={descriptionField} tag="span" />
          </CardDescription>
        )}
      </CardHeader>
      <CardFooter className="mt-auto flex flex-wrap gap-2 pt-0">
        {isEditing && linkField ? (
          <ContentSdkLink
            field={linkField}
            className="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
          />
        ) : href ? (
          <Button asChild variant="default" size="sm">
            <Link href={href} prefetch={false}>
              {ctaField?.value ? (
                <Text field={ctaField} tag="span" />
              ) : (
                <span>{linkTextFallback || href}</span>
              )}
            </Link>
          </Button>
        ) : (ctaField?.value || isEditing) ? (
          <Button type="button" variant="secondary" size="sm" disabled={!href}>
            <Text field={ctaField} tag="span" />
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

export const PortalHubViewClient: React.FC<PortalHubViewProps> = (props) => {
  const { fields, params, initialModules, initialIndustryKey, resolvedHubPath } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const searchParams = useSearchParams();
  const language =
    (page.layout?.sitecore?.context as { language?: string } | undefined)?.language || 'en';

  const queryIndustryRaw = searchParams.get('industry') ?? searchParams.get('industryType') ?? '';
  const queryIndustryKey = useMemo(() => normalizeIndustryKey(queryIndustryRaw), [queryIndustryRaw]);

  const paramIndustryKey = useMemo(() => normalizeIndustryKey(params.industryType ?? ''), [params.industryType]);

  const effectiveIndustryKey = queryIndustryKey || paramIndustryKey;

  const [modules, setModules] = useState<PortalHubModuleWire[]>(initialModules);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);

  const shouldRefetch = useMemo(() => {
    if (!queryIndustryKey) return false;
    return queryIndustryKey !== normalizeIndustryKey(initialIndustryKey);
  }, [initialIndustryKey, queryIndustryKey]);

  const runRefetch = useCallback(async () => {
    if (!shouldRefetch || !effectiveIndustryKey || !resolvedHubPath) {
      return;
    }
    setIsRefreshing(true);
    setRefreshError(false);
    try {
      const qs = new URLSearchParams({
        path: resolvedHubPath,
        industry: effectiveIndustryKey,
        language,
      });
      if (params.industryTemplateType) qs.set('industryTemplateType', params.industryTemplateType);
      if (params.moduleTemplateType) qs.set('moduleTemplateType', params.moduleTemplateType);

      const res = await fetch(`/api/portal-hub/modules?${qs.toString()}`, { method: 'GET' });
      if (!res.ok) {
        setRefreshError(true);
        return;
      }
      const data = (await res.json()) as { modules?: PortalHubModuleWire[] };
      setModules(Array.isArray(data.modules) ? data.modules : []);
    } catch {
      setRefreshError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [effectiveIndustryKey, language, params.industryTemplateType, params.moduleTemplateType, resolvedHubPath, shouldRefetch]);

  useEffect(() => {
    void runRefetch();
  }, [runRefetch]);

  useEffect(() => {
    if (!shouldRefetch) {
      setModules(initialModules);
    }
  }, [initialModules, shouldRefetch]);

  const showMissingIndustry = !effectiveIndustryKey;
  const showEmptyModules =
    Boolean(effectiveIndustryKey) && modules.length === 0 && !isRefreshing && !showMissingIndustry;

  return (
    <section
      data-component="PortalHub"
      className={cn('@container/portal-hub mx-auto w-full max-w-6xl px-4 py-10', params.styles)}
      aria-labelledby="portal-hub-title"
    >
      <header className="mb-8 max-w-3xl space-y-2">
        <h1 id="portal-hub-title" className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          <Text field={fields.title} tag="span" />
        </h1>
        <p className="text-muted-foreground text-base md:text-lg">
          <Text field={fields.subtitle} tag="span" />
        </p>
      </header>

      {isRefreshing ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`sk-${i}`} className="h-48 border-dashed">
              <CardHeader>
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : null}

      {refreshError && (fields.emptyModulesTitle?.value || fields.emptyModulesDescription?.value || isEditing) ? (
        <div className="text-destructive mb-6 space-y-1 text-sm" role="alert">
          {(fields.emptyModulesTitle?.value || isEditing) && (
            <p className="font-medium">
              <Text field={fields.emptyModulesTitle} tag="span" />
            </p>
          )}
          {(fields.emptyModulesDescription?.value || isEditing) && (
            <p>
              <Text field={fields.emptyModulesDescription} tag="span" />
            </p>
          )}
        </div>
      ) : null}

      {showMissingIndustry ? (
        <div className="bg-muted/40 text-muted-foreground rounded-lg border p-6 md:p-8" role="status">
          {(fields.missingIndustryTitle?.value || isEditing) && (
            <h2 className="text-foreground mb-2 text-lg font-medium">
              <Text field={fields.missingIndustryTitle} tag="span" />
            </h2>
          )}
          {(fields.missingIndustryDescription?.value || isEditing) && (
            <p className="text-sm leading-relaxed">
              <Text field={fields.missingIndustryDescription} tag="span" />
            </p>
          )}
        </div>
      ) : null}

      {showEmptyModules && !refreshError ? (
        <div className="bg-muted/30 rounded-lg border border-dashed p-8 text-center" role="status">
          {(fields.emptyModulesTitle?.value || isEditing) && (
            <h2 className="text-foreground mb-2 text-lg font-medium">
              <Text field={fields.emptyModulesTitle} tag="span" />
            </h2>
          )}
          {(fields.emptyModulesDescription?.value || isEditing) && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              <Text field={fields.emptyModulesDescription} tag="span" />
            </p>
          )}
        </div>
      ) : null}

      {!showMissingIndustry && modules.length > 0 && !isRefreshing ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module, index) => (
            <ModuleCard key={`module-${index}`} module={module} index={index} isEditing={isEditing} />
          ))}
        </div>
      ) : null}
    </section>
  );
};
