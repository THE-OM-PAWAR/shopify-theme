'use client';

import { useState, useRef, useEffect } from 'react';
import { ShopifyCollection } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollectionSliderProps {
  collections: ShopifyCollection[];
}

export default function CollectionSlider({ collections }: CollectionSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  
  // Touch/swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Responsive items per view
  const [itemsPerView, setItemsPerView] = useState(3);
  const maxIndex = Math.max(0, collections.length - itemsPerView);

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(2); // Mobile: 2 items per view
      } else if (window.innerWidth < 1024) {
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
    if (isAutoPlaying && collections.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, collections.length, itemsPerView]);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    setIsAutoPlaying(false);
    
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
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

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No collections available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Slider Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          ref={sliderRef}
          className="flex transition-transform duration-500 ease-in-out mb-20 cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className={`flex-shrink-0 px-1 sm:px-2 ${
                itemsPerView === 2 ? 'w-1/2' : 
                itemsPerView === 3 ? 'w-1/3' : 'w-1/4'
              }`}
            >
              <Link
                href={`/collections/${collection.handle}`}
                className="group block relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Collection Image */}
                <div className="aspect-square sm:aspect-[4/3] relative overflow-hidden">
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg font-medium">
                        {collection.title}
                      </span>
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Hover Content */}
                  <div className="absolute inset-0 flex items-end p-3 sm:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-white">
                      <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                        {collection.products.edges.length} Products
                      </p>
                      <Button
                        size="sm"
                        className="bg-white text-black hover:bg-gray-100 text-xs sm:text-sm h-6 sm:h-8 px-2 sm:px-3"
                      >
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Collection Info */}
                <div className="p-3 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {collection.products.edges.length} items
                    </span>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300 flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </div>

                {/* Slide Shadow Effect */}
                <div className="absolute inset-0 rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300 pointer-events-none" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile */}
      {collections.length > itemsPerView && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg h-10 w-10 p-0"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg h-10 w-10 p-0"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {collections.length > itemsPerView && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
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
  );
}