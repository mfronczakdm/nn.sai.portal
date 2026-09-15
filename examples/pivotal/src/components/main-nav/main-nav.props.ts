import type { ComponentProps } from '@/lib/component-props';
import type { IGQLImageField, IGQLLinkField, IGQLTextField } from 'src/types/igql';

export type MainNavTreeNode = {
  id?: string;
  name?: string;
  url?: { path?: string };
  navigationTitle?: IGQLTextField;
  title?: IGQLTextField;
  pageTitle?: IGQLTextField;
  children?: { results?: MainNavTreeNode[] };
};

export type MainNavSupportLink = {
  id?: string;
  linkText?: IGQLTextField;
  linkUrl?: IGQLLinkField;
};

export type MainNavDatasource = {
  logo?: IGQLImageField;
  logoLink?: IGQLLinkField;
  searchPage?: IGQLLinkField;
  searchLabel?: IGQLTextField;
  userLink?: IGQLLinkField;
  userLabel?: IGQLTextField;
  showCart?: IGQLTextField;
  cartLink?: IGQLLinkField;
  cartLabel?: IGQLTextField;
  children?: { results?: MainNavSupportLink[] };
  navigationRoot?: {
    targetItem?: MainNavTreeNode;
  };
};

export type MainNavFields = {
  data?: {
    datasource?: MainNavDatasource;
  };
};

export type MainNavProps = ComponentProps & {
  fields?: MainNavFields;
  isPageEditing?: boolean;
};
