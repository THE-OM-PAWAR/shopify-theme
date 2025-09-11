'use client';

import { useState } from 'react';
import { ShopifyProduct, ShopifyProductVariant } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import { useCustomizationStore } from '@/lib/customization-store';
import ProductImages from '@/components/product/ProductImages';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface ProductClientProps {
  product: ShopifyProduct;
}

export default function ProductClient({ product }: ProductClientProps) {
  const { getCustomization } = useCustomizationStore();
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant | null>(null);
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

  // Get customized images
  const customization = getCustomization(product.id);
  const customizedImages = customization ? [{
    id: 'customized',
    url: customization.renderedImageUrl,
    altText: `Customized ${product.title}`,
    width: 400,
    height: 600
  }] : [];

  // Combine customized images with product images
  const allImages = [
    ...customizedImages,
    ...product.images.edges.map(edge => edge.node)
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


  // Debug logging
  console.log('Product:', product.title);
  console.log('Selected variant:', selectedVariant);
  console.log('Available for sale:', selectedVariant?.availableForSale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <ProductImages images={allImages} productTitle={product.title} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            {customization && (
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

          <div className="prose max-w-none">
            <p className="text-gray-600">{product.description}</p>
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
                    className={`px-4 py-2 border rounded-md transition-colors text-sm font-medium ${
                      selectedOptions[option.name] === value
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

          {/* Debug Info (remove in production) */}
          {process.env.NODE_ENV === 'development' && selectedVariant && (
            <div className="bg-gray-100 p-4 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Variant ID: {selectedVariant.id}</p>
              <p>Variant Title: {selectedVariant.title}</p>
              <p>Available: {selectedVariant.availableForSale ? 'Yes' : 'No'}</p>
              <p>Price: {selectedVariant.price.amount} {selectedVariant.price.currencyCode}</p>
              <p>Selected Options: {JSON.stringify(selectedOptions)}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="border-t pt-6 space-y-4 text-sm text-gray-600">
            <p>• Free shipping on orders over $50</p>
            <p>• 30-day return policy</p>
            <p>• Secure checkout with SSL encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}