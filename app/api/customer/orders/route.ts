import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
    }

    // First, get the customer ID by email
    const customerId = await getCustomerIdByEmail(email, shopifyDomain, accessToken);
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Then, get the customer's orders
    const orders = await getCustomerOrders(customerId, shopifyDomain, accessToken);

    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get customer ID by email using Shopify Admin API
async function getCustomerIdByEmail(email: string, shopifyDomain: string, accessToken: string): Promise<string | null> {
  try {
    // Search for customer by email using Admin API
    const searchQuery = `email:${email}`;
    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/customers/search.json?query=${encodeURIComponent(searchQuery)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      console.error('Shopify API error:', response.status, await response.text());
      return null;
    }

    const result = await response.json();
    const customers = result.customers || [];

    if (customers.length === 0) {
      return null;
    }

    return customers[0].id.toString();
  } catch (error) {
    console.error('Error getting customer ID by email:', error);
    return null;
  }
}

// Get customer orders using Shopify Admin API
async function getCustomerOrders(customerId: string, shopifyDomain: string, accessToken: string) {
  try {
    // Get orders for the customer using Admin API
    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/orders.json?customer_id=${customerId}&status=any`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );

    if (!response.ok) {
      console.error('Shopify API error:', response.status, await response.text());
      return [];
    }

    const result = await response.json();
    const shopifyOrders = result.orders || [];

    // Format orders to match our application's structure
    return shopifyOrders.map((order: any) => ({
      id: order.id.toString(),
      orderNumber: order.name.replace('#', ''),
      processedAt: order.processed_at,
      financialStatus: order.financial_status.toUpperCase(),
      fulfillmentStatus: order.fulfillment_status ? order.fulfillment_status.toUpperCase() : 'UNFULFILLED',
      totalPrice: order.total_price,
      currencyCode: order.currency,
      lineItems: order.line_items.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        variant: {
          title: item.variant_title || 'Default',
        },
        quantity: item.quantity,
        originalTotalPrice: item.price,
      })),
    }));
  } catch (error) {
    console.error('Error getting customer orders:', error);
    return [];
  }
}
