import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getRazorpayConfig } from '@/lib/razorpay-global';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = await req.json();

    // Get Razorpay configuration
    const config = await getRazorpayConfig();
    
    if (!config.keySecret) {
      return NextResponse.json({ 
        error: `Razorpay ${config.paymentMode} secret not configured` 
      }, { status: 500 });
    }

    // Get subscription price from database
    const subscriptionPriceSetting = await prisma.adminSettings.findFirst({
      where: { key: 'subscriptionPrice' },
      select: { value: true }
    });

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Get subscription price
      const subscriptionPrice = parseInt(subscriptionPriceSetting?.value || '29900');
      
      // Store subscription in database
      try {
        await prisma.subscription.create({
          data: {
            userId,
            status: 'ACTIVE',
            planType: 'premium',
            amount: subscriptionPrice, // Amount in paisa
            currency: 'INR',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          }
        });
      } catch (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
      }

      // Store payment record
      try {
        await prisma.payment.create({
          data: {
            userId,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amount: subscriptionPrice,
            currency: 'INR',
            status: 'COMPLETED',
            description: 'Premium Subscription',
          }
        });
      } catch (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't return error as subscription is already created
      }

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
