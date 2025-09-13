import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Fetch payment settings from database
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

    // Convert array to object
    const settingsObj = settings.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    const paymentMode = settingsObj.paymentMode || 'test';
    
    // Use appropriate keys based on payment mode
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

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Send the appropriate key ID to frontend
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
