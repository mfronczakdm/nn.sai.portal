'use client';

import type React from 'react';
import { Suspense, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ResetPasswordForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = useCallback(async () => {
    setError(null);
    setMessage(null);
    setDevResetUrl(null);

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          resetReturnPath:
            typeof routeParams.site === 'string' && typeof routeParams.locale === 'string'
              ? `/${routeParams.site}/${routeParams.locale}/reset-password`
              : '/reset-password',
        }),
      });
      const data = (await response.json()) as { message?: string; resetUrl?: string; error?: string };
      if (!response.ok) {
        setError(data.error ?? 'Request failed.');
        return;
      }
      setMessage(data.message ?? 'If an account exists, a reset link has been sent.');
      if (data.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch {
      setError('Unable to request a password reset.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, routeParams.locale, routeParams.site]);

  const handleConfirmReset = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setMessage(null);

      if (!token) {
        setError('Missing reset token.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch('/api/auth/password-reset/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? 'Reset failed.');
          return;
        }
        setMessage('Password updated. You can sign in with your new password.');
        setTimeout(() => router.push('/'), 1500);
      } catch {
        setError('Unable to reset password.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [confirmPassword, password, router, token],
  );

  return (
    <Card className="my-12 w-full max-w-md">
      <CardHeader>
        <CardTitle>{token ? 'Set a new password' : 'Reset your password'}</CardTitle>
        <CardDescription>
          {token
            ? 'Choose a new password for your portal account.'
            : 'Request a reset link for your portal account.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        {devResetUrl ? (
          <Alert>
            <AlertDescription>
              Dev reset link:{' '}
              <Link href={devResetUrl.replace(/^https?:\/\/[^/]+/, '')} className="underline">
                continue
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        {token ? (
          <form className="space-y-4" onSubmit={handleConfirmReset}>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Update password
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button type="button" className="w-full" disabled={isSubmitting} onClick={handleRequestReset}>
              Send reset link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <main className="container mx-auto flex min-h-[60vh] items-start justify-center px-4 py-8">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
