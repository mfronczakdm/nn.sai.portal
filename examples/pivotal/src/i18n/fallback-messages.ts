/**
 * Local fallback dictionary phrases for site-three components.
 * Merged under Sitecore dictionary values in i18n/request.ts so missing
 * CMS keys do not throw next-intl MISSING_MESSAGE errors during local dev.
 */
export const fallbackMessages: Record<string, string> = {
  // SearchBox
  Go: 'Go',
  Go_To_Search_Results: 'Go to search results',
  Search: 'Search',
  Search_Input_Placeholder: 'Type to search...',

  // MiniCart
  Go_To_Cart: 'Go to Cart',
  Your_Cart: 'Your Cart',
  Cart_Empty: 'Your cart is currently empty.',

  // SignupBanner
  Signup_Form_Button_Label: 'Submit',
  Signup_Form_Input_Placeholder: 'Enter your email address.',

  // MegaMenuItem
  Explore: 'Explore',
  Back: 'Back',

  // ProductComparison / ProductPageHeader
  Buy_Now: 'Buy Now',
  Add_To_Cart: 'Add to cart',
};
