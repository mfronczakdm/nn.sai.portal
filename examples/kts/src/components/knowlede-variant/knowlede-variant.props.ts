import type { LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { TaxonomyTopicReference } from '@/lib/taxonomy-topic';

export type KnowledeVariantFields = {
  Content?: RichTextField;
  /** General Link back to the source Knowledge Article */
  sourceDocument?: LinkField;
  SourceDocument?: LinkField;
  'Source Document'?: LinkField;
  /** Treelist of Knowledge Domain topics from the source article */
  SourceDocumentLOB?: TaxonomyTopicReference[];
  sourceDocumentLOB?: TaxonomyTopicReference[];
  /** Treelist of Peril Types from the source article */
  SourceDocumentPerils?: TaxonomyTopicReference[];
  sourceDocumentPerils?: TaxonomyTopicReference[];
};

export type KnowledeVariantProps = ComponentProps & {
  fields?: KnowledeVariantFields;
};
