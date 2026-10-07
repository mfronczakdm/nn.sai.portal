// Client-safe component map for App Router

import { BYOCClientWrapper, NextjsContentSdkComponent, FEaaSClientWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

import * as zipcodemodaldev from 'src/components/zipcode-modal/zipcode-modal.dev';
import * as VerticalImageAccordion from 'src/components/vertical-image-accordion/VerticalImageAccordion';
import * as VariantContent from 'src/components/variant-content/VariantContent';
import * as NewsListing from 'src/components/uiim/news/NewsListing';
import * as MediaCanvas from 'src/components/uiim/media/MediaCanvas';
import * as CareerListing from 'src/components/uiim/lawyers/CareerListing';
import * as BioListing from 'src/components/uiim/lawyers/BioListing';
import * as BioDetail from 'src/components/uiim/lawyers/BioDetail';
import * as BlogListing from 'src/components/uiim/insights/BlogListing';
import * as DocumentCards from 'src/components/uiim/cards/DocumentCards';
import * as themeproviderdev from 'src/components/theme-provider/theme-provider.dev';
import * as TextBannerTextTopdev from 'src/components/text-banner/TextBannerTextTop.dev';
import * as TextBannerDefaultdev from 'src/components/text-banner/TextBannerDefault.dev';
import * as TextBannerBlueTitleRightdev from 'src/components/text-banner/TextBannerBlueTitleRight.dev';
import * as TextBanner02dev from 'src/components/text-banner/TextBanner02.dev';
import * as TextBanner01dev from 'src/components/text-banner/TextBanner01.dev';
import * as TextBanner from 'src/components/text-banner/TextBanner';
import * as TestimonialCarousel from 'src/components/testimonial-carousel/TestimonialCarousel';
import * as NavigationMenuToggleclient from 'src/components/sxa/NavigationMenuToggle.client';
import * as NavigationListclient from 'src/components/sxa/NavigationList.client';
import * as LinkList from 'src/components/sxa/LinkList';
import * as ContentBlock from 'src/components/sxa/ContentBlock';
import * as ButtonNavigationclient from 'src/components/sxa/ButtonNavigation.client';
import * as SubscriptionBanner from 'src/components/subscription-banner/SubscriptionBanner';
import * as SlideCarouseldev from 'src/components/slide-carousel/SlideCarousel.dev';
import * as TextSlider from 'src/components/site-three/TextSlider';
import * as ProductPageHeader from 'src/components/site-three/ProductPageHeader';
import * as ProductComparison from 'src/components/site-three/ProductComparison';
import * as MultiPromo from 'src/components/site-three/MultiPromo';
import * as MobileMenuWrapper from 'src/components/site-three/MobileMenuWrapper';
import * as MegaMenuItemWrapper from 'src/components/site-three/MegaMenuItemWrapper';
import * as ImageCarousel from 'src/components/site-three/ImageCarousel';
import * as HeroST from 'src/components/site-three/HeroST';
import * as HeaderSTHamburger from 'src/components/site-three/HeaderSTHamburger';
import * as FeatureBanner from 'src/components/site-three/FeatureBanner';
import * as AccordionBlock from 'src/components/site-three/AccordionBlock';
import * as SecondaryNavigation from 'src/components/secondary-navigation/SecondaryNavigation';
import * as SearchResults from 'src/components/search-results/SearchResults';
import * as SearchExperienceLoadMore from 'src/components/search-experience/SearchExperience.LoadMore';
import * as SearchExperience from 'src/components/search-experience/SearchExperience';
import * as SitecoreSearchResults from 'src/components/search/SitecoreSearchResults';
import * as PulseAssistant from 'src/components/pulse-assistant/PulseAssistant';
import * as PromoAnimatedImageRightdev from 'src/components/promo-animated/PromoAnimatedImageRight.dev';
import * as PromoAnimatedDefaultdev from 'src/components/promo-animated/PromoAnimatedDefault.dev';
import * as PromoAnimated from 'src/components/promo-animated/PromoAnimated';
import * as ProductListingThreeUpdev from 'src/components/product-listing/ProductListingThreeUp.dev';
import * as ProductListingSliderdev from 'src/components/product-listing/ProductListingSlider.dev';
import * as ProductListingDefaultdev from 'src/components/product-listing/ProductListingDefault.dev';
import * as ProductListing from 'src/components/product-listing/ProductListing';
import * as PortalPageDetail from 'src/components/portal-page-detail/PortalPageDetail';
import * as PortalHubViewclient from 'src/components/portal-hub/PortalHubView.client';
import * as portaldev from 'src/components/portal/portal.dev';
import * as PageHeaderFiftyFiftydev from 'src/components/page-header/PageHeaderFiftyFifty.dev';
import * as PageHeaderDefaultdev from 'src/components/page-header/PageHeaderDefault.dev';
import * as PageHeaderCentereddev from 'src/components/page-header/PageHeaderCentered.dev';
import * as PageHeaderBlueTextdev from 'src/components/page-header/PageHeaderBlueText.dev';
import * as PageHeaderBlueBackgrounddev from 'src/components/page-header/PageHeaderBlueBackground.dev';
import * as PageHeader from 'src/components/page-header/PageHeader';
import * as MultiPromoTabs from 'src/components/multi-promo-tabs/MultiPromoTabs';
import * as modetoggledev from 'src/components/mode-toggle/mode-toggle.dev';
import * as MediaSectiondev from 'src/components/media-section/MediaSection.dev';
import * as meteors from 'src/components/magicui/meteors';
import * as LogoTabs from 'src/components/logo-tabs/LogoTabs';
import * as LocationSearchTitleZipCentereddev from 'src/components/location-search/LocationSearchTitleZipCentered.dev';
import * as LocationSearchMapTopAllCentereddev from 'src/components/location-search/LocationSearchMapTopAllCentered.dev';
import * as LocationSearchMapRightTitleZipCentereddev from 'src/components/location-search/LocationSearchMapRightTitleZipCentered.dev';
import * as LocationSearchMapRightdev from 'src/components/location-search/LocationSearchMapRight.dev';
import * as LocationSearchDefaultdev from 'src/components/location-search/LocationSearchDefault.dev';
import * as LocationSearch from 'src/components/location-search/LocationSearch';
import * as GoogleMapdev from 'src/components/location-search/GoogleMap.dev';
import * as KnowledgeListing from 'src/components/knowledge-listing/KnowledgeListing';
import * as KnowledeVariant from 'src/components/knowlede-variant/KnowledeVariant';
import * as KmArticleContent from 'src/components/km-article-content/KmArticleContent';
import * as ImageGalleryNoSpacingdev from 'src/components/image-gallery/ImageGalleryNoSpacing.dev';
import * as ImageGalleryGriddev from 'src/components/image-gallery/ImageGalleryGrid.dev';
import * as ImageGalleryFiftyFiftydev from 'src/components/image-gallery/ImageGalleryFiftyFifty.dev';
import * as ImageGalleryFeaturedImagedev from 'src/components/image-gallery/ImageGalleryFeaturedImage.dev';
import * as ImageGallerydev from 'src/components/image-gallery/ImageGallery.dev';
import * as ImageGallery from 'src/components/image-gallery/ImageGallery';
import * as ImageWrapperclient from 'src/components/image/ImageWrapper.client';
import * as imageoptimizationcontext from 'src/components/image/image-optimization.context';
import * as Icon from 'src/components/icon/Icon';
import * as HtmlSnippetBlock from 'src/components/html-snippet-block/HtmlSnippetBlock';
import * as HeroImageRightdev from 'src/components/hero/HeroImageRight.dev';
import * as HeroImageBottomInsetdev from 'src/components/hero/HeroImageBottomInset.dev';
import * as HeroImageBottomdev from 'src/components/hero/HeroImageBottom.dev';
import * as HeroImageBackgrounddev from 'src/components/hero/HeroImageBackground.dev';
import * as HeroDefaultdev from 'src/components/hero/HeroDefault.dev';
import * as Hero from 'src/components/hero/Hero';
import * as GlobalHeaderDefaultdev from 'src/components/global-header/GlobalHeaderDefault.dev';
import * as GlobalHeaderCentereddev from 'src/components/global-header/GlobalHeaderCentered.dev';
import * as GlobalHeader from 'src/components/global-header/GlobalHeader';
import * as GlobalFooterDefaultdev from 'src/components/global-footer/GlobalFooterDefault.dev';
import * as GlobalFooterBlueCompactdev from 'src/components/global-footer/GlobalFooterBlueCompact.dev';
import * as GlobalFooterBlueCentereddev from 'src/components/global-footer/GlobalFooterBlueCentered.dev';
import * as GlobalFooterBlackLargedev from 'src/components/global-footer/GlobalFooterBlackLarge.dev';
import * as GlobalFooterBlackCompactdev from 'src/components/global-footer/GlobalFooterBlackCompact.dev';
import * as GlobalFooter from 'src/components/global-footer/GlobalFooter';
import * as FooterNavigationColumndev from 'src/components/global-footer/FooterNavigationColumn.dev';
import * as FooterNavigationColumn from 'src/components/global-footer/FooterNavigationColumn';
import * as ZipcodeSearchFormdev from 'src/components/forms/zipcode/ZipcodeSearchForm.dev';
import * as SubmitInfoFormdev from 'src/components/forms/submitinfo/SubmitInfoForm.dev';
import * as EmailSignupFormdev from 'src/components/forms/email/EmailSignupForm.dev';
import * as floatingdockdev from 'src/components/floating-dock/floating-dock.dev';
import * as FAQListing from 'src/components/faq-listing/FAQListing';
import * as DownloadList from 'src/components/download-list/DownloadList';
import * as ProductsSection from 'src/components/component-library/ProductsSection';
import * as Header from 'src/components/component-library/Header';
import * as FeaturesSection from 'src/components/component-library/FeaturesSection';
import * as FAQ from 'src/components/component-library/FAQ';
import * as ContactSection from 'src/components/component-library/ContactSection';
import * as Carousel from 'src/components/carousel/Carousel';
import * as cardspotlightdev from 'src/components/card-spotlight/card-spotlight.dev';
import * as AuthPanel from 'src/components/auth-panel/AuthPanel';
import * as ArticleListing from 'src/components/article-listing/ArticleListing';
import * as ArticleHeader from 'src/components/article-header/ArticleHeader';
import * as ArticleContent from 'src/components/article-content/ArticleContent';
import * as AnimatedSectiondev from 'src/components/animated-section/AnimatedSection.dev';
import * as AlertBannerdev from 'src/components/alert-banner/AlertBanner.dev';
import * as AiFaq from 'src/components/ai-faq/AiFaq';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCClientWrapper],
  ['FEaaSWrapper', FEaaSClientWrapper],
  ['Form', Form],
  ['zipcode-modal', { ...zipcodemodaldev }],
  ['VerticalImageAccordion', { ...VerticalImageAccordion }],
  ['VariantContent', { ...VariantContent }],
  ['NewsListing', { ...NewsListing }],
  ['MediaCanvas', { ...MediaCanvas }],
  ['CareerListing', { ...CareerListing }],
  ['BioListing', { ...BioListing }],
  ['BioDetail', { ...BioDetail }],
  ['BlogListing', { ...BlogListing }],
  ['DocumentCards', { ...DocumentCards }],
  ['theme-provider', { ...themeproviderdev }],
  ['TextBannerTextTop', { ...TextBannerTextTopdev }],
  ['TextBannerDefault', { ...TextBannerDefaultdev }],
  ['TextBannerBlueTitleRight', { ...TextBannerBlueTitleRightdev }],
  ['TextBanner02', { ...TextBanner02dev }],
  ['TextBanner01', { ...TextBanner01dev }],
  ['TextBanner', { ...TextBanner }],
  ['TestimonialCarousel', { ...TestimonialCarousel }],
  ['NavigationMenuToggle', { ...NavigationMenuToggleclient }],
  ['NavigationList', { ...NavigationListclient }],
  ['LinkList', { ...LinkList }],
  ['ContentBlock', { ...ContentBlock }],
  ['ButtonNavigation', { ...ButtonNavigationclient }],
  ['SubscriptionBanner', { ...SubscriptionBanner }],
  ['SlideCarousel', { ...SlideCarouseldev }],
  ['TextSlider', { ...TextSlider }],
  ['ProductPageHeader', { ...ProductPageHeader }],
  ['ProductComparison', { ...ProductComparison }],
  ['MultiPromo', { ...MultiPromo }],
  ['MobileMenuWrapper', { ...MobileMenuWrapper }],
  ['MegaMenuItemWrapper', { ...MegaMenuItemWrapper }],
  ['ImageCarousel', { ...ImageCarousel }],
  ['HeroST', { ...HeroST }],
  ['HeaderSTHamburger', { ...HeaderSTHamburger }],
  ['FeatureBanner', { ...FeatureBanner }],
  ['AccordionBlock', { ...AccordionBlock }],
  ['SecondaryNavigation', { ...SecondaryNavigation }],
  ['SearchResults', { ...SearchResults }],
  ['SearchExperience', { ...SearchExperienceLoadMore, ...SearchExperience }],
  ['SitecoreSearchResults', { ...SitecoreSearchResults }],
  ['PulseAssistant', { ...PulseAssistant }],
  ['PromoAnimatedImageRight', { ...PromoAnimatedImageRightdev }],
  ['PromoAnimatedDefault', { ...PromoAnimatedDefaultdev }],
  ['PromoAnimated', { ...PromoAnimated }],
  ['ProductListingThreeUp', { ...ProductListingThreeUpdev }],
  ['ProductListingSlider', { ...ProductListingSliderdev }],
  ['ProductListingDefault', { ...ProductListingDefaultdev }],
  ['ProductListing', { ...ProductListing }],
  ['PortalPageDetail', { ...PortalPageDetail }],
  ['PortalHubView', { ...PortalHubViewclient }],
  ['portal', { ...portaldev }],
  ['PageHeaderFiftyFifty', { ...PageHeaderFiftyFiftydev }],
  ['PageHeaderDefault', { ...PageHeaderDefaultdev }],
  ['PageHeaderCentered', { ...PageHeaderCentereddev }],
  ['PageHeaderBlueText', { ...PageHeaderBlueTextdev }],
  ['PageHeaderBlueBackground', { ...PageHeaderBlueBackgrounddev }],
  ['PageHeader', { ...PageHeader }],
  ['MultiPromoTabs', { ...MultiPromoTabs }],
  ['mode-toggle', { ...modetoggledev }],
  ['MediaSection', { ...MediaSectiondev }],
  ['meteors', { ...meteors }],
  ['LogoTabs', { ...LogoTabs }],
  ['LocationSearchTitleZipCentered', { ...LocationSearchTitleZipCentereddev }],
  ['LocationSearchMapTopAllCentered', { ...LocationSearchMapTopAllCentereddev }],
  ['LocationSearchMapRightTitleZipCentered', { ...LocationSearchMapRightTitleZipCentereddev }],
  ['LocationSearchMapRight', { ...LocationSearchMapRightdev }],
  ['LocationSearchDefault', { ...LocationSearchDefaultdev }],
  ['LocationSearch', { ...LocationSearch }],
  ['GoogleMap', { ...GoogleMapdev }],
  ['KnowledgeListing', { ...KnowledgeListing }],
  ['KnowledeVariant', { ...KnowledeVariant }],
  ['KmArticleContent', { ...KmArticleContent }],
  ['ImageGalleryNoSpacing', { ...ImageGalleryNoSpacingdev }],
  ['ImageGalleryGrid', { ...ImageGalleryGriddev }],
  ['ImageGalleryFiftyFifty', { ...ImageGalleryFiftyFiftydev }],
  ['ImageGalleryFeaturedImage', { ...ImageGalleryFeaturedImagedev }],
  ['ImageGallery', { ...ImageGallerydev, ...ImageGallery }],
  ['ImageWrapper', { ...ImageWrapperclient }],
  ['image-optimization', { ...imageoptimizationcontext }],
  ['Icon', { ...Icon }],
  ['HtmlSnippetBlock', { ...HtmlSnippetBlock }],
  ['HeroImageRight', { ...HeroImageRightdev }],
  ['HeroImageBottomInset', { ...HeroImageBottomInsetdev }],
  ['HeroImageBottom', { ...HeroImageBottomdev }],
  ['HeroImageBackground', { ...HeroImageBackgrounddev }],
  ['HeroDefault', { ...HeroDefaultdev }],
  ['Hero', { ...Hero }],
  ['GlobalHeaderDefault', { ...GlobalHeaderDefaultdev }],
  ['GlobalHeaderCentered', { ...GlobalHeaderCentereddev }],
  ['GlobalHeader', { ...GlobalHeader }],
  ['GlobalFooterDefault', { ...GlobalFooterDefaultdev }],
  ['GlobalFooterBlueCompact', { ...GlobalFooterBlueCompactdev }],
  ['GlobalFooterBlueCentered', { ...GlobalFooterBlueCentereddev }],
  ['GlobalFooterBlackLarge', { ...GlobalFooterBlackLargedev }],
  ['GlobalFooterBlackCompact', { ...GlobalFooterBlackCompactdev }],
  ['GlobalFooter', { ...GlobalFooter }],
  ['FooterNavigationColumn', { ...FooterNavigationColumndev, ...FooterNavigationColumn }],
  ['ZipcodeSearchForm', { ...ZipcodeSearchFormdev }],
  ['SubmitInfoForm', { ...SubmitInfoFormdev }],
  ['EmailSignupForm', { ...EmailSignupFormdev }],
  ['floating-dock', { ...floatingdockdev }],
  ['FAQListing', { ...FAQListing }],
  ['DownloadList', { ...DownloadList }],
  ['ProductsSection', { ...ProductsSection }],
  ['Header', { ...Header }],
  ['FeaturesSection', { ...FeaturesSection }],
  ['FAQ', { ...FAQ }],
  ['ContactSection', { ...ContactSection }],
  ['Carousel', { ...Carousel }],
  ['card-spotlight', { ...cardspotlightdev }],
  ['AuthPanel', { ...AuthPanel }],
  ['ArticleListing', { ...ArticleListing }],
  ['ArticleHeader', { ...ArticleHeader }],
  ['ArticleContent', { ...ArticleContent }],
  ['AnimatedSection', { ...AnimatedSectiondev }],
  ['AlertBanner', { ...AlertBannerdev }],
  ['AiFaq', { ...AiFaq }],
]);

export default componentMap;
