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

/** Public product CDNs that block or fail the `/_next/image` optimizer (hotlink / fetch). */
function isDirectProductMediaHost(hostname: string): boolean {
  return (
    hostname === 'quanex.com' ||
    hostname.endsWith('.quanex.com') ||
    hostname === 'eraeverywhere.com' ||
    hostname.endsWith('.eraeverywhere.com') ||
    hostname === 'amesburytruth.com' ||
    hostname.endsWith('.amesburytruth.com') ||
    hostname === 'atlanta-apparel.com' ||
    hostname.endsWith('.atlanta-apparel.com')
  );
}

/** Azure blob media referenced by external Image fields on demo sites (amkor and similar). */
function isExternalDemoMediaHost(hostname: string): boolean {
  return hostname.endsWith('.blob.core.windows.net');
}

export function shouldBypassOptimizer(src: string): boolean {
  try {
    const hostname = new URL(src, 'https://localhost').hostname.toLowerCase();
    return (
      hostname.endsWith('.sitecoresandbox.cloud') ||
      hostname.endsWith('.sitecorecontenthub.cloud') ||
      hostname.includes('stylelabs.cloud') ||
      hostname === 'images.unsplash.com' ||
      isDirectProductMediaHost(hostname) ||
      isExternalDemoMediaHost(hostname)
    );
  } catch {
    return false;
  }
}
