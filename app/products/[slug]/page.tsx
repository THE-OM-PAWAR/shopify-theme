'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { ShopifyProduct } from '@/types/shopify';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  // Mock product data
  const mockProduct: ShopifyProduct = {
    id: 'gid://shopify/Product/1',
    title: 'Classic Wood Frame',
    description: `Crafted from premium hardwood, this classic frame brings warmth and elegance to any space. Each frame is carefully finished by hand to ensure the highest quality.

Features:
• Made from sustainably sourced hardwood
• Acid-free matting to preserve your photos
• Easy-to-use backing system
• Available in multiple sizes
• Includes hanging hardware

Perfect for displaying your favorite family photos, artwork, or certificates. The natural wood grain adds a timeless appeal that complements both traditional and modern decor.`,
    handle: 'classic-wood-frame',
    images: [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=800',
        altText: 'Classic Wood Frame - Front View',
        width: 800,
        height: 800,
      },
      {
        id: '2',
        url: 'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=800',
        altText: 'Classic Wood Frame - Side View',
        width: 800,
        height: 800,
      },
      {
        id: '3',
        url: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=800',
        altText: 'Classic Wood Frame - Detail',
        width: 800,
        height: 800,
      },
    ],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1',
        title: '5x7',
        price: { amount: '24.99', currencyCode: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '5x7' }],
      },
      {
        id: 'gid://shopify/ProductVariant/2',
        title: '8x10',
        price: { amount: '29.99', currencyCode: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '8x10' }],
      },
      {
        id: 'gid://shopify/ProductVariant/3',
        title: '11x14',
        price: { amount: '39.99', currencyCode: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '11x14' }],
      },
      {
        id: 'gid://shopify/ProductVariant/4',
        title: '16x20',
        price: { amount: '54.99', currencyCode: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '16x20' }],
      },
    ],
    tags: ['wood', 'classic', 'natural', 'handmade'],
    productType: 'Frame',
    vendor: 'FrameCraft',
    priceRange: {
      minVariantPrice: { amount: '24.99', currencyCode: 'USD' },
      maxVariantPrice: { amount: '54.99', currencyCode: 'USD' },
    },
  };

  useEffect(() => {
    // In real app, fetch product by slug
    setTimeout(() => {
      setProduct(mockProduct);
      setSelectedVariant(mockProduct.variants[1]); // Default to 8x10
      setLoading(false);
    }, 500);
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItem({
      id: `${selectedVariant.id}-${Date.now()}`,
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      price: parseFloat(selectedVariant.price.amount),
      quantity: 1,
      image: product.images[0]?.url,
      variant: selectedVariant.title,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images[selectedImage]?.url || product.images[0].url}
                alt={product.images[selectedImage]?.altText || product.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative overflow-hidden rounded border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText || `${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                ${selectedVariant ? parseFloat(selectedVariant.price.amount).toFixed(2) : 'N/A'}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-3 text-sm font-medium rounded-md border transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {variant.selectedOptions[0]?.value} - ${parseFloat(variant.price.amount).toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full"
                disabled={!selectedVariant || !selectedVariant.availableForSale}
              >
                Add to Cart - ${selectedVariant ? parseFloat(selectedVariant.price.amount).toFixed(2) : '0.00'}
              </Button>
              
              <Button variant="outline" size="lg" className="w-full" asChild>
                <a href="/customize">Customize This Frame</a>
              </Button>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <div className="prose prose-sm text-gray-600">
                {product.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}