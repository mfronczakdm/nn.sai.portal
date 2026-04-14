import NextAuth from 'next-auth';
import type { NextAuthConfig, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const credentialsProvider = Credentials({
  id: 'credentials',
  name: 'Credentials',
  credentials: {
    username: { type: 'text' },
    password: { type: 'password' },
  },
  authorize: async (credentials): Promise<User | null> => {
    const username = typeof credentials?.username === 'string' ? credentials.username : '';
    const password = typeof credentials?.password === 'string' ? credentials.password : '';
    const expectedUser = process.env.AUTH_DEMO_USERNAME;
    const expectedPass = process.env.AUTH_DEMO_PASSWORD;

    if (!expectedUser || !expectedPass || !username || !password) {
      return null;
    }

    if (username === expectedUser && password === expectedPass) {
      return {
        id: username,
        name: username,
        email: `${username}@users.invalid`,
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
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
