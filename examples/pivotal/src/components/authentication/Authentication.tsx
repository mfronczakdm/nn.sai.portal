'use client';

import type React from 'react';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Image as ContentSdkImage, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { resolveLinkFieldHref } from '@/lib/auth/link-field';
import { resolvePostLogoutRedirect, resolvePortalPostLoginRedirect } from '@/lib/auth-redirect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { AuthenticationProps } from './authentication.props';

const DEFAULT_LOGIN_BUTTON_TEXT = 'Sign In';
const DEFAULT_LOGOUT_BUTTON_TEXT = 'Sign Out';

type FieldTextTag = 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

function FieldTextOrFallback({
  field,
  fallback,
  tag: Tag = 'span',
  className,
}: {
  field?: { value?: string };
  fallback: string;
  tag?: FieldTextTag;
  className?: string;
}): React.ReactElement {
  const value = field?.value?.trim();
  if (value) {
    return <Text field={field} tag={Tag} className={className} />;
  }
  return <Tag className={className}>{fallback}</Tag>;
}

function AuthenticationFallback(): React.ReactElement {
  return (
    <div className="flex w-full items-center justify-center px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Skeleton className="mx-auto h-12 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

const AuthenticationInner: React.FC<AuthenticationProps> = (props) => {
  const { fields, params } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetDevLink, setResetDevLink] = useState<string | null>(null);

  const postLoginLinkHref = resolveLinkFieldHref(fields?.postLoginRedirect);
  const resetPasswordPath =
    fields?.resetPasswordPath?.value?.trim() || '/reset-password';

  const resetReturnPath = useMemo(() => {
    const site = typeof routeParams.site === 'string' ? routeParams.site : '';
    const locale = typeof routeParams.locale === 'string' ? routeParams.locale : '';
    const suffix = resetPasswordPath.startsWith('/')
      ? resetPasswordPath
      : `/${resetPasswordPath}`;
    if (site && locale) {
      return `/${site}/${locale}${suffix}`;
    }
    return suffix;
  }, [routeParams.locale, routeParams.site, resetPasswordPath]);

  const postLoginTarget = useMemo(
    () => resolvePortalPostLoginRedirect(searchParams, params?.redirectUrl, postLoginLinkHref),
    [searchParams, params?.redirectUrl, postLoginLinkHref],
  );

  const postLogoutTarget = useMemo(
    () => resolvePostLogoutRedirect(searchParams, params?.postLogoutRedirect),
    [searchParams, params?.postLogoutRedirect],
  );

  const forgotPasswordHref = useMemo(() => {
    const base = resetReturnPath.split('?')[0] ?? resetPasswordPath;
    return base.startsWith('/') ? base : `/${base}`;
  }, [resetReturnPath, resetPasswordPath]);

  const handleCredentialsLogin = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoginError(false);
      setResetMessage(null);
      setResetDevLink(null);

      setIsSubmitting(true);
      try {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
          callbackUrl: postLoginTarget,
        });

        if (result?.error) {
          setLoginError(true);
          return;
        }

        router.push(postLoginTarget);
        router.refresh();
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, postLoginTarget, router],
  );

  const handleLogout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await signOut({ redirect: false });
      router.push(postLogoutTarget);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }, [postLogoutTarget, router]);

  const handleForgotPassword = useCallback(async () => {
    setResetMessage(null);
    setResetDevLink(null);

    if (!email.trim()) {
      setResetMessage('Enter your email above, then try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          resetReturnPath,
        }),
      });
      const data = (await response.json()) as { message?: string; resetUrl?: string };
      setResetMessage(data.message ?? 'If an account exists, a reset link has been sent.');
      if (data.resetUrl) {
        setResetDevLink(data.resetUrl);
      }
    } catch {
      setResetMessage('Unable to request a password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, resetReturnPath]);

  if (!fields?.title) {
    return <NoDataFallback componentName="Authentication" />;
  }

  const isAuthenticated = status === 'authenticated' && session?.user;
  const isSessionLoading = status === 'loading';
  const sessionCustomer = session?.user?.customerSlug;

  return (
    <section
      data-component="Authentication"
      className={cn(
        '@container/authentication flex w-full items-center justify-center px-4 py-8 sm:py-12',
        params?.styles,
      )}
      id={params?.RenderingIdentifier}
    >
      <Card className="w-full max-w-md border shadow-sm">
        <CardHeader className="space-y-4 text-center">
          {fields.logo && (
            <div className="mx-auto flex h-12 w-full max-w-[200px] shrink-0 items-center justify-center overflow-hidden">
              <ContentSdkImage
                field={fields.logo}
                className="max-h-12 w-auto max-w-full object-contain object-center"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold">
              <Text field={fields.title} tag="span" />
            </CardTitle>
            <CardDescription>
              <Text field={fields.subtitle} tag="span" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && fields.loginFailedMessage ? (
            <Alert variant="destructive">
              <AlertDescription>
                <Text field={fields.loginFailedMessage} tag="span" />
              </AlertDescription>
            </Alert>
          ) : null}

          {resetMessage ? (
            <Alert>
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          ) : null}

          {resetDevLink ? (
            <Alert>
              <AlertDescription>
                Dev reset link:{' '}
                <Link href={resetDevLink.replace(/^https?:\/\/[^/]+/, '')} className="underline">
                  open reset page
                </Link>
              </AlertDescription>
            </Alert>
          ) : null}

          {isSessionLoading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground text-sm break-all">{session.user?.email}</p>
              {sessionCustomer ? (
                <p className="text-muted-foreground text-xs">Tenant: {sessionCustomer}</p>
              ) : null}
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={handleLogout}>
                <FieldTextOrFallback
                  field={fields.logoutButtonText}
                  fallback={DEFAULT_LOGOUT_BUTTON_TEXT}
                />
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleCredentialsLogin}>
              <div className="space-y-2">
                <Label htmlFor="authentication-email">
                  <Text field={fields.userNameLabel} tag="span" />
                </Label>
                <Input
                  id="authentication-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  aria-invalid={loginError}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authentication-password">
                  <Text field={fields.passwordLabel} tag="span" />
                </Label>
                <Input
                  id="authentication-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  aria-invalid={loginError}
                />
              </div>
              <Button
                type="submit"
                className="w-full text-primary-foreground [&_*]:text-inherit"
                disabled={isSubmitting}
              >
                <FieldTextOrFallback
                  field={fields.loginButtonText}
                  fallback={DEFAULT_LOGIN_BUTTON_TEXT}
                />
              </Button>
              <div className="flex flex-col gap-2 text-center text-sm">
                <button
                  type="button"
                  className="text-primary hover:underline disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={handleForgotPassword}
                >
                  {fields.forgotPasswordLinkText?.value?.trim() || 'Forgot password?'}
                </button>
                <Link href={forgotPasswordHref} className="text-muted-foreground hover:underline">
                  {fields.forgotPasswordLabel?.value?.trim() || 'Reset password on dedicated page'}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export const Default: React.FC<AuthenticationProps> = (props) => (
  <Suspense fallback={<AuthenticationFallback />}>
    <AuthenticationInner {...props} />
  </Suspense>
);

