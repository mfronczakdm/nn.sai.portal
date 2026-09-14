'use client';

import { useKioskI18n } from '@/components/kiosk/LocaleProvider';

type ContentUnavailableProps = {
  title?: string;
  message?: string;
};

export function ContentUnavailable({ title, message }: ContentUnavailableProps) {
  const { dictionary } = useKioskI18n();

  return (
    <section
      role="alert"
      className="mx-auto max-w-3xl rounded-3xl border-4 border-lcmc-navy bg-white p-10 text-center"
    >
      <h1 className="text-3xl font-bold text-lcmc-navy">{title ?? dictionary.contentUnavailableTitle}</h1>
      <p className="mt-4 text-xl text-lcmc-ink">{message ?? dictionary.contentUnavailableMessage}</p>
    </section>
  );
}
