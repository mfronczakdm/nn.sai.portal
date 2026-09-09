import type { ReactNode } from 'react';
import { IdleRedirectProvider } from '@/components/kiosk/IdleRedirectProvider';
import { KioskShell } from '@/components/kiosk/KioskShell';

export default function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <IdleRedirectProvider>
      <KioskShell>{children}</KioskShell>
    </IdleRedirectProvider>
  );
}
