'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

type OnScreenKeyboardProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function OnScreenKeyboard({ value, onChange, className }: OnScreenKeyboardProps) {
  const [shift, setShift] = useState(false);

  const rows = useMemo(
    () =>
      ROWS.map((row) =>
        row.map((key) => (shift || /[0-9]/.test(key) ? key : key.toLowerCase()))
      ),
    [shift]
  );

  return (
    <div className={cn('rounded-3xl bg-lcmc-navy-dark p-4', className)} aria-label="On-screen keyboard">
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.join('')} className="flex justify-center gap-2">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className="kiosk-tap min-w-[3.75rem] bg-white text-2xl text-lcmc-navy"
                onClick={() => onChange(value + key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center gap-2">
          <Button variant="secondary" onClick={() => setShift((current) => !current)}>
            {shift ? 'abc' : 'ABC'}
          </Button>
          <Button variant="secondary" className="min-w-[12rem]" onClick={() => onChange(`${value} `)}>
            Space
          </Button>
          <Button
            variant="secondary"
            onClick={() => onChange(value.slice(0, -1))}
            aria-label="Backspace"
          >
            ⌫
          </Button>
          <Button variant="danger" onClick={() => onChange('')}>
            Clear
          </Button>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-white/80">
        Hardware kiosk keyboards, if attached, also type into the search field.
      </p>
    </div>
  );
}
