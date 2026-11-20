'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/** Version4 labels that should open an existing Mega Menu Item on hover. */
export const version4MegaMenuAliases: Record<string, string> = {
  'Patient Care': 'For Patients',
  'About MCW': 'About Us',
};

export function normalizeMegaMenuTitle(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

type Version4MegaMenuContextValue = {
  activeTitle: string | null;
  setActiveTitle: (title: string | null) => void;
};

const Version4MegaMenuContext = createContext<Version4MegaMenuContextValue | null>(null);

export function Version4MegaMenuProvider({ children }: { children: ReactNode }) {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const value = useMemo(() => ({ activeTitle, setActiveTitle }), [activeTitle]);

  return (
    <Version4MegaMenuContext.Provider value={value}>{children}</Version4MegaMenuContext.Provider>
  );
}

export function useVersion4MegaMenu(): Version4MegaMenuContextValue | null {
  return useContext(Version4MegaMenuContext);
}
