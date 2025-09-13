export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    reference?: {
      image?: {
        url: string;
        altText: string | null;
      };
    };
  }>;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText: string | null;
        width: number;
        height: number;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  price: string;
  currencyCode: string;
  image: string | null;
  quantity: number;
  maxQuantity: number;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: string;
  currencyCode: string;
  checkoutUrl: string;
}