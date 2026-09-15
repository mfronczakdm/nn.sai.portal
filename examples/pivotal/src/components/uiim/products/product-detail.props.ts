import type {
  Field,
  ImageField,
  LinkField,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export type ProductDetailFields = {
  ProductName?: Field<string>;
  ProductID?: Field<string>;
  ProductSKU?: Field<string>;
  pageTitle?: Field<string>;
  pageHeaderTitle?: Field<string>;
  CategoryLabel?: Field<string>;
  SpecSheetLink?: LinkField;
  image?: ImageField;
  ImageSecondary?: ImageField;
  /** Plain public URL — preferred for external images (layout often drops Image-field src). */
  ImageUrl?: Field<string>;
  ImageSecondaryUrl?: Field<string>;
  Description?: RichTextField;
  Detail?: RichTextField;
  TechnicalData?: RichTextField;
  StylesAvailable?: RichTextField;
  Benefits?: RichTextField;
};

export type ProductDetailProps = ComponentProps & {
  fields?: ProductDetailFields;
  isPageEditing?: boolean;
};
