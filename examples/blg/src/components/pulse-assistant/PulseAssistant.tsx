'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, Loader2, MessageCircle, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DEMO_TAXONOMY_CHANGE_EVENT,
  getPersonaStateCode,
  readStoredDemoTaxonomy,
  type DemoUserTaxonomy,
} from '@/lib/demo-taxonomy';
import { PULSE_DEMO_STARTER_PROMPTS } from '@/lib/pulse-demo-playbook';
import { cn } from '@/lib/utils';
import type { PulseAskResponse, PulseSource, PulseStateCode } from '@/lib/pulse-types';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  sources?: PulseSource[];
  stateCallout?: string | null;
};

const STARTER_PROMPTS = [...PULSE_DEMO_STARTER_PROMPTS];

const TYPE_BADGE: Record<PulseSource['type'], string> = {
  'knowledge-article': 'Insight',
  'people-and-teams': 'Lawyer',
  product: 'Capability',
  'shared-content': 'Related',
  other: 'Content',
};

function sourceBadge(source: PulseSource): string {
  const hay = `${source.title} ${source.url}`.toLowerCase();
  if (/webinar/.test(hay)) return 'Webinar';
  if (/podcast/.test(hay)) return 'Podcast';
  if (/\bcle\b/.test(hay)) return 'CLE';
  if (/checklist|white.?paper/.test(hay)) return 'Guide';
  if (/alert/.test(hay)) return 'Alert';
  return TYPE_BADGE[source.type];
}

const STATE_LABEL: Record<PulseStateCode, string> = {
  FL: 'Florida',
  NC: 'North Carolina',
};

function renderAnswerText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function SourceCards({ sources }: { sources: PulseSource[] }) {
  if (!sources.length) return null;
  return (
    <ul className="mt-3 space-y-2">
      {sources.map((source) => (
        <li key={source.id}>
          <Link
            href={source.url || '/search'}
            className="block rounded-xl border border-border bg-background/80 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-foreground leading-snug">{source.title}</span>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {sourceBadge(source)}
              </span>
            </div>
            {source.excerpt ? (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{source.excerpt}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export type PulseAssistantProps = {
  /** When true, the widget is not rendered (Experience Editor / Design Library). */
  hidden?: boolean;
};

export function PulseAssistant({ hidden = false }: PulseAssistantProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [persona, setPersona] = useState<DemoUserTaxonomy | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestTurnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setPersona(readStoredDemoTaxonomy());
    sync();
    window.addEventListener(DEMO_TAXONOMY_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(DEMO_TAXONOMY_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  /**
   * Keep the start of the latest turn visible at the top of the panel so long
   * answers are read top-down (scroll down), instead of jumping to the bottom.
   */
  useEffect(() => {
    if (!open) return;
    const container = listRef.current;
    if (!container) return;

    const frame = window.requestAnimationFrame(() => {
      const target = latestTurnRef.current;
      if (!target) {
        container.scrollTop = 0;
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - 4;
      container.scrollTop = Math.max(0, nextTop);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, messages, busy]);

  if (hidden) return null;

  const stateCode = persona ? (getPersonaStateCode(persona) as PulseStateCode) : null;

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/pulse/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, stateCode }),
      });

      if (!res.ok) {
        throw new Error(`Pulse request failed (${res.status})`);
      }

      const data = (await res.json()) as PulseAskResponse;
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.answer,
        sources: data.sources,
        stateCallout: data.stateCallout,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: 'assistant',
          text: 'Pulse hit a snag reaching the content index. Try again in a moment, or use site search.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-label="Pulse AI assistant"
          aria-modal="false"
          className="pointer-events-auto flex w-[min(100vw-1.5rem,24rem)] max-h-[min(70vh,36rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <header className="flex items-start justify-between gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight">Pulse</h2>
              </div>
              <p className="mt-0.5 text-xs text-primary-foreground/80">
                Find the right lawyer from indexed site content
              </p>
              {stateCode ? (
                <span className="mt-2 inline-flex rounded-md bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-medium">
                  Context: {STATE_LABEL[stateCode]}
                </span>
              ) : (
                <span className="mt-2 inline-flex rounded-md bg-primary-foreground/10 px-2 py-0.5 text-[11px] font-medium text-primary-foreground/75">
                  Visitor view
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Close Pulse"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ask in plain language — practice, geography, and situation at once. Pulse is
                  strongest when keyword search would force you to guess the right terms.
                </p>
                <div className="flex flex-col gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void ask(prompt)}
                      className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-muted/60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((msg, index) => {
              const isLatestAssistant =
                msg.role === 'assistant' &&
                messages.slice(index + 1).every((m) => m.role !== 'assistant');
              const isLatestUserWhileBusy =
                busy && msg.role === 'user' && index === messages.length - 1;
              const anchorLatest = isLatestAssistant || isLatestUserWhileBusy;

              return (
                <div
                  key={msg.id}
                  ref={anchorLatest ? latestTurnRef : undefined}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-muted/40 text-foreground'
                    )}
                  >
                    {msg.role === 'assistant' && msg.stateCallout ? (
                      <p className="mb-2 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {msg.stateCallout}
                      </p>
                    ) : null}
                    <div className="whitespace-pre-wrap">
                      {msg.role === 'assistant' ? renderAnswerText(msg.text) : msg.text}
                    </div>
                    {msg.role === 'assistant' && msg.sources?.length ? (
                      <SourceCards sources={msg.sources} />
                    ) : null}
                    {msg.role === 'assistant' && msg.sources && msg.sources.length === 0 ? (
                      <p className="mt-2 text-xs">
                        <Link
                          href="/search"
                          className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Open site search
                        </Link>
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {busy ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Searching indexed content…
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-2 py-1.5 focus-within:border-primary/50">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Pulse…"
                disabled={busy}
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Ask Pulse a question"
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !input.trim()}
                className="h-8 w-8 shrink-0 rounded-lg"
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          !open && 'animate-[pulse_2.4s_ease-in-out_1]'
        )}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? 'Close Ask Pulse' : 'Ask Pulse'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open ? (
          <span className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-md sm:block">
            Ask Pulse
          </span>
        ) : null}
      </button>
    </div>
  );
}

export default PulseAssistant;
