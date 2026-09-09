import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center">
      <h1 className="text-3xl font-bold text-lcmc-navy">We could not find that screen</h1>
      <p className="mt-4 text-xl">Please ask a staff member for assistance, or return home and try again.</p>
      <Link href="/" className="kiosk-tap mt-8 bg-lcmc-teal text-white">
        Home
      </Link>
    </section>
  );
}
