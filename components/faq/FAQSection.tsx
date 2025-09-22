'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FAQSearch from './FAQSearch';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Product Information
  {
    id: '1',
    question: 'What types of acrylic frames do you offer?',
    answer: 'We offer a wide variety of custom acrylic frames including photo frames, wall clocks, photo decors, and gallery sets. All frames are made from high-quality acrylic material and can be customized with your personal photos.',
    category: 'Product Information'
  },
  {
    id: '2',
    question: 'What sizes are available for acrylic frames?',
    answer: 'Our acrylic frames come in various sizes ranging from small 4x6 inch frames to large 24x36 inch displays. We also offer custom sizes upon request. Popular sizes include 8x10, 11x14, 16x20, and 20x24 inches.',
    category: 'Product Information'
  },
  {
    id: '3',
    question: 'What is the quality of the acrylic material?',
    answer: 'We use premium crystal-clear acrylic that is UV-resistant, shatterproof, and maintains its clarity for years. Our acrylic is 3-5mm thick depending on the frame size, ensuring durability and a professional appearance.',
    category: 'Product Information'
  },
  {
    id: '4',
    question: 'Can I customize the frame design?',
    answer: 'Yes! You can customize various aspects including frame color, thickness, mounting options, and even add personalized text or graphics. Our design tool allows you to preview your custom frame before ordering.',
    category: 'Product Information'
  },

  // Ordering Process
  {
    id: '5',
    question: 'How do I place an order?',
    answer: 'Ordering is simple! Choose your frame type, upload your photo, customize the design using our online tool, add to cart, and proceed to checkout. You can also contact us for custom orders or bulk purchases.',
    category: 'Ordering Process'
  },
  {
    id: '6',
    question: 'What file formats do you accept for photos?',
    answer: 'We accept all common image formats including JPEG, PNG, TIFF, and PDF. For best quality, we recommend high-resolution images (300 DPI or higher). Minimum resolution is 150 DPI for good print quality.',
    category: 'Ordering Process'
  },
  {
    id: '7',
    question: 'Can I preview my design before ordering?',
    answer: 'Absolutely! Our online design tool provides a real-time preview of your custom frame. You can see exactly how your photo will look in the frame, adjust sizing, and make changes before finalizing your order.',
    category: 'Ordering Process'
  },
  {
    id: '8',
    question: 'Do you offer bulk discounts?',
    answer: 'Yes, we offer attractive discounts for bulk orders. Contact our sales team for custom pricing on orders of 10+ frames. We also have special rates for businesses, events, and corporate orders.',
    category: 'Ordering Process'
  },

  // Shipping & Delivery
  {
    id: '9',
    question: 'How long does it take to process and ship my order?',
    answer: 'Standard processing time is 3-5 business days, plus shipping time. Express processing (1-2 days) is available for an additional fee. Shipping times vary by location: 2-5 business days for domestic orders, 7-14 days for international.',
    category: 'Shipping & Delivery'
  },
  {
    id: '10',
    question: 'What shipping methods do you offer?',
    answer: 'We offer standard ground shipping, expedited shipping (2-day), and overnight delivery. International shipping is available to most countries. All frames are carefully packaged to prevent damage during transit.',
    category: 'Shipping & Delivery'
  },
  {
    id: '11',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship worldwide! International shipping rates and delivery times vary by country. Please note that customers are responsible for any customs duties or taxes in their country.',
    category: 'Shipping & Delivery'
  },
  {
    id: '12',
    question: 'How are the frames packaged for shipping?',
    answer: 'Each frame is individually wrapped in protective material and placed in a sturdy shipping box with additional padding. We use bubble wrap and foam inserts to ensure your frames arrive in perfect condition.',
    category: 'Shipping & Delivery'
  },

  // Returns & Exchanges
  {
    id: '13',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unused items in original packaging. Custom frames with personal photos can be returned within 14 days if there\'s a manufacturing defect. Return shipping costs are the customer\'s responsibility unless the item is defective.',
    category: 'Returns & Exchanges'
  },
  {
    id: '14',
    question: 'Can I exchange my frame for a different size?',
    answer: 'Yes, we allow exchanges for different sizes within 30 days of purchase. The customer is responsible for return shipping costs. If the new frame costs more, you\'ll pay the difference; if it costs less, we\'ll provide a refund.',
    category: 'Returns & Exchanges'
  },
  {
    id: '15',
    question: 'What if my frame arrives damaged?',
    answer: 'If your frame arrives damaged, please contact us immediately with photos of the damage. We\'ll arrange for a replacement or full refund at no cost to you. We take great care in packaging, but accidents can happen during shipping.',
    category: 'Returns & Exchanges'
  },

  // Care & Maintenance
  {
    id: '16',
    question: 'How do I clean my acrylic frame?',
    answer: 'Clean your acrylic frame with a soft, lint-free cloth and mild soap solution. Avoid abrasive cleaners, paper towels, or rough cloths that could scratch the surface. For stubborn marks, use a specialized acrylic cleaner.',
    category: 'Care & Maintenance'
  },
  {
    id: '17',
    question: 'How long will my acrylic frame last?',
    answer: 'With proper care, our acrylic frames can last for decades. The UV-resistant material prevents yellowing, and the shatterproof design makes them more durable than glass. They\'re perfect for both indoor and outdoor use.',
    category: 'Care & Maintenance'
  },
  {
    id: '18',
    question: 'Can I hang my frame outdoors?',
    answer: 'Yes! Our acrylic frames are weather-resistant and UV-stable, making them perfect for outdoor display. However, we recommend using appropriate mounting hardware designed for outdoor use to ensure secure installation.',
    category: 'Care & Maintenance'
  },

  // Technical Support
  {
    id: '19',
    question: 'What if I need help with the design tool?',
    answer: 'Our customer support team is available to help with any technical issues. You can reach us via email, phone, or live chat. We also provide video tutorials and step-by-step guides for using our design tools.',
    category: 'Technical Support'
  },
  {
    id: '20',
    question: 'Do you offer design services?',
    answer: 'Yes! If you need help creating your custom design, our design team can assist you. We offer complimentary design consultation for orders over $100, and custom design services for complex projects.',
    category: 'Technical Support'
  }
];

const categories = [
  'All Questions',
  'Product Information',
  'Ordering Process',
  'Shipping & Delivery',
  'Returns & Exchanges',
  'Care & Maintenance',
  'Technical Support'
];

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('All Questions');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = useMemo(() => {
    let filtered = activeCategory === 'All Questions' 
      ? faqData 
      : faqData.filter(faq => faq.category === activeCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (openItems.length === filteredFAQs.length) {
      setOpenItems([]);
    } else {
      setOpenItems(filteredFAQs.map(faq => faq.id));
    };
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveCategory('All Questions'); // Reset category when searching
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Search */}
      <FAQSearch 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onClear={handleClearSearch}
      />

      {/* Category Filter - Scrollable Row (no visible scrollbar) */}
      <div className="w-full overflow-x-auto mb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div
          className="flex gap-2 justify-start min-w-max px-1 py-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Search Results` : activeCategory} ({filteredFAQs.length} questions)
            {searchQuery && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                for "{searchQuery}"
              </span>
            )}
          </h2>
          {filteredFAQs.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              {openItems.length === filteredFAQs.length ? 'Collapse All' : 'Expand All'}
            </button>
          )}
        </div>

        {filteredFAQs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900 pr-4">
                {faq.question}
              </h3>
              {openItems.includes(faq.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            
            {openItems.includes(faq.id) && (
              <div className="px-6 pb-4">
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No questions found in this category.</p>
        </div>
      )}
    </div>
  );
}
