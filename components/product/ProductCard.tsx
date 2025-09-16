'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShopifyProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '@/lib/customization-store';
import ImageCustomizationModal from '@/components/customization/ImageCustomizationModal';
import { Palette, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [currentDisplayImage, setCurrentDisplayImage] = useState(product.images.edges[0]?.node?.url);
  const { getCustomization, _hasHydrated } = useCustomizationStore();
  
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;
  
  // Check if product has frame image metafield
  const frameImageMetafield = product.metafields?.find(
    (metafield) => metafield && metafield.namespace === 'custom' && metafield.key === 'frame_image'
  );
  
  // Get frame image URL from reference field (for file metafields) or fallback to value
  const frameImageUrl = frameImageMetafield?.reference?.image?.url || frameImageMetafield?.value;
  
  // Allow customization if frame image URL exists
  const canCustomize = !!frameImageUrl;
  
  // Check if user has customized this product
  useEffect(() => {
    if (_hasHydrated) {
      const customization = getCustomization(product.id);
      setCurrentDisplayImage(customization?.renderedImageUrl || image?.url);
    }
  }, [_hasHydrated, product.id, getCustomization, image?.url]);

  const handleCustomizeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCustomizationModalOpen(true);
  };

  const handleViewProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/products/${product.handle}`;
  };

  const handleCardClick = () => {
    if (canCustomize && frameImageUrl) {
      setIsCustomizationModalOpen(true);
    } else {
      window.location.href = `/products/${product.handle}`;
    }
  };

  return (
    <>
      <div className="group relative cursor-pointer" onClick={handleCardClick}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
          <div className="aspect-square relative overflow-hidden bg-gray-50">
            {currentDisplayImage ? (
              <Image
                src={currentDisplayImage}
                alt={image?.altText || product.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No image</span>
              </div>
            )}
            
            {/* Customization Badge */}
            {_hasHydrated && getCustomization(product.id) && (
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                <Star className="h-3 w-3 inline mr-1" />
                Custom
              </div>
            )}
            
            {/* Hover Overlay with Buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleViewProduct}
                  className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg font-medium"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                
                {canCustomize && (
                  <Button
                    size="sm"
                    onClick={handleCustomizeClick}
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg font-medium"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight">
              {product.title}
            </h3>
            <p className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currencyCode,
              }).format(parseFloat(price.amount))}
            </p>
            
            {/* Action Buttons for Mobile */}
            <div className="mt-4 flex gap-2 sm:hidden">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewProduct}
                className="flex-1 font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              
              {canCustomize && (
                <Button
                  size="sm"
                  onClick={handleCustomizeClick}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {isCustomizationModalOpen && frameImageUrl && (
        <ImageCustomizationModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          product={product}
          frameImageUrl={frameImageUrl}
        />
      )}
    </>
  );
}