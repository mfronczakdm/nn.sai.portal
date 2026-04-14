// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCServerWrapper, NextjsContentSdkComponent, FEaaSServerWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as VideoPlayerdev from 'src/components/video/VideoPlayer.dev';
import * as VideoModaldev from 'src/components/video/VideoModal.dev';
import * as Video from 'src/components/video/Video';
import * as videoprops from 'src/components/video/video-props';
import * as VerticalImageAccordion from 'src/components/vertical-image-accordion/VerticalImageAccordion';
import * as verticalimageaccordionprops from 'src/components/vertical-image-accordion/vertical-image-accordion.props';
import * as TopicListing from 'src/components/topic-listing/TopicListing';
import * as TopicItemdev from 'src/components/topic-listing/TopicItem.dev';
import * as topiclistingprops from 'src/components/topic-listing/topic-listing.props';
import * as themeproviderdev from 'src/components/theme-provider/theme-provider.dev';
import * as TextBannerDefaultdev from 'src/components/text-banner/TextBannerDefault.dev';
import * as TextBanner02dev from 'src/components/text-banner/TextBanner02.dev';
import * as TextBanner01dev from 'src/components/text-banner/TextBanner01.dev';
import * as TextBanner from 'src/components/text-banner/TextBanner';
import * as textbannerprops from 'src/components/text-banner/text-banner.props';
import * as TestimonialCarouselItem from 'src/components/testimonial-carousel/TestimonialCarouselItem';
import * as TestimonialCarousel from 'src/components/testimonial-carousel/TestimonialCarousel';
import * as testimonialcarouselprops from 'src/components/testimonial-carousel/testimonial-carousel.props';
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
import * as SubscriptionBanner from 'src/components/subscription-banner/SubscriptionBanner';
import * as subscriptionbannerprops from 'src/components/subscription-banner/subscription-banner.props';
import * as subscriptionbannerdictionary from 'src/components/subscription-banner/subscription-banner.dictionary';
import * as StructuredData from 'src/components/structured-data/StructuredData';
import * as SiteMetadata from 'src/components/site-metadata/SiteMetadata';
import * as sitemetadataprops from 'src/components/site-metadata/site-metadata.props';
import * as SecondaryNavigation from 'src/components/secondary-navigation/SecondaryNavigation';
import * as secondarynavigationprops from 'src/components/secondary-navigation/secondary-navigation.props';
import * as RichTextBlock from 'src/components/rich-text-block/RichTextBlock';
import * as richtextblockprops from 'src/components/rich-text-block/rich-text-block.props';
import * as PromoBlock from 'src/components/promo-block/PromoBlock';
import * as promoblockprops from 'src/components/promo-block/promo-block.props';
import * as PromoAnimatedImageRightdev from 'src/components/promo-animated/PromoAnimatedImageRight.dev';
import * as PromoAnimatedDefaultdev from 'src/components/promo-animated/PromoAnimatedDefault.dev';
import * as PromoAnimated from 'src/components/promo-animated/PromoAnimated';
import * as promoanimatedutil from 'src/components/promo-animated/promo-animated.util';
import * as promoanimatedprops from 'src/components/promo-animated/promo-animated.props';
import * as portaldev from 'src/components/portal/portal.dev';
import * as PageHeader from 'src/components/page-header/PageHeader';
import * as pageheaderprops from 'src/components/page-header/page-header.props';
import * as MultiPromoTabs from 'src/components/multi-promo-tabs/MultiPromoTabs';
import * as MultiPromoTabdev from 'src/components/multi-promo-tabs/MultiPromoTab.dev';
import * as multipromotabsprops from 'src/components/multi-promo-tabs/multi-promo-tabs.props';
import * as MultiPromoItemdev from 'src/components/multi-promo/MultiPromoItem.dev';
import * as MultiPromo from 'src/components/multi-promo/MultiPromo';
import * as multipromoprops from 'src/components/multi-promo/multi-promo.props';
import * as modetoggledev from 'src/components/mode-toggle/mode-toggle.dev';
import * as MediaSectiondev from 'src/components/media-section/MediaSection.dev';
import * as mediasectionprops from 'src/components/media-section/media-section.props';
import * as meteors from 'src/components/magicui/meteors';
import * as LogoTabs from 'src/components/logo-tabs/LogoTabs';
import * as LogoItem from 'src/components/logo-tabs/LogoItem';
import * as logotabsprops from 'src/components/logo-tabs/logo-tabs.props';
import * as logoprops from 'src/components/logo/logo.props';
import * as Logodev from 'src/components/logo/Logo.dev';
import * as nextImageSrcdev from 'src/components/image/nextImageSrc.dev';
import * as ImageWrapperdev from 'src/components/image/ImageWrapper.dev';
import * as ImageWrapperclient from 'src/components/image/ImageWrapper.client';
import * as ImageBlock from 'src/components/image/ImageBlock';
import * as imageprops from 'src/components/image/image.props';
import * as imageoptimizationcontext from 'src/components/image/image-optimization.context';
import * as Icon from 'src/components/icon/Icon';
import * as YoutubeIcondev from 'src/components/icon/svg/YoutubeIcon.dev';
import * as TwitterIcondev from 'src/components/icon/svg/TwitterIcon.dev';
import * as signaldev from 'src/components/icon/svg/signal.dev';
import * as playdev from 'src/components/icon/svg/play.dev';
import * as LinkedInIcondev from 'src/components/icon/svg/LinkedInIcon.dev';
import * as InternalIcondev from 'src/components/icon/svg/InternalIcon.dev';
import * as InstagramIcondev from 'src/components/icon/svg/InstagramIcon.dev';
import * as FileIcondev from 'src/components/icon/svg/FileIcon.dev';
import * as FacebookIcondev from 'src/components/icon/svg/FacebookIcon.dev';
import * as ExternalIcondev from 'src/components/icon/svg/ExternalIcon.dev';
import * as EmailIcondev from 'src/components/icon/svg/EmailIcon.dev';
import * as diversitydev from 'src/components/icon/svg/diversity.dev';
import * as crossarrowsdev from 'src/components/icon/svg/cross-arrows.dev';
import * as communitiesdev from 'src/components/icon/svg/communities.dev';
import * as arrowuprightdev from 'src/components/icon/svg/arrow-up-right.dev';
import * as arrowrightdev from 'src/components/icon/svg/arrow-right.dev';
import * as arrowleftdev from 'src/components/icon/svg/arrow-left.dev';
import * as Hero from 'src/components/hero/Hero';
import * as heroprops from 'src/components/hero/hero.props';
import * as GlobalHeader from 'src/components/global-header/GlobalHeader';
import * as globalheaderprops from 'src/components/global-header/global-header.props';
import * as GlobalFooter from 'src/components/global-footer/GlobalFooter';
import * as globalfooterprops from 'src/components/global-footer/global-footer.props';
import * as FooterNavigationColumn from 'src/components/global-footer/FooterNavigationColumn';
import * as FooterNavigationCalloutdev from 'src/components/footer-navigation-callout/FooterNavigationCallout.dev';
import * as floatingdockdev from 'src/components/floating-dock/floating-dock.dev';
import * as Flexdev from 'src/components/flex/Flex.dev';
import * as CtaBanner from 'src/components/cta-banner/CtaBanner';
import * as containerutil from 'src/components/container/container.util';
import * as ContainerFullWidth from 'src/components/container/container-full-width/ContainerFullWidth';
import * as ContainerFullBleed from 'src/components/container/container-full-bleed/ContainerFullBleed';
import * as Container7030 from 'src/components/container/container-7030/Container7030';
import * as Container70 from 'src/components/container/container-70/Container70';
import * as Container6321 from 'src/components/container/container-6321/Container6321';
import * as Container6040 from 'src/components/container/container-6040/Container6040';
import * as Container5050 from 'src/components/container/container-5050/Container5050';
import * as Container4060 from 'src/components/container/container-4060/Container4060';
import * as Container3070 from 'src/components/container/container-3070/Container3070';
import * as Container303030 from 'src/components/container/container-303030/Container303030';
import * as Container25252525 from 'src/components/container/container-25252525/Container25252525';
import * as Carddev from 'src/components/card/Card.dev';
import * as ButtonComponent from 'src/components/button-component/ButtonComponent';
import * as Breadcrumbs from 'src/components/breadcrumbs/Breadcrumbs';
import * as BackgroundThumbnaildev from 'src/components/background-thumbnail/BackgroundThumbnail.dev';
import * as ArticleListing from 'src/components/article-listing/ArticleListing';
import * as ArticleHeader from 'src/components/article-header/ArticleHeader';
import * as articleheaderdictionary from 'src/components/article-header/article-header.dictionary';
import * as AnimatedSectiondev from 'src/components/animated-section/AnimatedSection.dev';
import * as AlertBannerdev from 'src/components/alert-banner/AlertBanner.dev';
import * as AccordionBlockItemdev from 'src/components/accordion-block/AccordionBlockItem.dev';
import * as AccordionBlockDefaultdev from 'src/components/accordion-block/AccordionBlockDefault.dev';
import * as AccordionBlock from 'src/components/accordion-block/AccordionBlock';
import * as accordionblockprops from 'src/components/accordion-block/accordion-block.props';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCServerWrapper],
  ['FEaaSWrapper', FEaaSServerWrapper],
  ['Form', { ...Form, componentType: 'client' }],
  ['VideoPlayer', { ...VideoPlayerdev }],
  ['VideoModal', { ...VideoModaldev }],
  ['Video', { ...Video, componentType: 'client' }],
  ['video-props', { ...videoprops }],
  ['VerticalImageAccordion', { ...VerticalImageAccordion, componentType: 'client' }],
  ['vertical-image-accordion', { ...verticalimageaccordionprops }],
  ['TopicListing', { ...TopicListing }],
  ['TopicItem', { ...TopicItemdev }],
  ['topic-listing', { ...topiclistingprops }],
  ['theme-provider', { ...themeproviderdev }],
  ['TextBannerDefault', { ...TextBannerDefaultdev }],
  ['TextBanner02', { ...TextBanner02dev }],
  ['TextBanner01', { ...TextBanner01dev }],
  ['TextBanner', { ...TextBanner }],
  ['text-banner', { ...textbannerprops }],
  ['TestimonialCarouselItem', { ...TestimonialCarouselItem }],
  ['TestimonialCarousel', { ...TestimonialCarousel, componentType: 'client' }],
  ['testimonial-carousel', { ...testimonialcarouselprops }],
  ['Title', { ...Title, componentType: 'client' }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['Promo', { ...Promo }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['NavigationMenuToggle', { ...NavigationMenuToggleclient }],
  ['NavigationList', { ...NavigationListclient }],
  ['Navigation', { ...Navigation }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image, componentType: 'client' }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['SubscriptionBanner', { ...SubscriptionBanner, componentType: 'client' }],
  ['subscription-banner', { ...subscriptionbannerprops, ...subscriptionbannerdictionary }],
  ['StructuredData', { ...StructuredData }],
  ['SiteMetadata', { ...SiteMetadata }],
  ['site-metadata', { ...sitemetadataprops }],
  ['SecondaryNavigation', { ...SecondaryNavigation, componentType: 'client' }],
  ['secondary-navigation', { ...secondarynavigationprops }],
  ['RichTextBlock', { ...RichTextBlock }],
  ['rich-text-block', { ...richtextblockprops }],
  ['PromoBlock', { ...PromoBlock }],
  ['promo-block', { ...promoblockprops }],
  ['PromoAnimatedImageRight', { ...PromoAnimatedImageRightdev }],
  ['PromoAnimatedDefault', { ...PromoAnimatedDefaultdev }],
  ['PromoAnimated', { ...PromoAnimated, componentType: 'client' }],
  ['promo-animated', { ...promoanimatedutil, ...promoanimatedprops }],
  ['portal', { ...portaldev }],
  ['PageHeader', { ...PageHeader, componentType: 'client' }],
  ['page-header', { ...pageheaderprops }],
  ['MultiPromoTabs', { ...MultiPromoTabs, componentType: 'client' }],
  ['MultiPromoTab', { ...MultiPromoTabdev }],
  ['multi-promo-tabs', { ...multipromotabsprops }],
  ['MultiPromoItem', { ...MultiPromoItemdev }],
  ['MultiPromo', { ...MultiPromo, componentType: 'client' }],
  ['multi-promo', { ...multipromoprops }],
  ['mode-toggle', { ...modetoggledev }],
  ['MediaSection', { ...MediaSectiondev }],
  ['media-section', { ...mediasectionprops }],
  ['meteors', { ...meteors, componentType: 'client' }],
  ['LogoTabs', { ...LogoTabs, componentType: 'client' }],
  ['LogoItem', { ...LogoItem }],
  ['logo-tabs', { ...logotabsprops }],
  ['logo', { ...logoprops }],
  ['Logo', { ...Logodev }],
  ['nextImageSrc', { ...nextImageSrcdev }],
  ['ImageWrapper', { ...ImageWrapperdev, ...ImageWrapperclient }],
  ['ImageBlock', { ...ImageBlock }],
  ['image', { ...imageprops }],
  ['image-optimization', { ...imageoptimizationcontext }],
  ['Icon', { ...Icon, componentType: 'client' }],
  ['YoutubeIcon', { ...YoutubeIcondev }],
  ['TwitterIcon', { ...TwitterIcondev }],
  ['signal', { ...signaldev }],
  ['play', { ...playdev }],
  ['LinkedInIcon', { ...LinkedInIcondev }],
  ['InternalIcon', { ...InternalIcondev }],
  ['InstagramIcon', { ...InstagramIcondev }],
  ['FileIcon', { ...FileIcondev }],
  ['FacebookIcon', { ...FacebookIcondev }],
  ['ExternalIcon', { ...ExternalIcondev }],
  ['EmailIcon', { ...EmailIcondev }],
  ['diversity', { ...diversitydev }],
  ['cross-arrows', { ...crossarrowsdev }],
  ['communities', { ...communitiesdev }],
  ['arrow-up-right', { ...arrowuprightdev }],
  ['arrow-right', { ...arrowrightdev }],
  ['arrow-left', { ...arrowleftdev }],
  ['Hero', { ...Hero, componentType: 'client' }],
  ['hero', { ...heroprops }],
  ['GlobalHeader', { ...GlobalHeader, componentType: 'client' }],
  ['global-header', { ...globalheaderprops }],
  ['GlobalFooter', { ...GlobalFooter }],
  ['global-footer', { ...globalfooterprops }],
  ['FooterNavigationColumn', { ...FooterNavigationColumn, componentType: 'client' }],
  ['FooterNavigationCallout', { ...FooterNavigationCalloutdev }],
  ['floating-dock', { ...floatingdockdev }],
  ['Flex', { ...Flexdev }],
  ['CtaBanner', { ...CtaBanner }],
  ['container', { ...containerutil }],
  ['ContainerFullWidth', { ...ContainerFullWidth }],
  ['ContainerFullBleed', { ...ContainerFullBleed }],
  ['Container7030', { ...Container7030 }],
  ['Container70', { ...Container70 }],
  ['Container6321', { ...Container6321 }],
  ['Container6040', { ...Container6040 }],
  ['Container5050', { ...Container5050 }],
  ['Container4060', { ...Container4060 }],
  ['Container3070', { ...Container3070 }],
  ['Container303030', { ...Container303030 }],
  ['Container25252525', { ...Container25252525 }],
  ['Card', { ...Carddev }],
  ['ButtonComponent', { ...ButtonComponent }],
  ['Breadcrumbs', { ...Breadcrumbs }],
  ['BackgroundThumbnail', { ...BackgroundThumbnaildev }],
  ['ArticleListing', { ...ArticleListing, componentType: 'client' }],
  ['ArticleHeader', { ...ArticleHeader, componentType: 'client' }],
  ['article-header', { ...articleheaderdictionary }],
  ['AnimatedSection', { ...AnimatedSectiondev }],
  ['AlertBanner', { ...AlertBannerdev }],
  ['AccordionBlockItem', { ...AccordionBlockItemdev }],
  ['AccordionBlockDefault', { ...AccordionBlockDefaultdev }],
  ['AccordionBlock', { ...AccordionBlock, componentType: 'client' }],
  ['accordion-block', { ...accordionblockprops }],
]);

export default componentMap;
