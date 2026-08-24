'use client';

import { useToggleWithClickOutside } from '@/hooks/useToggleWithClickOutside';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileMenuWrapperProps {
  children: ReactNode;
  /** When true, the menu control stays visible on desktop (VersionN layouts). */
  alwaysVisible?: boolean;
  /** Optional visible label next to the hamburger (e.g. MENU). */
  label?: string;
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
}

export const MobileMenuWrapper = ({
  children,
  alwaysVisible = false,
  label,
  className,
  buttonClassName,
  panelClassName,
}: MobileMenuWrapperProps) => {
  const {
    isVisible: isMobileMenuVisible,
    setIsVisible: setIsMobileMenuVisible,
    ref,
  } = useToggleWithClickOutside<HTMLLIElement>(false);

  return (
    <li
      ref={ref}
      className={cn(
        'relative flex cursor-pointer items-center justify-center',
        alwaysVisible ? 'self-stretch' : 'lg:hidden p-4',
        className
      )}
    >
      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        className={cn(
          'relative flex items-center justify-center',
          alwaysVisible ? 'h-full gap-3 px-5 py-4' : 'h-4 w-5',
          buttonClassName
        )}
        onClick={() => setIsMobileMenuVisible(!isMobileMenuVisible)}
        aria-label={label ? `Toggle ${label.toLowerCase()}` : 'Toggle mobile menu'}
        aria-expanded={isMobileMenuVisible}
      >
        <span className="relative h-4 w-5 shrink-0">
          <span
            className={`absolute left-0 top-0 w-full h-0.5 bg-current origin-top-right transition-transform duration-300 ease-in-out ${
              isMobileMenuVisible ? '-rotate-47' : ''
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-current transition-all duration-300 ease-in-out ${
              isMobileMenuVisible ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`absolute left-0 bottom-0 w-full h-0.5 bg-current origin-bottom-right transition-transform duration-300 ease-in-out ${
              isMobileMenuVisible ? 'rotate-47' : ''
            }`}
          />
        </span>
        {label ? (
          <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] sm:inline">
            {label}
          </span>
        ) : null}
      </button>

      {/* Mobile Menu Content */}
      <div
        className={cn(
          isMobileMenuVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
          'fixed left-0 right-0 top-14 z-50 flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-auto bg-background p-4 text-foreground transition-all duration-300 ease-in-out',
          panelClassName
        )}
      >
        {children}
      </div>
    </li>
  );
};
