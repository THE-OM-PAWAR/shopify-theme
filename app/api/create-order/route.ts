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

    if (!orderData.email || !orderData.shipping_address || !orderData.line_items || orderData.line_items.length === 0) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
    }

    // Create order in Shopify
    const shopifyOrder = await createShopifyOrder(orderData, shopifyDomain, accessToken);
    
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
