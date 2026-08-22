/**
 * Test fixtures and mock data for Promo component
 */

interface PromoFields {
  PromoIcon: {
    value: {
      src: string;
      alt: string;
      width?: string;
      height?: string;
    };
  };
  PromoText: {
    value: string;
  };
  PromoLink: {
    value: {
      href: string;
      text: string;
      linktype?: string;
      url?: string;
      anchor?: string;
      target?: string;
    };
  };
  PromoLink2?: {
    value: {
      href: string;
      text: string;
      linktype?: string;
      url?: string;
      anchor?: string;
      target?: string;
    };
  };
  PromoText2: {
    value: string;
  };
  PromoText3: {
    value: string;
  };
}

type PromoProps = {
  params: { [key: string]: string };
  fields: PromoFields;
};

/**
 * Base mock data for Promo component
 */
export const mockPromoData = {
  defaultIcon: {
    value: {
      src: '/test-image.jpg',
      alt: 'Test Promo Image',
      width: '800',
      height: '600',
    },
  },
  defaultText: {
    value: '<h2>Featured Product</h2>',
  },
  defaultLink: {
    value: {
      href: '/products/featured',
      text: 'Learn More',
      linktype: 'internal',
    },
  },
  secondaryLink: {
    value: {
      href: '/products/savings',
      text: 'View Savings',
      linktype: 'internal',
    },
  },
  defaultText2: {
    value: '<p>Discover our amazing product features and benefits.</p>',
  },
  defaultText3: {
    value: '<div>New Arrival</div>',
  },
  emptyText: {
    value: '',
  },
};

/**
 * Default props for Promo component testing (Default variant)
 */
export const defaultPromoProps: PromoProps = {
  params: {
    RenderingIdentifier: 'promo-1',
    styles: 'custom-promo-style',
  },
  fields: {
    PromoIcon: mockPromoData.defaultIcon,
    PromoText: mockPromoData.defaultText,
    PromoLink: mockPromoData.defaultLink,
    PromoText2: mockPromoData.defaultText2,
    PromoText3: mockPromoData.defaultText3,
  },
};

/**
 * Props for CenteredCard variant
 */
export const centeredCardPromoProps: PromoProps = {
  params: {
    RenderingIdentifier: 'promo-centered',
    styles: 'centered-style',
  },
  fields: {
    PromoIcon: mockPromoData.defaultIcon,
    PromoText: {
      value: '<h2>Centered Promo Title</h2>',
    },
    PromoLink: mockPromoData.defaultLink,
    PromoText2: {
      value: '<p>Centered promotional content.</p>',
    },
    PromoText3: mockPromoData.defaultText3,
  },
};

/**
 * Props with minimal fields
 */
export const minimalPromoProps: PromoProps = {
  params: {
    styles: '',
  },
  fields: {
    PromoIcon: mockPromoData.defaultIcon,
    PromoText: mockPromoData.defaultText,
    PromoLink: mockPromoData.defaultLink,
    PromoText2: mockPromoData.emptyText,
    PromoText3: mockPromoData.emptyText,
  },
};

/**
 * Props with no fields (empty state)
 */
export const emptyPromoProps: PromoProps = {
  params: {
    styles: 'test-style',
  },
  fields: null as unknown as PromoFields,
};

/**
 * Props with empty text fields
 */
export const emptyTextFieldsProps: PromoProps = {
  params: {
    RenderingIdentifier: 'promo-empty',
    styles: '',
  },
  fields: {
    PromoIcon: mockPromoData.defaultIcon,
    PromoText: mockPromoData.emptyText,
    PromoLink: mockPromoData.defaultLink,
    PromoText2: mockPromoData.emptyText,
    PromoText3: mockPromoData.emptyText,
  },
};

/**
 * Props for Left / Right split promo variants
 */
export const splitPromoProps: PromoProps = {
  params: {
    RenderingIdentifier: 'promo-split',
    styles: 'split-promo-style',
  },
  fields: {
    PromoIcon: mockPromoData.defaultIcon,
    PromoText: {
      value: 'Personal Banking',
    },
    PromoText2: {
      value:
        '<ul><li>No minimum balance requirement or monthly maintenance fee</li><li>Free access to Rockland Trust ATMs</li><li>Free access to Online Banking and Mobile Banking</li></ul>',
    },
    PromoText3: mockPromoData.emptyText,
    PromoLink: {
      value: {
        href: '/checking/open',
        text: 'OPEN A FREE CHECKING ACCOUNT',
        linktype: 'internal',
      },
    },
    PromoLink2: {
      value: {
        href: '/savings',
        text: 'View Our Savings Products',
        linktype: 'internal',
      },
    },
  },
};

/**
 * Props for Columns promo variant
 */
export const columnsPromoProps: PromoProps = {
  params: {
    RenderingIdentifier: 'promo-columns',
    styles: 'columns-promo-style',
  },
  fields: {
    PromoIcon: mockPromoData.defaultIcon,
    PromoText3: {
      value: 'Featured Rates',
    },
    PromoText: {
      value:
        '<h2>Express Mortgage</h2><p>20 year term as low as</p><h3>6.874% APR</h3>',
    },
    PromoText2: {
      value:
        '<h2>Home Equity Line of Credit</h2><p>featured</p><h3>6.240% APR</h3>',
    },
    PromoLink: {
      value: {
        href: '/mortgages/express',
        text: 'Learn More',
        linktype: 'internal',
      },
    },
    PromoLink2: {
      value: {
        href: '/home-equity',
        text: 'Learn More',
        linktype: 'internal',
      },
    },
  },
};
