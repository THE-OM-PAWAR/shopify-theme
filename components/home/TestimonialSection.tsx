'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Interior Designer",
    location: "New York",
    rating: 5,
    content: "The quality of these products is absolutely exceptional. I've been using them in my client projects for months and they never fail to impress. The attention to detail is remarkable.",
    avatar: "/testimonials/sarah.jpg"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Home Decor Enthusiast",
    location: "California",
    rating: 5,
    content: "I've purchased several items from this collection and each one has exceeded my expectations. The craftsmanship is outstanding and the customer service is top-notch.",
    avatar: "/testimonials/michael.jpg"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Lifestyle Blogger",
    location: "Texas",
    rating: 5,
    content: "These products have completely transformed my living space. The design is modern yet timeless, and the quality is something you can feel. Highly recommended!",
    avatar: "/testimonials/emily.jpg"
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Architect",
    location: "Chicago",
    rating: 5,
    content: "As an architect, I appreciate both form and function. These products deliver on both fronts beautifully. They're now a staple in my design recommendations.",
    avatar: "/testimonials/david.jpg"
  },
  {
    id: 5,
    name: "Lisa Park",
    role: "Furniture Store Owner",
    location: "Seattle",
    rating: 5,
    content: "I've been in the furniture business for 15 years, and I can confidently say these are some of the finest products I've seen. My customers love them!",
    avatar: "/testimonials/lisa.jpg"
  }
];

export default function TestimonialSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what real customers have to say about their experience with our products.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative">
          {/* Main Testimonial */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 text-gray-100">
              <Quote className="h-16 w-16" />
            </div>

            <div className="relative z-10">
              {/* Rating */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-1">
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
              </div>

              {/* Content */}
              <blockquote className="text-lg md:text-xl text-gray-700 text-center mb-8 leading-relaxed max-w-4xl mx-auto">
                "{testimonials[currentTestimonial].content}"
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-semibold text-lg hidden">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-gray-600 mb-1">
                    {testimonials[currentTestimonial].role}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonials[currentTestimonial].location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-gray-900 p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-gray-900 p-3 rounded-full transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? 'bg-gray-900 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              10K+
            </div>
            <div className="text-gray-600">
              Happy Customers
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              4.9/5
            </div>
            <div className="text-gray-600">
              Average Rating
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              99%
            </div>
            <div className="text-gray-600">
              Would Recommend
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
