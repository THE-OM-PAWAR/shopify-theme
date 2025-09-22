'use client';

import { ShopifyCollection } from '@/lib/types';
import ProductSlider from '@/components/product/ProductSlider';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import CollectionSlider from '../collection/CollectionSlider';

interface FeaturedSectionProps {
  collections: ShopifyCollection[];
}

export default function FeaturedSection({ collections }: FeaturedSectionProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    

        {/* Collections */}
        <div className="space-y-24">
          {collections.map((collection, index) => {
            const products = collection.products.edges.map(edge => edge.node);
            
            return (
              <div key={collection.id} className="space-y-12">
                {/* Collection Header */}
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
                      {collection.description}
                    </p>
                  )}
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/collections/${collection.handle}`} className="inline-flex items-center">
                      View All {collection.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                {/* Products Slider */}
                <ProductSlider products={products.slice(0, 8)} />
              </div>
            );
          })}
        </div>

        {/* View All Collections CTA */}
        <div className="text-center mt-20">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/collections" className="inline-flex items-center">
              Explore All Collections
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}