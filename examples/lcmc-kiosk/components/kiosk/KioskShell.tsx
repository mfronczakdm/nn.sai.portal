'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { KioskHeader } from './KioskHeader';
import { useKioskI18n } from './LocaleProvider';

export function KioskShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { dictionary } = useKioskI18n();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-full flex-col bg-lcmc-cream">
      <KioskHeader title={isHome ? '' : dictionary.lobbyDirectory} showNav={!isHome} />
      <main className="flex-1 overflow-auto px-6 py-8">{children}</main>
      <footer className="bg-lcmc-navy px-6 py-3 text-center text-sm text-white/80">
        {isHome ? dictionary.footerHome : dictionary.footerIdle}
      </footer>
    </div>
  );
}
