# FrameCraft - Photo Frame E-commerce Store

A complete Next.js 14 e-commerce website for a photo frame customization store with Shopify integration.

## Features

### 🛍️ E-commerce Functionality
- Product catalog with filtering and sorting
- Shopping cart with persistent storage
- Shopify Storefront API integration
- Dynamic product pages with variants
- Responsive design for all devices

### 🎨 Photo Customization
- Image upload with drag & drop
- Image cropping and resizing tool
- Real-time frame preview
- Custom frame creation workflow
- Save customized frames with orders

### 🏪 Store Pages
- Homepage with hero section and featured products
- Product listing page with filters
- Product detail pages with image gallery
- Cart and checkout integration
- User dashboard for order history
- About and Contact pages

### 🛠️ Technical Features
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- React Easy Crop for image editing
- Shopify Storefront API integration
- SEO optimized with metadata
- Server components for performance

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Shopify store with Storefront API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/framecraft.git
cd framecraft
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Shopify credentials:
```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Shopify Setup

### Storefront API Setup
1. Go to your Shopify Admin → Apps → Manage private apps
2. Create a private app with Storefront API access
3. Enable the following permissions:
   - Read products, variants, and collections
   - Read customer tags
   - Read and modify checkouts

### Required Product Setup
- Create products with multiple variants (sizes)
- Add product images
- Set up collections for categorization
- Configure product tags for filtering

## Project Structure

```
├── app/                  # Next.js app router pages
│   ├── products/         # Product listing and detail pages
│   ├── customize/        # Photo customization tool
│   ├── about/           # About page
│   ├── contact/         # Contact page
│   └── layout.tsx       # Root layout with metadata
├── components/          # React components
│   ├── layout/         # Header, footer, navigation
│   ├── products/       # Product grid, filters
│   ├── customization/  # Image upload, cropper
│   ├── cart/          # Shopping cart components
│   └── ui/            # Reusable UI components
├── lib/               # Utility functions
│   └── shopify.ts     # Shopify API client
├── store/             # Zustand state management
│   └── cart-store.ts  # Shopping cart state
└── types/             # TypeScript type definitions
    └── shopify.ts     # Shopify API types
```

## Customization

### Styling
- Built with Tailwind CSS
- Customize colors in `tailwind.config.ts`
- Component styles in individual component files
- Global styles in `app/globals.css`

### Branding
- Update logo and brand name in `components/layout/navbar.tsx`
- Modify hero section in `app/page.tsx`
- Change colors and fonts in Tailwind config
- Update metadata in `app/layout.tsx`

### Products
- Frame images should be high-quality product photos
- Use overlay images for frame customization preview
- Configure product variants for different sizes
- Set up proper product tags for filtering

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set the following environment variables in your hosting platform:
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`

### Recommended Hosting
- Vercel (optimal for Next.js)
- Netlify
- AWS Amplify
- Any platform supporting Next.js

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact us at hello@framecraft.com or create an issue in this repository.