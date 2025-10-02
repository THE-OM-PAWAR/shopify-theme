'use client';

import { useState, useEffect } from 'react';
import { ShopifyProduct, ShopifyProductVariant } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import { useCustomizationStore } from '@/lib/customization-store';
import ProductImages from '@/components/product/ProductImages';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import TestimonialSection from '../home/TestimonialSection';

interface ProductClientProps {
  product: ShopifyProduct;
}

export default function ProductClient({ product }: ProductClientProps) {
  const { getCustomization, _hasHydrated } = useCustomizationStore();
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant | null>(null);
  const [hydratedCustomizedImages, setHydratedCustomizedImages] = useState<any[]>([]);
  const [customizationData, setCustomizationData] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaultOptions: Record<string, string> = {};
    const firstVariant = product.variants.edges[0]?.node;
    if (firstVariant) {
      firstVariant.selectedOptions.forEach(option => {
        defaultOptions[option.name] = option.value;
      });
    }
    return defaultOptions;
  });
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart, openCart } = useCartStore();

  // Initialize selected variant on component mount
  useState(() => {
    if (product.variants.edges.length > 0) {
      setSelectedVariant(product.variants.edges[0].node);
    }
  });

  // Update customized images after hydration
  useEffect(() => {
    if (_hasHydrated) {
      const customization = getCustomization(product.id);
      setCustomizationData(customization);
      // Don't show customized images in the main product display
      const customizedImages: any[] = [];
      setHydratedCustomizedImages(customizedImages);
    }
  }, [_hasHydrated, product.id, product.title, getCustomization]);

  // Collect variant images to exclude them from the main product gallery
  const variantImages = product.variants.edges
    .map(edge => edge.node.image)
    .filter(Boolean) as Array<{ id?: string; url?: string }>;

  const variantImageIdSet = new Set(
    variantImages.map(img => img.id).filter(Boolean) as string[]
  );
  const variantImageUrlSet = new Set(
    variantImages.map(img => img.url).filter(Boolean) as string[]
  );

  // Combine customized images with product images, excluding variant images
  const productImagesExcludingVariants = product.images.edges
    .map(edge => edge.node)
    .filter(img => {
      const matchesById = img.id ? variantImageIdSet.has(img.id) : false;
      const matchesByUrl = (img as any).url ? variantImageUrlSet.has((img as any).url) : false;
      return !(matchesById || matchesByUrl);
    });

  const allImages = [
    ...hydratedCustomizedImages,
    ...productImagesExcludingVariants
  ];
  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newSelectedOptions);

    // Find the variant that matches the selected options
    const matchingVariant = product.variants.edges.find(({ node: variant }) =>
      variant.selectedOptions.length === Object.keys(newSelectedOptions).length &&
      variant.selectedOptions.every(option =>
        newSelectedOptions[option.name] === option.value
      ) &&
      Object.keys(newSelectedOptions).every(optionName =>
        variant.selectedOptions.some(option =>
          option.name === optionName && option.value === newSelectedOptions[optionName]
        )
      )
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant.node);
      console.log('Selected variant changed:', {
        variantId: matchingVariant.node.id,
        title: matchingVariant.node.title,
        options: matchingVariant.node.selectedOptions,
        availableForSale: matchingVariant.node.availableForSale
      });
    } else {
      console.warn('No matching variant found for options:', newSelectedOptions);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isAddingToCart) {
      console.log('Cannot add to cart:', { selectedVariant: !!selectedVariant, isAddingToCart });
      return;
    }

    if (!selectedVariant.availableForSale) {
      toast.error('This variant is out of stock', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    console.log('Adding to cart:', {
      variantId: selectedVariant.id,
      quantity,
      productTitle: product.title,
      variantTitle: selectedVariant.title
    });

    setIsAddingToCart(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`, {
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

      // Open cart drawer after successful add
      setTimeout(() => {
        openCart();
      }, 500);

    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart. Please try again.', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || isAddingToCart) {
      return;
    }

    if (!selectedVariant.availableForSale) {
      toast.error('This variant is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      // Add to cart first
      await addToCart(selectedVariant.id, quantity);

      // Redirect to checkout immediately
      window.location.href = '/checkout';

    } catch (error) {
      console.error('Buy now error:', error);
      toast.error('Failed to process. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <ProductImages
            images={allImages}
            productTitle={product.title}
            productId={product.id}
            selectedVariant={selectedVariant || undefined}
            allVariants={product.variants.edges.map(edge => edge.node)}
            metafields={product.metafields}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            {customizationData && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Customized Product
                </span>
              </div>
            )}
            {selectedVariant && (
              <p className="text-2xl font-semibold text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: selectedVariant.price.currencyCode,
                }).format(parseFloat(selectedVariant.price.amount))}
              </p>
            )}
          </div>

          {/* Variant Options */}
          {product.options && product.options.length > 0 && product.options.filter(option => option.values.length > 1).map((option) => (
            <div key={option.id}>
              <h3 className="font-medium text-gray-900 mb-2">{option.name}</h3>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    className={`px-4 py-2 border rounded-md transition-colors text-sm font-medium ${selectedOptions[option.name] === value
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-gray-400 bg-white text-gray-900'
                      }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity Selector */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="px-4 py-2 border rounded-md min-w-[60px] text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          <div className="prose max-w-none mt-6">
            <style jsx>{`
              .clamp-3-lines {
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                transition: max-height 0.2s;
              }
              .expanded {
                -webkit-line-clamp: unset;
                max-height: none;
                overflow: visible;
              }
            `}</style>
            {(() => {
              const [expanded, setExpanded] = useState(false);
              return (
                <>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p
                    className={`text-gray-600 clamp-3-lines${expanded ? ' expanded' : ''}`}
                  >
                    {product.description}
                  </p>
                  {product.description && (
                    <button
                      type="button"
                      className="mt-2 text-blue-600 hover:underline text-sm font-medium focus:outline-none"
                      onClick={() => setExpanded((prev) => !prev)}
                    >
                      {expanded ? 'View less' : 'View more'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
          {/* Add to Cart */}
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={!selectedVariant || !selectedVariant.availableForSale || isAddingToCart}
              size="lg"
            >
              {isAddingToCart
                ? 'Adding to Cart...'
                : selectedVariant && selectedVariant.availableForSale
                  ? 'Add to Cart'
                  : 'Out of Stock'
              }
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleBuyNow}
              disabled={!selectedVariant || !selectedVariant.availableForSale || isAddingToCart}
              size="lg"
            >
              Buy Now
            </Button>
          </div>


          {/* Additional Info */}
          <div className="border-t pt-6 space-y-4 text-sm text-gray-600">
            <p>• Free shipping on orders over $50</p>
            <p>• 30-day return policy</p>
            <p>• Secure checkout with SSL encryption</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <TestimonialSection />
      </div>

      {/* Recommended Products */}
      <RecommendedProducts
        currentProductId={product.id}
        currentProductTitle={product.title}
      />
    </div>
  );
}