# Enterprise Subscription Management System

## Overview

This enterprise-level subscription management system provides comprehensive automation and monitoring capabilities for subscription lifecycle management, including automated renewals, notifications, analytics, and webhook integrations.

## Features

### 🔄 Automated Subscription Management
- **Expiry Handler**: Automatically processes subscription expirations with grace periods
- **Status Transitions**: ACTIVE → GRACE_PERIOD → EXPIRED workflow
- **Batch Processing**: Efficient handling of multiple subscriptions
- **Error Recovery**: Comprehensive error handling and retry mechanisms

### 📧 Email Notification System
- **Expiry Warnings**: 7-day advance notifications
- **Grace Period Alerts**: Limited access notifications
- **Renewal Reminders**: Proactive renewal encouragement
- **Success Confirmations**: Auto-renewal success notifications
- **Failure Alerts**: Payment failure notifications with recovery actions
- **HTML Templates**: Professional, responsive email designs

### 📊 Analytics Dashboard
- **Real-time Metrics**: Live subscription and revenue tracking
- **Trend Analysis**: Monthly growth and churn analysis
- **Revenue Tracking**: ARPU, MRR, and total revenue metrics
- **Visual Charts**: Interactive charts using Recharts
- **Time-based Filtering**: Daily, weekly, monthly views

### 🔁 Auto-Renewal System
- **Smart Renewal**: Automatic subscription extensions
- **Payment Processing**: Integration with Razorpay/payment systems
- **User Control**: Toggle auto-renewal on/off
- **Failure Handling**: Graceful degradation on payment failures
- **Notification Integration**: Automatic success/failure notifications

### 🌐 Webhook System
- **Event Broadcasting**: Real-time subscription event notifications
- **HMAC Signatures**: Secure webhook verification
- **Endpoint Management**: Multiple webhook endpoint support
- **Event Filtering**: Subscribe to specific event types
- **Retry Logic**: Automatic retry on webhook delivery failures

### 🚨 Enhanced User Experience
- **Expiry Warnings**: Visual alerts for upcoming expirations
- **Status Indicators**: Clear subscription status communication
- **Renewal Actions**: One-click renewal buttons
- **Auto-renewal Control**: Easy toggle for automatic renewals

## API Endpoints

### Subscription Management
- `POST /api/admin/subscriptions/expire` - Process subscription expirations
- `POST /api/admin/subscriptions/auto-renewal` - Manage auto-renewal settings
- `GET /api/admin/subscriptions/auto-renewal?secret=XXX` - Process auto-renewals (cron)

### Notifications
- `POST /api/admin/notifications/process?secret=XXX` - Process notification queue

### Analytics
- `GET /api/admin/analytics/subscriptions` - Get subscription analytics data

### Webhooks
- `POST /api/admin/webhooks` - Trigger webhook events
- `GET /api/admin/webhooks` - Manage webhook endpoints

## Database Schema Updates

### Subscription Model
```prisma
model Subscription {
  id             String             @id @default(cuid())
  userId         String
  status         SubscriptionStatus @default(INACTIVE)
  autoRenew      Boolean            @default(false)
  // ... other fields
}
```

### Notification Queue
```prisma
model NotificationQueue {
  id           String                   @id @default(cuid())
  userId       String
  type         NotificationQueueType
  data         Json
  status       NotificationQueueStatus  @default(PENDING)
  scheduledFor DateTime
  processedAt  DateTime?
  retryCount   Int                     @default(0)
  error        String?
  createdAt    DateTime                @default(now())
  updatedAt    DateTime                @updatedAt
  user         User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Enums
```prisma
enum SubscriptionStatus {
  INACTIVE
  ACTIVE
  EXPIRED
  CANCELLED
  GRACE_PERIOD
  PENDING_RENEWAL
}

enum NotificationQueueType {
  expiry_warning
  grace_period
  expired
  renewal_reminder
  subscription_renewed
  auto_renewal_failed
}

enum NotificationQueueStatus {
  PENDING
  PROCESSING
  SENT
  FAILED
}
```

## Cron Jobs Setup

### Daily Expiry Processing
```bash
# Run daily at 9:00 AM
0 9 * * * curl -X GET "https://yourapp.com/api/admin/subscriptions/expire?secret=YOUR_CRON_SECRET"
```

### Auto-renewal Processing
```bash
# Run daily at 10:00 AM
0 10 * * * curl -X GET "https://yourapp.com/api/admin/subscriptions/auto-renewal?secret=YOUR_CRON_SECRET"
```

### Notification Processing
```bash
# Run every hour
0 * * * * curl -X POST "https://yourapp.com/api/admin/notifications/process?secret=YOUR_CRON_SECRET"
```

## Environment Variables

```env
# Cron job security
CRON_SECRET=your-secure-cron-secret

# Webhook security
WEBHOOK_SECRET_1=your-webhook-secret-1
WEBHOOK_SECRET_2=your-webhook-secret-2

# Email configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# App configuration
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

## Usage Examples

### Triggering Webhook Events
```typescript
import { triggerWebhook } from '@/app/api/admin/webhooks/route';

// When a subscription is created
await triggerWebhook('subscription.created', subscriptionId);

// When payment succeeds
await triggerWebhook('payment.successful', subscriptionId, {
  paymentId: 'pay_123',
  amount: 7500
});
```

### Processing Notifications
```typescript
// Schedule an expiry warning
await prisma.notificationQueue.create({
  data: {
    userId: subscription.userId,
    type: 'expiry_warning',
    data: {
      subscriptionId: subscription.id,
      daysUntilExpiry: 7,
      // ... other data
    },
    status: 'PENDING',
    scheduledFor: new Date()
  }
});
```

## Security Considerations

1. **Cron Secret**: Protect cron endpoints with secure secrets
2. **Webhook Signatures**: Verify webhook authenticity with HMAC
3. **Rate Limiting**: Implement rate limiting on sensitive endpoints
4. **Input Validation**: Validate all API inputs
5. **Error Handling**: Avoid exposing sensitive information in errors

## Monitoring and Alerting

1. **Failed Auto-renewals**: Monitor failed payment attempts
2. **Notification Failures**: Track email delivery failures
3. **Webhook Failures**: Monitor webhook delivery success rates
4. **Subscription Metrics**: Track churn and growth rates
5. **Performance**: Monitor API response times and database performance

## Future Enhancements

1. **Dunning Management**: Advanced payment retry logic
2. **Subscription Upgrades/Downgrades**: Mid-cycle plan changes
3. **Prorations**: Automatic pro-rating calculations
4. **Multi-currency**: Support for multiple currencies
5. **Advanced Analytics**: Cohort analysis and LTV calculations
6. **A/B Testing**: Pricing and retention experiments

## Support

For issues or questions regarding the subscription management system, please contact the development team or refer to the API documentation.