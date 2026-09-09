'use client';

import { ContentUnavailable } from '@/components/ui/ContentUnavailable';
import { Button } from '@/components/ui/Button';

export default function KioskError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <ContentUnavailable />
      <div className="text-center">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
