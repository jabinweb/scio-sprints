import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface VerifyRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  userId: string;
  subjectId: string;
}

export async function POST(request: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      subjectId
    }: VerifyRequest = await request.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId || !subjectId) {
      return NextResponse.json({ 
        error: 'Missing required verification parameters' 
      }, { status: 400 });
    }

    // Get Razorpay settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('key, value')
      .in('key', ['paymentMode', 'razorpayTestKeySecret', 'razorpayKeySecret']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
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

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ 
        error: 'Invalid payment signature' 
      }, { status: 400 });
    }

    // Get subject and class details
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

    // Get subject price (use subject's own price field)
    const subjectPrice = subject.price || 7500; // Default to ₹75 if not set

    // Create subscription
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

    let subscription;
    try {
      subscription = await prisma.subscription.create({
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
    } catch (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError);
      return NextResponse.json({ 
        error: 'Failed to create subscription' 
      }, { status: 500 });
    }

    // Record payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        userId,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        amount: subjectPrice,
        currency: 'INR',
        status: 'SUCCESS',
        description: `Subject subscription: ${subject.name}`,
        metadata: {
          subscriptionId: subscription.id,
          subjectId,
          classId: subject.classId,
          type: 'subject_subscription'
        }
      });

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      // Don't fail the request as subscription is already created
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: `Successfully subscribed to ${subject.name}!`
    });

  } catch (error) {
    console.error('Subject payment verification error:', error);
    return NextResponse.json({ 
      error: 'Payment verification failed' 
    }, { status: 500 });
  }
}
