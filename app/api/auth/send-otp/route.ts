import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { OTPStore } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if user exists in Shopify using Admin API
    const userExists = await checkIfUserExists(email);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Generate a session ID
    const sessionId = uuidv4();
    
    // Store OTP session (expires in 10 minutes)
    OTPStore.set(sessionId, {
      email,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      isNewUser: !userExists, // isNewUser is true if user doesn't exist in Shopify
    });

    // Send OTP via Shopify Admin API
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    // For debugging
    console.log(`OTP for ${email}: ${otp}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully', 
      sessionId,
      isNewUser: !userExists // isNewUser is true if user doesn't exist in Shopify
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

// Check if user exists in Shopify using Admin API
async function checkIfUserExists(email: string): Promise<boolean> {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      console.error('Shopify credentials missing');
      return false;
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
      return false;
    }

    const result = await response.json();
    const customers = result.customers || [];

    // User exists if we found at least one customer with this email
    return customers.length > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

// Send OTP email using Shopify Admin API
async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store';

    if (!shopifyDomain || !accessToken) {
      console.error('Shopify credentials missing');
      return false;
    }

    // Create an email template
    const subject = `Your OTP Code for ${storeName}`;
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Your one-time password (OTP) for authentication is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          This is an automated message from ${storeName}. Please do not reply to this email.
        </p>
      </div>
    `;

    // Send email using Shopify Admin API
    // Note: Shopify doesn't have a direct API for sending arbitrary emails
    // Instead, we'll use the draft order invoice sending capability

    // First, create a draft order
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
            note: `OTP Email: ${otp}`,
            line_items: [
              {
                title: "OTP Verification",
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
      console.error('Failed to send invoice email:', await sendEmailResponse.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}