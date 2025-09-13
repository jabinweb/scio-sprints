import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, classId } = await req.json();

    // Fetch payment settings
    const settings = await prisma.adminSettings.findMany({
      where: {
        key: {
          in: ['paymentMode', 'razorpayTestKeySecret', 'razorpayKeySecret']
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    if (!settings.length) {
      console.error('Error fetching settings: No settings found');
      return NextResponse.json({ error: 'Payment configuration not found' }, { status: 500 });
    }

    const settingsObj = settings.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const paymentMode = settingsObj.paymentMode || 'test';
    const keySecret = paymentMode === 'test' ? settingsObj.razorpayTestKeySecret : settingsObj.razorpayKeySecret;

    if (!keySecret) {
      return NextResponse.json({ 
        error: `Razorpay ${paymentMode} secret not configured` 
      }, { status: 500 });
    }

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Get class details
      const classData = await prisma.class.findUnique({
        where: { id: classId },
        select: {
          id: true,
          name: true,
          price: true
        }
      });

      if (!classData) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }

      // Create class-specific subscription using Prisma
      try {
        await prisma.subscription.create({
          data: {
            userId,
            classId: parseInt(classId),
            status: 'ACTIVE',
            planType: 'class_access',
            planName: `${classData.name} Access`,
            amount: classData.price,
            currency: 'INR',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year access
          }
        });
      } catch (subscriptionError) {
        console.error('Error creating class subscription:', subscriptionError);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
      }

      // Store payment record
      try {
        await prisma.payment.create({
          data: {
            userId,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amount: classData.price || 0,
            currency: 'INR',
            status: 'COMPLETED',
            description: `Class subscription: ${classData.name}`,
          }
        });
      } catch (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't fail the request as subscription is already created
      }

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Class payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
