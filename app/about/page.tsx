import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Our Store</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We're passionate about bringing you the finest products with exceptional quality and service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            To provide our customers with carefully curated, high-quality products that enhance their daily lives. 
            We believe in the power of exceptional craftsmanship and thoughtful design.
          </p>
          <p className="text-gray-600">
            Every product in our collection is selected with care, ensuring that it meets our high standards 
            for quality, functionality, and style.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Premium quality products from trusted brands
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Fast and reliable shipping worldwide
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
              30-day hassle-free return policy
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Dedicated customer support team
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Secure checkout and payment processing
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <p className="text-gray-600 mb-6">
          Have questions about our products or need assistance? We're here to help!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/collections">Shop Collections</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}