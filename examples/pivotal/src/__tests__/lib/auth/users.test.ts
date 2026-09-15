jest.mock('@/lib/auth/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/password', () => ({
  verifyPassword: jest.fn(),
}));

import { prisma } from '@/lib/auth/db';
import { verifyPassword } from '@/lib/auth/password';
import { authenticateDemoPortalUser } from '@/lib/auth/demo-portal-users';
import { authenticatePortalUser, findUserByEmail } from '@/lib/auth/users';

const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockVerifyPassword = verifyPassword as jest.Mock;

describe('auth/demo-portal-users', () => {
  it('authenticates chipotle demo user with customerSlug', () => {
    expect(
      authenticateDemoPortalUser({
        email: 'chipotle@example.com',
        password: 'password123',
      }),
    ).toEqual({
      id: 'demo:chipotle',
      email: 'chipotle@example.com',
      customerSlug: 'chipotle',
      customerName: 'Chipotle',
    });
  });

  it('authenticates tacobell demo user (case-insensitive email)', () => {
    expect(
      authenticateDemoPortalUser({
        email: '  TacoBell@Example.com  ',
        password: 'password123',
      }),
    ).toMatchObject({
      customerSlug: 'tacobell',
      customerName: 'Taco Bell',
    });
  });

  it('returns null for wrong password', () => {
    expect(
      authenticateDemoPortalUser({
        email: 'chipotle@example.com',
        password: 'wrong',
      }),
    ).toBeNull();
  });
});

describe('auth/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('normalizes email before lookup', async () => {
      mockFindUnique.mockResolvedValue(null);

      await findUserByEmail('  User@Example.COM  ');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
        include: { customer: true },
      });
    });
  });

  describe('authenticatePortalUser', () => {
    it('returns null when email or password is missing', async () => {
      await expect(authenticatePortalUser({ email: '', password: 'x' })).resolves.toBeNull();
      await expect(authenticatePortalUser({ email: 'a@b.com', password: '' })).resolves.toBeNull();
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it('returns demo file user without hitting Prisma', async () => {
      const result = await authenticatePortalUser({
        email: 'chipotle@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        id: 'demo:chipotle',
        email: 'chipotle@example.com',
        customerSlug: 'chipotle',
        customerName: 'Chipotle',
      });
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it('returns null when user is not found in demo file or database', async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await authenticatePortalUser({
        email: 'missing@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
      expect(mockFindUnique).toHaveBeenCalled();
    });

    it('returns null when password is invalid for Prisma user', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'extra@example.com',
        passwordHash: 'hash',
        customer: { slug: 'extra', name: 'Extra' },
      });
      mockVerifyPassword.mockResolvedValue(false);

      const result = await authenticatePortalUser({
        email: 'extra@example.com',
        password: 'wrong',
      });

      expect(result).toBeNull();
    });

    it('falls back to Prisma when email is not in demo file', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'extra@example.com',
        passwordHash: 'hash',
        customer: { slug: 'extra', name: 'Extra' },
      });
      mockVerifyPassword.mockResolvedValue(true);

      const result = await authenticatePortalUser({
        email: 'extra@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        id: 'user-1',
        email: 'extra@example.com',
        customerSlug: 'extra',
        customerName: 'Extra',
      });
    });

    it('returns null when Prisma throws (e.g. no DB on Vercel)', async () => {
      mockFindUnique.mockRejectedValue(new Error('Unable to open the database file'));

      const result = await authenticatePortalUser({
        email: 'missing@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
    });
  });
});
