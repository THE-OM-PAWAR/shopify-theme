import { shopifyFetchServer } from '@/lib/shopify-server';
import { FEATURED_COLLECTIONS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import ProductSlider from '@/components/product/ProductSlider';
import HeroBanner from '@/components/home/HeroBanner';
import NewsletterSection from '@/components/home/NewsletterSection';
import TestimonialSection from '@/components/home/TestimonialSection';
import InstagramReelsSection from '@/components/home/InstagramReelsSection';
import CollectionSlider from '@/components/collection/CollectionSlider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

async function getFeaturedCollections() {
  try {
    const response = await shopifyFetchServer({
      query: FEATURED_COLLECTIONS_QUERY,
      variables: { first: 7 },
    });
    return response.data?.collections?.edges || [];
  } catch (error) {
    console.error('Error fetching featured collections:', error);
    return [];
  }
}

export default async function HomePage() {
  const collectionsData = await getFeaturedCollections();
  const collections: ShopifyCollection[] = collectionsData.map((edge: any) => edge.node);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated collections, each designed to bring you the finest products
          </p>
        </div>
        
        <CollectionSlider collections={collections} />

      </section>

      {/* Products by Collection */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {collections.map((collection, index) => {
              const products = collection.products.edges.map(edge => edge.node);
              
              return (
                <div key={collection.id}>
                  {/* Banner before collection (example) */}
                  {index === 1 && (
                    <div className="mb-16 relative overflow-hidden rounded-2xl">
                      <div className="relative h-[60vh] bg-gradient-to-br from-slate-100 to-slate-200">
                        {/* Background Image using simple img tag */}
                        <img
                          src="/banners/Your paragraph text_20250920_002024_0000 (1).png"
                          alt="Acrylic Frames Banner"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20"></div>
                        
                        {/* Content - bottom left small */}
                        <div className="absolute bottom-6 left-6 z-10">
                          <div className="text-left text-white bg-black/40 rounded-lg px-4 py-3 shadow-lg max-w-xs">
                            <h4 className="text-lg md:text-xl font-bold mb-1 tracking-wide">
                              ACRYLIC FRAME'S
                            </h4>
                            <p className="text-sm md:text-base font-light">
                              That bring smiles every time you pass by.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Collection Section */}
                  <div className="space-y-12">
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
                    </div>
                    
                    {/* Products Slider */}
                    <ProductSlider products={products} />
                  </div>
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

      {/* Testimonials */}
      <TestimonialSection />

      {/* Instagram Reels */}
      <InstagramReelsSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}