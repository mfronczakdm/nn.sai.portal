import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

/**
 * Datasource fields for AuthPanel. All visible copy should come from Sitecore.
 *
 * In Sitecore, add an **AuthPanel** rendering to a placeholder (for example `headless-main`)
 * with a datasource that maps these fields. Optional rendering parameters: `redirectUrl`,
 * `postLogoutRedirect`. Query string overrides: `callbackUrl` / `redirect` (after login),
 * `post_logout_redirect` (after logout).
 */
export type AuthPanelFields = {
  title: Field<string>;
  subtitle: Field<string>;
  logo: ImageField;
  loginButtonText: Field<string>;
  logoutButtonText: Field<string>;
  usernameLabel: Field<string>;
  passwordLabel: Field<string>;
  /**
   * Optional copy when credentials fail. If omitted, only non-text cues (border + aria) indicate failure.
   */
  loginFailedMessage?: Field<string>;
};

export type AuthPanelProps = ComponentProps & {
  fields: AuthPanelFields;
  params: ComponentProps['params'] & {
    redirectUrl?: string;
    postLogoutRedirect?: string;
  };
};
