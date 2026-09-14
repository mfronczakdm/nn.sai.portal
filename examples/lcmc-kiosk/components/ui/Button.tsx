import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary: 'bg-lcmc-teal text-white hover:bg-lcmc-teal-light',
  secondary: 'bg-white text-lcmc-navy border-2 border-lcmc-navy hover:bg-lcmc-cream',
  ghost: 'bg-transparent text-white border-2 border-white/80 hover:bg-white/10',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button type="button" className={cn('kiosk-tap', variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
