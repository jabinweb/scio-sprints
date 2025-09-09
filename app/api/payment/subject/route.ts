import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Razorpay from 'razorpay';

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
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select(`
        *,
        class:classes(*)
      `)
      .eq('id', subjectId)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json({ 
        error: 'Subject not found' 
      }, { status: 404 });
    }

    // Check if user already has access to this subject
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('subjectId', subjectId)
      .eq('status', 'ACTIVE')
      .gte('endDate', new Date().toISOString())
      .single();

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'You already have an active subscription for this subject' 
      }, { status: 409 });
    }

    // Check if user has full class access
    const { data: classSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('classId', subject.classId)
      .is('subjectId', null)
      .eq('status', 'ACTIVE')
      .gte('endDate', new Date().toISOString())
      .single();

    if (classSubscription) {
      return NextResponse.json({ 
        error: 'You already have full class access which includes this subject' 
      }, { status: 409 });
    }

    // Get subject price (use subject's own price field)
    const subjectPrice = amount || subject.price || 7500; // Default to ₹75 if not set

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

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

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

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
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
