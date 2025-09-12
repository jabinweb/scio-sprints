// Email template functions for subscription management

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourapp.com';

export function generateExpiryWarningEmail(userName: string, className: string, daysLeft: number, endDate: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Expiry Warning</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Subscription Expiry Warning</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                    <strong>Your subscription to ${className} will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>
                </p>
                <p style="margin: 10px 0 0 0; color: #856404;">
                    Expiry Date: ${new Date(endDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                </p>
            </div>
            
            <p>Don't let your learning journey come to a halt! Renew your subscription to continue accessing:</p>
            
            <ul style="color: #555;">
                <li>Interactive learning content</li>
                <li>Practice exercises and quizzes</li>
                <li>Progress tracking</li>
                <li>Expert support</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard/subscriptions" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Renew Subscription Now
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Questions? Reply to this email or contact our support team.
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
            <p>You received this email because you have an active subscription with us.</p>
        </div>
    </body>
    </html>
  `;
}

export function generateGracePeriodEmail(userName: string, className: string, endDate: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grace Period Notice</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff7b7b 0%, #667eea 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Grace Period Active</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #721c24;">
                    <strong>Your ${className} subscription has expired but you're in a 7-day grace period.</strong>
                </p>
                <p style="margin: 10px 0 0 0; color: #721c24;">
                    Original Expiry: ${new Date(endDate).toLocaleDateString()}
                </p>
            </div>
            
            <p>You still have limited access, but to restore full functionality and continue your learning:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard/subscriptions" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Renew Now - Don't Lose Access!
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                After the grace period, you'll lose access to all premium content.
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
}

export function generateExpiredEmail(userName: string, className: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Expired</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">😔 Subscription Expired</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <p>Your subscription to <strong>${className}</strong> has expired, and you no longer have access to premium content.</p>
            
            <p>We miss you! Resubscribe to continue your learning journey and unlock:</p>
            
            <ul style="color: #555;">
                <li>Full access to all content</li>
                <li>New updates and features</li>
                <li>Continuous learning progress</li>
                <li>Community support</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard/subscriptions" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Resubscribe Now
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                We'd love to have you back! Contact us if you have any questions.
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
}

export function generateRenewalReminderEmail(userName: string, className: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Renewal Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔄 Time to Renew</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <p>It's time to renew your subscription to <strong>${className}</strong> and continue your amazing learning progress!</p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #0c5460;">
                    <strong>💡 Why renew?</strong> Keep your momentum going and unlock new content that's been added since your last subscription.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard/subscriptions" style="background: #17a2b8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Renew Subscription
                </a>
            </div>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
}

export function generateSubscriptionRenewedEmail(userName: string, className: string, newEndDate: string, amount: number) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Renewed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✅ Subscription Renewed!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                    <strong>Great news! Your subscription to ${className} has been renewed successfully.</strong>
                </p>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6;">
                <h3 style="margin-top: 0; color: #333;">Renewal Details:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Subscription:</strong> ${className}</li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Charged:</strong> ₹${(amount/100).toFixed(2)}</li>
                    <li style="padding: 8px 0;"><strong>New Expiry Date:</strong> ${new Date(newEndDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</li>
                </ul>
            </div>
            
            <p>Continue your learning journey with uninterrupted access to all premium content!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Continue Learning
                </a>
            </div>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
}

export function generateAutoRenewalFailedEmail(userName: string, className: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Auto-Renewal Failed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">❌ Auto-Renewal Failed</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName},</h2>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #721c24;">
                    <strong>We were unable to automatically renew your subscription to ${className}.</strong>
                </p>
            </div>
            
            <p>This could be due to:</p>
            <ul style="color: #555;">
                <li>Expired or invalid payment method</li>
                <li>Insufficient funds</li>
                <li>Bank security restrictions</li>
                <li>Card issuer declined the transaction</li>
            </ul>
            
            <p><strong>Don't worry!</strong> You can easily renew your subscription manually:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/dashboard/subscriptions" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Renew Subscription Now
                </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                    <strong>💡 Tip:</strong> Update your payment method in settings to avoid future issues with auto-renewal.
                </p>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Need help? Contact our support team and we'll assist you right away.
            </p>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; padding: 20px;">
            <p>© 2025 Scio Labs. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
}

// Helper function to generate email content based on notification type
export function generateEmailContent(type: string, data: Record<string, unknown>) {
  const userName = (data.userName as string) || 'Valued Customer';
  const className = (data.className as string) || (data.subjectName as string) || 'your subscription';
  
  switch (type) {
    case 'expiry_warning':
      const daysLeft = (data.daysUntilExpiry as number) || 7;
      const endDate = (data.endDate as string) || new Date().toISOString();
      return {
        subject: `⚠️ Your ${className} subscription expires in ${daysLeft} days`,
        html: generateExpiryWarningEmail(userName, className, daysLeft, endDate),
        text: `Hi ${userName},\n\nYour subscription to ${className} will expire in ${daysLeft} days on ${new Date(endDate).toLocaleDateString()}.\n\nTo continue your learning journey, please renew your subscription at ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScio Labs Team`
      };

    case 'grace_period':
      const gracePeriodEndDate = (data.endDate as string) || new Date().toISOString();
      return {
        subject: `🔔 ${className} subscription in grace period`,
        html: generateGracePeriodEmail(userName, className, gracePeriodEndDate),
        text: `Hi ${userName},\n\nYour subscription to ${className} has expired but you're in a 7-day grace period.\n\nRenew now to continue your access: ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScio Labs Team`
      };

    case 'expired':
      return {
        subject: `😔 Your ${className} subscription has expired`,
        html: generateExpiredEmail(userName, className),
        text: `Hi ${userName},\n\nYour subscription to ${className} has expired.\n\nResubscribe to regain access: ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScio Labs Team`
      };

    case 'renewal_reminder':
      return {
        subject: `🔄 Time to renew your ${className} subscription`,
        html: generateRenewalReminderEmail(userName, className),
        text: `Hi ${userName},\n\nIt's time to renew your subscription to ${className}.\n\nRenew now: ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScio Labs Team`
      };

    case 'subscription_renewed':
      const newEndDate = (data.newEndDate as string) || new Date().toISOString();
      const amount = (data.amount as number) || 0;
      return {
        subject: `✅ ${className} subscription renewed successfully`,
        html: generateSubscriptionRenewedEmail(userName, className, newEndDate, amount),
        text: `Hi ${userName},\n\nGreat news! Your subscription to ${className} has been renewed successfully.\n\nNew expiry date: ${new Date(newEndDate).toLocaleDateString()}\n\nAmount charged: ₹${amount/100}\n\nBest regards,\nScio Labs Team`
      };

    case 'auto_renewal_failed':
      return {
        subject: `❌ Auto-renewal failed for ${className}`,
        html: generateAutoRenewalFailedEmail(userName, className),
        text: `Hi ${userName},\n\nWe were unable to automatically renew your subscription to ${className}.\n\nPlease update your payment method and renew manually: ${SITE_URL}/dashboard/subscriptions\n\nBest regards,\nScio Labs Team`
      };

    default:
      return {
        subject: `Update from Scio Labs`,
        html: `<p>Hi ${userName},</p><p>We have an update regarding your subscription.</p>`,
        text: `Hi ${userName}, We have an update regarding your subscription.`
      };
  }
}