'use client';

import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  apiVersion: '2024-01',
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
});

export const shopifyFetch = async ({ query, variables = {} }: { query: string; variables?: any }) => {
  try {
    const response = await shopifyClient.request(query, variables);
    return response;
  } catch (error) {
    console.error('Shopify API Error:', error);
    throw error;
  }
};