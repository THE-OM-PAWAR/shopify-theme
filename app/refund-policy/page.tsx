import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Frame',
  description: 'Learn about Frame\'s return and refund policy, including eligibility requirements and processing times.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">30-Day Return Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  To start a return, you can contact us at{' '}
                  <a href="mailto:nexusnestam@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                    nexusnestam@gmail.com
                  </a>
                  . Please note that returns will need to be sent to the following address: [INSERT RETURN ADDRESS]
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Process</h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <p className="text-blue-800">
                    <strong>Important:</strong> If your return is accepted, we'll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  You can always contact us for any return question at{' '}
                  <a href="mailto:nexusnestam@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                    nexusnestam@gmail.com
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damages and Issues</h2>
                <p className="text-gray-700 leading-relaxed">
                  Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exceptions / Non-Returnable Items</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Certain types of items cannot be returned, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>Perishable goods (such as food, flowers, or plants)</li>
                  <li>Custom products (such as special orders or personalized items)</li>
                  <li>Personal care goods (such as beauty products)</li>
                  <li>Hazardous materials, flammable liquids, or gases</li>
                  <li>Sale items</li>
                  <li>Gift cards</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Please get in touch if you have questions or concerns about your specific item.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-4">
                  <p className="text-amber-800">
                    <strong>Note:</strong> Unfortunately, we cannot accept returns on sale items or gift cards.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exchanges</h2>
                <p className="text-gray-700 leading-relaxed">
                  The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">European Union 14 Day Cooling Off Period</h2>
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <p className="text-green-800 mb-2">
                    <strong>EU Customers:</strong> Special rights apply to you.
                  </p>
                  <p className="text-green-700">
                    Notwithstanding the above, if the merchandise is being shipped into the European Union, you have the right to cancel or return your order within 14 days, for any reason and without a justification.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  As above, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refunds</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Process Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <p className="text-gray-700">We will notify you once we've received and inspected your return</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <p className="text-gray-700">We'll let you know if the refund was approved or not</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <p className="text-gray-700">If approved, you'll be automatically refunded on your original payment method within <strong>10 business days</strong></p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    Please remember it can take some time for your bank or credit card company to process and post the refund too.
                  </p>
                  
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-800">
                      <strong>Delayed Refund?</strong> If more than 15 business days have passed since we've approved your return, please contact us at{' '}
                      <a href="mailto:nexusnestam@gmail.com" className="text-red-600 hover:text-red-800 underline">
                        nexusnestam@gmail.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-gray-100 rounded-lg p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Have questions about returns, refunds, or exchanges? We're here to help!
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Contact us:</span>
                  <a 
                    href="mailto:nexusnestam@gmail.com" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>nexusnestam@gmail.com</span>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
