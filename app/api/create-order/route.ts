import { NextRequest, NextResponse } from 'next/server';

// Function to format order notes with image information
function formatOrderNote(orderData: any): string {
  const notes: string[] = [];
  
  // Add payment method
  notes.push(`Payment Method: ${orderData.payment_method || 'COD'}`);
  
  // Add image information if available
  if (orderData.image_notes) {
    notes.push('');
    notes.push('CUSTOMIZATION IMAGES:');
    notes.push(orderData.image_notes);
  }
  
  return notes.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validate required order data
    if (!orderData.email || !orderData.shipping_address || !orderData.line_items || orderData.line_items.length === 0) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
    }

    // SECURITY: Validate authentication
    const authHeader = request.headers.get('authorization');
    const customerId = request.headers.get('x-customer-id');
    
    if (!authHeader || !customerId) {
      return NextResponse.json({ 
        error: 'Authentication required', 
        details: 'You must be logged in to place an order' 
      }, { status: 401 });
    }

    // Verify the access token format
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Invalid authentication format' 
      }, { status: 401 });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    
    // Validate access token with Shopify
    const isValidToken = await validateShopifyAccessToken(accessToken, customerId);
    if (!isValidToken) {
      return NextResponse.json({ 
        error: 'Invalid or expired authentication token' 
      }, { status: 401 });
    }

    // Additional security: Verify the email matches the authenticated customer
    const customerEmail = await getCustomerEmailFromToken(accessToken);
    if (customerEmail && customerEmail !== orderData.email) {
      return NextResponse.json({ 
        error: 'Email mismatch', 
        details: 'Order email must match authenticated customer email' 
      }, { status: 403 });
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !adminAccessToken) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
    }

    // Create order in Shopify
    const shopifyOrder = await createShopifyOrder(orderData, shopifyDomain, adminAccessToken);
    
    if (!shopifyOrder) {
      return NextResponse.json({ error: 'Failed to create order in Shopify' }, { status: 500 });
    }

    // Return success response with order details
    return NextResponse.json({
      success: true,
      order: {
        id: shopifyOrder.id,
        order_number: shopifyOrder.name,
        total_price: shopifyOrder.total_price,
        currency: shopifyOrder.currency,
        status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status || 'unfulfilled',
        shipping_address: shopifyOrder.shipping_address,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create order in Shopify
async function createShopifyOrder(orderData: any, shopifyDomain: string, accessToken: string) {
  try {
    // Determine financial status based on payment method
    const isCOD = orderData.payment_method === 'cod';
    const financialStatus = isCOD ? 'pending' : 'paid';
    
    // Format the order data for Shopify API
    const shopifyOrderData = {
      order: {
        email: orderData.email,
        financial_status: financialStatus,
        fulfillment_status: 'unfulfilled',
        send_receipt: true,
        send_fulfillment_receipt: true,
        line_items: orderData.line_items.map((item: any) => ({
          variant_id: parseInt(item.variant_id),
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_address: {
          first_name: orderData.shipping_address.first_name,
          last_name: orderData.shipping_address.last_name,
          address1: orderData.shipping_address.address1,
          address2: orderData.shipping_address.address2 || '',
          city: orderData.shipping_address.city,
          province: orderData.shipping_address.province,
          zip: orderData.shipping_address.zip,
          country: orderData.shipping_address.country,
          phone: orderData.shipping_address.phone,
        },
        billing_address: orderData.billing_address || orderData.shipping_address,
        shipping_lines: orderData.shipping_lines || [
          {
            title: 'Standard Shipping',
            price: '0.00',
            code: 'standard',
          },
        ],
        tags: 'website-order',
        note: formatOrderNote(orderData),
      },
    };

    // Add transactions based on payment method
    if (orderData.payment_details) {
      // For Razorpay payments
      (shopifyOrderData.order as any).transactions = [
        {
          kind: 'sale',
          status: 'success',
          amount: orderData.total_price,
          gateway: 'razorpay',
          payment_details: {
            credit_card_number: 'XXXX',
            credit_card_company: 'Razorpay',
          },
        },
      ];
    } else if (isCOD) {
      // For COD orders, add a pending transaction
      (shopifyOrderData.order as any).transactions = [
        {
          kind: 'sale',
          status: 'pending',
          amount: orderData.total_price,
          gateway: 'cash_on_delivery',
          payment_details: {
            credit_card_number: 'N/A',
            credit_card_company: 'Cash on Delivery',
          },
        },
      ];
    }

    // Create the order in Shopify
    const response = await fetch(`https://${shopifyDomain}/admin/api/2024-01/orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(shopifyOrderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Shopify order creation error:', errorData);
      throw new Error(`Shopify API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.order;
  } catch (error) {
    console.error('Error creating Shopify order:', error);
    throw error;
  }
}

// Validate Shopify access token
async function validateShopifyAccessToken(accessToken: string, customerId: string): Promise<boolean> {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    if (!shopifyDomain) return false;

    const response = await fetch(`https://${shopifyDomain}/admin/api/2024-01/customers/${customerId}.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.customer && data.customer.id.toString() === customerId;
  } catch (error) {
    console.error('Error validating access token:', error);
    return false;
  }
}

// Get customer email from access token
async function getCustomerEmailFromToken(accessToken: string): Promise<string | null> {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    if (!shopifyDomain) return null;

    // Use the Storefront API to get customer info
    const response = await fetch(`https://${shopifyDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        query: `
          query getCustomer($customerAccessToken: String!) {
            customer(customerAccessToken: $customerAccessToken) {
              id
              email
            }
          }
        `,
        variables: {
          customerAccessToken: accessToken,
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.customer?.email || null;
  } catch (error) {
    console.error('Error getting customer email:', error);
    return null;
  }
}
