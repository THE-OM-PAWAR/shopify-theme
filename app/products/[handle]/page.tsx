import { shopifyFetchServer } from '@/lib/shopify-server';
import { PRODUCT_QUERY, ALL_PRODUCTS_HANDLES_QUERY } from '@/lib/queries';
import { ShopifyProduct } from '@/lib/types';
import ProductClient from '@/components/product/ProductClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateStaticParams() {
  try {
    const response = await shopifyFetchServer({
      query: ALL_PRODUCTS_HANDLES_QUERY,
      variables: { first: 250 },
    });
    
    const products = response.data?.products?.edges || [];
    return products.map((edge: any) => ({
      handle: edge.node.handle,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

async function getProduct(handle: string) {
  try {
    const response = await shopifyFetchServer({
      query: PRODUCT_QUERY,
      variables: { handle },
    });
    return response.data?.product || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const product: ShopifyProduct | null = await getProduct(params.handle);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ProductClient product={product} />;
}