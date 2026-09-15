import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createPasswordResetToken } from '@/lib/auth/reset-tokens';
import { findUserByEmail } from '@/lib/auth/users';

const requestSchema = z.object({
  email: z.string().email(),
  resetReturnPath: z.string().optional(),
});

function buildResetUrl(token: string, origin: string, resetReturnPath?: string): string {
  const path = resetReturnPath?.trim() || '/reset-password';
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(safePath, origin);
  url.searchParams.set('token', token);
  return url.toString();
}

function shouldExposeResetLink(): boolean {
  return (
    process.env.NODE_ENV !== 'production' || process.env.AUTH_EXPOSE_RESET_LINK === 'true'
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { email, resetReturnPath } = parsed.data;
  const user = await findUserByEmail(email);

  if (!user) {
    return NextResponse.json({
      ok: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  }

  const { token } = await createPasswordResetToken(user.id);
  const resetUrl = buildResetUrl(token, new URL(request.url).origin, resetReturnPath);

  if (shouldExposeResetLink()) {
    console.info('[auth] Password reset link (dev):', resetUrl);
    return NextResponse.json({
      ok: true,
      message: 'If an account exists, a reset link has been sent.',
      resetUrl,
    });
  }

  return NextResponse.json({
    ok: true,
    message: 'If an account exists, a reset link has been sent.',
  });
}
