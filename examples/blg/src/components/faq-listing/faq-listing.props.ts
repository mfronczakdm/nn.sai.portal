import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { ReferenceField } from '@/types/ReferenceField.props';

export type FaqItemFields = {
  Question?: Field<string>;
  Answer?: Field<string>;
};

export type FaqItemReferenceField = ReferenceField & {
  fields?: FaqItemFields;
};

export type FAQListingFields = {
  titleOptional?: Field<string>;
  descriptionOptional?: Field<string>;
  linkOptional?: LinkField;
  /** Treelist of AIFAQ items — Sitecore field name is FeaturedFaq */
  FeaturedFaq?: FaqItemReferenceField[];
  featuredFaq?: FaqItemReferenceField[];
};

export type FAQListingProps = ComponentProps & {
  fields?: FAQListingFields;
  isPageEditing?: boolean;
};
