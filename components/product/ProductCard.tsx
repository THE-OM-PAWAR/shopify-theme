'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ShopifyProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '@/lib/customization-store';
import ImageCustomizationModal from '@/components/customization/ImageCustomizationModal';
import { Palette, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const { getCustomization } = useCustomizationStore();
  
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  
  console.log('ProductCard - Product:', product.title);
  console.log('ProductCard - Product metafields:', product.metafields);
  
  // Check if product has frame image metafield
  const frameImageMetafield = product.metafields?.find(
    (metafield) => metafield && metafield.namespace === 'custom' && metafield.key === 'frame_image'
  );
  
  console.log('ProductCard - Frame image metafield:', frameImageMetafield);
  
  const frameImageUrl = frameImageMetafield?.value;
  console.log('ProductCard - Frame image URL:', frameImageUrl);
  
  // Only allow customization if we have a valid HTTP(S) URL, not a Shopify GID
  const canCustomize = !!frameImageUrl && (frameImageUrl.startsWith('http://') || frameImageUrl.startsWith('https://'));
  console.log('ProductCard - Can customize:', canCustomize);
  
  // Check if user has customized this product
  const customization = getCustomization(product.id);
  const displayImage = customization?.renderedImageUrl || image?.url;

  const handleCustomizeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Customize button clicked for product:', product.title);
    console.log('Frame image URL:', frameImageUrl);
    console.log('Can customize:', canCustomize);
    
    if (!canCustomize) {
      console.error('Cannot customize product:', product.id, 'Frame image URL:', frameImageUrl);
      toast.error('This product cannot be customized. Frame image not properly configured.');
      return;
    }
    
    console.log('Opening customization modal...');
    setIsCustomizationModalOpen(true);
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/products/${product.handle}`;
  };

  return (
    <>
      <div className="group relative">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={image?.altText || product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            
            {/* Customization Badge */}
            {customization && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Custom
              </div>
            )}
            
            {/* Hover Overlay with Buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleViewProduct}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                {/* Always show customize button for testing */}
                <Button
                  size="sm"
                  onClick={handleCustomizeClick}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Palette className="h-4 w-4 mr-1" />
                  Customize
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {product.title}
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currencyCode,
              }).format(parseFloat(price.amount))}
            </p>
            
            {/* Action Buttons for Mobile */}
            <div className="mt-3 flex gap-2 sm:hidden">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewProduct}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              {/* Always show customize button for testing */}
              <Button
                size="sm"
                onClick={handleCustomizeClick}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Palette className="h-4 w-4 mr-1" />
                Customize
              </Button>
            </div>
            
            {/* Debug Info */}
            <div className="mt-2 text-xs text-gray-500">
              <p>Frame URL: {frameImageUrl || 'None'}</p>
              <p>Can Customize: {canCustomize ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {isCustomizationModalOpen && (
        <ImageCustomizationModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          product={product}
          frameImageUrl={frameImageUrl || 'https://via.placeholder.com/400x600/transparent'}
        />
      )}
    </>
  );
}