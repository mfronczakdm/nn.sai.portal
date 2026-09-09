import { HomeButton } from './HomeButton';
import { BackButton } from './BackButton';
import { KioskLogo } from './KioskLogo';

type KioskChromeProps = {
  title: string;
  showNav?: boolean;
};

export function KioskHeader({ title, showNav = true }: KioskChromeProps) {
  return (
    <header className="flex items-center justify-between gap-4 bg-lcmc-navy px-6 py-4 text-white">
      <div className="flex items-center gap-4">
        <KioskLogo width={180} priority />
        <p className="hidden text-lg font-medium text-white/80 lg:block">{title}</p>
      </div>
      {showNav ? (
        <nav className="flex gap-3" aria-label="Kiosk">
          <BackButton />
          <HomeButton />
        </nav>
      ) : null}
    </header>
  );
}
