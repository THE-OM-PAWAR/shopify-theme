'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { shopifyFetch } from '@/lib/shopify';
import { PRODUCT_QUERY } from '@/lib/queries';
import { ShopifyProduct, ShopifyProductVariant } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import ProductImages from '@/components/product/ProductImages';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await shopifyFetch({
          query: PRODUCT_QUERY,
          variables: { handle: params.handle },
        });

        if (response.data?.product) {
          const productData = response.data.product;
          setProduct(productData);
          
          // Set default variant
          const firstVariant = productData.variants.edges[0]?.node;
          if (firstVariant) {
            setSelectedVariant(firstVariant);
            // Set default selected options
            const defaultOptions: Record<string, string> = {};
            firstVariant.selectedOptions.forEach(option => {
              defaultOptions[option.name] = option.value;
            });
            setSelectedOptions(defaultOptions);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    if (params.handle) {
      fetchProduct();
    }
  }, [params.handle]);

  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newSelectedOptions);

    // Find the variant that matches the selected options
    const matchingVariant = product?.variants.edges.find(({ node: variant }) =>
      variant.selectedOptions.every(option =>
        newSelectedOptions[option.name] === option.value
      )
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant.node);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !product) return;

    const cartItem = {
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      price: selectedVariant.price.amount,
      currencyCode: selectedVariant.price.currencyCode,
      image: selectedVariant.image?.url || product.images.edges[0]?.node.url || null,
      quantity: quantity,
      maxQuantity: 10, // Default max quantity
    };

    addItem(cartItem);
    openCart();
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner className="py-16" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product not found'}
          </h1>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images.edges.map(edge => edge.node);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <ProductImages images={images} productTitle={product.title} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
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
          {product.options && product.options.map((option) => (
            <div key={option.id}>
              <h3 className="font-medium text-gray-900 mb-2">{option.name}</h3>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedOptions[option.name] === value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
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
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!selectedVariant?.availableForSale}
          >
            {selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
          </Button>

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