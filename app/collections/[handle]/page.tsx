import { shopifyFetchServer } from '@/lib/shopify-server';
import { COLLECTION_PRODUCTS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getCollection(handle: string) {
  try {
    const response = await shopifyFetchServer({
      query: COLLECTION_PRODUCTS_QUERY,
      variables: { handle, first: 24 },
    });
    return response.data?.collection || null;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export default async function CollectionPage({ params }: { params: { handle: string } }) {
  const collection: ShopifyCollection | null = await getCollection(params.handle);

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-gray-400 text-2xl">❓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <p className="text-gray-600 mb-8">
            The collection you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/collections" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const products = collection.products.edges.map(edge => edge.node);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/collections" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Link>
        </div>

        {/* Collection Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {collection.description}
            </p>
          )}
          <div className="mt-6">
            <span className="inline-flex items-center px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-400 text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-8">
              This collection doesn't have any products yet. Check back soon!
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/collections">
                Explore Other Collections
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}