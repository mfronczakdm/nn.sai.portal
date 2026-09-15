import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

/**
 * Datasource fields for the Authentication portal login component.
 * UI copy/branding only — customer scoping comes from the authenticated user record.
 * `postLoginRedirect` is a General Link to a Sitecore page path after successful login.
 */
export type AuthenticationFields = {
  title: Field<string>;
  subtitle: Field<string>;
  logo?: ImageField;
  postLoginRedirect?: LinkField;
  loginButtonText: Field<string>;
  logoutButtonText: Field<string>;
  userNameLabel: Field<string>;
  passwordLabel: Field<string>;
  forgotPasswordLabel?: Field<string>;
  forgotPasswordLinkText?: Field<string>;
  loginFailedMessage?: Field<string>;
  /** Relative path for forgot-password flow, default `/reset-password`. */
  resetPasswordPath?: Field<string>;
};

export type AuthenticationProps = ComponentProps & {
  fields: AuthenticationFields;
  params: ComponentProps['params'] & {
    redirectUrl?: string;
    postLogoutRedirect?: string;
  };
};
