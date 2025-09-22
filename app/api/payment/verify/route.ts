import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayPayment, verifyCashfreePayment } from '@/lib/payment-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, metadata } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Check if this is a Razorpay or Cashfree payment
    const isRazorpayPayment = body.razorpay_payment_id && body.razorpay_order_id && body.razorpay_signature;
    const isCashfreePayment = body.orderId;
    
    if (!isRazorpayPayment && !isCashfreePayment) {
      return NextResponse.json({ 
        error: 'Invalid payment verification request. Missing required parameters.' 
      }, { status: 400 });
    }

    let payment;

    // Handle Razorpay payment verification
    if (isRazorpayPayment) {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
      
      payment = await verifyRazorpayPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
    }
    
    // Handle Cashfree payment verification
    else if (isCashfreePayment) {
      // For Cashfree, paymentId is actually the order_id (database payment ID)
      // We can use it directly to find the payment record
      payment = await verifyCashfreePayment(paymentId, paymentId);
    }

    // If payment verification successful, create subscription based on metadata
    if (payment && payment.status === 'COMPLETED' && metadata) {
      try {
        if (metadata.type === 'class_subscription') {
          // Create class subscription
          const existingClassSubscription = await prisma.subscription.findFirst({
            where: {
              userId: metadata.userId,
              classId: metadata.classId,
              subjectId: null, // Class-level subscription
              status: 'ACTIVE',
              endDate: { gte: new Date() }
            }
          });

          if (!existingClassSubscription) {
            await prisma.subscription.create({
              data: {
                userId: metadata.userId,
                classId: metadata.classId,
                subjectId: null, // Class-level subscription
                status: 'ACTIVE',
                planType: 'class_subscription',
                amount: payment.amount,
                currency: payment.currency,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              }
            });
          }
        } else if (metadata.type === 'subject_subscription') {
          // Create subject subscription
          const existingSubjectSubscription = await prisma.subscription.findFirst({
            where: {
              userId: metadata.userId,
              subjectId: metadata.subjectId,
              status: 'ACTIVE',
              endDate: { gte: new Date() }
            }
          });

          if (!existingSubjectSubscription) {
            await prisma.subscription.create({
              data: {
                userId: metadata.userId,
                subjectId: metadata.subjectId,
                status: 'ACTIVE',
                planType: 'subject_subscription',
                amount: payment.amount,
                currency: payment.currency,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              }
            });
          }
        }
      } catch (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
      }
    }

    // If payment verification successful, return success
    if (payment && payment.status === 'COMPLETED') {
      return NextResponse.json({ 
        verified: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          gateway: payment.gateway
        }
      });
    } else {
      return NextResponse.json({ 
        verified: false,
        error: 'Payment verification failed'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid payment signature') || 
          error.message.includes('Payment status:')) {
        return NextResponse.json({ 
          verified: false,
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
