'use client';

import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { useKioskI18n } from './LocaleProvider';

type KioskSearchProps = {
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  resultSummary: string;
  children: ReactNode;
};

export function KioskSearch({
  label,
  placeholder,
  query,
  onQueryChange,
  resultSummary,
  children,
}: KioskSearchProps) {
  const { dictionary } = useKioskI18n();
  const [keyboardOpen, setKeyboardOpen] = useState(true);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setKeyboardOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col gap-4">
      <form onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-lcmc-navy">{label}</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={() => setKeyboardOpen(true)}
            placeholder={placeholder}
            className="min-h-tap w-full rounded-2xl border-2 border-lcmc-navy px-5 text-2xl"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
          />
        </label>
      </form>

      <p className="text-lg font-semibold text-lcmc-navy" aria-live="polite">
        {resultSummary}
      </p>

      <div className="min-h-[12rem] flex-1 overflow-auto pb-4">{children}</div>

      <div className="sticky bottom-0 z-10 bg-lcmc-cream pb-2 pt-1">
        {keyboardOpen ? (
          <OnScreenKeyboard
            value={query}
            onChange={onQueryChange}
            onDone={() => setKeyboardOpen(false)}
          />
        ) : (
          <Button variant="secondary" onClick={() => setKeyboardOpen(true)}>
            {dictionary.showKeyboard}
          </Button>
        )}
      </div>
    </div>
  );
}
