'use client';

import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { Button } from '@/components/ui/Button';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';

export default function KioskError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dictionary } = useKioskI18n();

  return (
    <div className="space-y-6">
      <ContentUnavailable />
      <div className="text-center">
        <Button onClick={reset}>{dictionary.tryAgain}</Button>
      </div>
    </div>
  );
}
