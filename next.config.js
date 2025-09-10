/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  optimizeFonts: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['@shopify/storefront-kit-react']
  },
};

module.exports = nextConfig;
