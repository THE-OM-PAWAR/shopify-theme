'use client';

import { useState, useEffect } from 'react';
import { ShopifyProduct } from '@/lib/types';
import { shopifyFetchClient } from '@/lib/shopify-client';
import { ALL_PRODUCTS_QUERY } from '@/lib/queries';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendedProductsProps {
  currentProductId: string;
  currentProductTitle: string;
}

export default function RecommendedProducts({ currentProductId, currentProductTitle }: RecommendedProductsProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const response = await shopifyFetchClient({
          query: ALL_PRODUCTS_QUERY,
          variables: { first: 20 }
        });

        if (response.data?.products?.edges) {
          const allProducts = response.data.products.edges.map((edge: any) => edge.node);
          // Filter out current product and get random selection
          const filteredProducts = allProducts
            .filter((product: ShopifyProduct) => product.id !== currentProductId)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8); // Show 8 recommended products
          
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [currentProductId]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, products.length - 3)) % Math.max(1, products.length - 3));
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            You Might Also Like
          </h2>
          <p className="text-lg text-gray-600">
            Discover more beautiful acrylic frames
          </p>
        </div>

        {/* Desktop: Slider with navigation */}
        <div className="hidden md:block">
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / 4)}%)`,
                }}
              >
                {products.map((product) => (
                  <div key={product.id} className="w-1/4 flex-shrink-0 px-3">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {products.length > 4 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg h-10 w-10 p-0"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg h-10 w-10 p-0"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile: Simple horizontal scroll */}
        <div className="md:hidden">
          <div
            className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{
                  width: '66.666vw', // 1.5 cards per row
                  maxWidth: '280px',
                  minWidth: '200px',
                  scrollSnapAlign: 'start',
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <style jsx global>{`
            .scrollbar-hide {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        {/* View All Products CTA */}
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8"
          >
            <a href="/products">
              View All Products
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
