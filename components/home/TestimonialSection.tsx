'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Neha Sharma",
    role: "Interior Designer",
    location: "Pune",
    rating: 5,
    content:
      "I ordered the Portrait Acrylic Photo Frame for my living room, and it has really transformed the space. The clarity of the acrylic, the finish, everything feels premium. Delivery was faster than expected, and it came very well packed. Very happy with the buy!",
    avatar: "/testimonials/neha.jpg",
  },
  {
    id: 2,
    name: "Rahul Verma",
    role: "Entrepreneur",
    location: "Jaipur",
    rating: 5,
    content:
      "Bought a Custom Nameplate from this store as a gift for my parents’ house. The craftsmanship is top-notch, the edges are smooth, and the inscription turned out exactly as I wanted. Would definitely recommend to anyone looking for stylish yet affordable home decor.",
    avatar: "/testimonials/rahul.jpg",
  },
  {
    id: 3,
    name: "Pooja Reddy",
    role: "Software Engineer",
    location: "Hyderabad",
    rating: 4,
    content:
      "The wall clock I got here is more than just functional — it’s a piece of art. The acrylic sheen, the design proportions, it all looks very modern. Also, customer service helped me choose the right size. Totally satisfied.",
    avatar: "/testimonials/pooja.jpg",
  },
  {
    id: 4,
    name: "Karan Singh",
    role: "Cafe Owner",
    location: "Delhi",
    rating: 5,
    content:
      "I ordered the photo gallery set for my cafe’s wall, and it’s become a conversation starter among customers. Colours are vivid, the mounting is sturdy, everything aligns well. Worth every rupee!",
    avatar: "/testimonials/karan.jpg",
  },
  {
    id: 5,
    name: "Aisha Khan",
    role: "Marketing Manager",
    location: "Bengaluru",
    rating: 4,
    content:
      "Excellent quality and attention to detail. The custom nameplate I bought didn’t just arrive exactly as shown in pictures, but even better. Had a small issue with shipping, but support resolved it quickly. Great overall experience.",
    avatar: "/testimonials/aisha.jpg",
  },
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
