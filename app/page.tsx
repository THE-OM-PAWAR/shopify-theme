import { shopifyFetchServer } from '@/lib/shopify-server';
import { FEATURED_COLLECTIONS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import CollectionSlider from '@/components/collection/CollectionSlider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

async function getFeaturedCollections() {
  try {
    const response = await shopifyFetchServer({
      query: FEATURED_COLLECTIONS_QUERY,
      variables: { first: 3 },
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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Premium Quality, Exceptional Style
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover our curated collection of products designed to enhance your lifestyle
            </p>
            <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/collections">Shop Collections</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Shop by Collection Section */}
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

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Collections</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked collections featuring the latest trends and timeless classics
          </p>
        </div>

        <div className="space-y-16">
          {collections.map((collection) => {
            const products = collection.products.edges.map(edge => edge.node);
            
            return (
              <div key={collection.id} className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{collection.title}</h3>
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                  <Button asChild variant="outline">
                    <Link href={`/collections/${collection.handle}`}>
                      View All {collection.title}
                    </Link>
                  </Button>
                </div>
                
                <ProductGrid products={products} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay in the Loop</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to get special offers, free giveaways, and updates on new products
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <Button className="px-6">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}