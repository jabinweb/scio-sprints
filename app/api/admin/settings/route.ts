import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Try to fetch settings with a simpler query first
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('key, value')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching settings from database:', error);
      
      // Return default settings if database query fails
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
        const { data: existing, error: checkError } = await supabase
          .from('admin_settings')
          .select('id')
          .eq('key', key)
          .maybeSingle();

        if (checkError) {
          console.error(`Error checking setting ${key}:`, checkError);
          continue;
        }

        if (existing) {
          // Update existing setting
          const { error: updateError } = await supabase
            .from('admin_settings')
            .update({
              value: String(value),
              updated_at: new Date().toISOString()
            })
            .eq('key', key);

          if (updateError) {
            console.error(`Error updating setting ${key}:`, updateError);
          }
        } else {
          // Insert new setting with generated ID
          const { error: insertError } = await supabase
            .from('admin_settings')
            .insert({
              id: crypto.randomUUID(), // Generate UUID for new records
              key,
              value: String(value),
              description: `Setting for ${key}`,
              category: getSettingCategory(key),
              dataType: 'string',
              isPublic: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error(`Error inserting setting ${key}:`, insertError);
          }
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
