import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay credentials missing' }, { status: 500 });
    }

    // Verify payment signature
    const isValidPayment = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValidPayment) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment is verified, now create the order in Shopify
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ error: 'Shopify credentials missing' }, { status: 500 });
    }

    // Add payment details to the order data
    const orderWithPayment = {
      ...orderData,
      payment_details: {
        gateway: 'razorpay',
        transaction_id: razorpay_payment_id,
        payment_status: 'paid',
      },
    };

    // Create order in Shopify
    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2024-01/orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ order: orderWithPayment }),
      }
    );

    if (!response.ok) {
      console.error('Shopify API error:', response.status, await response.text());
      return NextResponse.json({ error: 'Failed to create order in Shopify' }, { status: 500 });
    }

    const result = await response.json();
    const order = result.order;

    // If the order was created successfully, update the shipping details using Shipmozo
    // This would typically be done via a webhook or separate API call
    // For now, we'll just return the order details

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.name.replace('#', ''),
        total_price: order.total_price,
        currency: order.currency,
        payment_id: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Verify Razorpay payment signature
function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const text = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');
  
  return expectedSignature === signature;
}
