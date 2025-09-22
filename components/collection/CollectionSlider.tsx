import { ShopifyCollection } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CollectionSliderProps {
  collections: ShopifyCollection[];
}

export default function CollectionSlider({ collections }: CollectionSliderProps) {

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No collections available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Collections Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {collections.slice(0, 4).map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group block relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Collection Image */}
            <div className="aspect-square relative overflow-hidden">
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-lg font-medium">
                    {collection.title}
                  </span>
                </div>
              )}
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Hover Content */}
              <div className="absolute inset-0 flex items-end p-3 sm:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white">
                  <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                    {collection.products.edges.length} Products
                  </p>
                  <Button
                    size="sm"
                    className="bg-white text-black hover:bg-gray-100 text-xs sm:text-sm h-6 sm:h-8 px-2 sm:px-3"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="p-3 sm:p-6">

              <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-gray-700 transition-colors line-clamp-1">
                {collection.title}
              </h3>
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300 flex items-center justify-center">
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/collections" className="inline-flex items-center">
            View All Collections
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}