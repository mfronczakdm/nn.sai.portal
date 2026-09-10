import { HomeButton } from './HomeButton';
import { BackButton } from './BackButton';
import { KioskLogo } from './KioskLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

type KioskChromeProps = {
  title: string;
  showNav?: boolean;
};

export function KioskHeader({ title, showNav = true }: KioskChromeProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 bg-lcmc-navy px-6 py-4 text-white">
      <div className="flex min-w-0 items-center gap-4">
        <KioskLogo width={180} priority />
        {title ? <p className="hidden truncate text-lg font-medium text-white/80 lg:block">{title}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <LanguageSwitcher />
        {showNav ? (
          <nav className="flex gap-3" aria-label="Kiosk">
            <BackButton />
            <HomeButton />
          </nav>
        ) : null}
      </div>
    </header>
  );
}
