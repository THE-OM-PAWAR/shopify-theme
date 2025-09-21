import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, receipt, notes } = await request.json();

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay credentials missing' }, { status: 500 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Create order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise (Razorpay expects amount in smallest currency unit)
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1, // Auto capture payment
    });

    return NextResponse.json({
      success: true,
      order,
      key_id: razorpayKeyId,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
