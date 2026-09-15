import sitecoreImageLoader, { shouldBypassOptimizer } from '@/lib/sitecore-image-loader';

describe('sitecore-image-loader', () => {
  it('bypasses the optimizer for Quanex, ERA, and AmesburyTruth product CDNs', () => {
    expect(shouldBypassOptimizer('https://www.quanex.com/wp-content/uploads/x.jpg')).toBe(true);
    expect(
      shouldBypassOptimizer(
        'https://www.eraeverywhere.com/globalassets/era/product-1500max/11099.jpg'
      )
    ).toBe(true);
    expect(
      shouldBypassOptimizer(
        'https://www.amesburytruth.com/images/products/Maxim%20HP%20Casement%20Hinge_clear%20bkgr,%20no%20shadow1.png'
      )
    ).toBe(true);
  });

  it('bypasses the optimizer for Azure blob media used by external Image fields', () => {
    const src =
      'https://amkormarcomexternal.blob.core.windows.net/amkordotcom/wp-content/uploads/2026/05/ATA-Facility-Best-Deal-Blog-Content-Tile.png';
    expect(shouldBypassOptimizer(src)).toBe(true);
    expect(sitecoreImageLoader({ src, width: 640 })).toBe(src);
  });

  it('bypasses the optimizer for every external host present in amkor content', () => {
    const amkorContentHosts = [
      'https://images.unsplash.com/photo-1760842543713-108c3cadbba1?w=1200&q=80',
      'https://amkormarcomexternal.blob.core.windows.net/amkordotcom/wp-content/uploads/2026/06/SEE-Bootcamp-2-1.png',
      'https://mrfbasech2.sitecoresandbox.cloud/api/public/content/abc123',
    ];

    amkorContentHosts.forEach((src) => {
      expect(shouldBypassOptimizer(src)).toBe(true);
      expect(sitecoreImageLoader({ src, width: 1200 })).toBe(src);
    });
  });

  it('returns the original URL for ERA media instead of /_next/image', () => {
    const src = 'https://www.eraeverywhere.com/globalassets/era/product-1500max/11099.jpg';
    expect(sitecoreImageLoader({ src, width: 320 })).toBe(src);
  });

  it('uses the Next optimizer for other https hosts', () => {
    const src = 'https://edge.example.com/media/foo.jpg';
    expect(shouldBypassOptimizer(src)).toBe(false);
    expect(sitecoreImageLoader({ src, width: 640, quality: 80 })).toBe(
      '/_next/image?url=https%3A%2F%2Fedge.example.com%2Fmedia%2Ffoo.jpg&w=640&q=80'
    );
  });
});
