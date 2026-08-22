import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { TaxonomyTopicReference } from '@/lib/taxonomy-topic';
import type { ReferenceField } from '@/types/ReferenceField.props';

export type KmTopicReference = TaxonomyTopicReference;

/**
 * Page fields from Knowledge Article template {42F8929A-83CD-48FE-92F0-8AAC46E6CC62}.
 * Sitecore field names with spaces are preserved; camelCase aliases accepted when present.
 */
export type KmArticleContentFields = {
  'KB-ID'?: Field<string>;
  Title?: Field<string>;
  LOB?: KmTopicReference[];
  'Peril type'?: KmTopicReference[];
  Purpose?: RichTextField;
  'Intake Triggers'?: RichTextField;
  'Core Triage Questions'?: RichTextField;
  'General Escalation Rules'?: RichTextField;
  'Standard Site Inspection Rules'?: RichTextField;
  'Photo Video Standards'?: RichTextField;
  'General Mitigation'?: RichTextField;
  'Baseline Reserve Guidelines'?: RichTextField;
  'General Payment Triggers'?: RichTextField;
  'Common Scenarios'?: RichTextField;
  /** Treelist of KnowledgeChunks shared / state-specific content */
  sharedContent?: ReferenceField[];
  SharedContent?: ReferenceField[];
  /** Helpfulness thumbs-up total */
  PositiveCount?: Field<string | number>;
  /** Helpfulness thumbs-down total */
  NegativeCount?: Field<string | number>;
  /** Number of star ratings submitted */
  TotalRatings?: Field<string | number>;
  /** Sum of all star values (1–5 each) */
  RatingsSum?: Field<string | number>;
  /** AverageRating = RatingsSum / TotalRatings */
  AverageRating?: Field<string | number>;
  LastRated?: Field<string>;
  // Layout Service / GraphQL aliases
  kbId?: Field<string>;
  title?: Field<string>;
  lob?: KmTopicReference[];
  perilType?: KmTopicReference[];
  purpose?: RichTextField;
  intakeTriggers?: RichTextField;
  coreTriageQuestions?: RichTextField;
  generalEscalationRules?: RichTextField;
  standardSiteInspectionRules?: RichTextField;
  photoVideoStandards?: RichTextField;
  generalMitigation?: RichTextField;
  baselineReserveGuidelines?: RichTextField;
  generalPaymentTriggers?: RichTextField;
  commonScenarios?: RichTextField;
  positiveCount?: Field<string | number>;
  negativeCount?: Field<string | number>;
  totalRatings?: Field<string | number>;
  ratingsSum?: Field<string | number>;
  averageRating?: Field<string | number>;
  lastRated?: Field<string>;
  'Positive Count'?: Field<string | number>;
  'Negative Count'?: Field<string | number>;
  'Total Ratings'?: Field<string | number>;
  'Rating Sum'?: Field<string | number>;
  'Average Rating'?: Field<string | number>;
  'Last Rated'?: Field<string>;
};

export type KmArticleContentProps = ComponentProps & {
  fields?: KmArticleContentFields;
  isPageEditing?: boolean;
};
