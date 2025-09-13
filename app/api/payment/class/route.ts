import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { classId, userId } = await req.json();

    if (!classId || !userId) {
      return NextResponse.json({ error: 'Class ID and User ID are required' }, { status: 400 });
    }

    // Get class details
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        price: true,
        currency: true
      }
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if user already has a FULL CLASS subscription (not individual subjects)
    const existingClassSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        classId: classId,
        subjectId: null, // Only check for class-level subscriptions
        status: 'ACTIVE',
        endDate: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        planType: true
      }
    });

    if (existingClassSubscription) {
      return NextResponse.json({ 
        error: 'Already subscribed to this class',
        details: {
          subscriptionId: existingClassSubscription.id,
          status: existingClassSubscription.status,
          startDate: existingClassSubscription.startDate,
          endDate: existingClassSubscription.endDate,
          planType: existingClassSubscription.planType
        }
      }, { status: 400 });
    }

    // Fetch payment settings
    const settings = await prisma.adminSettings.findMany({
      where: {
        key: {
          in: ['paymentMode', 'razorpayTestKeyId', 'razorpayKeyId', 'razorpayTestKeySecret', 'razorpayKeySecret']
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
    const keyId = paymentMode === 'test' ? settingsObj.razorpayTestKeyId : settingsObj.razorpayKeyId;
    const keySecret = paymentMode === 'test' ? settingsObj.razorpayTestKeySecret : settingsObj.razorpayKeySecret;

    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        error: `Razorpay ${paymentMode} credentials not configured` 
      }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderAmount = classData.price || 0; // Handle null price
    
    const order = await razorpay.orders.create({
      amount: orderAmount, // Already in paisa
      currency: classData.currency,
      receipt: `cls_${classId.toString().slice(0, 8)}_${Date.now().toString().slice(-8)}`,
      notes: {
        classId: classId.toString(),
        userId: userId,
        className: classData.name,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      classId: classId,
      className: classData.name,
    });
  } catch (error) {
    console.error('Class payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
