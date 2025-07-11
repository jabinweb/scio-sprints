import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { classId, userId } = await req.json();

    if (!classId || !userId) {
      return NextResponse.json({ error: 'Class ID and User ID are required' }, { status: 400 });
    }

    // Get class details
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name, price, currency')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check if user already has subscription for this class
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('userId', userId)
      .eq('classId', classId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (existingSubscription) {
      return NextResponse.json({ error: 'Already subscribed to this class' }, { status: 400 });
    }

    // Fetch payment settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['paymentMode', 'razorpayTestKeyId', 'razorpayKeyId', 'razorpayTestKeySecret', 'razorpayKeySecret']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
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

    const order = await razorpay.orders.create({
      amount: classData.price, // Already in paisa
      currency: classData.currency,
      receipt: `class_${classId}_order_${Date.now()}`,
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
