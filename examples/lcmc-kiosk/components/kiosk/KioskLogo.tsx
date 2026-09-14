import Image from 'next/image';
import { cn } from '@/lib/utils';

type KioskLogoProps = {
  className?: string;
  /** Pixel width of the image. Height follows the 513×280 source ratio. */
  width?: number;
  priority?: boolean;
};

export function KioskLogo({ className, width = 400, priority = false }: KioskLogoProps) {
  const height = Math.round((width * 280) / 513);

  return (
    <Image
      src="/branding/lcmc-health-logo.png"
      alt="LCMC Health"
      width={width}
      height={height}
      className={cn('h-auto w-auto', className)}
      priority={priority}
    />
  );
}
