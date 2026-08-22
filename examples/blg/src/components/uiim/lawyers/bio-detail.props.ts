import type {
  Field,
  ImageField,
  LinkField,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export type BioDetailFields = {
  FullName?: Field<string>;
  PreferredName?: Field<string>;
  JobTitle?: Field<string>;
  Office?: Field<string> | { value?: string; id?: string; displayName?: string; name?: string };
  Headshot?: ImageField;
  Summary?: Field<string>;
  YearsOfExperience?: Field<string | number>;
  PracticeAreas?: unknown;
  Industries?: unknown;
  BarAdmissions?: unknown;
  Languages?: unknown;
  Education?: unknown;
  Awards?: unknown;
  Publications?: unknown;
  SpeakingEngagements?: unknown;
  Biography?: RichTextField;
  RepresentativeMatters?: RichTextField;
  CommunityInvolvement?: RichTextField;
  Email?: Field<string>;
  Phone?: Field<string>;
  LinkedIn?: LinkField;
  SeoTitle?: Field<string>;
  SeoDescription?: Field<string>;
};

export type BioDetailProps = ComponentProps & {
  fields?: BioDetailFields;
  isPageEditing?: boolean;
};
