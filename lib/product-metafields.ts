/**
 * Product metafields utilities for storing custom images
 */

import { CREATE_PRODUCT_METAFIELD_MUTATION } from './queries';

interface MetafieldInput {
  namespace: string;
  key: string;
  value: string;
  type: string;
  ownerId: string;
}

/**
 * Upload custom image to Shopify and create/update product metafield
 */
export async function updateProductCustomImage(
  productId: string, 
  cloudinaryImageUrl: string, 
  orderId?: string
): Promise<string> {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;
  
  try {
    // First, download and upload the image to Shopify
    const shopifyImageUrl = await uploadImageToShopify(cloudinaryImageUrl, `custom-${productId}-${Date.now()}.jpg`);
    
    // Create metafield for custom image
    const metafieldInput: MetafieldInput = {
      namespace: 'custom',
      key: 'custom_image_url',
      value: shopifyImageUrl,
      type: 'single_line_text_field',
      ownerId: productId
    };
    
    // If order ID is provided, also store order reference
    const metafields: MetafieldInput[] = [metafieldInput];
    
    if (orderId) {
      metafields.push({
        namespace: 'custom',
        key: 'custom_image_order',
        value: orderId,
        type: 'single_line_text_field',
        ownerId: productId
      });
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        query: CREATE_PRODUCT_METAFIELD_MUTATION,
        variables: {
          metafields: metafields
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('Shopify Admin GraphQL errors:', result.errors);
      throw new Error('GraphQL errors occurred');
    }
    
    const userErrors = result.data?.metafieldsSet?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error('Metafield creation errors:', userErrors);
      throw new Error(userErrors[0].message);
    }
    
    console.log('Successfully updated product metafield with custom image:', {
      productId,
      shopifyImageUrl,
      metafields: result.data?.metafieldsSet?.metafields
    });
    
    return shopifyImageUrl;
    
  } catch (error) {
    console.error('Error updating product metafield:', error);
    throw error;
  }
}

/**
 * Upload image to Shopify (reused from shopify-admin.ts)
 */
async function uploadImageToShopify(imageUrl: string, filename?: string): Promise<string> {
  const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;
  
  // Download the image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  
  // Determine content type
  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
  const fileExtension = contentType.includes('png') ? 'png' : 'jpg';
  const finalFilename = filename || `custom-image-${Date.now()}.${fileExtension}`;
  
  const mutation = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          url
          originalSource
          fileStatus
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const variables = {
    files: [
      {
        originalSource: `data:${contentType};base64,${base64Image}`,
        filename: finalFilename,
        contentType: 'IMAGE',
        alt: 'Custom Product Image'
      }
    ]
  };
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
    },
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (result.errors) {
    console.error('Shopify Admin GraphQL errors:', result.errors);
    throw new Error('GraphQL errors occurred');
  }
  
  const fileData = result.data?.fileCreate?.files?.[0];
  const userErrors = result.data?.fileCreate?.userErrors;
  
  if (userErrors && userErrors.length > 0) {
    console.error('File upload errors:', userErrors);
    throw new Error(userErrors[0].message);
  }
  
  if (!fileData?.url) {
    throw new Error('Failed to upload image to Shopify');
  }
  
  return fileData.url;
}
