'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FramePreview from './FramePreview';

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

interface ProductVariant {
  id: string;
  title: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
}
interface ProductImagesProps {
  images: ProductImage[];
  productTitle: string;
  productId?: string;
  frameCoverUrl?: string;
  frameLengthUrl?: string;
  selectedVariant?: ProductVariant;
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
}

export default function ProductImages({ 
  images, 
  productTitle, 
  productId,
  selectedVariant,
  metafields 
}: ProductImagesProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extract metafield URLs
  const frameCoverMetafield = metafields?.find(
    (metafield) => metafield && metafield.namespace === 'custom' && metafield.key === 'frame_cover'
  );
  
  // Use frame_cover as the background for preview
  const frameCoverUrl = frameCoverMetafield?.reference?.image?.url || frameCoverMetafield?.value;
  
  // Check if this product has frame customization capability
  const hasFrameCustomization = !!(frameCoverUrl && selectedVariant?.image?.url);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Create combined images array with frame preview first if available
  const allImages = hasFrameCustomization && productId ? [
    {
      id: 'frame-preview',
      url: 'frame-preview', // Special identifier
      altText: `${productTitle} Frame Preview`,
      width: 400,
      height: 600
    },
    ...images
  ] : images;
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {allImages[currentImageIndex].url === 'frame-preview' ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <FramePreview
              productId={productId!}
              frameCoverUrl={frameCoverUrl}
              variantImageUrl={selectedVariant?.image?.url}
              width={400}
              height={600}
              className="max-w-full max-h-full"
            />
          </div>
        ) : (
          <Image
            src={allImages[currentImageIndex].url}
            alt={allImages[currentImageIndex].altText || productTitle}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        
        {allImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={previousImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              className={`aspect-square relative rounded-md overflow-hidden border-2 ${
                index === currentImageIndex ? 'border-black' : 'border-transparent'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              {image.url === 'frame-preview' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 p-1">
                  <FramePreview
                    productId={productId!}
                    frameCoverUrl={frameCoverUrl}
                    variantImageUrl={selectedVariant?.image?.url}
                    width={80}
                    height={120}
                    className="max-w-full max-h-full"
                  />
                </div>
              ) : (
                <Image
                  src={image.url}
                  alt={image.altText || `${productTitle} image ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="25vw"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}