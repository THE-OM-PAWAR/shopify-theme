import Link from 'next/link';
import Image from 'next/image';
import { ShopifyProduct } from '@/types/shopify';

interface ProductGridProps {
  products: ShopifyProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const image = product.images?.[0];
        const price = product.priceRange.minVariantPrice.amount;
        
        return (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group block"
          >
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {image && (
                  <Image
                    src={image.url}
                    alt={image.altText || product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  ${parseFloat(price).toFixed(2)}
                </p>
                
                {product.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}