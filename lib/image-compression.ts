/**
 * Image compression utility
 * Compresses images to 10MB or less while maintaining quality
 */

export interface CompressionOptions {
  maxSizeInMB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressionResult {
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
}

/**
 * Converts bytes to MB
 */
export function bytesToMB(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Converts MB to bytes
 */
export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

/**
 * Calculates the compression quality needed to achieve target size
 */
function calculateQuality(
  originalSize: number,
  targetSize: number,
  currentQuality: number = 0.9
): number {
  // More accurate estimation: JPEG compression ratio is roughly proportional to quality^2
  const estimatedRatio = Math.pow(currentQuality, 1.5) * 0.9; // More accurate estimation
  const estimatedCompressedSize = originalSize * estimatedRatio;
  
  if (estimatedCompressedSize <= targetSize) {
    return currentQuality;
  }
  
  // Calculate new quality based on size ratio with better formula
  const sizeRatio = targetSize / originalSize;
  // Use square root to get more accurate quality estimation
  const newQuality = Math.max(0.3, Math.min(0.95, Math.sqrt(sizeRatio / 0.9)));
  
  return newQuality;
}

/**
 * Resizes image while maintaining aspect ratio
 */
function resizeImage(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = image;
  
  // Calculate new dimensions while maintaining aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;
    
    if (width > height) {
      width = Math.min(maxWidth, width);
      height = width / aspectRatio;
    } else {
      height = Math.min(maxHeight, height);
      width = height * aspectRatio;
    }
  }
  
  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;
  
  // Draw resized image
  ctx.drawImage(image, 0, 0, width, height);
  
  return { width, height };
}

/**
 * Compresses an image file to the specified maximum size
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxSizeInMB = 20,
    quality = 0.9,
    maxWidth = 4000,
    maxHeight = 4000
  } = options;

  const maxSizeInBytes = mbToBytes(maxSizeInMB);
  const originalSize = file.size;
  
  // If file is already under the limit, return as-is
  if (originalSize <= maxSizeInBytes) {
    return {
      compressedBlob: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false
    };
  }

  // If file is only slightly over the limit (within 20%), try minimal compression
  const sizeRatio = maxSizeInBytes / originalSize;
  if (sizeRatio > 0.8) {
    console.log(`File is close to target size (${getFileSizeString(originalSize)}), using minimal compression`);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

         // First, resize if necessary
         const { width, height } = resizeImage(canvas, ctx, img, maxWidth, maxHeight);
         
         // Calculate initial quality based on file size ratio
         const sizeRatio = maxSizeInBytes / originalSize;
         let currentQuality = quality;
         
         // For 13MB -> 10MB, we want minimal compression
         if (sizeRatio > 0.8) {
           // Very close to target size, use maximum quality (minimal compression)
           currentQuality = Math.max(0.95, Math.min(0.98, 0.96));
         } else if (sizeRatio > 0.6) {
           // Close to target size, use very high quality
           currentQuality = Math.max(0.9, Math.min(0.95, 0.93));
         } else if (sizeRatio > 0.3) {
           // Large file, start with high quality
           currentQuality = Math.max(0.85, Math.min(0.92, 0.88));
         } else {
           // Very large file, start with good quality
           currentQuality = Math.max(0.8, Math.min(0.9, 0.85));
         }
        
         // Function to try compression with given quality
         const tryCompression = (testQuality: number, iteration: number = 0): void => {
           canvas.toBlob(
             (blob) => {
               if (blob) {
                 const sizeDifference = Math.abs(blob.size - maxSizeInBytes);
                 const tolerance = maxSizeInBytes * 0.2; // 20% tolerance for minimal compression
                 
                 // Debug logging
                 console.log(`Compression attempt ${iteration + 1}: Quality=${testQuality.toFixed(3)}, Size=${getFileSizeString(blob.size)}, Target=${getFileSizeString(maxSizeInBytes)}`);
                 
                 if (blob.size <= maxSizeInBytes) {
                   // Success! We found a quality that works
                   console.log(`Compression successful: ${getFileSizeString(originalSize)} → ${getFileSizeString(blob.size)}`);
                   resolve({
                     compressedBlob: blob,
                     originalSize,
                     compressedSize: blob.size,
                     compressionRatio: blob.size / originalSize,
                     wasCompressed: true
                   });
                 } else if (blob.size > maxSizeInBytes && iteration < 2) {
                   // Still too big, try very small quality reduction
                   const sizeRatio = maxSizeInBytes / blob.size;
                   const qualityReduction = Math.pow(sizeRatio, 0.9); // Very conservative reduction
                   const newQuality = Math.max(0.7, Math.min(0.95, testQuality * qualityReduction));
                   
                   console.log(`Reducing quality: ${testQuality.toFixed(3)} → ${newQuality.toFixed(3)}`);
                   
                   if (newQuality < testQuality && newQuality >= 0.7) {
                     tryCompression(newQuality, iteration + 1);
                   } else {
                     // Can't compress further, return what we have
                     resolve({
                       compressedBlob: blob,
                       originalSize,
                       compressedSize: blob.size,
                       compressionRatio: blob.size / originalSize,
                       wasCompressed: true
                     });
                   }
                 } else if (blob.size < maxSizeInBytes && iteration < 2) {
                   // Too small, try slightly higher quality
                   const sizeRatio = maxSizeInBytes / blob.size;
                   const qualityIncrease = Math.pow(sizeRatio, 0.3); // Very conservative increase
                   const newQuality = Math.min(0.95, Math.max(0.8, testQuality * qualityIncrease));
                   
                   console.log(`Increasing quality: ${testQuality.toFixed(3)} → ${newQuality.toFixed(3)}`);
                   
                   if (newQuality > testQuality && newQuality <= 0.95) {
                     tryCompression(newQuality, iteration + 1);
                   } else {
                     // Good enough, return what we have
                     resolve({
                       compressedBlob: blob,
                       originalSize,
                       compressedSize: blob.size,
                       compressionRatio: blob.size / originalSize,
                       wasCompressed: true
                     });
                   }
                 } else {
                   // Max iterations reached or good enough, return what we have
                   resolve({
                     compressedBlob: blob,
                     originalSize,
                     compressedSize: blob.size,
                     compressionRatio: blob.size / originalSize,
                     wasCompressed: true
                   });
                 }
               } else {
                 reject(new Error('Failed to create compressed image'));
               }
             },
             file.type || 'image/jpeg',
             testQuality
           );
         };

        // Start with the initial quality
        tryCompression(currentQuality);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    // Load the image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses multiple images
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  const results = await Promise.all(
    files.map(file => compressImage(file, options))
  );
  
  return results;
}

/**
 * Gets file size in human readable format
 */
export function getFileSizeString(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Gets image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}
