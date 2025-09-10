export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  tags: string[];
  productType: string;
  vendor: string;
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
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

export interface ShopifyImage {
  id: string;
  url: string;
  altText?: string;
  width: number;
  height: number;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  description: string;
  handle: string;
  image?: ShopifyImage;
  products: ShopifyProduct[];
}

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  variant: string;
  customImage?: {
    url: string;
    cropData: any;
    originalName: string;
  };
}

export interface CustomFrame {
  id: string;
  productId: string;
  variantId: string;
  imageUrl: string;
  cropData: any;
  frameType: string;
  createdAt: string;
  orderId?: string;
}