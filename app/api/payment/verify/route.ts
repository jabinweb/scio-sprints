import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayPayment, verifyCashfreePayment } from '@/lib/payment-service';
import { sendEmail } from '@/lib/mail';
import { generateEmailContent } from '@/lib/email';
import { notifyAdminNewSubscription } from '@/lib/admin-notifications';

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
            const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
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
                endDate: endDate
              }
            });

            // Send welcome email after successful subscription creation
            try {
              const user = await prisma.user.findUnique({
                where: { id: metadata.userId },
                select: { email: true, displayName: true }
              });

              const classData = await prisma.class.findUnique({
                where: { id: metadata.classId },
                select: { name: true }
              });

              if (user?.email && classData) {
                const welcomeEmailContent = generateEmailContent('new_subscription', {
                  userName: user.displayName || user.email.split('@')[0],
                  className: classData.name,
                  subscriptionType: 'Class Access',
                  endDate: endDate.toISOString(),
                  amount: payment.amount || 0
                });

                await sendEmail({
                  to: user.email,
                  subject: welcomeEmailContent.subject,
                  html: welcomeEmailContent.html,
                  text: welcomeEmailContent.text
                });

                // Send payment receipt email
                const receiptEmailContent = generateEmailContent('payment_receipt', {
                  userName: user.displayName || user.email.split('@')[0],
                  paymentId: body.razorpay_payment_id || body.orderId || '',
                  orderId: body.razorpay_order_id || body.orderId || '',
                  subscriptionName: `${classData.name} - Class Access`,
                  amount: payment.amount || 0,
                  paymentDate: new Date().toISOString()
                });

                await sendEmail({
                  to: user.email,
                  subject: receiptEmailContent.subject,
                  html: receiptEmailContent.html,
                  text: receiptEmailContent.text
                });

                // Send admin notification for new subscription
                await notifyAdminNewSubscription({
                  userName: user.displayName || user.email.split('@')[0],
                  userEmail: user.email,
                  subscriptionName: `${classData.name} - Class Access`,
                  amount: payment.amount || 0
                });
              }
            } catch (emailError) {
              console.error('Error sending welcome/receipt emails:', emailError);
              // Don't fail the payment verification if email fails
            }
          }
        } else if (metadata.type === 'subject_subscription') {
          // Handle both single and multiple subject subscriptions
          const subjectIds: string[] = metadata.subjectIds || (metadata.subjectId ? [metadata.subjectId] : []);
          
          if (subjectIds.length === 0) {
            throw new Error('No subject IDs provided for subject subscription');
          }

          // Check for existing subscriptions for all subjects
          const existingSubscriptions = await prisma.subscription.findMany({
            where: {
              userId: metadata.userId,
              subjectId: { in: subjectIds },
              status: 'ACTIVE',
              endDate: { gte: new Date() }
            }
          });

          // Only create subscriptions for subjects that don't already have active subscriptions
          const existingSubjectIds = existingSubscriptions.map(s => s.subjectId).filter((id): id is string => id !== null);
          const newSubjectIds = subjectIds.filter((id: string) => !existingSubjectIds.includes(id));

          if (newSubjectIds.length > 0) {
            const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
            
            // Create subscriptions for all new subjects
            const subscriptionData = newSubjectIds.map((subjectId: string) => ({
              userId: metadata.userId,
              subjectId: subjectId,
              status: 'ACTIVE' as const,
              planType: 'subject_subscription' as const,
              amount: Math.floor((payment.amount || 0) / subjectIds.length), // Distribute amount evenly
              currency: payment.currency,
              startDate: new Date(),
              endDate: endDate
            }));

            await prisma.subscription.createMany({
              data: subscriptionData
            });

            // Send welcome email after successful subscription creation
            try {
              const user = await prisma.user.findUnique({
                where: { id: metadata.userId },
                select: { email: true, displayName: true }
              });

              const subjects = await prisma.subject.findMany({
                where: { id: { in: newSubjectIds } },
                select: { name: true, class: { select: { name: true } } }
              });

              if (user?.email && subjects.length > 0) {
                const subjectNames = subjects.map(s => s.name).join(', ');
                const className = subjects[0].class.name; // Assuming all subjects are from the same class
                
                const welcomeEmailContent = generateEmailContent('new_subscription', {
                  userName: user.displayName || user.email.split('@')[0],
                  subjectName: subjectNames,
                  className: className,
                  subscriptionType: newSubjectIds.length === 1 ? 'Subject Access' : 'Multiple Subject Access',
                  endDate: endDate.toISOString(),
                  amount: payment.amount || 0
                });

                await sendEmail({
                  to: user.email,
                  subject: welcomeEmailContent.subject,
                  html: welcomeEmailContent.html,
                  text: welcomeEmailContent.text
                });

                // Send payment receipt email
                const receiptEmailContent = generateEmailContent('payment_receipt', {
                  userName: user.displayName || user.email.split('@')[0],
                  paymentId: body.razorpay_payment_id || body.orderId || '',
                  orderId: body.razorpay_order_id || body.orderId || '',
                  subscriptionName: newSubjectIds.length === 1 
                    ? `${subjects[0].name} - Subject Access`
                    : `${subjectNames} - Multiple Subject Access`,
                  amount: payment.amount || 0,
                  paymentDate: new Date().toISOString()
                });

                await sendEmail({
                  to: user.email,
                  subject: receiptEmailContent.subject,
                  html: receiptEmailContent.html,
                  text: receiptEmailContent.text
                });

                // Send admin notification for new subscription
                await notifyAdminNewSubscription({
                  userName: user.displayName || user.email.split('@')[0],
                  userEmail: user.email,
                  subscriptionName: newSubjectIds.length === 1 
                    ? `${subjects[0].name} - Subject Access`
                    : `${subjectNames} - Multiple Subject Access`,
                  amount: payment.amount || 0
                });
              }
            } catch (emailError) {
              console.error('Error sending welcome/receipt emails:', emailError);
              // Don't fail the payment verification if email fails
            }
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
