// Server-side Shopify API client for Server Components
export const shopifyFetchServer = async ({ query, variables = {} }: { query: string; variables?: any }) => {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-07/graphql.json`;
  
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
    console.error('Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN environment variable');
    throw new Error('Shopify store domain is not configured');
  }
  
  if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.error('Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable');
    throw new Error('Shopify storefront access token is not configured');
  }
  
  try {
    console.log('Making Shopify API request to:', endpoint);
    console.log('Using store domain:', process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // Add timeout and signal handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('Shopify API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API HTTP error! status: ${response.status}, response: ${errorText}`);
      
      if (response.status === 403) {
        throw new Error('Shopify API authentication failed. Please check your store domain and access token.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('Shopify GraphQL errors:', result.errors);
      throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }

    return { data: result.data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Shopify API request timed out');
      throw new Error('Request timed out. Please try again.');
    }
    
    console.error('Shopify Server API Error:', error);
    throw error;
  }
};