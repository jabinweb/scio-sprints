import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayPayment, verifyCashfreePayment } from '@/lib/payment-service';

interface VerifyRequest {
  // Razorpay fields
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  // Cashfree fields
  paymentId?: string;
  orderId?: string;
  // Common fields
  userId: string;
  subjectId: string;
}

export async function POST(request: Request) {
  try {
    const body: VerifyRequest = await request.json();
    const { userId, subjectId } = body;

    if (!userId || !subjectId) {
      return NextResponse.json({ 
        error: 'User ID and Subject ID are required' 
      }, { status: 400 });
    }

    // Check if this is a Razorpay or Cashfree payment
    const isRazorpayPayment = body.razorpay_payment_id && body.razorpay_order_id && body.razorpay_signature;
    const isCashfreePayment = body.paymentId && body.orderId;
    
    if (!isRazorpayPayment && !isCashfreePayment) {
      return NextResponse.json({ 
        error: 'Invalid payment verification request. Missing required parameters.' 
      }, { status: 400 });
    }

    let payment;

    // Handle Razorpay payment verification
    if (isRazorpayPayment) {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
      
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing Razorpay payment parameters' }, { status: 400 });
      }
      
      // Find the payment record by Razorpay order ID
      const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (!existingPayment) {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
      }

      payment = await verifyRazorpayPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
    }
    
    // Handle Cashfree payment verification
    else if (isCashfreePayment) {
      const { orderId: cashfreeOrderId } = body;
      
      if (!cashfreeOrderId) {
        return NextResponse.json({ error: 'Missing Cashfree order ID' }, { status: 400 });
      }
      
      // Find the payment record by Cashfree order ID
      const existingPayment = await prisma.payment.findFirst({
        where: { cashfreeOrderId },
      });

      if (!existingPayment) {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
      }

      payment = await verifyCashfreePayment(existingPayment.id, cashfreeOrderId);
    }

    // If payment verification successful, create subject subscription
    if (payment && payment.status === 'COMPLETED') {

    // Get subject and class details
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        class: true
      }
    });

    if (!subject) {
      return NextResponse.json({ 
        error: 'Subject not found' 
      }, { status: 404 });
    }

    // Get subject price (use subject's own price field)
    const subjectPrice = subject.price || 7500; // Default to ₹75 if not set

    // Check if subscription already exists for this user and subject
    const existingSubscription = await prisma.subscription.findFirst({
      where: { 
        userId,
        subjectId,
        status: 'ACTIVE'
      }
    });

    if (!existingSubscription) {
      // Create subscription
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

      try {
        const subscription = await prisma.subscription.create({
          data: {
            userId,
            classId: subject.classId,
            subjectId,
            status: 'ACTIVE',
            planType: 'subject_access',
            planName: `${subject.name} - Individual Subject Access`,
            amount: subjectPrice,
            currency: 'INR',
            startDate: new Date(),
            endDate: endDate
          }
        });

        return NextResponse.json({
          success: true,
          subscription,
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            gateway: payment.gateway
          },
          message: `Successfully subscribed to ${subject.name}!`
        });

      } catch (subscriptionError) {
        console.error('Subscription creation error:', subscriptionError);
        return NextResponse.json({ 
          error: 'Failed to create subscription' 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: true,
        subscription: existingSubscription,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          gateway: payment.gateway
        },
        message: `Already subscribed to ${subject.name}!`
      });
    }

    } else {
      return NextResponse.json({ 
        verified: false,
        error: 'Payment verification failed'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Subject payment verification error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid payment signature') || 
          error.message.includes('Payment status:')) {
        return NextResponse.json({ 
          success: false,
          error: error.message 
        }, { status: 400 });
      }
      
      if (error.message.includes('not configured')) {
        return NextResponse.json({ 
          error: 'Payment gateway not configured' 
        }, { status: 503 });
      }
    }

    return NextResponse.json({ 
      error: 'Payment verification failed' 
    }, { status: 500 });
  }
}
