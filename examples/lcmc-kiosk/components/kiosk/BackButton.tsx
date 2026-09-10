'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useKioskI18n } from './LocaleProvider';

export function BackButton({ light = true }: { light?: boolean }) {
  const router = useRouter();
  const { dictionary } = useKioskI18n();

  return (
    <Button
      variant={light ? 'ghost' : 'secondary'}
      className="min-w-[10rem]"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
          return;
        }
        router.push('/');
      }}
    >
      {dictionary.back}
    </Button>
  );
}
