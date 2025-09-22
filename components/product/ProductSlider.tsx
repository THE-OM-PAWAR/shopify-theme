'use client';

import { useState, useRef, useEffect } from 'react';
import { ShopifyProduct } from '@/lib/types';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSliderProps {
  products: ShopifyProduct[];
}

export default function ProductSlider({ products }: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  
  // Mouse drag functionality for desktop
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Responsive items per view
  const [itemsPerView, setItemsPerView] = useState(4);
  const maxIndex = Math.max(0, products.length - itemsPerView);

  // Update items per view based on screen size (desktop only)
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 1024) {
        setItemsPerView(3); // Tablet: 3 items per view
      } else {
        setItemsPerView(4); // Desktop: 4 items per view
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && products.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, products.length, itemsPerView]);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    setIsAutoPlaying(false);
    
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Mouse drag functionality for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      nextSlide();
    }
    if (isRightSwipe && currentIndex > 0) {
      prevSlide();
    }
    
    setIsDragging(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const nextSlide = () => {
    goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    goToSlide(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-gray-400 text-2xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
        <p className="text-gray-600">
          We couldn't find any products matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
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
                width: '66.666vw', // 1.5 cards per row (100vw / 1.5)
                maxWidth: '280px',
                minWidth: '200px',
                scrollSnapAlign: 'start',
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Slider with navigation */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-xl">
          <div
            ref={sliderRef}
            className="flex transition-transform duration-500 ease-in-out cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0 px-2"
                style={{
                  width: itemsPerView === 2 ? '50%' : 
                         itemsPerView === 3 ? '33.333%' : '25%'
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Desktop only */}
        {products.length > itemsPerView && (
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

        {/* Dots Indicator - Desktop only */}
        {products.length > itemsPerView && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-black scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        )}


      </div>

      {/* Global styles for scrollbar hiding */}
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
  );
}
