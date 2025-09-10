import { shopifyFetchServer } from '@/lib/shopify-server';
import { COLLECTION_PRODUCTS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection not found</h1>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const products = collection.products.edges.map(edge => edge.node);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Collection Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{collection.title}</h1>
        {collection.description && (
          <p className="text-gray-600 max-w-2xl mx-auto">{collection.description}</p>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid products={products} />
    </div>
  );
}