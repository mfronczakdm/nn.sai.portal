import type { ReactNode } from 'react';
import { IdleRedirectProvider } from '@/components/kiosk/IdleRedirectProvider';
import { KioskShell } from '@/components/kiosk/KioskShell';
import { LocaleProvider } from '@/components/kiosk/LocaleProvider';
import { getRequestI18n } from '@/lib/i18n/get-locale';

export default function KioskLayout({ children }: { children: ReactNode }) {
  const { locale } = getRequestI18n();

  return (
    <LocaleProvider locale={locale}>
      <IdleRedirectProvider>
        <KioskShell>{children}</KioskShell>
      </IdleRedirectProvider>
    </LocaleProvider>
  );
}
