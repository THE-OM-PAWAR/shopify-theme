'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    title: "Premium Quality Products",
    subtitle: "Discover Excellence",
    description: "Curated collection of premium products designed to enhance your lifestyle with unmatched quality and style.",
    cta: "Shop Now",
    href: "/collections",
    image: "/banners/hero-1.webp",
    fallbackBackground: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
  },
  {
    id: 2,
    title: "Crafted with Precision",
    subtitle: "Artisan Collection",
    description: "Each piece is meticulously crafted by skilled artisans, bringing you products that stand the test of time.",
    cta: "Explore",
    href: "/collections",
    image: "/banners/hero-2.jpg",
    fallbackBackground: "bg-gradient-to-br from-gray-900 via-gray-800 to-black"
  },
  {
    id: 3,
    title: "Modern Design Meets Function",
    subtitle: "Contemporary Living",
    description: "Where innovative design meets practical functionality, creating products that elevate your everyday experience.",
    cta: "Discover",
    href: "/collections",
    image: "/banners/hero-3.jpg",
    fallbackBackground: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

  const handleImageError = (slideId: number) => {
    setImageLoadErrors(prev => new Set(prev).add(slideId));
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            } ${imageLoadErrors.has(slide.id) ? slide.fallbackBackground : ''}`}
          >
            {/* Background Image */}
            {!imageLoadErrors.has(slide.id) && (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`
                }}
              />
            )}
            
            {/* Hidden img for error detection */}
            <img
              src={slide.image}
              alt=""
              className="hidden"
              onError={() => handleImageError(slide.id)}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />
            
            <div className="relative h-full flex items-center justify-center">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <div className={`transition-all duration-1000 delay-300 ${
                  index === currentSlide 
                    ? 'opacity-100' 
                    : 'opacity-0'
                }`}>
                  <p className="text-sm font-medium tracking-wider uppercase mb-4 text-white/80">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90 leading-relaxed">
                    {slide.description}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
                  >
                    <Link
                      href={slide.href}
                    >
                      {slide.cta}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-5000 ease-linear"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>
      )}
    </section>
  );
}