'use client';

import type React from 'react';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Image as ContentSdkImage, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { resolvePostLoginRedirect, resolvePostLogoutRedirect } from '@/lib/auth-redirect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuthPanelProps } from './auth-panel.props';

function AuthPanelFallback(): React.ReactElement {
  return (
    <Card className="my-8 w-full max-w-md">
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
  );
}

const AuthPanelInner: React.FC<AuthPanelProps> = (props) => {
  const { fields, params } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const postLoginTarget = useMemo(
    () => resolvePostLoginRedirect(searchParams, params?.redirectUrl),
    [searchParams, params?.redirectUrl],
  );

  const postLogoutTarget = useMemo(
    () => resolvePostLogoutRedirect(searchParams, params?.postLogoutRedirect),
    [searchParams, params?.postLogoutRedirect],
  );

  const handleCredentialsLogin = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoginError(false);
      setIsSubmitting(true);
      try {
        const result = await signIn('credentials', {
          redirect: false,
          username,
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
    [password, postLoginTarget, router, username],
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

  const isAuthenticated = status === 'authenticated' && session?.user;
  const isSessionLoading = status === 'loading';

  return (
    <section
      data-component="AuthPanel"
      className={cn('@container/auth-panel my-8 w-full max-w-md', params?.styles)}
    >
      <Card>
        <CardHeader className="space-y-4">
          {fields.logo && (
            <div className="relative mx-auto h-12 w-auto max-w-[200px]">
              <ContentSdkImage field={fields.logo} className="object-contain" />
            </div>
          )}
          <CardTitle className="text-center text-2xl font-semibold">
            <Text field={fields.title} tag="span" />
          </CardTitle>
          <CardDescription className="text-center">
            <Text field={fields.subtitle} tag="span" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && fields.loginFailedMessage ? (
            <Alert variant="destructive">
              <AlertDescription>
                <Text field={fields.loginFailedMessage} tag="span" />
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
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={handleLogout}>
                <Text field={fields.logoutButtonText} tag="span" />
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleCredentialsLogin}>
              <div className="space-y-2">
                <Label htmlFor="authpanel-username">
                  <Text field={fields.userNameLabel} tag="span" />
                </Label>
                <Input
                  id="authpanel-username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                  aria-invalid={loginError}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authpanel-password">
                  <Text field={fields.passwordLabel} tag="span" />
                </Label>
                <Input
                  id="authpanel-password"
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Text field={fields.loginButtonText} tag="span" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export const Default: React.FC<AuthPanelProps> = (props) => (
  <Suspense fallback={<AuthPanelFallback />}>
    <AuthPanelInner {...props} />
  </Suspense>
);
