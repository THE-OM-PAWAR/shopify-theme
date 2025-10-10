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
  uploadedImages?: Array<{url: string, publicId: string}>;
  nameplateText?: string;
  isCollageProduct?: boolean;
  isUploadProduct?: boolean;
  isNameplateProduct?: boolean;
}

/**
 * Collects all image URLs from cart items and their customizations
 * @param cartItems - Array of cart items
 * @param getCustomization - Function to get customization data for a product
 * @param getUploadedImages - Function to get uploaded images for a product
 * @param getProductType - Function to get product type info (isCollage, isUpload, isNameplate)
 * @param getNameplateText - Function to get nameplate text for a product
 * @returns Array of ProductImageInfo objects
 */
export function collectProductImageInfo(
  cartItems: CartItem[],
  getCustomization: (productId: string) => CustomizationData | null,
  getUploadedImages?: (productId: string) => Array<{url: string, publicId: string}> | null,
  getProductType?: (productId: string) => {isCollage: boolean, isUpload: boolean, isNameplate: boolean} | null,
  getNameplateText?: (productId: string) => string | null
): ProductImageInfo[] {
  return cartItems.map(item => {
    const customization = getCustomization(item.productId);
    const uploadedImages = getUploadedImages ? getUploadedImages(item.productId) : null;
    const productType = getProductType ? getProductType(item.productId) : null;
    const nameplateText = getNameplateText ? getNameplateText(item.productId) : null;
    
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

    // Add uploaded images if available
    if (uploadedImages && uploadedImages.length > 0) {
      imageInfo.uploadedImages = uploadedImages;
    }

    // Add nameplate text if available
    if (nameplateText && nameplateText.trim()) {
      imageInfo.nameplateText = nameplateText;
    }

    // Add product type info if available
    if (productType) {
      imageInfo.isCollageProduct = productType.isCollage;
      imageInfo.isUploadProduct = productType.isUpload;
      imageInfo.isNameplateProduct = productType.isNameplate;
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

    // Add uploaded images if they exist
    if (info.uploadedImages && info.uploadedImages.length > 0) {
      const imageType = info.isCollageProduct ? 'COLLAGE IMAGES' : 'UPLOADED IMAGES';
      productSection.push(`\n${imageType}:`);
      productSection.push(`${info.uploadedImages.length}. ${productName} (Qty: ${info.quantity})`);
      info.uploadedImages.forEach((img, imgIndex) => {
        const imgLabel = info.isCollageProduct ? 'Collage' : 'Uploaded';
        productSection.push(`  - ${imgLabel} Image ${imgIndex + 1}: ${img.url}`);
      });
    }

    // Add nameplate text if it exists
    if (info.nameplateText && info.nameplateText.trim()) {
      productSection.push(`\nNAMEPLATE TEXT:`);
      productSection.push(`1. ${productName} (Qty: ${info.quantity})`);
      productSection.push(`  - Nameplate Text: "${info.nameplateText}"`);
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
