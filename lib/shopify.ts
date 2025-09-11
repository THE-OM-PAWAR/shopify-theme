'use client';

import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is required');
}

if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is required');
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  apiVersion: '2025-07',
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
});

export const shopifyFetch = async ({ query, variables = {} }: { query: string; variables?: any }) => {
  try {
    console.log('Shopify API Request:', {
      query: query.substring(0, 100) + '...',
      variables
    });

    const response = await shopifyClient.request(query, variables);
    
    console.log('Shopify API Response:', {
      data: response.data ? 'Present' : 'Missing',
      errors: response.errors || 'None'
    });

    return response;
  } catch (error) {
    console.error('Shopify API Error:', error);
    throw error;
  }
};