import { shopifyFetchServer } from '@/lib/shopify-server';
import { FEATURED_COLLECTIONS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import CollectionSlider from '@/components/collection/CollectionSlider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Shield, Truck, RefreshCw } from 'lucide-react';

async function getFeaturedCollections() {
  try {
    const response = await shopifyFetchServer({
      query: FEATURED_COLLECTIONS_QUERY,
      variables: { first: 6 },
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
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f1f5f9" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-8">
              <Star className="h-4 w-4 mr-2" />
              Premium Quality Products
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Crafted for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Excellence
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover our curated collection of premium products designed to enhance your lifestyle with exceptional quality and timeless style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg">
                <Link href="/collections">
                  Explore Collections
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-gray-300">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Shipping</h3>
            <p className="text-gray-600 leading-relaxed">
              Complimentary shipping on all orders over $50. Fast, reliable delivery worldwide.
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Guarantee</h3>
            <p className="text-gray-600 leading-relaxed">
              30-day money-back guarantee. We stand behind the quality of every product.
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors">
              <RefreshCw className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Returns</h3>
            <p className="text-gray-600 leading-relaxed">
              Hassle-free returns and exchanges. Customer satisfaction is our priority.
            </p>
          </div>
        </div>
      </section>

      {/* Collections Slider Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Shop by Collection
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our carefully curated collections, each designed to bring you the finest products with exceptional craftsmanship.
          </p>
        </div>
        
        <CollectionSlider collections={collections} />
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-gray-300">
            <Link href="/collections" className="inline-flex items-center">
              View All Collections
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked selection of premium products, featuring the latest trends and timeless classics.
            </p>
          </div>

          <div className="space-y-20">
            {collections.slice(0, 3).map((collection) => {
              const products = collection.products.edges.map(edge => edge.node);
              
              return (
                <div key={collection.id} className="space-y-12">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{collection.title}</h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                      {collection.description}
                    </p>
                    <Button asChild variant="outline" size="lg" className="px-6 py-3">
                      <Link href={`/collections/${collection.handle}`}>
                        View All {collection.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  
                  <ProductGrid products={products.slice(0, 8)} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Stay in the Loop
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Subscribe to get special offers, free giveaways, and updates on new products. Join our community of style enthusiasts.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
                <Button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-lg font-semibold">
                  Subscribe
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                No spam, unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}