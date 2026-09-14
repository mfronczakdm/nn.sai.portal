/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CheckboxField = Field & {
  boolValue: Maybe<Scalars['Boolean']['output']>;
  value: Maybe<Scalars['String']['output']>;
};

export type Field = {
  value: Maybe<Scalars['String']['output']>;
};

export type ImageField = Field & {
  jsonValue: Maybe<ImageFieldJson>;
  value: Maybe<Scalars['String']['output']>;
};

export type ImageFieldJson = {
  alt: Maybe<Scalars['String']['output']>;
  src: Maybe<Scalars['String']['output']>;
};

export type Item = {
  children: Maybe<ItemConnection>;
  displayName: Maybe<Scalars['String']['output']>;
  field: Maybe<Field>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  path: Maybe<Scalars['String']['output']>;
  url: Maybe<ItemUrl>;
};


export type ItemChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type ItemFieldArgs = {
  name: Scalars['String']['input'];
};

export type ItemConnection = {
  pageInfo: Maybe<PageInfo>;
  results: Maybe<Array<Maybe<Item>>>;
};

export type ItemUrl = {
  path: Maybe<Scalars['String']['output']>;
};

export type MultilistField = Field & {
  targetItems: Maybe<Array<Maybe<Item>>>;
  value: Maybe<Scalars['String']['output']>;
};

export type PageInfo = {
  endCursor: Maybe<Scalars['String']['output']>;
  hasNext: Maybe<Scalars['Boolean']['output']>;
};

export type Query = {
  item: Maybe<Item>;
};


export type QueryItemArgs = {
  language?: InputMaybe<Scalars['String']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
};

export type RichTextField = Field & {
  value: Maybe<Scalars['String']['output']>;
};

export type TextField = Field & {
  value: Maybe<Scalars['String']['output']>;
};

export type GetDepartmentByPathQueryVariables = Exact<{
  path: string;
  language: string;
}>;


export type GetDepartmentByPathQuery = { item: { id: string | null, name: string | null, displayName: string | null, path: string | null, serviceTitle:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, serviceShortDescription:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, serviceDetail:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, offeredAtLocations:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null, targetItems: Array<{ id: string | null, name: string | null, displayName: string | null } | null> | null }
      | { value: string | null }
      | { value: string | null }
     | null } | null };

export type GetDepartmentsQueryVariables = Exact<{
  path: string;
  language: string;
  first: number;
}>;


export type GetDepartmentsQuery = { item: { id: string | null, name: string | null, displayName: string | null, path: string | null, children: { results: Array<{ id: string | null, name: string | null, displayName: string | null, path: string | null, serviceTitle:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, serviceShortDescription:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, serviceDetail:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, offeredAtLocations:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null, targetItems: Array<{ id: string | null, name: string | null, displayName: string | null } | null> | null }
          | { value: string | null }
          | { value: string | null }
         | null } | null> | null } | null } | null };

export type ItemIdentityFragment = { id: string | null, name: string | null, displayName: string | null, path: string | null };

type FieldValue_CheckboxField_Fragment = { value: string | null };

type FieldValue_ImageField_Fragment = { value: string | null };

type FieldValue_MultilistField_Fragment = { value: string | null };

type FieldValue_RichTextField_Fragment = { value: string | null };

type FieldValue_TextField_Fragment = { value: string | null };

export type FieldValueFragment =
  | FieldValue_CheckboxField_Fragment
  | FieldValue_ImageField_Fragment
  | FieldValue_MultilistField_Fragment
  | FieldValue_RichTextField_Fragment
  | FieldValue_TextField_Fragment
;

export type LocationTargetFragment = { id: string | null, name: string | null, displayName: string | null };

export type GetLocationsQueryVariables = Exact<{
  path: string;
  language: string;
  first: number;
}>;


export type GetLocationsQuery = { item: { id: string | null, name: string | null, displayName: string | null, path: string | null, children: { results: Array<{ id: string | null, name: string | null, displayName: string | null, path: string | null, locationTitle:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, locationShortName:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, locationDescription:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, streetAddress:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, city:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, state:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, postalCode:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, phoneNumber:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, hoursText:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, parkingInfo:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, visitorInfo:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, locationType:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, hasEmergencyDepartment:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, offeredServices:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null, targetItems: Array<{ id: string | null, name: string | null, displayName: string | null } | null> | null }
          | { value: string | null }
          | { value: string | null }
         | null, locationPhysicians:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null, targetItems: Array<{ id: string | null, name: string | null, displayName: string | null } | null> | null }
          | { value: string | null }
          | { value: string | null }
         | null } | null> | null } | null } | null };

export type GetPhysicianByPathQueryVariables = Exact<{
  path: string;
  language: string;
}>;


export type GetPhysicianByPathQuery = { item: { id: string | null, name: string | null, displayName: string | null, path: string | null, physicianFullName:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, credentials:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, specialty:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, physicianBio:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, physicianPhone:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
      | { value: string | null }
     | null, servingLocations:
      | { value: string | null }
      | { value: string | null }
      | { value: string | null, targetItems: Array<{ id: string | null, name: string | null, displayName: string | null } | null> | null }
      | { value: string | null }
      | { value: string | null }
     | null } | null };

export type GetPhysiciansQueryVariables = Exact<{
  path: string;
  language: string;
  first: number;
}>;


export type GetPhysiciansQuery = { item: { id: string | null, name: string | null, displayName: string | null, path: string | null, children: { results: Array<{ id: string | null, name: string | null, displayName: string | null, path: string | null, physicianFullName:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, credentials:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, specialty:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, physicianBio:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, physicianPhone:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
          | { value: string | null }
         | null, servingLocations:
          | { value: string | null }
          | { value: string | null }
          | { value: string | null, targetItems: Array<{ id: string | null, name: string | null, displayName: string | null } | null> | null }
          | { value: string | null }
          | { value: string | null }
         | null } | null> | null } | null } | null };
