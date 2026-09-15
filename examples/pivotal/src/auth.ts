import NextAuth from 'next-auth';
import type { NextAuthConfig, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { authenticatePortalUser } from '@/lib/auth/users';

const credentialsProvider = Credentials({
  id: 'credentials',
  name: 'Credentials',
  credentials: {
    email: { type: 'email' },
    username: { type: 'text' },
    password: { type: 'password' },
  },
  authorize: async (credentials): Promise<User | null> => {
    const emailInput =
      typeof credentials?.email === 'string'
        ? credentials.email
        : typeof credentials?.username === 'string'
          ? credentials.username
          : '';
    const password = typeof credentials?.password === 'string' ? credentials.password : '';

    if (emailInput && password) {
      const portalUser = await authenticatePortalUser({
        email: emailInput,
        password,
      });

      if (portalUser) {
        return {
          id: portalUser.id,
          name: portalUser.customerName,
          email: portalUser.email,
          customerSlug: portalUser.customerSlug,
        };
      }
    }

    const username = emailInput;
    const expectedUser = process.env.AUTH_DEMO_USERNAME;
    const expectedPass = process.env.AUTH_DEMO_PASSWORD;

    if (!expectedUser || !expectedPass || !username || !password) {
      return null;
    }

    if (username === expectedUser && password === expectedPass) {
      const taxonomy = process.env.AUTH_DEMO_TAXONOMY?.trim();
      return {
        id: username,
        name: username,
        email: `${username}@users.invalid`,
        ...(taxonomy ? { taxonomy } : {}),
      };
    }

    return null;
  },
});

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

const providers: NextAuthConfig['providers'] = googleProvider
  ? [credentialsProvider, googleProvider]
  : [credentialsProvider];

export const authConfig = {
  trustHost: true,
  providers,
  session: { strategy: 'jwt' as const },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (user && typeof user.taxonomy === 'string' && user.taxonomy) {
        token.taxonomy = user.taxonomy;
      }
      if (user && typeof user.customerSlug === 'string' && user.customerSlug) {
        token.customerSlug = user.customerSlug;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && typeof token.taxonomy === 'string' && token.taxonomy) {
        session.user.taxonomy = token.taxonomy;
      }
      if (session.user && typeof token.customerSlug === 'string' && token.customerSlug) {
        session.user.customerSlug = token.customerSlug;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
