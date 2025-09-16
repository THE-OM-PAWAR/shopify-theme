'use client';

import { useState, useRef, useEffect } from 'react';
import { ShopifyCollection } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface CollectionSliderProps {
  collections: ShopifyCollection[];
}

export default function CollectionSlider({ collections }: CollectionSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const itemsPerView = 3;
  const maxIndex = Math.max(0, collections.length - itemsPerView);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && collections.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 5000);
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

  const nextSlide = () => {
    goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    goToSlide(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  };

  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No collections available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Slider Container */}
      <div className="relative overflow-hidden">
        <div
          ref={sliderRef}
          className="flex transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className="w-1/3 flex-shrink-0 px-3"
            >
              <Link
                href={`/collections/${collection.handle}`}
                className="group block relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Collection Image */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xl font-medium">
                        {collection.title}
                      </span>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Hover Content */}
                  <div className="absolute inset-0 flex items-end p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="text-white">
                      <p className="text-sm font-medium mb-3 text-white/90">
                        {collection.products.edges.length} Products
                      </p>
                      <Button
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg"
                      >
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Collection Info */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                      {collection.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 font-medium">
                      {collection.products.edges.length} items
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Shadow Effect */}
                <div className="absolute inset-0 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-500 pointer-events-none" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {collections.length > itemsPerView && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm hover:bg-white shadow-xl border-0 w-12 h-12 rounded-full"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm hover:bg-white shadow-xl border-0 w-12 h-12 rounded-full"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {collections.length > itemsPerView && (
        <div className="flex justify-center mt-12 space-x-3">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-gray-900 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isAutoPlaying && collections.length > itemsPerView && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-5000 ease-linear"
            style={{
              width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}