import Link from 'next/link';
import { getRequestI18n } from '@/lib/i18n/get-locale';

export default function HomePage() {
  const { dictionary } = getRequestI18n();

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 py-6 text-center">
      <div>
        <h1 className="text-5xl font-bold text-lcmc-navy">{dictionary.homeTitle}</h1>
        <p className="mt-4 text-2xl text-lcmc-ink">{dictionary.homeSubtitle}</p>
      </div>
      <div className="grid w-full gap-6 md:grid-cols-2">
        <Link
          href="/physicians"
          className="flex min-h-[12rem] items-center justify-center rounded-3xl bg-lcmc-teal px-8 text-4xl font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-lcmc-navy"
        >
          {dictionary.findDoctor}
        </Link>
        <Link
          href="/departments"
          className="flex min-h-[12rem] items-center justify-center rounded-3xl bg-lcmc-navy px-8 text-4xl font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-lcmc-teal"
        >
          {dictionary.findDepartment}
        </Link>
      </div>
      <Link
        href="/wayfinding"
        className="kiosk-tap min-w-[16rem] border-2 border-lcmc-navy bg-white text-lcmc-navy"
      >
        {dictionary.howToGetAround}
      </Link>
    </div>
  );
}
