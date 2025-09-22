'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { shopifyFetchClient } from '@/lib/shopify-client';
import { SEARCH_PRODUCTS_QUERY } from '@/lib/queries';
import { ShopifyProduct } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await shopifyFetchClient({
        query: SEARCH_PRODUCTS_QUERY,
        variables: {
          query: searchQuery,
          first: 10
        }
      });

      if (response.data?.products?.edges) {
        const products = response.data.products.edges.map((edge: any) => edge.node);
        setResults(products);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center space-x-2 mb-4 mt-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-3 text-lg"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {!hasSearched && !query && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search for products</p>
            </div>
          )}

          {hasSearched && !isLoading && results.length === 0 && query && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No products found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-2">Try different keywords</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.handle}`}
                  onClick={onClose}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex-shrink-0 w-24 h-24 relative overflow-hidden rounded-lg bg-gray-100">
                    {product.images.edges[0]?.node ? (
                      <Image
                        src={product.images.edges[0].node.url}
                        alt={product.images.edges[0].node.altText || product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-2 px-2">
                    <h4 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                      {product.title}
                    </h4>
                    {product.description && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(
                          product.priceRange.minVariantPrice.amount,
                          product.priceRange.minVariantPrice.currencyCode
                        )}
                      </span>
                      {product.variants.edges[0]?.node && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.variants.edges[0].node.availableForSale
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.variants.edges[0].node.availableForSale ? 'In Stock' : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {query && (
          <div className="border-t pt-4 mt-4">
            <Button
              asChild
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              <Link href={`/products?search=${encodeURIComponent(query)}`}>
                View all results for "{query}"
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
