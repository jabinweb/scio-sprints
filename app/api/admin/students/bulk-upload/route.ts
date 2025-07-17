import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create a server‐side client with service role key only if env vars exist
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
} catch (error) {
  console.error('Failed to create admin client:', error);
}

interface ProcessResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: Array<{ row: number; error: string; data: Record<string, string> }>;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const schoolId = formData.get('schoolId') as string;

    if (!file || !schoolId) {
      return NextResponse.json({ error: 'File and school ID are required' }, { status: 400 });
    }

    // Read and parse CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain header and at least one data row' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'email'];
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    const result: ProcessResult = {
      success: true,
      total: lines.length - 1,
      created: 0,
      updated: 0,
      errors: []
    };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const studentData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        studentData[header] = values[index] || '';
      });

      try {
        // Validate required fields
        if (!studentData.name || !studentData.email) {
          result.errors.push({
            row: i + 1,
            error: 'Name and email are required',
            data: studentData
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
          result.errors.push({
            row: i + 1,
            error: 'Invalid email format',
            data: studentData
          });
          continue;
        }

        // Check if user already exists in database first (simpler approach)
        const { data: existingDbUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', studentData.email.toLowerCase())
          .maybeSingle();

        let userId = existingDbUser?.id;
        let isNewUser = false;

        if (!existingDbUser) {
          // Generate a simple UUID for new user
          userId = crypto.randomUUID();
          isNewUser = true;

          // Only try auth creation if admin client is available
          if (supabaseAdmin) {
            try {
              const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: studentData.email,
                password: generateRandomPassword(),
                user_metadata: {
                  full_name: studentData.name,
                  grade: studentData.grade || '',
                  section: studentData.section || '',
                  roll_number: studentData.roll_number || '',
                  phone: studentData.phone || '',
                  parent_name: studentData.parent_name || '',
                  parent_email: studentData.parent_email || '',
                  school_id: schoolId,
                },
                email_confirm: true,
              });

              if (!authError && newUser.user) {
                userId = newUser.user.id;
              }
            } catch (authError) {
              console.warn('Auth user creation failed, continuing with generated ID:', authError);
              // Continue with generated UUID
            }
          }
        }

        // Create or update user record in database
        const userRecord = {
          id: userId,
          email: studentData.email,
          display_name: studentData.name,
          role: 'USER',
          school_id: schoolId,
          
          // new fields from CSV
          grade: studentData.grade || null,
          section: studentData.section || null,
          roll_number: studentData.roll_number || null,
          phone: studentData.phone || null,
          parent_name: studentData.parent_name || null,
          parent_email: studentData.parent_email || null,

          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (isNewUser) {
          const { error: dbError } = await supabase
            .from('users')
            .insert(userRecord);

          if (dbError) {
            result.errors.push({
              row: i + 1,
              error: `Database insert failed: ${dbError.message}`,
              data: studentData
            });
            continue;
          }
          result.created++;
        } else {
          const { error: dbError } = await supabase
            .from('users')
            .update({
              display_name: studentData.name,
              school_id: schoolId,
              
              // update new fields
              grade: studentData.grade || null,
              section: studentData.section || null,
              roll_number: studentData.roll_number || null,
              phone: studentData.phone || null,
              parent_name: studentData.parent_name || null,
              parent_email: studentData.parent_email || null,

              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (dbError) {
            result.errors.push({
              row: i + 1,
              error: `Database update failed: ${dbError.message}`,
              data: studentData
            });
            continue;
          }
          result.updated++;
        }

      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          data: studentData
        });
      }
    }

    // Update school student count
    try {
      const { data: schoolUsers } = await supabase
        .from('users')
        .select('id')
        .eq('school_id', schoolId)
        .eq('role', 'USER');

      await supabase
        .from('schools')
        .update({ student_count: schoolUsers?.length || 0 })
        .eq('id', schoolId);
    } catch (error) {
      console.error('Error updating school student count:', error);
    }

    // Determine overall success
    result.success = result.errors.length < result.total;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
