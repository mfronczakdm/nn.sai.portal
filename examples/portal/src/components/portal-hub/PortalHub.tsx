import type React from 'react';
import { Suspense } from 'react';

import scConfig from 'sitecore.config';
import { fetchPortalHubModules, resolvePortalHubItemPath } from '@/lib/portal-hub-from-edge';
import { normalizeIndustryKey } from '@/lib/portal-hub-utils';

import type { PortalHubProps } from './portal-hub.props';
import { PortalHubViewClient } from './PortalHubView.client';

/**
 * Config-driven portal hub: `industryType` (rendering param) and optional `?industry=` / `?industryType=`
 * resolve which Sitecore module rows to load under the configured hub item. Module copy, icons, and links
 * are authored only in Sitecore (see `portal-hub.props.ts` and `.env.remote.example`).
 */
export async function Default(props: PortalHubProps): Promise<React.ReactElement> {
  const { fields, params, page } = props;
  const language =
    (page.layout?.sitecore?.context as { language?: string } | undefined)?.language ||
    scConfig.defaultLanguage ||
    'en';

  const resolvedHubPath = resolvePortalHubItemPath({
    paramsHubItemPath: params.hubItemPath,
    fieldsHubRootPath: fields.hubRootPath,
  });

  const initialIndustryKey = normalizeIndustryKey(params.industryType ?? '');

  const initialModules =
    initialIndustryKey && resolvedHubPath
      ? await fetchPortalHubModules({
          path: resolvedHubPath,
          language,
          industryKey: initialIndustryKey,
          industryFragmentType: params.industryTemplateType,
          moduleFragmentType: params.moduleTemplateType,
        })
      : [];

  return (
    <Suspense fallback={null}>
      <PortalHubViewClient
        fields={fields}
        params={params}
        resolvedHubPath={resolvedHubPath}
        initialModules={initialModules}
        initialIndustryKey={initialIndustryKey}
      />
    </Suspense>
  );
}
