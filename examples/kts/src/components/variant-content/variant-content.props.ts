import type { RichTextField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';
import type { ReferenceField } from '@/types/ReferenceField.props';

/** KnowledgeChunks item referenced from Knowledge Article.sharedContent Treelist. */
export type VariantContentChunkFields = {
  Content?: RichTextField;
};

export type VariantContentChunkReference = ReferenceField & {
  path?: string;
  fields?: VariantContentChunkFields;
  /** GraphQL ComponentQuery alias */
  content?: { jsonValue?: RichTextField };
};

/** GraphQL ComponentQuery shape (expands page sharedContent with path + Content). */
export type VariantContentGraphQLFields = {
  data?: {
    datasource?: {
      sharedContent?: {
        targetItems?: VariantContentChunkReference[];
      };
    };
  };
};

export type VariantContentFields = VariantContentGraphQLFields & {
  /** Layout Service Treelist on the Knowledge Article page */
  sharedContent?: VariantContentChunkReference[];
  SharedContent?: VariantContentChunkReference[];
};

export type VariantContentProps = ComponentProps & {
  fields?: VariantContentFields;
  isPageEditing?: boolean;
};
