import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { TaxonomyTopicReference } from '@/lib/taxonomy-topic';

export type AiFaqFields = {
  Question?: Field<string>;
  Answer?: Field<string>;
  /** Treelist of Knowledge Domain topics */
  LOB?: TaxonomyTopicReference[];
  lob?: TaxonomyTopicReference[];
  /** Treelist of Peril Types topics — Sitecore field name is "Peril Type" */
  'Peril Type'?: TaxonomyTopicReference[];
  perilType?: TaxonomyTopicReference[];
};

export type AiFaqProps = ComponentProps & {
  fields?: AiFaqFields;
};
