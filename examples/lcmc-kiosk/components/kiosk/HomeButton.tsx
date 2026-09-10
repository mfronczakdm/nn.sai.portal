'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useKioskI18n } from './LocaleProvider';

export function HomeButton({ light = true }: { light?: boolean }) {
  const { dictionary } = useKioskI18n();

  return (
    <Link
      href="/"
      className={cn(
        'kiosk-tap min-w-[10rem] border-2',
        light
          ? 'border-white/80 bg-transparent text-white hover:bg-white/10'
          : 'border-lcmc-navy bg-white text-lcmc-navy hover:bg-lcmc-cream'
      )}
    >
      {dictionary.home}
    </Link>
  );
}
