import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import {
  generateSites,
  generateMetadata,
  extractFiles,
  writeImportMap,
} from '@sitecore-content-sdk/nextjs/tools';
import scConfig from './sitecore.config';

export default defineCliConfig({
  config: scConfig,
  build: {
    commands: [
      generateMetadata(),
      generateSites(),
      extractFiles(),
      writeImportMap({
        paths: ['src/components'],
      }),
    ],
  },
  componentMap: {
    paths: ['src/components'],
    // Exclude content-sdk auxillary components
    exclude: [
      'src/components/content-sdk/*',
      'src/components/ui/*',
      'src/components/lib/*',
      'src/components/video/*',
      'src/components/multi-promo/*',
      'src/components/image-carousel/*',
      'src/components/accordion-block/*',
      'src/components/image/ImageWrapper.dev.old.tsx',
      // Helpers / non-renderings (avoid component-map name collisions & invalid entries)
      'src/components/search-experience/search-components/**',
      'src/components/site-three/non-sitecore/**',
      'src/components/search-results/SearchResults copy.tsx',
      // Legacy GraphQL blog grid — name collides with UIIM Insights BlogListing
      'src/components/BlogListing/**',
      // BlogListing helper modules (not Sitecore renderings)
      'src/components/uiim/insights/blog-listing.taxonomy.ts',
      'src/components/uiim/insights/blog-listing.props.ts',
      // BioListing / BioDetail helpers
      'src/components/uiim/lawyers/bio-headshots.ts',
      'src/components/uiim/lawyers/bio-listing.props.ts',
      'src/components/uiim/lawyers/bio-detail.props.ts',
    ],
  },
});
