import { Metadata } from 'next';
import FAQSection from '@/components/faq/FAQSection';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Custom Acrylic Frames',
  description: 'Find answers to common questions about our custom acrylic frames, ordering process, shipping, and more.',
  keywords: 'FAQ, acrylic frames, custom frames, questions, help, support',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our custom acrylic frames, ordering process, and more.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find what you're looking for? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@yourstore.com"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
