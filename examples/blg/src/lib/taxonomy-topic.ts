import type { Field } from '@sitecore-content-sdk/nextjs';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  Car,
  CloudFog,
  Droplets,
  Flame,
  Home,
  Lock,
  Tag,
} from 'lucide-react';

import type { ReferenceField } from '@/types/ReferenceField.props';

export type TaxonomyTopicReference = ReferenceField & {
  fields?: {
    titleRequired?: Field<string>;
    Title?: Field<string>;
  };
};

/** Map taxonomy Topic names → Lucide icons for LOB / Peril chips. */
const ICON_BY_KEY: Record<string, LucideIcon> = {
  // Peril Types
  'business interuption': Briefcase,
  'business interruption': Briefcase,
  fire: Flame,
  'smoke damage': CloudFog,
  theft: Lock,
  'water damage': Droplets,
  'wind hail': CloudFog,
  // Knowledge Domain / LOB
  'commercial claims': Building2,
  'personal home': Home,
  'personal auto': Car,
};

function normalizeKey(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function iconForTopic(label: string): LucideIcon {
  return ICON_BY_KEY[normalizeKey(label)] || Tag;
}

export function topicLabel(topic: TaxonomyTopicReference): string {
  return (
    topic.fields?.titleRequired?.value?.trim() ||
    topic.fields?.Title?.value?.trim() ||
    topic.displayName?.trim() ||
    topic.name ||
    'Topic'
  );
}

/** Normalize Multilist / Treelist topic arrays from layout field bags. */
export function resolveTopicList(
  fields: Record<string, unknown> | undefined | null,
  names: string[]
): TaxonomyTopicReference[] {
  if (!fields) return [];
  for (const name of names) {
    const raw = fields[name];
    if (Array.isArray(raw)) return raw as TaxonomyTopicReference[];
  }
  return [];
}
