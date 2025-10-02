import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Frame',
  description: 'Read Frame\'s Terms of Service to understand your rights and responsibilities when using our services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: [Insert Date]</p>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <div className="space-y-8">
              {/* Overview */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">OVERVIEW</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Welcome to Frame! The terms "we", "us" and "our" refer to Frame. Frame operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the "Services"). Frame is powered by Shopify, which enables us to provide the Services to you.
                  </p>
                  <p>
                    The below terms and conditions, together with any policies referenced herein (these "Terms of Service" or "Terms") describe your rights and responsibilities when you use the Services.
                  </p>
                  <p>
                    Please read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <p className="text-blue-800 font-medium">
                      By visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our{' '}
                      <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>. 
                      If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 1 - Access and Account */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 1 - ACCESS AND ACCOUNT</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use the Services on devices you own, purchase or manage.
                  </p>
                  <p>
                    To use the Services, including accessing or browsing our online stores or purchasing any of the products or services we offer, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide in our stores is correct, current and complete and that you have all rights necessary to provide this information.
                  </p>
                  <p>
                    You are solely responsible for maintaining the security of your account credentials and for all of your account activity. You may not transfer, sell, assign, or license your account to any other person.
                  </p>
                </div>
              </section>

              {/* Section 2 - Our Products */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 2 - OUR PRODUCTS</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We have made every effort to provide an accurate representation of our products and services in our online stores. However, please note that colors or product appearance may differ from how they may appear on your screen due to the type of device you use to access the store and your device settings and configuration.
                  </p>
                  <p>
                    We do not warrant that the appearance or quality of any products or services purchased by you will meet your expectations or be the same as depicted or rendered in our online stores.
                  </p>
                  <p>
                    All descriptions of products are subject to change at any time without notice at our sole discretion. We reserve the right to discontinue any product at any time and may limit the quantities of any products that we offer to any person, geographic region or jurisdiction, on a case-by-case basis.
                  </p>
                </div>
              </section>

              {/* Section 3 - Orders */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 3 - ORDERS</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    When you place an order, you are making an offer to purchase. Frame reserves the right to accept or decline your order for any reason at its discretion. Your order is not accepted until Frame confirms acceptance. We must receive and process your payment before your order is accepted. Please review your order carefully before submitting, as Frame may be unable to accommodate cancellation requests after an order is accepted. In the event that we do not accept, make a change to, or cancel an order, we will attempt to notify you by contacting the e‑mail, billing address, and/or phone number provided at the time the order was made.
                  </p>
                  <p>
                    Your purchases are subject to return or exchange solely in accordance with our{' '}
                    <a href="/refund-policy" className="text-blue-600 hover:text-blue-800 underline">Refund Policy</a>.
                  </p>
                  <p>
                    You represent and warrant that your purchases are for your own personal or household use and not for commercial resale or export.
                  </p>
                </div>
              </section>

              {/* Section 4 - Prices and Billing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 4 - PRICES AND BILLING</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Prices, discounts and promotions are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed and will be set out in your order confirmation email. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.
                  </p>
                  <p>
                    Prices posted in our online stores may be different from prices offered in physical stores or in online or other stores operated by third parties. We may offer, from time to time, promotions on the Services that may affect pricing and that are governed by terms and conditions separate from these Terms. If there is a conflict between the terms for a promotion and these Terms, the promotion terms will govern.
                  </p>
                  <p>
                    You agree to provide current, complete and accurate purchase, payment and account information for all purchases made at our stores. You agree to promptly update your account and other information, including your email address, credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.
                  </p>
                  <p>
                    You represent and warrant that (i) the credit card information you provide is true, correct, and complete, (ii) you are duly authorized to use such credit card for the purchase, (iii) charges incurred by you will be honored by your credit card company, and (iv) you will pay charges incurred by you at the posted prices, including shipping and handling charges and all applicable taxes, if any.
                  </p>
                </div>
              </section>

              {/* Section 5 - Shipping and Delivery */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 5 - SHIPPING AND DELIVERY</h2>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                  <p className="text-amber-800">
                    We are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs processing, or events outside our control. Once we transfer products to the carrier, title and risk of loss passes to you.
                  </p>
                </div>
              </section>

              {/* Section 6 - Intellectual Property */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 6 - INTELLECTUAL PROPERTY</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Our Services, including but not limited to all trademarks, brands, text, displays, images, graphics, product reviews, video, and audio, and the design, selection, and arrangement thereof, are owned by Frame, its affiliates or licensors and are protected by U.S. and foreign patent, copyright and other intellectual property laws.
                  </p>
                  <p>
                    These Terms permit you to use the Services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Services without our prior written consent.
                  </p>
                  <p>
                    Frame's names, logos, product and service names, designs, and slogans are trademarks of Frame or its affiliates or licensors. You must not use such trademarks without the prior written permission of Frame. Shopify's name, logo, product and service names, designs and slogans are trademarks of Shopify.
                  </p>
                </div>
              </section>

              {/* Section 7 - Optional Tools */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 7 - OPTIONAL TOOLS</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    You may be provided with access to customer tools offered by third parties as part of the Services, which we neither monitor nor have any control nor input.
                  </p>
                  <p>
                    You acknowledge and agree that we provide access to such tools "as is" and "as available" without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.
                  </p>
                  <p>
                    Any use by you of the optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).
                  </p>
                </div>
              </section>

              {/* Section 8 - Third-Party Links */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 8 - THIRD-PARTY LINKS</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    The Services may contain materials and hyperlinks to websites provided or operated by third parties (including any embedded third party functionality). We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites you choose to access.
                  </p>
                  <p>
                    We are not liable for any harm or damages related to your access of any third-party websites, or your purchase or use of any products, services, resources, or content on any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction.
                  </p>
                </div>
              </section>

              {/* Section 9 - Relationship with Shopify */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 9 - RELATIONSHIP WITH SHOPIFY</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm mb-2">
                    <strong>Note:</strong> This section accurately characterizes Shopify's relationship with your store and should not be removed or modified.
                  </p>
                  <p className="text-green-700">
                    Frame is powered by Shopify, which enables us to provide the Services to you. However, any sales and purchases you make in our Store are made directly with Frame. By using the Services, you acknowledge and agree that Shopify is not responsible for any aspect of any sales between you and Frame, including any injury, damage, or loss resulting from purchased products and services. You hereby expressly release Shopify and its affiliates from all claims, damages, and liabilities arising from or related to your purchases and transactions with Frame.
                  </p>
                </div>
              </section>

              {/* Section 10 - Privacy Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 10 - PRIVACY POLICY</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    All personal information we collect through the Services is subject to our{' '}
                    <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>, 
                    and certain personal information may be subject to Shopify's Privacy Policy. By using the Services, you acknowledge that you have read these privacy policies.
                  </p>
                  <p>
                    Because the Services are hosted by Shopify, Shopify collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in other countries than where you reside, in order to provide services to you.
                  </p>
                </div>
              </section>

              {/* Section 11 - Feedback */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 11 - FEEDBACK</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    If you submit, upload, post, email, or otherwise transmit any ideas, suggestions, feedback, reviews, proposals, plans, or other content (collectively, "Feedback"), you grant us a perpetual, worldwide, sublicensable, royalty-free license to use, reproduce, modify, publish, distribute and display such Feedback in any medium for any purpose, including for commercial use.
                  </p>
                  <p>
                    You also represent and warrant that: (i) you own or have all necessary rights to all Feedback; (ii) you have disclosed any compensation or incentives received in connection with your submission of Feedback; and (iii) your Feedback will comply with these Terms.
                  </p>
                  <p>
                    We may, but have no obligation to, monitor, edit or remove Feedback that we determine in our sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party's intellectual property or these Terms of Service.
                  </p>
                </div>
              </section>

              {/* Section 12 - Errors, Inaccuracies and Omissions */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 12 - ERRORS, INACCURACIES AND OMISSIONS</h2>
                <p className="text-gray-700 leading-relaxed">
                  Occasionally there may be information on or in the Services that contain typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice (including after you have submitted your order).
                </p>
              </section>

              {/* Section 13 - Prohibited Uses */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 13 - PROHIBITED USES</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    You may access and use the Services for lawful purposes only. You may not access or use the Services, directly or indirectly for various prohibited activities including but not limited to:
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <ul className="list-disc pl-6 space-y-1 text-red-800 text-sm">
                      <li>Any unlawful or malicious purpose</li>
                      <li>Violating any regulations, rules, laws, or local ordinances</li>
                      <li>Infringing upon intellectual property rights</li>
                      <li>Harassing, abusing, or harming any person</li>
                      <li>Transmitting false or misleading information</li>
                      <li>Sending spam or promotional material</li>
                      <li>Impersonating another person or entity</li>
                    </ul>
                  </div>
                  <p>
                    We reserve the right to suspend, disable, or terminate your account at any time, without notice, if we determine that you have violated any part of these Terms.
                  </p>
                </div>
              </section>

              {/* Section 14 - Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 14 - TERMINATION</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We may terminate this agreement or your access to the Services (or any part thereof) in our sole discretion at any time without notice, and you will remain liable for all amounts due up to and including the date of termination.
                  </p>
                  <p>
                    The following sections will continue to apply following any termination: Intellectual Property, Feedback, Termination, Disclaimer of Warranties, Limitation of Liability, Indemnification, Severability, Waiver; Entire Agreement, Assignment, Governing Law, Privacy Policy, and any other provisions that by their nature should survive termination.
                  </p>
                </div>
              </section>

              {/* Section 15 - Disclaimer of Warranties */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 15 - DISCLAIMER OF WARRANTIES</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    The information presented on or through the Services is made available solely for general information purposes. We do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-800 font-medium text-sm">
                      EXCEPT AS EXPRESSLY STATED BY FRAME, THE SERVICES AND ALL PRODUCTS OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 16 - Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 16 - LIMITATION OF LIABILITY</h2>
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-red-800 font-medium text-sm">
                    TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL FRAME, OUR PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, SERVICE PROVIDERS OR LICENSORS, OR THOSE OF SHOPIFY AND ITS AFFILIATES, BE LIABLE FOR ANY INJURY, LOSS, CLAIM, OR ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND.
                  </p>
                </div>
              </section>

              {/* Remaining sections condensed for space */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTION 17 - INDEMNIFICATION</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify, defend and hold harmless Frame, Shopify, and our affiliates from any losses, damages, liabilities or claims, including reasonable attorneys' fees, payable to any third party due to or arising out of your breach of these Terms, violation of any law, or your access to and use of the Services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">SECTIONS 18-23 - LEGAL PROVISIONS</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h4 className="font-semibold mb-2">Section 18 - Severability</h4>
                      <p>Unenforceable provisions will be severed without affecting remaining terms.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Section 19 - Entire Agreement</h4>
                      <p>These Terms constitute the complete agreement between parties.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Section 20 - Assignment</h4>
                      <p>You cannot transfer these Terms without our written consent.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Section 21 - Governing Law</h4>
                      <p>Terms governed by laws where Frame is headquartered.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Section 22 - Headings</h4>
                      <p>Headings are for convenience only and don't limit terms.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Section 23 - Changes</h4>
                      <p>We may update these Terms; continued use means acceptance.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 24 - Contact Information */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">SECTION 24 - CONTACT INFORMATION</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Questions about the Terms of Service should be sent to us at{' '}
                  <a href="mailto:nexusnestam@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                    nexusnestam@gmail.com
                  </a>
                </p>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Contact Information:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Trading Name:</strong> [INSERT TRADING NAME]</p>
                    <p><strong>Email:</strong> <a href="mailto:nexusnestam@gmail.com" className="text-blue-600 hover:text-blue-800 underline">nexusnestam@gmail.com</a></p>
                    <p><strong>Address:</strong> [INSERT BUSINESS ADDRESS]</p>
                    <p><strong>Phone:</strong> [INSERT BUSINESS PHONE NUMBER]</p>
                    <p><strong>Registration Number:</strong> [INSERT BUSINESS REGISTRATION NUMBER]</p>
                    <p><strong>VAT Number:</strong> [INSERT VAT NUMBER]</p>
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
