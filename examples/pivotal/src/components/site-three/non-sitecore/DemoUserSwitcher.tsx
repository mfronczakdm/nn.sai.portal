'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DEMO_TAXONOMY_CHANGE_EVENT,
  DEMO_USER_PERSONAS,
  clearStoredDemoTaxonomy,
  readStoredDemoTaxonomy,
  setStoredDemoTaxonomy,
  type DemoUserTaxonomy,
} from '@/lib/demo-taxonomy';
import {
  identifyDemoPersona,
  resetDemoPersonaAnalyticsSession,
} from '@/lib/demo-analytics-identity';
import { cn } from '@/lib/utils';

/**
 * Demo persona menu (DropdownMenu, not Select).
 *
 * Radix Select was a poor fit: logging out unmounted the Logout item and left
 * `value` undefined, so Select fell back to the first persona (FL). A menu with
 * explicit actions avoids that.
 */
export function DemoUserSwitcher() {
  const [taxonomy, setTaxonomy] = useState<DemoUserTaxonomy | null>(null);
  const isLoggedIn = Boolean(taxonomy);

  useEffect(() => {
    const syncTaxonomy = () => {
      setTaxonomy(readStoredDemoTaxonomy());
    };

    syncTaxonomy();
    window.addEventListener(DEMO_TAXONOMY_CHANGE_EVENT, syncTaxonomy);

    return () => {
      window.removeEventListener(DEMO_TAXONOMY_CHANGE_EVENT, syncTaxonomy);
    };
  }, []);

  const handleLogin = (persona: DemoUserTaxonomy) => {
    if (persona === taxonomy) return;
    setStoredDemoTaxonomy(persona);
    setTaxonomy(persona);
    void identifyDemoPersona(persona, { resetSession: true });
  };

  const handleLogout = () => {
    clearStoredDemoTaxonomy();
    setTaxonomy(null);
    void resetDemoPersonaAnalyticsSession();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-[min(100%,18.5rem)] justify-between gap-2 px-3 font-normal"
          aria-label={isLoggedIn ? 'Demo persona' : 'Login as demo persona'}
        >
          <span className="truncate text-left">
            {taxonomy ?? 'Login / Logout'}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[18.5rem]">
        {isLoggedIn && (
          <>
            <DropdownMenuItem className="text-primary font-medium" onSelect={handleLogout}>
              <LogOut className="size-4" aria-hidden />
              Logout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel className="text-muted-foreground font-normal">
          {isLoggedIn ? 'Switch persona' : 'Login as'}
        </DropdownMenuLabel>
        {DEMO_USER_PERSONAS.map((persona) => {
          const selected = taxonomy === persona;
          return (
            <DropdownMenuItem
              key={persona}
              className={cn(selected && 'bg-accent')}
              onSelect={() => handleLogin(persona)}
            >
              <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
                {selected ? <Check className="size-4" /> : null}
              </span>
              <span className="min-w-0 flex-1 whitespace-normal">{persona}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
