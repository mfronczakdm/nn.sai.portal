import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { ReferenceField } from '@/types/ReferenceField.props';

export interface ArticleListingParams {
  styles?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type ArticleAuthorItemFields = {
  personProfileImage?: ImageField;
  personFirstName: Field<string>;
  personLastName: Field<string>;
  personJobTitle?: Field<string>;
  personBio?: Field<string>;
  personLinkedIn?: LinkField;
};

export type ArticleAuthorReferenceField = ReferenceField & {
  fields: ArticleAuthorItemFields;
};

export type ArticleItem = {
  pageTitle: Field<string>;
  pageSummary: Field<string>;
  pageThumbnail: ImageField;
  pageReadTime: Field<string>;
  taxAuthor: ArticleAuthorReferenceField;
};

export type ArticleItemReferenceField = ReferenceField & {
  fields: ArticleItem;
};

export interface ArticleListingFields {
  titleOptional?: Field<string>;
  descriptionOptional?: Field<string>;
  linkOptional?: LinkField;
  featuredContent?: ArticleItemReferenceField[];
}

export interface ArticleListingProps extends ComponentProps {
  params: ArticleListingParams;
  fields?: ArticleListingFields;
  isPageEditing?: boolean;
}
