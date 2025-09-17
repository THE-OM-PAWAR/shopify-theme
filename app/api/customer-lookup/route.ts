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
      return NextResponse.json({ error: 'Failed to search customers' }, { status: response.status });
    }

    const result = await response.json();
    const customers = result.customers || [];

    if (customers.length > 0) {
      const customer = customers[0];
      
      // Return customer data
      return NextResponse.json({
        found: true,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          phone: customer.phone,
          ordersCount: customer.orders_count,
          totalSpent: customer.total_spent,
          defaultAddress: customer.default_address ? {
            id: customer.default_address.id,
            firstName: customer.default_address.first_name,
            lastName: customer.default_address.last_name,
            address1: customer.default_address.address1,
            address2: customer.default_address.address2,
            city: customer.default_address.city,
            province: customer.default_address.province,
            zip: customer.default_address.zip,
            country: customer.default_address.country,
            phone: customer.default_address.phone,
          } : null,
          addresses: customer.addresses?.map((addr: any) => ({
            id: addr.id,
            firstName: addr.first_name,
            lastName: addr.last_name,
            address1: addr.address1,
            address2: addr.address2,
            city: addr.city,
            province: addr.province,
            zip: addr.zip,
            country: addr.country,
            phone: addr.phone,
          })) || [],
        }
      });
    } else {
      return NextResponse.json({ found: false });
    }

  } catch (error) {
    console.error('Customer lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}