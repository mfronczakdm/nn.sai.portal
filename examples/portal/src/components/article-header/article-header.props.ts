import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';
import type { JsonWrappedImageField } from '@/lib/sitecore-image-field';

interface ArticleHeaderParams {
  [key: string]: any; // eslint-disable-line
}

export type ReferenceField = {
  id: string;
  name: string;
  url?: string;
  displayName?: string;
  fields?: {
    [key: string]: Field | ReferenceField | null;
  };
};

export type AuthorReferenceField = ReferenceField & {
  fields: PersonItem;
};

export type AuthorItemFields = {
  name: Field<string>;
  jobTitle: Field<string>;
};

interface ArticleHeaderFields {
  imageRequired?: ImageField | JsonWrappedImageField;
  eyebrowOptional?: Field<string>;
  pageDisplayDate?: Field<string>;
  pageAuthor?: Field<string>;
}

interface ArticleHeaderExternalFields {
  pageHeaderTitle: Field<string>;
  pageReadTime?: Field<string>;
  pageDisplayDate?: Field<string>;
  pageAuthor?: { value: PersonItem };
}

/** Layout / GraphQL shape used by PageHeader and Content SDK (`fields.data.datasource`). */
export type ArticleHeaderFieldsFromLayout = {
  data: {
    datasource?: Partial<ArticleHeaderFields>;
    externalFields?: unknown;
  };
};

export interface ArticleHeaderProps extends ComponentProps {
  params: ArticleHeaderParams;
  fields: ArticleHeaderFields | ArticleHeaderFieldsFromLayout;
  externalFields: ArticleHeaderExternalFields;
}

export interface PersonItem extends ComponentProps {
  personProfileImage?: ImageField;
  personFirstName: Field<string>;
  personLastName: Field<string>;
  personJobTitle?: Field<string>;
  personBio?: Field<string>;
  personLinkedIn?: LinkField;
}
