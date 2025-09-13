/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Add font optimization settings to handle font loading issues
  optimizeFonts: true,
  // Add experimental features for better error handling
  experimental: {
    // Improve font loading reliability
    fontLoaders: [
      {
        loader: '@next/font/google',
        options: {
          subsets: ['latin'],
          display: 'swap',
          fallback: ['system-ui', 'arial'],
        },
      },
    ],
  },
  // Add timeout configurations
  serverRuntimeConfig: {
    // Increase timeout for API routes
    maxDuration: 30,
  },
};

module.exports = nextConfig;