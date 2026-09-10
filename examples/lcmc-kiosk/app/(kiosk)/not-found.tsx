import Link from 'next/link';
import { getRequestI18n } from '@/lib/i18n/get-locale';

export default function NotFound() {
  const { dictionary } = getRequestI18n();

  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center">
      <h1 className="text-3xl font-bold text-lcmc-navy">{dictionary.notFoundTitle}</h1>
      <p className="mt-4 text-xl">{dictionary.notFoundMessage}</p>
      <Link href="/" className="kiosk-tap mt-8 bg-lcmc-teal text-white">
        {dictionary.home}
      </Link>
    </section>
  );
}
