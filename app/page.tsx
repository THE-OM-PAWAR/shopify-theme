import { shopifyFetchServer } from '@/lib/shopify-server';
import { FEATURED_COLLECTIONS_QUERY } from '@/lib/queries';
import { ShopifyCollection } from '@/lib/types';
import ProductGrid from '@/components/product/ProductGrid';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedSection from '@/components/home/FeaturedSection';
import NewsletterSection from '@/components/home/NewsletterSection';

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
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Featured Collections */}
      <FeaturedSection collections={collections} />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}