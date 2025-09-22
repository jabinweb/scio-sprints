import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearSmtpCache } from '@/lib/mail';
import { clearRazorpayCache } from '@/lib/razorpay-global';

export async function GET() {
  try {
    // Try to fetch settings with a simpler query first
    const settings = await prisma.adminSettings.findMany({
      select: {
        key: true,
        value: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transform to key-value object
    const settingsObj = (settings || []).reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {
      // Default values as fallback
      siteName: 'ScioLabs',
      siteDescription: 'Interactive Learning Platform',
      contactEmail: 'contact@sciolabs.in',
      supportEmail: 'support@sciolabs.in',
      subscriptionPrice: '299',
      emailNotifications: 'true',
      maintenanceMode: 'false',
      
      // Payment Gateway Selection
      payment_default_gateway: 'RAZORPAY',
      
      // Razorpay Settings
      payment_razorpay_enabled: 'true',
      paymentMode: 'test',
      razorpayKeyId: '',
      razorpayTestKeyId: '',
      razorpayKeySecret: '',
      razorpayTestKeySecret: '',
      
      // Cashfree Settings
      payment_cashfree_enabled: 'false',
      payment_cashfree_app_id: '',
      payment_cashfree_secret_key: '',
      payment_cashfree_test_app_id: '',
      payment_cashfree_test_secret_key: '',
      payment_cashfree_environment: 'SANDBOX',
      
      // SMTP Settings
      smtpHost: 'smtp.hostinger.com',
      smtpPort: '587',
      smtpUser: 'info@sciolabs.in',
      smtpPass: '',
      smtpFrom: 'info@sciolabs.in',
      smtpFromName: 'ScioLabs Team'
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Unexpected error fetching settings:', error);
    
    // Return default settings on any error
    return NextResponse.json({
      siteName: 'ScioLabs',
      siteDescription: 'Interactive Learning Platform',
      contactEmail: 'contact@sciolabs.in',
      supportEmail: 'support@sciolabs.in',
      subscriptionPrice: '299',
      emailNotifications: 'true',
      maintenanceMode: 'false',
      paymentMode: 'test',
      razorpayKeyId: '',
      razorpayTestKeyId: '',
      razorpayKeySecret: '',
      razorpayTestKeySecret: '',
      smtpHost: 'smtp.hostinger.com',
      smtpPort: '587',
      smtpUser: 'info@sciolabs.in',
      smtpPass: '',
      smtpFrom: 'info@sciolabs.in',
      smtpFromName: 'ScioLabs Team'
    });
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    
    // Process each setting individually with proper error handling
    for (const [key, value] of Object.entries(updates)) {
      try {
        // First, check if the setting exists
        const existing = await prisma.adminSettings.findUnique({
          where: { key },
          select: { id: true }
        });

        if (existing) {
          // Update existing setting
          await prisma.adminSettings.update({
            where: { key },
            data: {
              value: String(value),
              updatedAt: new Date()
            }
          });
        } else {
          // Insert new setting
          await prisma.adminSettings.create({
            data: {
              key,
              value: String(value),
              description: `Setting for ${key}`,
              category: getSettingCategory(key),
              dataType: 'string',
              isPublic: false
            }
          });
        }
      } catch (settingError) {
        console.error(`Unexpected error processing setting ${key}:`, settingError);
        continue;
      }
    }

    // Clear appropriate caches based on what was updated
    const updatedKeys = Object.keys(updates);
    const hasSmtpUpdate = updatedKeys.some(key => key.includes('smtp') || key.includes('email') || key.includes('mail'));
    const hasPaymentUpdate = updatedKeys.some(key => key.includes('razorpay') || key.includes('payment') || key.includes('cashfree'));
    
    if (hasSmtpUpdate) {
      clearSmtpCache();
    }
    
    if (hasPaymentUpdate) {
      clearRazorpayCache();
      // Note: Add clearCashfreeCache() here when implemented
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// Helper function to categorize settings
function getSettingCategory(key: string): string {
  if (key.includes('razorpay') || key.includes('payment')) return 'payment';
  if (key.includes('smtp') || key.includes('email') || key.includes('mail')) return 'email';
  if (key.includes('site') || key.includes('contact') || key.includes('support') || key.includes('description')) return 'general';
  if (key.includes('maintenance')) return 'system';
  return 'general';
}
