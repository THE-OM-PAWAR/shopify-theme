import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, phone, sessionId } = await request.json();

    console.log('Registration request received:', { email, firstName, lastName, phone });

    if (!email || !firstName || !lastName) {
      console.error('Missing required fields:', { email: !!email, firstName: !!firstName, lastName: !!lastName });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Email, first name, and last name are required'
      }, { status: 400 });
    }

    // Note: The OTP verification is already done in the verify-otp endpoint
    // By the time we get to this endpoint, the user has already verified their email with OTP

    console.log('Attempting to create customer...');

    // Create customer in Shopify using Admin API
    const customer = await createCustomer({
      email,
      firstName,
      lastName,
      phone: phone || '',
    });

    console.log('Customer creation result:', customer ? 'Success' : 'Failed');

    if (!customer) {
      return NextResponse.json({ 
        error: 'Failed to create customer',
        details: 'Customer creation returned null. Check server logs for more details.'
      }, { status: 500 });
    }

    console.log('Generating customer access token...');

    // Generate a customer access token
    const accessToken = await generateCustomerAccessToken(customer.id);
      
    if (!accessToken) {
      console.error('Failed to generate access token for customer:', customer.id);
      return NextResponse.json({ 
        error: 'Failed to generate access token',
        details: 'Customer was created but access token generation failed'
      }, { status: 500 });
    }

    console.log('Registration completed successfully for:', email);

    return NextResponse.json({
      success: true,
      customer,
      accessToken,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to register user';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.message;
      
      // Check for specific error types
      if (error.message.includes('Shopify credentials')) {
        errorMessage = 'Configuration Error';
        errorDetails = 'Shopify credentials are not properly configured. Please contact support.';
      } else if (error.message.includes('Shopify API Error')) {
        errorMessage = 'Shopify API Error';
        errorDetails = error.message;
      } else if (error.message.includes('email')) {
        errorMessage = 'Email Error';
        errorDetails = 'There was an issue with the email address. Please try again.';
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}

// Create customer in Shopify using Admin API
async function createCustomer({ email, firstName, lastName, phone }: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    console.log('Creating customer with data:', { email, firstName, lastName, phone });
    console.log('Shopify Domain:', shopifyDomain ? 'Set' : 'Missing');
    console.log('Access Token:', accessToken ? 'Set' : 'Missing');

    if (!shopifyDomain || !accessToken) {
      console.error('Shopify credentials missing:', {
        domain: !!shopifyDomain,
        token: !!accessToken
      });
      throw new Error('Shopify credentials are not configured properly. Please check your environment variables.');
    }

    // Generate a random password for the customer
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const customerData = {
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        verified_email: true, // Since we verified with OTP
        password: password,
        password_confirmation: password,
        send_email_welcome: false, // We'll handle our own welcome email
      }
    };

    console.log('Sending request to Shopify API...');

    // Create customer using Admin API
    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/customers.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(customerData),
      }
    );

    console.log('Shopify API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Try to parse the error response
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors) {
          throw new Error(`Shopify API Error: ${JSON.stringify(errorData.errors)}`);
        }
      } catch (parseError) {
        // If we can't parse the error, use the raw text
        throw new Error(`Shopify API Error (${response.status}): ${errorText}`);
      }
      
      throw new Error(`Shopify API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('Shopify API response:', result);
    
    const shopifyCustomer = result.customer;

    if (!shopifyCustomer) {
      console.error('No customer data returned from Shopify API');
      throw new Error('No customer data returned from Shopify API');
    }

    console.log('Customer created successfully:', shopifyCustomer.id);

    // Send welcome email using Shopify Admin API (optional, don't fail if this fails)
    try {
      await sendWelcomeEmail(email, firstName);
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError);
      // Don't fail the entire process if email fails
    }

    // Format customer data to match our application's structure
    return {
      id: shopifyCustomer.id.toString(),
      email: shopifyCustomer.email,
      firstName: shopifyCustomer.first_name,
      lastName: shopifyCustomer.last_name,
      phone: shopifyCustomer.phone || '',
      addresses: [],
      ordersCount: 0,
      totalSpent: '0.00',
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error; // Re-throw to be handled by the calling function
  }
}

// Send welcome email using Shopify Admin API
async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store';

    if (!shopifyDomain || !accessToken) {
      console.error('Shopify credentials missing');
      return false;
    }

    // Create an email template
    const subject = `Welcome to ${storeName}!`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to ${storeName}!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for creating an account with us. Your account has been successfully created and is ready to use.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our products</li>
          <li>Save items to your wishlist</li>
          <li>Track your orders</li>
          <li>Manage your profile</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Happy shopping!</p>
        <p>The ${storeName} Team</p>
      </div>
    `;

    // Send email using Shopify Admin API
    // Use the draft order invoice sending capability as in the OTP email function
    const createDraftOrderResponse = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          draft_order: {
            email: email,
            note: `Welcome Email`,
            line_items: [
              {
                title: "Welcome",
                price: "0.00",
                quantity: 1
              }
            ]
          }
        }),
      }
    );

    if (!createDraftOrderResponse.ok) {
      console.error('Failed to create draft order:', await createDraftOrderResponse.text());
      return false;
    }

    const draftOrderResult = await createDraftOrderResponse.json();
    const draftOrderId = draftOrderResult.draft_order.id;

    // Send a custom email using the draft order
    const sendEmailResponse = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/draft_orders/${draftOrderId}/send_invoice.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          draft_order_invoice: {
            to: email,
            subject: subject,
            custom_message: body,
          }
        }),
      }
    );

    if (!sendEmailResponse.ok) {
      console.error('Failed to send welcome email:', await sendEmailResponse.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
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