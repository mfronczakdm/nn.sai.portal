import { NoDataFallback } from '@/utils/NoDataFallback';
import { Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

/**
 * Model used for Sitecore Component integration
 * Note: This component is primarily for Sitecore editing experience.
 * Actual page metadata is set via generateMetadata() in page.tsx for proper SEO.
 */
type SiteMetadataProps = ComponentProps & SiteMetadataFields;

type SiteMetadataFields = {
  fields: {
    title?: Field<string>;
    metadataTitle?: Field<string>;
    metadataAuthor?: Field<string>;
    metadataKeywords?: Field<string>;
    metadataDescription?: Field<string>;
  };
};

export const Default: React.FC<SiteMetadataProps> = (props) => {
  const { fields } = props;
  
  if (!fields) {
    return <NoDataFallback componentName="Site Metadata" />;
  }

  return (
    <>
      {/*
       * SEO metadata (title, description, keywords, viewport) is managed by
       * generateMetadata() in page.tsx. Rendering them here would create
       * duplicate <title> / <meta> tags.
       *
       * This component now only renders supplementary <head> elements that
       * are NOT handled by generateMetadata().
       */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
    </>
  );
};
