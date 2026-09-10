'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useKioskI18n } from './LocaleProvider';

const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

type OnScreenKeyboardProps = {
  value: string;
  onChange: (value: string) => void;
  onDone?: () => void;
  className?: string;
};

export function OnScreenKeyboard({ value, onChange, onDone, className }: OnScreenKeyboardProps) {
  const { dictionary } = useKioskI18n();
  const [shift, setShift] = useState(false);

  const rows = useMemo(
    () =>
      ROWS.map((row) =>
        row.map((key) => (shift || /[0-9]/.test(key) ? key : key.toLowerCase()))
      ),
    [shift]
  );

  return (
    <div className={cn('rounded-3xl bg-lcmc-navy-dark p-3', className)} aria-label={dictionary.keyboardAriaLabel}>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.join('')} className="flex justify-center gap-2">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className="kiosk-tap min-w-[3.5rem] bg-white text-2xl text-lcmc-navy"
                onClick={() => onChange(value + key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={() => setShift((current) => !current)}>
            {shift ? 'abc' : 'ABC'}
          </Button>
          <Button variant="secondary" className="min-w-[10rem]" onClick={() => onChange(`${value} `)}>
            {dictionary.keyboardSpace}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onChange(value.slice(0, -1))}
            aria-label="Backspace"
          >
            ⌫
          </Button>
          <Button variant="danger" onClick={() => onChange('')}>
            {dictionary.keyboardClear}
          </Button>
          {onDone ? (
            <Button variant="primary" onClick={onDone}>
              {dictionary.keyboardDone}
            </Button>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-center text-sm text-white/80">{dictionary.keyboardHint}</p>
    </div>
  );
}
