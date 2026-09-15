import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      /** Demo / role label for GraphQL or APIs, e.g. `Maintenance Engineer` — maps to `$taxonomy` where used. */
      taxonomy?: string;
      /** Multi-tenant portal customer slug, e.g. `chipotle` or `tacobell`. */
      customerSlug?: string;
    };
  }

  interface User {
    taxonomy?: string;
    customerSlug?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    taxonomy?: string;
    customerSlug?: string;
  }
}
