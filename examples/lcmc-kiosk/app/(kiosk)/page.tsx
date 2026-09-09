import Link from 'next/link';
import { KioskLogo } from '@/components/kiosk/KioskLogo';

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 py-6 text-center">
      <KioskLogo width={420} priority />
      <div>
        <h1 className="text-5xl font-bold text-lcmc-navy">How can we help you today?</h1>
        <p className="mt-4 text-2xl text-lcmc-ink">Tap a button to find a doctor or get directions.</p>
      </div>
      <div className="grid w-full gap-6 md:grid-cols-2">
        <Link
          href="/physicians"
          className="flex min-h-[12rem] items-center justify-center rounded-3xl bg-lcmc-teal px-8 text-4xl font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-lcmc-navy"
        >
          Find a Doctor
        </Link>
        <Link
          href="/departments"
          className="flex min-h-[12rem] items-center justify-center rounded-3xl bg-lcmc-navy px-8 text-4xl font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-lcmc-teal"
        >
          Find a Department / Wayfinding
        </Link>
      </div>
      <Link
        href="/wayfinding"
        className="kiosk-tap min-w-[16rem] border-2 border-lcmc-navy bg-white text-lcmc-navy"
      >
        How to get around
      </Link>
    </div>
  );
}
