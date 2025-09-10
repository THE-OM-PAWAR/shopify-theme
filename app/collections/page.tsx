import { shopifyFetchServer } from '@/lib/shopify-server';
import { FEATURED_COLLECTIONS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

async function getCollections() {
  try {
    const response = await shopifyFetchServer({
      query: FEATURED_COLLECTIONS_QUERY,
      variables: { first: 10 },
    });
    return response.data?.collections?.edges || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collectionsData = await getCollections();
  const collections: ShopifyCollection[] = collectionsData.map((edge: any) => edge.node);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">All Collections</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our curated collections of premium products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                {collection.title}
              </h3>
              {collection.description && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {collection.products.edges.length} products
                </span>
                <Button variant="outline" size="sm">
                  View Collection
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}