import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const settingsDoc = await adminDb.collection('appSettings').doc('general').get();
    
    if (!settingsDoc.exists) {
      // Return default settings if none exist
      const defaultSettings = {
        siteName: 'ScioLabs',
        siteDescription: 'Interactive Learning Platform',
        contactEmail: 'contact@sciolabs.com',
        supportEmail: 'support@sciolabs.com',
        subscriptionPrice: 896,
        emailNotifications: true,
        maintenanceMode: false,
        razorpayKeyId: '',
        razorpayKeySecret: '',
        razorpayTestKeyId: '',
        razorpayTestKeySecret: '',
        paymentMode: 'test',
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
      };
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const settings = await request.json();
    
    // Add timestamp for tracking
    const settingsWithTimestamp = {
      ...settings,
      updatedAt: new Date(),
    };

    await adminDb.collection('appSettings').doc('general').set(settingsWithTimestamp, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
