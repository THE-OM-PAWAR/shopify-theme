'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { getProducts } from '@/lib/shopify';
import { ShopifyProduct } from '@/types/shopify';

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('default');

  // Mock products for demo
  const mockProducts: ShopifyProduct[] = [
    {
      id: 'gid://shopify/Product/1',
      title: 'Classic Wood Frame - 8x10',
      description: 'Beautiful handcrafted wooden frame perfect for your favorite photos',
      handle: 'classic-wood-frame-8x10',
      images: [{
        id: '1',
        url: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=500',
        altText: 'Classic Wood Frame',
        width: 500,
        height: 500,
      }],
      variants: [{
        id: 'gid://shopify/ProductVariant/1',
        title: '8x10',
        price: { amount: '29.99', currencyCode: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '8x10' }],
      }],
      tags: ['wood', 'classic', 'natural'],
      productType: 'Frame',
      vendor: 'FrameCraft',
      priceRange: {
        minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
        maxVariantPrice: { amount: '29.99', currencyCode: 'USD' },
      },
    },
    {
      id: 'gid://shopify/Product/2',
      title: 'Modern Black Frame - 12x16',
      description: 'Sleek modern frame with clean lines, perfect for contemporary spaces',
      handle: 'modern-black-frame-12x16',
      images: [{
        id: '2',
        url: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=500',
        altText: 'Modern Black Frame',
        width: 500,
        height: 500,
      }],
      variants: [{
        id: 'gid://shopify/ProductVariant/2',
        title: '12x16',
        price: { amount: '39.99', currencyCode: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '12x16' }],
      }],
      tags: ['modern', 'black', 'minimalist'],
      productType: 'Frame',
      vendor: 'FrameCraft',
      priceRange: {
        minVariantPrice: { amount: '39.99', currencyCode: 'USD' },
        maxVariantPrice: { amount: '39.99', currencyCode: 'USD' },
      },
    },
    {
      id: 'gid://shopify/Product/3',
      title: 'Vintage Gold Frame - 11x14',
      description: 'Ornate vintage-style frame with gold finish, perfect for special occasions',
      handle: 'vintage-gold-frame-11x14',
      images: [{
        id: '3',
        url: 'https://images.pexels.com/photos/1070946/pexels-photo-1070946.jpeg?auto=compress&cs=tinysrgb&w=500',
        altText: 'Vintage Gold Frame',
        width: 500,
        height: 500,
      }],
      variants: [{
        id: 'gid://shopify/ProductVariant/3',
        title: '11x14',
        price: { amount: '54.99', currencyCode: 'USD' },
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '11x14' }],
      }],
      tags: ['vintage', 'gold', 'ornate'],
      productType: 'Frame',
      vendor: 'FrameCraft',
      priceRange: {
        minVariantPrice: { amount: '54.99', currencyCode: 'USD' },
        maxVariantPrice: { amount: '54.99', currencyCode: 'USD' },
      },
    },
  ];

  useEffect(() => {
    // In a real app, fetch from Shopify
    // getProducts().then(data => setProducts(data.products.edges.map(edge => edge.node)));
    
    // For demo, use mock data
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products; // In real app, apply filters here

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A-Z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Photo Frames</h1>
          <p className="text-gray-600 mt-2">
            Discover our collection of premium photo frames
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${filteredProducts.length} products`}
              </p>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}