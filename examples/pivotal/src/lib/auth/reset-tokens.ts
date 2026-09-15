import { randomBytes } from 'crypto';

import { prisma } from '@/lib/auth/db';

const RESET_TOKEN_BYTES = 32;
const DEFAULT_RESET_TTL_MS = 60 * 60 * 1000;

export function generateResetTokenValue(): string {
  return randomBytes(RESET_TOKEN_BYTES).toString('hex');
}

export async function createPasswordResetToken(userId: string, ttlMs = DEFAULT_RESET_TTL_MS) {
  const token = generateResetTokenValue();
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function consumePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { include: { customer: true } } },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
    }
    return null;
  }

  await prisma.passwordResetToken.delete({ where: { id: record.id } });
  return record.user;
}
