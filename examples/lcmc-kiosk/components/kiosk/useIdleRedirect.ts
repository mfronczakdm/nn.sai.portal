'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IDLE_TIMEOUT_MS } from '@/lib/kiosk/constants';

type UseIdleRedirectOptions = {
  timeoutMs?: number;
  enabled?: boolean;
};

export function useIdleRedirect({
  timeoutMs = IDLE_TIMEOUT_MS,
  enabled = true,
}: UseIdleRedirectOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    if (!enabled) return;
    timerRef.current = window.setTimeout(() => {
      router.push('/');
    }, timeoutMs);
  }, [clearTimer, enabled, router, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'keydown'];
    const onActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      clearTimer();
    };
  }, [clearTimer, enabled, pathname, resetTimer]);
}
