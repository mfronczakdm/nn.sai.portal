'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { KioskHeader } from './KioskHeader';

export function KioskShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-full flex-col bg-lcmc-cream">
      {!isHome ? <KioskHeader title="Lobby directory" showNav /> : null}
      <main className="flex-1 overflow-auto px-6 py-8">{children}</main>
      <footer className="bg-lcmc-navy px-6 py-3 text-center text-sm text-white/80">
        {isHome
          ? 'Welcome to LCMC Health. This screen stays here until you tap a button.'
          : 'This kiosk returns to the home screen after 90 seconds without a touch.'}
      </footer>
    </div>
  );
}
