// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as zipcodemodaldev from 'src/components/zipcode-modal/zipcode-modal.dev';
import * as verticalimageaccordionprops from 'src/components/vertical-image-accordion/vertical-image-accordion.props';
import * as VerticalImageAccordion from 'src/components/vertical-image-accordion/VerticalImageAccordion';
import * as variantcontentprops from 'src/components/variant-content/variant-content.props';
import * as variantcontentfields from 'src/components/variant-content/variant-content.fields';
import * as VariantContent from 'src/components/variant-content/VariantContent';
import * as NewsListing from 'src/components/uiim/news/NewsListing';
import * as MediaCanvas from 'src/components/uiim/media/MediaCanvas';
import * as careerlistingprops from 'src/components/uiim/lawyers/career-listing.props';
import * as biorelatedcontent from 'src/components/uiim/lawyers/bio-related-content';
import * as CareerListing from 'src/components/uiim/lawyers/CareerListing';
import * as BioListing from 'src/components/uiim/lawyers/BioListing';
import * as BioDetail from 'src/components/uiim/lawyers/BioDetail';
import * as BlogListing from 'src/components/uiim/insights/BlogListing';
import * as DocumentCards from 'src/components/uiim/cards/DocumentCards';
import * as topiclistingprops from 'src/components/topic-listing/topic-listing.props';
import * as TopicListing from 'src/components/topic-listing/TopicListing';
import * as TopicItemdev from 'src/components/topic-listing/TopicItem.dev';
import * as themeproviderdev from 'src/components/theme-provider/theme-provider.dev';
import * as textbannerprops from 'src/components/text-banner/text-banner.props';
import * as TextBannerTextTopdev from 'src/components/text-banner/TextBannerTextTop.dev';
import * as TextBannerDefaultdev from 'src/components/text-banner/TextBannerDefault.dev';
import * as TextBannerBlueTitleRightdev from 'src/components/text-banner/TextBannerBlueTitleRight.dev';
import * as TextBanner02dev from 'src/components/text-banner/TextBanner02.dev';
import * as TextBanner01dev from 'src/components/text-banner/TextBanner01.dev';
import * as TextBanner from 'src/components/text-banner/TextBanner';
import * as testimonialcarouselprops from 'src/components/testimonial-carousel/testimonial-carousel.props';
import * as TestimonialCarouselItem from 'src/components/testimonial-carousel/TestimonialCarouselItem';
import * as TestimonialCarousel from 'src/components/testimonial-carousel/TestimonialCarousel';
import * as TopicIconChip from 'src/components/taxonomy/TopicIconChip';
import * as Title from 'src/components/sxa/Title';
import * as RowSplitter from 'src/components/sxa/RowSplitter';
import * as RichText from 'src/components/sxa/RichText';
import * as Promo from 'src/components/sxa/Promo';
import * as PartialDesignDynamicPlaceholder from 'src/components/sxa/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/sxa/PageContent';
import * as NavigationMenuToggleclient from 'src/components/sxa/NavigationMenuToggle.client';
import * as NavigationListclient from 'src/components/sxa/NavigationList.client';
import * as Navigation from 'src/components/sxa/Navigation';
import * as LinkList from 'src/components/sxa/LinkList';
import * as Image from 'src/components/sxa/Image';
import * as ContentBlock from 'src/components/sxa/ContentBlock';
import * as Container from 'src/components/sxa/Container';
import * as ColumnSplitter from 'src/components/sxa/ColumnSplitter';
import * as ButtonNavigationclient from 'src/components/sxa/ButtonNavigation.client';
import * as subscriptionbannerprops from 'src/components/subscription-banner/subscription-banner.props';
import * as SubscriptionBanner from 'src/components/subscription-banner/SubscriptionBanner';
import * as submissionformprops from 'src/components/submission-form/submission-form.props';
import * as SubmissionFormDefaultdev from 'src/components/submission-form/SubmissionFormDefault.dev';
import * as SubmissionFormCentereddev from 'src/components/submission-form/SubmissionFormCentered.dev';
import * as SubmissionForm from 'src/components/submission-form/SubmissionForm';
import * as StructuredData from 'src/components/structured-data/StructuredData';
import * as slidecarouselprops from 'src/components/slide-carousel/slide-carousel.props';
import * as SlideCarouseldev from 'src/components/slide-carousel/SlideCarousel.dev';
import * as Video from 'src/components/site-three/Video';
import * as TextSlider from 'src/components/site-three/TextSlider';
import * as SignupBanner from 'src/components/site-three/SignupBanner';
import * as ProductPageHeader from 'src/components/site-three/ProductPageHeader';
import * as ProductComparison from 'src/components/site-three/ProductComparison';
import * as PageHeaderST from 'src/components/site-three/PageHeaderST';
import * as MultiPromo from 'src/components/site-three/MultiPromo';
import * as MobileMenuWrapper from 'src/components/site-three/MobileMenuWrapper';
import * as MegaMenuItemWrapper from 'src/components/site-three/MegaMenuItemWrapper';
import * as MegaMenuItem from 'src/components/site-three/MegaMenuItem';
import * as ImageCarousel from 'src/components/site-three/ImageCarousel';
import * as ImageBanner from 'src/components/site-three/ImageBanner';
import * as HeroST from 'src/components/site-three/HeroST';
import * as HeaderSTHamburger from 'src/components/site-three/HeaderSTHamburger';
import * as HeaderST from 'src/components/site-three/HeaderST';
import * as FooterST from 'src/components/site-three/FooterST';
import * as FeatureBanner from 'src/components/site-three/FeatureBanner';
import * as AccordionBlock from 'src/components/site-three/AccordionBlock';
import * as sitemetadataprops from 'src/components/site-metadata/site-metadata.props';
import * as SiteMetadata from 'src/components/site-metadata/SiteMetadata';
import * as secondarynavigationprops from 'src/components/secondary-navigation/secondary-navigation.props';
import * as SecondaryNavigation from 'src/components/secondary-navigation/SecondaryNavigation';
import * as data from 'src/components/search-results/data';
import * as SearchResults from 'src/components/search-results/SearchResults';
import * as SearchExperienceLoadMore from 'src/components/search-experience/SearchExperience.LoadMore';
import * as SearchExperience from 'src/components/search-experience/SearchExperience';
import * as SitecoreSearchResults from 'src/components/search/SitecoreSearchResults';
import * as richtextblockprops from 'src/components/rich-text-block/rich-text-block.props';
import * as RichTextBlock from 'src/components/rich-text-block/RichTextBlock';
import * as PulseAssistant from 'src/components/pulse-assistant/PulseAssistant';
import * as promoimageprops from 'src/components/promo-image/promo-image.props';
import * as PromoImageTitlePartialOverlaydev from 'src/components/promo-image/PromoImageTitlePartialOverlay.dev';
import * as PromoImageRightdev from 'src/components/promo-image/PromoImageRight.dev';
import * as PromoImageMiddledev from 'src/components/promo-image/PromoImageMiddle.dev';
import * as PromoImageLeftdev from 'src/components/promo-image/PromoImageLeft.dev';
import * as PromoImageDefaultdev from 'src/components/promo-image/PromoImageDefault.dev';
import * as PromoImage from 'src/components/promo-image/PromoImage';
import * as promoblockprops from 'src/components/promo-block/promo-block.props';
import * as PromoBlock from 'src/components/promo-block/PromoBlock';
import * as promoanimatedutil from 'src/components/promo-animated/promo-animated.util';
import * as promoanimatedprops from 'src/components/promo-animated/promo-animated.props';
import * as PromoAnimatedImageRightdev from 'src/components/promo-animated/PromoAnimatedImageRight.dev';
import * as PromoAnimatedDefaultdev from 'src/components/promo-animated/PromoAnimatedDefault.dev';
import * as PromoAnimated from 'src/components/promo-animated/PromoAnimated';
import * as productlistingprops from 'src/components/product-listing/product-listing.props';
import * as productlistingdictionary from 'src/components/product-listing/product-listing.dictionary';
import * as ProductListingThreeUpdev from 'src/components/product-listing/ProductListingThreeUp.dev';
import * as ProductListingSliderdev from 'src/components/product-listing/ProductListingSlider.dev';
import * as ProductListingDefaultdev from 'src/components/product-listing/ProductListingDefault.dev';
import * as ProductListingCarddev from 'src/components/product-listing/ProductListingCard.dev';
import * as ProductListing from 'src/components/product-listing/ProductListing';
import * as portalpagedetailprops from 'src/components/portal-page-detail/portal-page-detail.props';
import * as PortalPageDetail from 'src/components/portal-page-detail/PortalPageDetail';
import * as portalhubprops from 'src/components/portal-hub/portal-hub.props';
import * as PortalHubViewclient from 'src/components/portal-hub/PortalHubView.client';
import * as PortalHub from 'src/components/portal-hub/PortalHub';
import * as portaldev from 'src/components/portal/portal.dev';
import * as pageheaderprops from 'src/components/page-header/page-header.props';
import * as PageHeaderFiftyFiftydev from 'src/components/page-header/PageHeaderFiftyFifty.dev';
import * as PageHeaderDefaultdev from 'src/components/page-header/PageHeaderDefault.dev';
import * as PageHeaderCentereddev from 'src/components/page-header/PageHeaderCentered.dev';
import * as PageHeaderBlueTextdev from 'src/components/page-header/PageHeaderBlueText.dev';
import * as PageHeaderBlueBackgrounddev from 'src/components/page-header/PageHeaderBlueBackground.dev';
import * as PageHeader from 'src/components/page-header/PageHeader';
import * as multipromotabsprops from 'src/components/multi-promo-tabs/multi-promo-tabs.props';
import * as MultiPromoTabs from 'src/components/multi-promo-tabs/MultiPromoTabs';
import * as MultiPromoTabdev from 'src/components/multi-promo-tabs/MultiPromoTab.dev';
import * as modetoggledev from 'src/components/mode-toggle/mode-toggle.dev';
import * as mediasectionprops from 'src/components/media-section/media-section.props';
import * as MediaSectiondev from 'src/components/media-section/MediaSection.dev';
import * as meteors from 'src/components/magicui/meteors';
import * as logotabsprops from 'src/components/logo-tabs/logo-tabs.props';
import * as LogoTabs from 'src/components/logo-tabs/LogoTabs';
import * as LogoItem from 'src/components/logo-tabs/LogoItem';
import * as logoprops from 'src/components/logo/logo.props';
import * as Logodev from 'src/components/logo/Logo.dev';
import * as utils from 'src/components/location-search/utils';
import * as locationsearchprops from 'src/components/location-search/location-search.props';
import * as locationsearchitemprops from 'src/components/location-search/location-search-item.props';
import * as googlemapsprops from 'src/components/location-search/google-maps.props';
import * as LocationSearchTitleZipCentereddev from 'src/components/location-search/LocationSearchTitleZipCentered.dev';
import * as LocationSearchMapTopAllCentereddev from 'src/components/location-search/LocationSearchMapTopAllCentered.dev';
import * as LocationSearchMapRightTitleZipCentereddev from 'src/components/location-search/LocationSearchMapRightTitleZipCentered.dev';
import * as LocationSearchMapRightdev from 'src/components/location-search/LocationSearchMapRight.dev';
import * as LocationSearchItemdev from 'src/components/location-search/LocationSearchItem.dev';
import * as LocationSearchDefaultdev from 'src/components/location-search/LocationSearchDefault.dev';
import * as LocationSearch from 'src/components/location-search/LocationSearch';
import * as GoogleMapdev from 'src/components/location-search/GoogleMap.dev';
import * as knowledgelistingprops from 'src/components/knowledge-listing/knowledge-listing.props';
import * as knowledgelistingfields from 'src/components/knowledge-listing/knowledge-listing.fields';
import * as KnowledgeListing from 'src/components/knowledge-listing/KnowledgeListing';
import * as knowledevariantprops from 'src/components/knowlede-variant/knowlede-variant.props';
import * as KnowledeVariant from 'src/components/knowlede-variant/KnowledeVariant';
import * as kmarticlecontentprops from 'src/components/km-article-content/km-article-content.props';
import * as kmarticlecontentfields from 'src/components/km-article-content/km-article-content.fields';
import * as KmArticleContent from 'src/components/km-article-content/KmArticleContent';
import * as imagegalleryprops from 'src/components/image-gallery/image-gallery.props';
import * as ImageGalleryNoSpacingdev from 'src/components/image-gallery/ImageGalleryNoSpacing.dev';
import * as ImageGalleryGriddev from 'src/components/image-gallery/ImageGalleryGrid.dev';
import * as ImageGalleryFiftyFiftydev from 'src/components/image-gallery/ImageGalleryFiftyFifty.dev';
import * as ImageGalleryFeaturedImagedev from 'src/components/image-gallery/ImageGalleryFeaturedImage.dev';
import * as ImageGallerydev from 'src/components/image-gallery/ImageGallery.dev';
import * as ImageGallery from 'src/components/image-gallery/ImageGallery';
import * as nextImageSrcdev from 'src/components/image/nextImageSrc.dev';
import * as imageprops from 'src/components/image/image.props';
import * as imageoptimizationcontext from 'src/components/image/image-optimization.context';
import * as ImageWrapperdev from 'src/components/image/ImageWrapper.dev';
import * as ImageWrapperclient from 'src/components/image/ImageWrapper.client';
import * as ImageBlock from 'src/components/image/ImageBlock';
import * as Icon from 'src/components/icon/Icon';
import * as signaldev from 'src/components/icon/svg/signal.dev';
import * as playdev from 'src/components/icon/svg/play.dev';
import * as lineplaydev from 'src/components/icon/svg/line-play.dev';
import * as diversitydev from 'src/components/icon/svg/diversity.dev';
import * as crossarrowsdev from 'src/components/icon/svg/cross-arrows.dev';
import * as communitiesdev from 'src/components/icon/svg/communities.dev';
import * as arrowuprightdev from 'src/components/icon/svg/arrow-up-right.dev';
import * as arrowrightdev from 'src/components/icon/svg/arrow-right.dev';
import * as arrowleftdev from 'src/components/icon/svg/arrow-left.dev';
import * as YoutubeIcondev from 'src/components/icon/svg/YoutubeIcon.dev';
import * as TwitterIcondev from 'src/components/icon/svg/TwitterIcon.dev';
import * as LinkedInIcondev from 'src/components/icon/svg/LinkedInIcon.dev';
import * as InternalIcondev from 'src/components/icon/svg/InternalIcon.dev';
import * as InstagramIcondev from 'src/components/icon/svg/InstagramIcon.dev';
import * as FileIcondev from 'src/components/icon/svg/FileIcon.dev';
import * as FacebookIcondev from 'src/components/icon/svg/FacebookIcon.dev';
import * as ExternalIcondev from 'src/components/icon/svg/ExternalIcon.dev';
import * as EmailIcondev from 'src/components/icon/svg/EmailIcon.dev';
import * as htmlsnippetblockprops from 'src/components/html-snippet-block/html-snippet-block.props';
import * as HtmlSnippetBlock from 'src/components/html-snippet-block/HtmlSnippetBlock';
import * as heroprops from 'src/components/hero/hero.props';
import * as herodictionary from 'src/components/hero/hero.dictionary';
import * as HeroImageRightdev from 'src/components/hero/HeroImageRight.dev';
import * as HeroImageBottomInsetdev from 'src/components/hero/HeroImageBottomInset.dev';
import * as HeroImageBottomdev from 'src/components/hero/HeroImageBottom.dev';
import * as HeroImageBackgrounddev from 'src/components/hero/HeroImageBackground.dev';
import * as HeroDefaultdev from 'src/components/hero/HeroDefault.dev';
import * as Hero from 'src/components/hero/Hero';
import * as globalheaderprops from 'src/components/global-header/global-header.props';
import * as GlobalHeaderDefaultdev from 'src/components/global-header/GlobalHeaderDefault.dev';
import * as GlobalHeaderCentereddev from 'src/components/global-header/GlobalHeaderCentered.dev';
import * as GlobalHeader from 'src/components/global-header/GlobalHeader';
import * as globalfooterprops from 'src/components/global-footer/global-footer.props';
import * as globalfooterdictionary from 'src/components/global-footer/global-footer.dictionary';
import * as GlobalFooterDefaultdev from 'src/components/global-footer/GlobalFooterDefault.dev';
import * as GlobalFooterBlueCompactdev from 'src/components/global-footer/GlobalFooterBlueCompact.dev';
import * as GlobalFooterBlueCentereddev from 'src/components/global-footer/GlobalFooterBlueCentered.dev';
import * as GlobalFooterBlackLargedev from 'src/components/global-footer/GlobalFooterBlackLarge.dev';
import * as GlobalFooterBlackCompactdev from 'src/components/global-footer/GlobalFooterBlackCompact.dev';
import * as GlobalFooter from 'src/components/global-footer/GlobalFooter';
import * as FooterNavigationColumndev from 'src/components/global-footer/FooterNavigationColumn.dev';
import * as FooterNavigationColumn from 'src/components/global-footer/FooterNavigationColumn';
import * as zipcodesearchformprops from 'src/components/forms/zipcode/zipcode-search-form.props';
import * as ZipcodeSearchFormdev from 'src/components/forms/zipcode/ZipcodeSearchForm.dev';
import * as successcompactdev from 'src/components/forms/success/success-compact.dev';
import * as submitinfoformprops from 'src/components/forms/submitinfo/submit-info-form.props';
import * as submitinfoformdictionary from 'src/components/forms/submitinfo/submit-info-form.dictionary';
import * as SubmitInfoFormdev from 'src/components/forms/submitinfo/SubmitInfoForm.dev';
import * as emailsignupformprops from 'src/components/forms/email/email-signup-form.props';
import * as EmailSignupFormdev from 'src/components/forms/email/EmailSignupForm.dev';
import * as footernavigationcalloutprops from 'src/components/footer-navigation-callout/footer-navigation-callout.props';
import * as FooterNavigationCalloutdev from 'src/components/footer-navigation-callout/FooterNavigationCallout.dev';
import * as floatingdockdev from 'src/components/floating-dock/floating-dock.dev';
import * as Flexdev from 'src/components/flex/Flex.dev';
import * as faqlistingprops from 'src/components/faq-listing/faq-listing.props';
import * as FAQListing from 'src/components/faq-listing/FAQListing';
import * as downloadlistprops from 'src/components/download-list/download-list.props';
import * as downloadlistfields from 'src/components/download-list/download-list.fields';
import * as DownloadList from 'src/components/download-list/DownloadList';
import * as ctabannerprops from 'src/components/cta-banner/cta-banner.props';
import * as CtaBanner from 'src/components/cta-banner/CtaBanner';
import * as ContentSdkRichText from 'src/components/content-sdk-rich-text/ContentSdkRichText';
import * as containerutil from 'src/components/container/container.util';
import * as containerprops from 'src/components/container/container.props';
import * as containerfullwidthprops from 'src/components/container/container-full-width/container-full-width.props';
import * as ContainerFullWidth from 'src/components/container/container-full-width/ContainerFullWidth';
import * as containerfullbleedprops from 'src/components/container/container-full-bleed/container-full-bleed.props';
import * as ContainerFullBleed from 'src/components/container/container-full-bleed/ContainerFullBleed';
import * as container7030props from 'src/components/container/container-7030/container-7030.props';
import * as Container7030 from 'src/components/container/container-7030/Container7030';
import * as container70props from 'src/components/container/container-70/container-70.props';
import * as Container70 from 'src/components/container/container-70/Container70';
import * as Container6321 from 'src/components/container/container-6321/Container6321';
import * as container6040props from 'src/components/container/container-6040/container-6040.props';
import * as Container6040 from 'src/components/container/container-6040/Container6040';
import * as container5050props from 'src/components/container/container-5050/container-5050.props';
import * as Container5050 from 'src/components/container/container-5050/Container5050';
import * as container4060props from 'src/components/container/container-4060/container-4060.props';
import * as Container4060 from 'src/components/container/container-4060/Container4060';
import * as container3070props from 'src/components/container/container-3070/container-3070.props';
import * as Container3070 from 'src/components/container/container-3070/Container3070';
import * as container303030props from 'src/components/container/container-303030/container-303030.props';
import * as Container303030 from 'src/components/container/container-303030/Container303030';
import * as Container25252525 from 'src/components/container/container-25252525/Container25252525';
import * as logocloud from 'src/components/component-library/logo-cloud';
import * as Testimonials from 'src/components/component-library/Testimonials';
import * as TeamSection from 'src/components/component-library/TeamSection';
import * as StatsSection from 'src/components/component-library/StatsSection';
import * as ProductsSection from 'src/components/component-library/ProductsSection';
import * as PlaceholderTabs from 'src/components/component-library/PlaceholderTabs';
import * as NewsletterSection from 'src/components/component-library/NewsletterSection';
import * as Header from 'src/components/component-library/Header';
import * as FeaturesSection from 'src/components/component-library/FeaturesSection';
import * as FAQ from 'src/components/component-library/FAQ';
import * as ContactSection from 'src/components/component-library/ContactSection';
import * as CallToAction from 'src/components/component-library/CallToAction';
import * as CLHero from 'src/components/component-library/CLHero';
import * as Carousel from 'src/components/carousel/Carousel';
import * as cardspotlightdev from 'src/components/card-spotlight/card-spotlight.dev';
import * as cardprops from 'src/components/card/card.props';
import * as Carddev from 'src/components/card/Card.dev';
import * as ButtonComponent from 'src/components/button-component/ButtonComponent';
import * as breadcrumbsprops from 'src/components/breadcrumbs/breadcrumbs.props';
import * as Breadcrumbs from 'src/components/breadcrumbs/Breadcrumbs';
import * as BackgroundThumbnaildev from 'src/components/background-thumbnail/BackgroundThumbnail.dev';
import * as authpanelprops from 'src/components/auth-panel/auth-panel.props';
import * as AuthPanel from 'src/components/auth-panel/AuthPanel';
import * as articlelistingprops from 'src/components/article-listing/article-listing.props';
import * as ArticleListing from 'src/components/article-listing/ArticleListing';
import * as articleheaderprops from 'src/components/article-header/article-header.props';
import * as articleheaderfields from 'src/components/article-header/article-header.fields';
import * as articleheaderdictionary from 'src/components/article-header/article-header.dictionary';
import * as ArticleHeader from 'src/components/article-header/ArticleHeader';
import * as articlecontentprops from 'src/components/article-content/article-content.props';
import * as articlecontentfields from 'src/components/article-content/article-content.fields';
import * as ArticleContent from 'src/components/article-content/ArticleContent';
import * as animatedsectionprops from 'src/components/animated-section/animated-section.props';
import * as AnimatedSectiondev from 'src/components/animated-section/AnimatedSection.dev';
import * as alertbannerprops from 'src/components/alert-banner/alert-banner.props';
import * as AlertBannerdev from 'src/components/alert-banner/AlertBanner.dev';
import * as aifaqprops from 'src/components/ai-faq/ai-faq.props';
import * as AiFaq from 'src/components/ai-faq/AiFaq';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['zipcode-modal', { ...zipcodemodaldev }],
  ['vertical-image-accordion', { ...verticalimageaccordionprops }],
  ['VerticalImageAccordion', { ...VerticalImageAccordion, componentType: 'client' }],
  ['variant-content', { ...variantcontentprops, ...variantcontentfields }],
  ['VariantContent', { ...VariantContent, componentType: 'client' }],
  ['NewsListing', { ...NewsListing, componentType: 'client' }],
  ['MediaCanvas', { ...MediaCanvas, componentType: 'client' }],
  ['career-listing', { ...careerlistingprops }],
  ['bio-related-content', { ...biorelatedcontent }],
  ['CareerListing', { ...CareerListing, componentType: 'client' }],
  ['BioListing', { ...BioListing, componentType: 'client' }],
  ['BioDetail', { ...BioDetail, componentType: 'client' }],
  ['BlogListing', { ...BlogListing, componentType: 'client' }],
  ['DocumentCards', { ...DocumentCards, componentType: 'client' }],
  ['topic-listing', { ...topiclistingprops }],
  ['TopicListing', { ...TopicListing }],
  ['TopicItem', { ...TopicItemdev }],
  ['theme-provider', { ...themeproviderdev }],
  ['text-banner', { ...textbannerprops }],
  ['TextBannerTextTop', { ...TextBannerTextTopdev }],
  ['TextBannerDefault', { ...TextBannerDefaultdev }],
  ['TextBannerBlueTitleRight', { ...TextBannerBlueTitleRightdev }],
  ['TextBanner02', { ...TextBanner02dev }],
  ['TextBanner01', { ...TextBanner01dev }],
  ['TextBanner', { ...TextBanner, componentType: 'client' }],
  ['testimonial-carousel', { ...testimonialcarouselprops }],
  ['TestimonialCarouselItem', { ...TestimonialCarouselItem }],
  ['TestimonialCarousel', { ...TestimonialCarousel, componentType: 'client' }],
  ['TopicIconChip', { ...TopicIconChip }],
  ['Title', { ...Title }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Promo', { ...Promo }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['NavigationMenuToggle', { ...NavigationMenuToggleclient }],
  ['NavigationList', { ...NavigationListclient }],
  ['Navigation', { ...Navigation }],
  ['LinkList', { ...LinkList, componentType: 'client' }],
  ['Image', { ...Image }],
  ['ContentBlock', { ...ContentBlock, componentType: 'client' }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['ButtonNavigation', { ...ButtonNavigationclient }],
  ['subscription-banner', { ...subscriptionbannerprops }],
  ['SubscriptionBanner', { ...SubscriptionBanner, componentType: 'client' }],
  ['submission-form', { ...submissionformprops }],
  ['SubmissionFormDefault', { ...SubmissionFormDefaultdev }],
  ['SubmissionFormCentered', { ...SubmissionFormCentereddev }],
  ['SubmissionForm', { ...SubmissionForm }],
  ['StructuredData', { ...StructuredData }],
  ['slide-carousel', { ...slidecarouselprops }],
  ['SlideCarousel', { ...SlideCarouseldev }],
  ['Video', { ...Video }],
  ['TextSlider', { ...TextSlider, componentType: 'client' }],
  ['SignupBanner', { ...SignupBanner }],
  ['ProductPageHeader', { ...ProductPageHeader, componentType: 'client' }],
  ['ProductComparison', { ...ProductComparison, componentType: 'client' }],
  ['PageHeaderST', { ...PageHeaderST }],
  ['MultiPromo', { ...MultiPromo, componentType: 'client' }],
  ['MobileMenuWrapper', { ...MobileMenuWrapper, componentType: 'client' }],
  ['MegaMenuItemWrapper', { ...MegaMenuItemWrapper, componentType: 'client' }],
  ['MegaMenuItem', { ...MegaMenuItem }],
  ['ImageCarousel', { ...ImageCarousel, componentType: 'client' }],
  ['ImageBanner', { ...ImageBanner }],
  ['HeroST', { ...HeroST, componentType: 'client' }],
  ['HeaderSTHamburger', { ...HeaderSTHamburger, componentType: 'client' }],
  ['HeaderST', { ...HeaderST }],
  ['FooterST', { ...FooterST }],
  ['FeatureBanner', { ...FeatureBanner, componentType: 'client' }],
  ['AccordionBlock', { ...AccordionBlock, componentType: 'client' }],
  ['site-metadata', { ...sitemetadataprops }],
  ['SiteMetadata', { ...SiteMetadata }],
  ['secondary-navigation', { ...secondarynavigationprops }],
  ['SecondaryNavigation', { ...SecondaryNavigation, componentType: 'client' }],
  ['data', { ...data }],
  ['SearchResults', { ...SearchResults, componentType: 'client' }],
  ['SearchExperience', { ...SearchExperienceLoadMore, ...SearchExperience, componentType: 'client' }],
  ['SitecoreSearchResults', { ...SitecoreSearchResults, componentType: 'client' }],
  ['rich-text-block', { ...richtextblockprops }],
  ['RichTextBlock', { ...RichTextBlock }],
  ['PulseAssistant', { ...PulseAssistant, componentType: 'client' }],
  ['promo-image', { ...promoimageprops }],
  ['PromoImageTitlePartialOverlay', { ...PromoImageTitlePartialOverlaydev }],
  ['PromoImageRight', { ...PromoImageRightdev }],
  ['PromoImageMiddle', { ...PromoImageMiddledev }],
  ['PromoImageLeft', { ...PromoImageLeftdev }],
  ['PromoImageDefault', { ...PromoImageDefaultdev }],
  ['PromoImage', { ...PromoImage }],
  ['promo-block', { ...promoblockprops }],
  ['PromoBlock', { ...PromoBlock }],
  ['promo-animated', { ...promoanimatedutil, ...promoanimatedprops }],
  ['PromoAnimatedImageRight', { ...PromoAnimatedImageRightdev }],
  ['PromoAnimatedDefault', { ...PromoAnimatedDefaultdev }],
  ['PromoAnimated', { ...PromoAnimated, componentType: 'client' }],
  ['product-listing', { ...productlistingprops, ...productlistingdictionary }],
  ['ProductListingThreeUp', { ...ProductListingThreeUpdev }],
  ['ProductListingSlider', { ...ProductListingSliderdev }],
  ['ProductListingDefault', { ...ProductListingDefaultdev }],
  ['ProductListingCard', { ...ProductListingCarddev }],
  ['ProductListing', { ...ProductListing, componentType: 'client' }],
  ['portal-page-detail', { ...portalpagedetailprops }],
  ['PortalPageDetail', { ...PortalPageDetail, componentType: 'client' }],
  ['portal-hub', { ...portalhubprops }],
  ['PortalHubView', { ...PortalHubViewclient }],
  ['PortalHub', { ...PortalHub }],
  ['portal', { ...portaldev }],
  ['page-header', { ...pageheaderprops }],
  ['PageHeaderFiftyFifty', { ...PageHeaderFiftyFiftydev }],
  ['PageHeaderDefault', { ...PageHeaderDefaultdev }],
  ['PageHeaderCentered', { ...PageHeaderCentereddev }],
  ['PageHeaderBlueText', { ...PageHeaderBlueTextdev }],
  ['PageHeaderBlueBackground', { ...PageHeaderBlueBackgrounddev }],
  ['PageHeader', { ...PageHeader, componentType: 'client' }],
  ['multi-promo-tabs', { ...multipromotabsprops }],
  ['MultiPromoTabs', { ...MultiPromoTabs, componentType: 'client' }],
  ['MultiPromoTab', { ...MultiPromoTabdev }],
  ['mode-toggle', { ...modetoggledev }],
  ['media-section', { ...mediasectionprops }],
  ['MediaSection', { ...MediaSectiondev }],
  ['meteors', { ...meteors, componentType: 'client' }],
  ['logo-tabs', { ...logotabsprops }],
  ['LogoTabs', { ...LogoTabs, componentType: 'client' }],
  ['LogoItem', { ...LogoItem }],
  ['logo', { ...logoprops }],
  ['Logo', { ...Logodev }],
  ['utils', { ...utils }],
  ['location-search', { ...locationsearchprops }],
  ['location-search-item', { ...locationsearchitemprops }],
  ['google-maps', { ...googlemapsprops }],
  ['LocationSearchTitleZipCentered', { ...LocationSearchTitleZipCentereddev }],
  ['LocationSearchMapTopAllCentered', { ...LocationSearchMapTopAllCentereddev }],
  ['LocationSearchMapRightTitleZipCentered', { ...LocationSearchMapRightTitleZipCentereddev }],
  ['LocationSearchMapRight', { ...LocationSearchMapRightdev }],
  ['LocationSearchItem', { ...LocationSearchItemdev }],
  ['LocationSearchDefault', { ...LocationSearchDefaultdev }],
  ['LocationSearch', { ...LocationSearch, componentType: 'client' }],
  ['GoogleMap', { ...GoogleMapdev }],
  ['knowledge-listing', { ...knowledgelistingprops, ...knowledgelistingfields }],
  ['KnowledgeListing', { ...KnowledgeListing, componentType: 'client' }],
  ['knowlede-variant', { ...knowledevariantprops }],
  ['KnowledeVariant', { ...KnowledeVariant, componentType: 'client' }],
  ['km-article-content', { ...kmarticlecontentprops, ...kmarticlecontentfields }],
  ['KmArticleContent', { ...KmArticleContent, componentType: 'client' }],
  ['image-gallery', { ...imagegalleryprops }],
  ['ImageGalleryNoSpacing', { ...ImageGalleryNoSpacingdev }],
  ['ImageGalleryGrid', { ...ImageGalleryGriddev }],
  ['ImageGalleryFiftyFifty', { ...ImageGalleryFiftyFiftydev }],
  ['ImageGalleryFeaturedImage', { ...ImageGalleryFeaturedImagedev }],
  ['ImageGallery', { ...ImageGallerydev, ...ImageGallery, componentType: 'client' }],
  ['nextImageSrc', { ...nextImageSrcdev }],
  ['image', { ...imageprops }],
  ['image-optimization', { ...imageoptimizationcontext }],
  ['ImageWrapper', { ...ImageWrapperdev, ...ImageWrapperclient }],
  ['ImageBlock', { ...ImageBlock }],
  ['Icon', { ...Icon, componentType: 'client' }],
  ['signal', { ...signaldev }],
  ['play', { ...playdev }],
  ['line-play', { ...lineplaydev }],
  ['diversity', { ...diversitydev }],
  ['cross-arrows', { ...crossarrowsdev }],
  ['communities', { ...communitiesdev }],
  ['arrow-up-right', { ...arrowuprightdev }],
  ['arrow-right', { ...arrowrightdev }],
  ['arrow-left', { ...arrowleftdev }],
  ['YoutubeIcon', { ...YoutubeIcondev }],
  ['TwitterIcon', { ...TwitterIcondev }],
  ['LinkedInIcon', { ...LinkedInIcondev }],
  ['InternalIcon', { ...InternalIcondev }],
  ['InstagramIcon', { ...InstagramIcondev }],
  ['FileIcon', { ...FileIcondev }],
  ['FacebookIcon', { ...FacebookIcondev }],
  ['ExternalIcon', { ...ExternalIcondev }],
  ['EmailIcon', { ...EmailIcondev }],
  ['html-snippet-block', { ...htmlsnippetblockprops }],
  ['HtmlSnippetBlock', { ...HtmlSnippetBlock, componentType: 'client' }],
  ['hero', { ...heroprops, ...herodictionary }],
  ['HeroImageRight', { ...HeroImageRightdev }],
  ['HeroImageBottomInset', { ...HeroImageBottomInsetdev }],
  ['HeroImageBottom', { ...HeroImageBottomdev }],
  ['HeroImageBackground', { ...HeroImageBackgrounddev }],
  ['HeroDefault', { ...HeroDefaultdev }],
  ['Hero', { ...Hero, componentType: 'client' }],
  ['global-header', { ...globalheaderprops }],
  ['GlobalHeaderDefault', { ...GlobalHeaderDefaultdev }],
  ['GlobalHeaderCentered', { ...GlobalHeaderCentereddev }],
  ['GlobalHeader', { ...GlobalHeader, componentType: 'client' }],
  ['global-footer', { ...globalfooterprops, ...globalfooterdictionary }],
  ['GlobalFooterDefault', { ...GlobalFooterDefaultdev }],
  ['GlobalFooterBlueCompact', { ...GlobalFooterBlueCompactdev }],
  ['GlobalFooterBlueCentered', { ...GlobalFooterBlueCentereddev }],
  ['GlobalFooterBlackLarge', { ...GlobalFooterBlackLargedev }],
  ['GlobalFooterBlackCompact', { ...GlobalFooterBlackCompactdev }],
  ['GlobalFooter', { ...GlobalFooter, componentType: 'client' }],
  ['FooterNavigationColumn', { ...FooterNavigationColumndev, ...FooterNavigationColumn, componentType: 'client' }],
  ['zipcode-search-form', { ...zipcodesearchformprops }],
  ['ZipcodeSearchForm', { ...ZipcodeSearchFormdev }],
  ['success-compact', { ...successcompactdev }],
  ['submit-info-form', { ...submitinfoformprops, ...submitinfoformdictionary }],
  ['SubmitInfoForm', { ...SubmitInfoFormdev }],
  ['email-signup-form', { ...emailsignupformprops }],
  ['EmailSignupForm', { ...EmailSignupFormdev }],
  ['footer-navigation-callout', { ...footernavigationcalloutprops }],
  ['FooterNavigationCallout', { ...FooterNavigationCalloutdev }],
  ['floating-dock', { ...floatingdockdev }],
  ['Flex', { ...Flexdev }],
  ['faq-listing', { ...faqlistingprops }],
  ['FAQListing', { ...FAQListing, componentType: 'client' }],
  ['download-list', { ...downloadlistprops, ...downloadlistfields }],
  ['DownloadList', { ...DownloadList, componentType: 'client' }],
  ['cta-banner', { ...ctabannerprops }],
  ['CtaBanner', { ...CtaBanner }],
  ['ContentSdkRichText', { ...ContentSdkRichText }],
  ['container', { ...containerutil, ...containerprops }],
  ['container-full-width', { ...containerfullwidthprops }],
  ['ContainerFullWidth', { ...ContainerFullWidth }],
  ['container-full-bleed', { ...containerfullbleedprops }],
  ['ContainerFullBleed', { ...ContainerFullBleed }],
  ['container-7030', { ...container7030props }],
  ['Container7030', { ...Container7030 }],
  ['container-70', { ...container70props }],
  ['Container70', { ...Container70 }],
  ['Container6321', { ...Container6321 }],
  ['container-6040', { ...container6040props }],
  ['Container6040', { ...Container6040 }],
  ['container-5050', { ...container5050props }],
  ['Container5050', { ...Container5050 }],
  ['container-4060', { ...container4060props }],
  ['Container4060', { ...Container4060 }],
  ['container-3070', { ...container3070props }],
  ['Container3070', { ...Container3070 }],
  ['container-303030', { ...container303030props }],
  ['Container303030', { ...Container303030 }],
  ['Container25252525', { ...Container25252525 }],
  ['logo-cloud', { ...logocloud }],
  ['Testimonials', { ...Testimonials }],
  ['TeamSection', { ...TeamSection }],
  ['StatsSection', { ...StatsSection }],
  ['ProductsSection', { ...ProductsSection, componentType: 'client' }],
  ['PlaceholderTabs', { ...PlaceholderTabs }],
  ['NewsletterSection', { ...NewsletterSection }],
  ['Header', { ...Header, componentType: 'client' }],
  ['FeaturesSection', { ...FeaturesSection, componentType: 'client' }],
  ['FAQ', { ...FAQ, componentType: 'client' }],
  ['ContactSection', { ...ContactSection, componentType: 'client' }],
  ['CallToAction', { ...CallToAction }],
  ['CLHero', { ...CLHero }],
  ['Carousel', { ...Carousel, componentType: 'client' }],
  ['card-spotlight', { ...cardspotlightdev }],
  ['card', { ...cardprops }],
  ['Card', { ...Carddev }],
  ['ButtonComponent', { ...ButtonComponent }],
  ['breadcrumbs', { ...breadcrumbsprops }],
  ['Breadcrumbs', { ...Breadcrumbs }],
  ['BackgroundThumbnail', { ...BackgroundThumbnaildev }],
  ['auth-panel', { ...authpanelprops }],
  ['AuthPanel', { ...AuthPanel, componentType: 'client' }],
  ['article-listing', { ...articlelistingprops }],
  ['ArticleListing', { ...ArticleListing, componentType: 'client' }],
  ['article-header', { ...articleheaderprops, ...articleheaderfields, ...articleheaderdictionary }],
  ['ArticleHeader', { ...ArticleHeader, componentType: 'client' }],
  ['article-content', { ...articlecontentprops, ...articlecontentfields }],
  ['ArticleContent', { ...ArticleContent, componentType: 'client' }],
  ['animated-section', { ...animatedsectionprops }],
  ['AnimatedSection', { ...AnimatedSectiondev }],
  ['alert-banner', { ...alertbannerprops }],
  ['AlertBanner', { ...AlertBannerdev }],
  ['ai-faq', { ...aifaqprops }],
  ['AiFaq', { ...AiFaq, componentType: 'client' }],
]);

export default componentMap;
