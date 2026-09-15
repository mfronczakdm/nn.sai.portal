import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import scConfig from 'sitecore.config';
import client from '@/lib/sitecore-client';
import { getMockPortalHubModules, isPortalHubMocksEnabled } from '@/lib/portal-hub-mocks';
import { extractImageSrc, normalizeImageFieldSrc } from '@/lib/sitecore-image-field';
import { isAllowedPortalHubPath, normalizeIndustryKey } from '@/lib/portal-hub-utils';

const DEFAULT_INDUSTRY_FRAGMENT = 'PortalIndustryFolder';
const DEFAULT_MODULE_FRAGMENT = 'PortalHubModule';
const MAX_INDUSTRY_CHILDREN = 40;
const MAX_MODULE_CHILDREN = 48;

/**
 * GraphQL `field(name:) { jsonValue }` branch — pass `*.jsonValue` into Content SDK field components.
 */
export type PortalHubModuleWire = {
  title?: { jsonValue?: Field<string> };
  description?: { jsonValue?: Field<string> };
  icon?: { jsonValue?: ImageField };
  link?: { jsonValue?: LinkField };
  ctaText?: { jsonValue?: Field<string> };
};

interface EdgeJsonField {
  jsonValue?: unknown;
}

interface IndustryChildResult {
  industryKey?: EdgeJsonField;
  children?: {
    results?: ModuleChildResult[];
  };
}

interface EdgeValueField {
  value?: unknown;
}

interface ModuleChildResult {
  title?: EdgeJsonField;
  description?: EdgeJsonField;
  icon?: EdgeValueField;
  link?: EdgeValueField;
  ctaText?: EdgeJsonField;
}

interface PortalHubQueryResult {
  item?: {
    children?: {
      results?: IndustryChildResult[];
    };
  };
}

export type FetchPortalHubModulesArgs = {
  path: string;
  language: string;
  industryKey: string;
  industryFragmentType?: string;
  moduleFragmentType?: string;
};

function readScalarFromJsonField(field?: EdgeJsonField): string {
  if (!field || field.jsonValue == null) return '';
  const jv = field.jsonValue;
  if (typeof jv === 'string') return jv.trim();
  if (typeof jv === 'object' && jv !== null && 'value' in jv && typeof (jv as { value?: unknown }).value === 'string') {
    return String((jv as { value: string }).value).trim();
  }
  return '';
}

function readTextFieldValue(field?: Field<string>): string {
  if (!field) return '';
  if (typeof (field as { value?: unknown }).value === 'string') {
    return (field as { value: string }).value.trim();
  }
  const jv = (field as { jsonValue?: { value?: string } }).jsonValue?.value;
  return typeof jv === 'string' ? jv.trim() : '';
}

export function resolvePortalHubItemPath(args: {
  paramsHubItemPath?: string;
  fieldsHubRootPath?: Field<string>;
}): string {
  const envPath = process.env.PORTAL_HUB_ITEM_PATH?.trim();
  if (envPath) return envPath;

  const paramPath = args.paramsHubItemPath?.trim();
  if (paramPath) return paramPath;

  const fieldPath = readTextFieldValue(args.fieldsHubRootPath);
  if (fieldPath) return fieldPath;

  const siteName = scConfig.defaultSite || process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || '';
  if (!siteName) return '';

  const suffix = process.env.PORTAL_HUB_DATA_PATH_SUFFIX?.trim() || '/Data/Portal Hub';
  return `/sitecore/content/${siteName}/${siteName}${suffix}`;
}

function buildPortalHubQuery(industryType: string, moduleType: string): string {
  return `
    query PortalHubModulesQuery($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        children(first: ${MAX_INDUSTRY_CHILDREN}) {
          results {
            ... on ${industryType} {
              industryKey: field(name: "Industry Key") { jsonValue }
              children(first: ${MAX_MODULE_CHILDREN}) {
                results {
                  ... on ${moduleType} {
                    title: field(name: "Title") { jsonValue }
                    description: field(name: "Description") { jsonValue }
                    icon: field(name: "Icon") { value }
                    link: field(name: "Link") { value }
                    ctaText: field(name: "Cta Text") { jsonValue }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
}


function wireImageField(icon?: EdgeValueField): PortalHubModuleWire['icon'] {
  if (icon?.value == null) return undefined;
  const src = extractImageSrc(icon.value);
  if (!src) return undefined;
  const imageField =
    typeof icon.value === 'object' && icon.value !== null && 'src' in icon.value
      ? normalizeImageFieldSrc({ value: icon.value } as ImageField)
      : normalizeImageFieldSrc({ value: { src } } as ImageField);
  if (!imageField?.value?.src) return undefined;
  return { jsonValue: imageField };
}

/** Edge returns General Link as raw XML in `value`; jsonValue often fails with FORMAT errors. */
export function wireLinkField(link?: EdgeValueField): PortalHubModuleWire['link'] {
  if (link?.value == null) return undefined;

  if (typeof link.value === 'object' && link.value !== null && 'href' in link.value) {
    const href = String((link.value as { href?: string }).href ?? '').trim();
    if (!href) return undefined;
    return {
      jsonValue: {
        value: link.value,
      } as LinkField,
    };
  }

  if (typeof link.value !== 'string') return undefined;
  const raw = link.value.trim();
  if (!raw) return undefined;

  const href = raw.match(/\burl="([^"]*)"/i)?.[1]?.trim();
  if (!href) return undefined;

  const linktype = raw.match(/\blinktype="([^"]*)"/i)?.[1]?.trim() || 'internal';
  const text = raw.match(/\b(?:text|title)="([^"]*)"/i)?.[1]?.trim() || '';

  return {
    jsonValue: {
      value: { href, text, linktype },
    } as LinkField,
  };
}
export async function fetchPortalHubModules(args: FetchPortalHubModulesArgs): Promise<PortalHubModuleWire[]> {
  const { path, language, industryKey } = args;
  const normalizedKey = normalizeIndustryKey(industryKey);

  if (isPortalHubMocksEnabled()) {
    return getMockPortalHubModules(normalizedKey);
  }

  if (!path || !normalizedKey || !isAllowedPortalHubPath(path)) return [];

  const industryFragment =
    args.industryFragmentType?.trim() ||
    process.env.PORTAL_GRAPHQL_INDUSTRY_TYPE?.trim() ||
    DEFAULT_INDUSTRY_FRAGMENT;
  const moduleFragment =
    args.moduleFragmentType?.trim() ||
    process.env.PORTAL_GRAPHQL_MODULE_TYPE?.trim() ||
    DEFAULT_MODULE_FRAGMENT;

  try {
    const result = await client.getData<PortalHubQueryResult>(
      buildPortalHubQuery(industryFragment, moduleFragment),
      { path, language },
    );

    const industries = result?.item?.children?.results ?? [];
    const industryNode = industries.find(
      (row) => normalizeIndustryKey(readScalarFromJsonField(row?.industryKey)) === normalizedKey,
    );

    const modules = industryNode?.children?.results ?? [];
    return modules.map((m) => ({
      title: m.title,
      description: m.description,
      icon: wireImageField(m.icon),
      link: wireLinkField(m.link),
      ctaText: m.ctaText,
    })) as PortalHubModuleWire[];
  } catch (error) {
    console.error('[fetchPortalHubModules] GraphQL request failed:', error);
    return [];
  }
}
