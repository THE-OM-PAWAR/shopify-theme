import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy | Frame',
  description: 'Learn about Frame\'s shipping rates, delivery times, and shipping policies for domestic and international orders.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">📦</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
            <p className="text-gray-600">
              <strong>Effective Date:</strong> [Insert Date]
            </p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-8 text-center">
              Thank you for visiting and shopping at Frame. Below are the terms and conditions that constitute our Shipping Policy.
            </p>

            <div className="space-y-10">
              {/* Domestic Shipping */}
              <section>
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">📍</span>
                  <h2 className="text-2xl font-semibold text-gray-900">Domestic Shipping Policy</h2>
                </div>

                {/* Processing Time */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipment Processing Time</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                    <p className="text-blue-800 mb-2">
                      <strong>Processing Time:</strong> All orders are processed within 1–3 business days.
                    </p>
                    <p className="text-blue-700 text-sm">
                      Orders are not shipped or delivered on weekends or holidays.
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional transit days for delivery.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    If there will be a significant delay in shipment of your order, we will contact you via email or phone.
                  </p>
                </div>

                {/* Shipping Rates */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping Rates & Delivery Estimates</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Shipping charges for your order will be calculated and displayed at checkout.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Shipment Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Estimated Delivery Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Shipment Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Standard Shipping
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            3–7 business days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            ₹[Insert Cost]
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Express Shipping
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            1–3 business days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            ₹[Insert Cost]
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-4">
                    <p className="text-amber-800 text-sm">
                      <strong>Note:</strong> Delivery delays can occasionally occur.
                    </p>
                  </div>
                </div>

                {/* P.O. Boxes */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipment to P.O. boxes or APO/FPO addresses</h3>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-800">
                      Frame ships to addresses within India, and does not currently ship to P.O. boxes or APO/FPO addresses.
                    </p>
                  </div>
                </div>
              </section>

              {/* International Shipping */}
              <section>
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">🌍</span>
                  <h2 className="text-2xl font-semibold text-gray-900">International Shipping Policy</h2>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We currently do not ship outside India.
                  </p>
                  <p className="text-gray-600 text-sm italic">
                    If you need international shipping, please contact us at{' '}
                    <a href="mailto:nexusnestam@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                      nexusnestam@gmail.com
                    </a>{' '}
                    for special arrangements.
                  </p>
                </div>
              </section>

              {/* Order Tracking */}
              <section>
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">🚚</span>
                  <h2 className="text-2xl font-semibold text-gray-900">Shipment Confirmation & Order Tracking</h2>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
                    <p className="text-green-800">
                      You will receive a <strong>Shipment Confirmation email</strong> once your order has shipped, containing your tracking number(s).
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">⏰</div>
                    <p className="text-green-800">
                      The tracking number will be active within <strong>24 hours</strong>.
                    </p>
                  </div>
                </div>
              </section>

              {/* Customs and Duties */}
              <section>
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">💸</span>
                  <h2 className="text-2xl font-semibold text-gray-900">Customs, Duties and Taxes</h2>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-yellow-800 mb-2">
                    <strong>Important:</strong> Frame is not responsible for any customs and taxes applied to your order.
                  </p>
                  <p className="text-yellow-700 text-sm">
                    All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
                  </p>
                </div>
              </section>

              {/* Damages */}
              <section>
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">❌</span>
                  <h2 className="text-2xl font-semibold text-gray-900">Damages</h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-800 mb-2">
                      <strong>Liability:</strong> Frame is not liable for any products damaged or lost during shipping.
                    </p>
                    <p className="text-red-700 text-sm">
                      If you received your order damaged, please contact the shipment carrier or our support team directly to file a claim.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Important:</strong> Please save all packaging materials and damaged goods before filing a claim.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Section */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mt-12">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">📞</span>
                  <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  If you have any questions about your shipment, contact us:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="font-semibold text-gray-900">Email</span>
                    </div>
                    <a 
                      href="mailto:nexusnestam@gmail.com" 
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      nexusnestam@gmail.com
                    </a>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="font-semibold text-gray-900">Phone</span>
                    </div>
                    <p className="text-gray-600 text-sm">[+91 XXXXX XXXXX]</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-gray-900">Address</span>
                    </div>
                    <p className="text-gray-600 text-sm">[Your Store Address]</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
