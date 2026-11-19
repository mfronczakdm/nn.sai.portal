import { cn } from '@/lib/utils';

type KioskLogoProps = {
  className?: string;
  /** Pixel width of the wordmark. Height follows the 520×140 source ratio. */
  width?: number;
  priority?: boolean;
};

export function KioskLogo({ className, width = 400 }: KioskLogoProps) {
  const height = Math.round((width * 140) / 520);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 520 140"
      width={width}
      height={height}
      className={cn('h-auto w-auto', className)}
      role="img"
      aria-labelledby="mcwLogoTitle"
    >
      <title id="mcwLogoTitle">Medical College of Wisconsin</title>
      <text
        x="0"
        y="72"
        fill="currentColor"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="72"
        fontWeight="700"
        letterSpacing="4"
      >
        MCW
      </text>
      <text
        x="0"
        y="118"
        fill="currentColor"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="600"
      >
        Medical College of Wisconsin
      </text>
    </svg>
  );
}
