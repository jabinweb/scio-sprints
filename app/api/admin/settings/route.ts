import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      siteName: 'Learning Platform',
      subscriptionPrice: '299',
      paymentMode: 'test',
      razorpayKeyId: '',
      razorpayTestKeyId: '',
      razorpayKeySecret: '',
      razorpayTestKeySecret: ''
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Unexpected error fetching settings:', error);
    
    // Return default settings on any error
    return NextResponse.json({
      siteName: 'Learning Platform',
      subscriptionPrice: '299',
      paymentMode: 'test',
      razorpayKeyId: '',
      razorpayTestKeyId: '',
      razorpayKeySecret: '',
      razorpayTestKeySecret: ''
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

// Helper function to categorize settings
function getSettingCategory(key: string): string {
  if (key.includes('razorpay') || key.includes('payment')) return 'payment';
  if (key.includes('smtp') || key.includes('email')) return 'email';
  if (key.includes('site') || key.includes('contact')) return 'general';
  return 'general';
}
