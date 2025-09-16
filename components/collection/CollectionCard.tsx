'use client';

import { ShopifyCollection } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';

interface CollectionCardProps {
  collection: ShopifyCollection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const productCount = collection.products.edges.length;

  return (
    <Link
      href={`/collections/${collection.handle}`}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Collection Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {collection.image ? (
          <Image
            src={collection.image.url}
            alt={collection.image.altText || collection.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        
        {/* Hover Arrow */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight className="h-5 w-5 text-gray-900" />
        </div>
      </div>
      
      {/* Collection Info */}
      <div className="p-8">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </span>
          <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-gray-700">
            Explore
            <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}