import { NextResponse } from 'next/server';

import { handlers } from '@/auth';
import { isAuthSecretConfigured } from '@/lib/auth/secret';

export const runtime = 'nodejs';

/**
 * Auth.js returns HTTP 500 `{ message: "There was a problem with the server configuration." }`
 * when AUTH_SECRET is missing. SessionProvider calls GET /api/auth/session on every page,
 * which floods the network tab and Vercel logs. Serve a safe empty session instead.
 * Login still requires AUTH_SECRET (and AUTH_URL) in Vercel env.
 */
function missingSecretResponse(request: Request): Response {
  const pathname = new URL(request.url).pathname;
  console.error(
    '[auth] AUTH_SECRET (or NEXTAUTH_SECRET) is not set. Add it in Vercel Project Settings → Environment Variables.'
  );

  if (pathname.endsWith('/session')) {
    return NextResponse.json(null);
  }
  if (pathname.endsWith('/providers')) {
    return NextResponse.json({});
  }
  if (pathname.endsWith('/csrf')) {
    return NextResponse.json({ csrfToken: '' });
  }

  return NextResponse.json({ error: 'Auth is not configured' }, { status: 503 });
}

export async function GET(request: Request): Promise<Response> {
  if (!isAuthSecretConfigured()) {
    return missingSecretResponse(request);
  }
  return handlers.GET(request);
}

export async function POST(request: Request): Promise<Response> {
  if (!isAuthSecretConfigured()) {
    return missingSecretResponse(request);
  }
  return handlers.POST(request);
}
