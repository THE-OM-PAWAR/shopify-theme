'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShopifyProduct } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '@/lib/customization-store';
import ImageCustomizationModal from '@/components/customization/ImageCustomizationModal';
import { Star, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [currentDisplayImage, setCurrentDisplayImage] = useState(product.images.edges[0]?.node?.url);
  const [isLiked, setIsLiked] = useState(false);
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

  // Clicking the card: if customizable, open customization; otherwise go to product page

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleCardClick = () => {
    if (canCustomize) {
      setIsCustomizationModalOpen(true);
    } else {
      window.location.href = `/products/${product.handle}`;
    }
  };

  return (
    <>
      <div className="group relative cursor-pointer" onClick={handleCardClick}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-500 transform hover:-translate-y-2">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-50">
            {currentDisplayImage ? (
              <Image
                src={currentDisplayImage}
                alt={image?.altText || product.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No image</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {_hasHydrated && getCustomization(product.id) && (
                <div className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Custom
                </div>
              )}
            </div>


            {/* Hover overlay removed to avoid covering card click and buttons */}
          </div>
          
          {/* Product Info */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight group-hover:text-gray-700 transition-colors">
              {product.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: price.currencyCode,
                }).format(parseFloat(price.amount))}
              </p>
              
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                In Stock
              </div>
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