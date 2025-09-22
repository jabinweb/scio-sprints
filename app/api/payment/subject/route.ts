import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentOrder } from '@/lib/payment-service';

interface PaymentRequest {
  subjectId: string;
  userId: string;
  amount?: number;
}

export async function POST(request: Request) {
  try {
    const { subjectId, userId, amount }: PaymentRequest = await request.json();

    if (!subjectId || !userId) {
      return NextResponse.json({ 
        error: 'Subject ID and User ID are required' 
      }, { status: 400 });
    }

    // Get subject details
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

    // Check if user already has access to this subject
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        subjectId: subjectId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      }
    });

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'You already have an active subscription for this subject' 
      }, { status: 409 });
    }

    // Check if user has full class access
    const classSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        classId: subject.classId,
        subjectId: null,
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      }
    });

    if (classSubscription) {
      return NextResponse.json({ 
        error: 'You already have full class access which includes this subject' 
      }, { status: 409 });
    }

    // Get subject price (use subject's own price field)
    const subjectPrice = amount || subject.price || 7500; // Default to ₹75 if not set

    // Create payment order using unified service
    const orderResult = await createPaymentOrder({
      userId: userId,
      amount: subjectPrice,
      currency: 'INR',
      description: `${subject.name} - Subject Subscription`
    });

    if (!orderResult) {
      return NextResponse.json({ 
        error: 'Payment order creation failed' 
      }, { status: 500 });
    }

    // Format response based on gateway
    if (orderResult.gateway === 'RAZORPAY') {
      return NextResponse.json({
        orderId: orderResult.orderData.id,
        amount: orderResult.orderData.amount,
        currency: orderResult.orderData.currency,
        keyId: orderResult.orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subjectId: subjectId,
        subjectName: subject.name,
        gateway: orderResult.gateway
      });
    } else if (orderResult.gateway === 'CASHFREE') {
      return NextResponse.json({
        orderId: orderResult.orderData.order_id,
        amount: orderResult.orderData.order_amount * 100, // Convert back to paise for frontend
        currency: orderResult.orderData.order_currency,
        payment_session_id: orderResult.orderData.payment_session_id,
        subjectId: subjectId,
        subjectName: subject.name,
        gateway: orderResult.gateway
      });
    }

  } catch (error) {
    console.error('Subject payment creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment order' 
    }, { status: 500 });
  }
}
