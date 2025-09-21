import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 });
    }

    if (!RAZORPAY_KEY_SECRET) {
      console.error('Razorpay key secret missing');
      return NextResponse.json({ error: 'Payment verification configuration error' }, { status: 500 });
    }

    // Verify signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Get payment details from Razorpay
    const response = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay payment fetch error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch payment details', details: errorData },
        { status: response.status }
      );
    }

    const paymentData = await response.json();

    // Return success response with payment details
    return NextResponse.json({
      success: true,
      payment: {
        id: paymentData.id,
        order_id: paymentData.order_id,
        amount: paymentData.amount / 100, // Convert from paisa to rupees
        currency: paymentData.currency,
        status: paymentData.status,
        method: paymentData.method,
        email: paymentData.email,
        contact: paymentData.contact,
        created_at: paymentData.created_at,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
