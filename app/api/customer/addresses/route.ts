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

    // Then, get the customer's addresses
    const addresses = await getCustomerAddresses(customerId, shopifyDomain, accessToken);

    return NextResponse.json({ 
      success: true, 
      addresses 
    });
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses', details: error instanceof Error ? error.message : 'Unknown error' },
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

// Get customer addresses using Shopify Admin API
async function getCustomerAddresses(customerId: string, shopifyDomain: string, accessToken: string) {
  try {
    // Get customer details including addresses using Admin API
    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/customers/${customerId}.json`,
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
    const customer = result.customer;

    if (!customer || !customer.addresses) {
      return [];
    }

    // Format addresses to match our application's structure
    return customer.addresses.map((addr: any) => ({
      id: addr.id.toString(),
      firstName: addr.first_name,
      lastName: addr.last_name,
      address1: addr.address1,
      address2: addr.address2 || '',
      city: addr.city,
      province: addr.province,
      zip: addr.zip,
      country: addr.country,
      phone: addr.phone || '',
      default: addr.default || false,
    }));
  } catch (error) {
    console.error('Error getting customer addresses:', error);
    return [];
  }
}
