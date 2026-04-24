import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      /** Plan / region label for GraphQL, e.g. `BCBS of California` — maps to `$taxonomy`. */
      taxonomy?: string;
    };
  }

  interface User {
    taxonomy?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    taxonomy?: string;
  }
}
