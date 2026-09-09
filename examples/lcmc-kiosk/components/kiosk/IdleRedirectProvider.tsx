'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useIdleRedirect } from './useIdleRedirect';

type IdleRedirectProviderProps = {
  children: ReactNode;
};

export function IdleRedirectProvider({ children }: IdleRedirectProviderProps) {
  const pathname = usePathname();
  useIdleRedirect({ enabled: pathname !== '/' });
  return children;
}
