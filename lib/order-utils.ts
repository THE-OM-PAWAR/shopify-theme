import { CartItem } from './types';
import { CustomizationData } from './customization-store';

export interface ProductImageInfo {
  productId: string;
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  originalImageUrl?: string;
  customizedImageUrl?: string;
  userUploadedImageUrl?: string;
  croppedImageUrl?: string;
  frameImageUrl?: string;
}

/**
 * Collects all image URLs from cart items and their customizations
 * @param cartItems - Array of cart items
 * @param getCustomization - Function to get customization data for a product
 * @returns Array of ProductImageInfo objects
 */
export function collectProductImageInfo(
  cartItems: CartItem[],
  getCustomization: (productId: string) => CustomizationData | null
): ProductImageInfo[] {
  return cartItems.map(item => {
    const customization = getCustomization(item.productId);
    
    const imageInfo: ProductImageInfo = {
      productId: item.productId,
      productTitle: item.title,
      variantTitle: item.variantTitle || undefined,
      quantity: item.quantity,
      originalImageUrl: item.image || undefined,
    };

    // Add customization image URLs if available
    if (customization) {
      imageInfo.customizedImageUrl = customization.renderedImageUrl;
      imageInfo.userUploadedImageUrl = customization.originalImageUrl;
      imageInfo.croppedImageUrl = customization.croppedImageUrl;
      imageInfo.frameImageUrl = customization.frameImageUrl;
    }

    return imageInfo;
  });
}

/**
 * Formats image information into a readable note for the order
 * @param imageInfo - Array of ProductImageInfo objects
 * @returns Formatted string for order notes
 */
export function formatImageInfoForOrderNotes(imageInfo: ProductImageInfo[]): string {
  if (imageInfo.length === 0) {
    return '';
  }

  const noteSections: string[] = [];
  
  imageInfo.forEach((info, index) => {
    const productName = info.variantTitle && info.variantTitle !== 'Default Title' 
      ? `${info.productTitle} - ${info.variantTitle}` 
      : info.productTitle;
    
    const productSection: string[] = [];
    productSection.push(`${index + 1}. ${productName} (Qty: ${info.quantity})`);
    
    // Only show customization images if they exist
    if (info.userUploadedImageUrl || info.croppedImageUrl || info.customizedImageUrl) {
      productSection.push(`  - User Uploaded Image: ${info.userUploadedImageUrl || ''}`);
      productSection.push(`  - Cropped Image: ${info.croppedImageUrl || ''}`);
      productSection.push(`  - Final Customized Image: ${info.customizedImageUrl || ''}`);
    }

    noteSections.push(productSection.join('\n'));
  });

  return noteSections.join('\n\n');
}

/**
 * Creates a concise summary of image URLs for quick reference
 * @param imageInfo - Array of ProductImageInfo objects
 * @returns Concise summary string
 */
export function createImageSummary(imageInfo: ProductImageInfo[]): string {
  const summaries: string[] = [];
  
  imageInfo.forEach((info, index) => {
    const productSummary: string[] = [];
    productSummary.push(`${index + 1}. ${info.productTitle} (Qty: ${info.quantity})`);
    
    if (info.customizedImageUrl) {
      productSummary.push(`   Customized: ${info.customizedImageUrl}`);
    }
    
    if (info.userUploadedImageUrl) {
      productSummary.push(`   User Upload: ${info.userUploadedImageUrl}`);
    }
    
    summaries.push(productSummary.join('\n'));
  });

  return summaries.join('\n');
}
