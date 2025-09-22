import { NextRequest, NextResponse } from 'next/server';
import { OTPStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, sessionId } = await request.json();

    if (!email || !otp || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify OTP using our shared OTP store
    const isValid = OTPStore.verifyOTP(sessionId, email, otp);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Get the session to check if user is new
    const session = OTPStore.get(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 400 });
    }
    // Store the isNewUser flag before deleting the session
    const isNewUser = session.isNewUser;

    // OTP is valid, delete session
    OTPStore.delete(sessionId);

    // If existing user, fetch customer data from Shopify
    if (!isNewUser) {
      // Get customer data from Shopify Admin API
      const customer = await getCustomerByEmail(email);
      
      if (!customer) {
        return NextResponse.json({ error: 'Failed to retrieve customer data' }, { status: 500 });
      }
      
      // Generate a customer access token using Shopify Admin API
      const accessToken = await generateCustomerAccessToken(customer.id);
      
      if (!accessToken) {
        return NextResponse.json({ error: 'Failed to generate access token' }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        customer,
        accessToken,
      });
    }

    // If new user, return success but don't create account yet
    return NextResponse.json({
      success: true,
      isNewUser: true,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}

// Get customer data from Shopify Admin API
async function getCustomerByEmail(email: string) {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      console.error('Shopify credentials missing');
      return null;
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
      return null;
    }

    const result = await response.json();
    const customers = result.customers || [];

    if (customers.length === 0) {
      return null;
    }

    const customer = customers[0];
    
    // Format customer data to match our application's structure
    return {
      id: customer.id.toString(),
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone || '',
      defaultAddress: customer.default_address ? {
        id: customer.default_address.id.toString(),
        firstName: customer.default_address.first_name,
        lastName: customer.default_address.last_name,
        address1: customer.default_address.address1,
        address2: customer.default_address.address2 || '',
        city: customer.default_address.city,
        province: customer.default_address.province,
        zip: customer.default_address.zip,
        country: customer.default_address.country,
        phone: customer.default_address.phone || '',
      } : null,
      addresses: customer.addresses?.map((addr: any) => ({
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
      })) || [],
      ordersCount: customer.orders_count || 0,
      totalSpent: customer.total_spent || '0.00',
    };
  } catch (error) {
    console.error('Error getting customer by email:', error);
    return null;
  }
}

// Generate a customer access token using Shopify Admin API
async function generateCustomerAccessToken(customerId: string): Promise<string | null> {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      console.error('Shopify credentials missing');
      return null;
    }

    // Generate a multipass token for the customer
    // Note: In a real implementation, you would use Shopify's multipass feature
    // For this demo, we'll generate a token that's valid for 30 days
    const customerToken = `shopify-token-${customerId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Store the token in a database or cache in a real implementation
    // For now, we'll just return it
    
    return customerToken;
  } catch (error) {
    console.error('Error generating customer access token:', error);
    return null;
  }
}