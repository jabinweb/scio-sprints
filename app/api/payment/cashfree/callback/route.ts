import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const order_id = url.searchParams.get('order_id');
  const order_status = url.searchParams.get('order_status');
  
  // Log the callback for debugging
  console.log('[info] Cashfree callback received:', {
    order_id,
    order_status,
    searchParams: url.searchParams.toString()
  });

  try {
    // Basic validation
    if (!order_id) {
      console.error('[error] Cashfree callback missing order_id');
      return redirect('/dashboard/payments?error=missing_order_id');
    }

    // Handle different order statuses
    if (order_status === 'PAID') {
      // Payment successful - redirect to success page
      console.log('[info] Cashfree payment successful for order:', order_id);
      return redirect(`/dashboard/payments?success=true&order_id=${order_id}`);
    } else if (order_status === 'FAILED') {
      // Payment failed
      console.log('[info] Cashfree payment failed for order:', order_id);
      return redirect(`/dashboard/payments?error=payment_failed&order_id=${order_id}`);
    } else if (order_status === 'CANCELLED') {
      // Payment cancelled by user
      console.log('[info] Cashfree payment cancelled for order:', order_id);
      return redirect(`/dashboard/payments?error=payment_cancelled&order_id=${order_id}`);
    } else {
      // Unknown status
      console.log('[info] Cashfree payment unknown status for order:', order_id, 'status:', order_status);
      return redirect(`/dashboard/payments?error=unknown_status&order_id=${order_id}&status=${order_status}`);
    }

  } catch (error) {
    console.error('[error] Cashfree callback processing error:', error);
    return redirect('/dashboard/payments?error=callback_error');
  }
}

export async function POST(request: Request) {
  // Handle webhook notifications from Cashfree
  try {
    const body = await request.json();
    
    console.log('[info] Cashfree webhook received:', body);
    
    // You might want to verify the webhook signature here
    // and update payment status in your database
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[error] Cashfree webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}