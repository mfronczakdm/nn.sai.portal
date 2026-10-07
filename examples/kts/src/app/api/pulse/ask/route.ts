import { NextResponse } from 'next/server';

import { composePulseAnswer } from '@/lib/pulse-answer';
import { getPulsePack } from '@/lib/pulse-packs';
import { retrievePulseSources } from '@/lib/pulse-retrieve';
import type { PulseAskRequest, PulseStateCode } from '@/lib/pulse-types';

export const dynamic = 'force-dynamic';

function parseStateCode(value: unknown): PulseStateCode | null {
  if (value === 'FL' || value === 'NC') return value;
  if (typeof value === 'string') {
    const upper = value.trim().toUpperCase();
    if (upper === 'FL' || upper === 'NC') return upper;
  }
  return null;
}

function parseSiteName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  let body: PulseAskRequest;
  try {
    body = (await request.json()) as PulseAskRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 });
  }
  if (question.length > 500) {
    return NextResponse.json({ error: 'question is too long' }, { status: 400 });
  }

  const siteName = parseSiteName(body.siteName);
  const pack = getPulsePack(siteName);
  const stateCode = pack.enableStatePersona ? parseStateCode(body.stateCode) : null;

  try {
    const sources = await retrievePulseSources(question, {
      siteName: pack.siteName,
      stateCode,
      language: 'en',
    });
    const payload = composePulseAnswer(question, sources, {
      stateCode,
      pack,
    });
    return NextResponse.json(payload);
  } catch (error) {
    console.error('[api/pulse/ask]', error);
    return NextResponse.json(
      { error: 'Pulse could not retrieve published content right now.' },
      { status: 500 }
    );
  }
}
