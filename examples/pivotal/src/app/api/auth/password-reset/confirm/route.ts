import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hashPassword } from '@/lib/auth/password';
import { consumePasswordResetToken } from '@/lib/auth/reset-tokens';
import { prisma } from '@/lib/auth/db';

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid token or password' }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const user = await consumePasswordResetToken(token);

  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
