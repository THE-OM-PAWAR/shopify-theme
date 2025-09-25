import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
    }

    // Get order from Shopify
    const order = await getShopifyOrder(orderId, shopifyDomain, accessToken);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Return order details
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.name,
        created_at: order.created_at,
        processed_at: order.processed_at,
        financial_status: order.financial_status,
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        total_price: order.total_price,
        currency: order.currency,
        customer: {
          email: order.email,
          name: `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim(),
        },
        line_items: order.line_items.map((item: any) => ({
          id: item.id,
          title: item.name,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku || '',
          image: item.image || null,
        })),
        shipping_address: order.shipping_address,
        shipping_lines: order.shipping_lines,
        fulfillments: order.fulfillments || [],
      },
    });
  } catch (error) {
    console.error('Order details fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get order from Shopify
async function getShopifyOrder(orderId: string, shopifyDomain: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/orders/${orderId}.json`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      console.error('Shopify API error:', response.status);
      return null;
    }

    const result = await response.json();
    return result.order;
  } catch (error) {
    console.error('Error getting Shopify order:', error);
    return null;
  }
}

