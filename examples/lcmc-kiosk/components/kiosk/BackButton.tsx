'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function BackButton({ light = true }: { light?: boolean }) {
  const router = useRouter();

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
      Back
    </Button>
  );
}
