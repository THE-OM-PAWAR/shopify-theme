import { shopifyFetchServer } from '@/lib/shopify-server';
import { FEATURED_COLLECTIONS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedSection from '@/components/home/FeaturedSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import CollectionSlider from '@/components/collection/CollectionSlider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

async function getFeaturedCollections() {
  try {
    const response = await shopifyFetchServer({
      query: FEATURED_COLLECTIONS_QUERY,
      variables: { first: 5 },
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated collections, each designed to bring you the finest products
          </p>
        </div>
        
        <CollectionSlider collections={collections} />
        
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/collections" className="inline-flex items-center">
              View All Collections
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      <FeaturedSection collections={collections} />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}