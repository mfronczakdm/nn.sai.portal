import { KIOSK_ASSISTANCE_MESSAGE } from '@/lib/kiosk/constants';

type ContentUnavailableProps = {
  title?: string;
  message?: string;
};

export function ContentUnavailable({
  title = 'Content is temporarily unavailable',
  message = KIOSK_ASSISTANCE_MESSAGE,
}: ContentUnavailableProps) {
  return (
    <section
      role="alert"
      className="mx-auto max-w-3xl rounded-3xl border-4 border-lcmc-navy bg-white p-10 text-center"
    >
      <h1 className="text-3xl font-bold text-lcmc-navy">{title}</h1>
      <p className="mt-4 text-xl text-lcmc-ink">{message}</p>
    </section>
  );
}
