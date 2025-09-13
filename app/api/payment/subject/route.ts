import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRazorpayInstance, validateRazorpayConfig, getRazorpayConfig } from '@/lib/razorpay-global';

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

    // Validate Razorpay configuration
    const validation = await validateRazorpayConfig();
    if (!validation.valid) {
      console.error('Razorpay configuration error:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 500 });
    }

    // Create Razorpay instance with global configuration
    const razorpay = await createRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ 
        error: 'Failed to initialize Razorpay instance' 
      }, { status: 500 });
    }

    const order = await razorpay.orders.create({
      amount: subjectPrice,
      currency: 'INR',
      receipt: `subj_${subjectId.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
      notes: {
        subjectId: subjectId.toString(),
        userId: userId,
        subjectName: subject.name,
        type: 'subject_subscription'
      }
    });

    // Get the configuration to return the key ID
    const config = await getRazorpayConfig();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId,
      subjectId: subjectId,
      subjectName: subject.name,
    });

  } catch (error) {
    console.error('Subject payment creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create payment order' 
    }, { status: 500 });
  }
}
