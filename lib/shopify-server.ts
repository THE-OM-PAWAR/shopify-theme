// Server-side Shopify API client for Server Components
export const shopifyFetchServer = async ({ query, variables = {} }: { query: string; variables?: any }) => {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('Shopify GraphQL errors:', result.errors);
      throw new Error('GraphQL errors occurred');
    }

    return { data: result.data };
  } catch (error) {
    console.error('Shopify Server API Error:', error);
    throw error;
  }
};