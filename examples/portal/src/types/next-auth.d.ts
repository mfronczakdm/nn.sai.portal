import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      /** Demo / role label for GraphQL or APIs, e.g. `Maintenance Engineer` — maps to `$taxonomy` where used. */
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
