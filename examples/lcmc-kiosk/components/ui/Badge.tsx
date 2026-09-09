import { cn } from '@/lib/utils';

type BadgeProps = {
  children: string;
  tone?: 'success' | 'neutral' | 'info';
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-10 items-center rounded-full px-4 text-base font-semibold',
        tone === 'success' && 'bg-lcmc-green text-white',
        tone === 'info' && 'bg-lcmc-teal text-white',
        tone === 'neutral' && 'bg-lcmc-cream text-lcmc-navy'
      )}
    >
      {children}
    </span>
  );
}
