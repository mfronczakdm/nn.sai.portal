'use client';

/**
 * Next.js image loader.
 * Content Hub sandbox hosts often fail through Vercel's `/_next/image` optimizer
 * (upstream blocks, auth, or public-content quirks). Serve those URLs directly.
 * Everything else uses the built-in optimizer.
 */
export default function sitecoreImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (shouldBypassOptimizer(src)) {
    return src;
  }

  const params = new URLSearchParams();
  params.set('url', src);
  params.set('w', String(width));
  params.set('q', String(quality ?? 75));
  return `/_next/image?${params.toString()}`;
}

function shouldBypassOptimizer(src: string): boolean {
  try {
    const hostname = new URL(src, 'https://localhost').hostname.toLowerCase();
    return (
      hostname === 'www.cooley.com' ||
      hostname === 'cooley.com' ||
      hostname.endsWith('.sitecoresandbox.cloud') ||
      hostname.endsWith('.sitecorecontenthub.cloud') ||
      hostname.includes('stylelabs.cloud') ||
      hostname === 'images.unsplash.com'
    );
  } catch {
    return false;
  }
}
