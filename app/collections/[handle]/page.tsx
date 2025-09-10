'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { shopifyFetch } from '@/lib/shopify';
import { COLLECTION_PRODUCTS_QUERY } from '@/lib/queries';
import { ShopifyCollection, ShopifyProduct } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';

export default function CollectionPage() {
  const params = useParams();
  const [collection, setCollection] = useState<ShopifyCollection | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollection() {
      try {
        const response = await shopifyFetch({
          query: COLLECTION_PRODUCTS_QUERY,
          variables: { handle: params.handle, first: 12 },
        });

        if (response.data?.collection) {
          const collectionData = response.data.collection;
          setCollection(collectionData);
          
          const productsData = collectionData.products.edges.map((edge: any) => edge.node);
          setProducts(productsData);
          
          setHasNextPage(collectionData.products.pageInfo.hasNextPage);
          const lastEdge = collectionData.products.edges[collectionData.products.edges.length - 1];
          setEndCursor(lastEdge?.cursor || null);
        } else {
          setError('Collection not found');
        }
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    }

    if (params.handle) {
      fetchCollection();
    }
  }, [params.handle]);

  const loadMore = async () => {
    if (!hasNextPage || loadingMore) return;

    setLoadingMore(true);
    try {
      const response = await shopifyFetch({
        query: COLLECTION_PRODUCTS_QUERY,
        variables: { handle: params.handle, first: 12, after: endCursor },
      });

      if (response.data?.collection) {
        const newProducts = response.data.collection.products.edges.map((edge: any) => edge.node);
        setProducts(prev => [...prev, ...newProducts]);
        
        setHasNextPage(response.data.collection.products.pageInfo.hasNextPage);
        const lastEdge = response.data.collection.products.edges[response.data.collection.products.edges.length - 1];
        setEndCursor(lastEdge?.cursor || null);
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner className="py-16" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Collection not found'}
          </h1>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

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

      {/* Load More Button */}
      {hasNextPage && (
        <div className="text-center mt-12">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            size="lg"
          >
            {loadingMore ? 'Loading...' : 'Load More Products'}
          </Button>
        </div>
      )}
    </div>
  );
}